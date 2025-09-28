import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { getAstrologicalResponse, generateKundaliSummary } from "./services/gemini";
import { 
  insertProductSchema, 
  insertOrderSchema, 
  insertKundaliRequestSchema, 
  insertChatMessageSchema, 
  insertContactMessageSchema,
  insertLikedProductSchema,
  insertUserCartSchema,
  insertPromotionalBannerSchema,
  registerSchema,
  loginSchema,
  changePasswordSchema,
  type User
} from "@shared/schema";
import { z } from "zod";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import session from "express-session";
import connectPg from "connect-pg-simple";

// Session configuration
const pgStore = connectPg(session);
const sessionStore = new pgStore({
  conString: process.env.DATABASE_URL,
  createTableIfMissing: true,
  ttl: 7 * 24 * 60 * 60, // 7 days
});

// Authentication middleware
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

async function requireAuth(req: any, res: any, next: any) {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  
  try {
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      req.session.destroy();
      return res.status(401).json({ message: "User not found" });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({ message: "Authentication error" });
  }
}

async function optionalAuth(req: any, res: any, next: any) {
  if (req.session?.userId) {
    try {
      const user = await storage.getUser(req.session.userId);
      if (user) {
        req.user = user;
      }
    } catch (error) {
      console.error("Optional auth error:", error);
    }
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Session middleware
  app.use(session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET || 'nakshatra-secret-key-change-this',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  }));

  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 12);

      // Create user
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      // Create session
      (req.session as any).userId = user.id;
      await storage.updateLastLogin(user.id);

      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user || !user.password) {
        return res.status(400).json({ message: "Invalid email or password" });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ message: "Invalid email or password" });
      }

      // Create session
      (req.session as any).userId = user.id;
      await storage.updateLastLogin(user.id);

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    try {
      req.session.destroy(() => {
        res.json({ message: "Logged out successfully" });
      });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Logout failed" });
    }
  });

  app.get("/api/auth/me", requireAuth, async (req, res) => {
    try {
      const { password, ...userWithoutPassword } = req.user!;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to get user info" });
    }
  });

  app.post("/api/auth/change-password", requireAuth, async (req, res) => {
    try {
      const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
      
      const user = req.user!;
      if (!user.password) {
        return res.status(400).json({ message: "Password not set" });
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 12);

      // Update password
      await storage.updateUser(user.id, { password: hashedNewPassword });

      res.json({ message: "Password changed successfully" });
    } catch (error) {
      console.error("Change password error:", error);
      res.status(500).json({ message: "Failed to change password" });
    }
  });

  // Products API
  app.get("/api/products", async (req, res) => {
    try {
      const category = req.query.category as string;
      const products = category 
        ? await storage.getProductsByCategory(category)
        : await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // Orders API
  app.post("/api/orders", async (req, res) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(orderData);
      res.json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.post("/api/order-items", async (req, res) => {
    try {
      const orderItemData = req.body;
      const orderItem = await storage.createOrderItem(orderItemData);
      res.json(orderItem);
    } catch (error) {
      console.error("Error creating order item:", error);
      res.status(500).json({ message: "Failed to create order item" });
    }
  });

  // Kundali API
  app.post("/api/kundali", requireAuth, async (req, res) => {
    try {
      const kundaliData = insertKundaliRequestSchema.parse(req.body);
      const request = await storage.createKundaliRequest({
        ...kundaliData,
        userId: req.user!.id,
      });
      
      // Generate AI summary for the request
      try {
        const summary = await generateKundaliSummary({
          fullName: kundaliData.fullName,
          birthDate: kundaliData.birthDate,
          birthTime: kundaliData.birthTime,
          birthPlace: kundaliData.birthPlace,
          gender: kundaliData.gender,
        });
        
        res.json({ 
          ...request, 
          aiSummary: summary 
        });
      } catch (aiError) {
        console.error("AI summary generation failed:", aiError);
        res.json(request);
      }
    } catch (error) {
      console.error("Error creating Kundali request:", error);
      res.status(500).json({ message: "Failed to create Kundali request" });
    }
  });

  // Chat API
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, userId } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }

      // Store user message
      if (userId) {
        await storage.createChatMessage({
          userId,
          message,
          isFromUser: true,
          response: null,
        });
      }

      // Get AI response
      const aiResponse = await getAstrologicalResponse(message);

      // Store AI response
      if (userId) {
        await storage.createChatMessage({
          userId,
          message: aiResponse,
          isFromUser: false,
          response: null,
        });
      }

      res.json({ response: aiResponse });
    } catch (error) {
      console.error("Error in chat:", error);
      res.status(500).json({ message: "Failed to process chat message" });
    }
  });

  app.get("/api/chat/history/:userId", async (req, res) => {
    try {
      const history = await storage.getChatHistory(req.params.userId);
      res.json(history);
    } catch (error) {
      console.error("Error fetching chat history:", error);
      res.status(500).json({ message: "Failed to fetch chat history" });
    }
  });

  // Contact API
  app.post("/api/contact", async (req, res) => {
    try {
      const contactData = insertContactMessageSchema.parse(req.body);
      const message = await storage.createContactMessage(contactData);
      res.json(message);
    } catch (error) {
      console.error("Error creating contact message:", error);
      res.status(500).json({ message: "Failed to send contact message" });
    }
  });

  // Seed initial products if needed
  app.post("/api/seed-products", async (req, res) => {
    try {
      const sampleProducts = [
        {
          name: "Blue Sapphire Ring",
          description: "Authentic Neelam for Saturn's blessings",
          price: "12999.00",
          category: "rings",
          imageUrl: "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
          stock: 5,
        },
        {
          name: "Sri Yantra - Gold Plated",
          description: "Sacred geometry for prosperity",
          price: "3499.00",
          category: "yantras",
          imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
          stock: 10,
        },
        {
          name: "Healing Crystal Set",
          description: "7 chakra balancing stones",
          price: "2199.00",
          category: "stones",
          imageUrl: "https://pixabay.com/get/g815d14118c29afb10d6d11e272db22518d7ad8ccb63773474af24d83ace503826cfdcbaf760b5840fadd8be12e2ad648330ca27948c943f11aad1b024541f618_1280.jpg",
          stock: 15,
        },
        {
          name: "Vedic Astrology Guide",
          description: "Complete handbook for beginners",
          price: "899.00",
          category: "books",
          imageUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
          stock: 20,
        },
        {
          name: "Natural Ruby Stone",
          description: "Manikya for Sun's power",
          price: "8999.00",
          category: "stones",
          imageUrl: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
          stock: 3,
        },
        {
          name: "Om Silver Pendant",
          description: "Sacred symbol protection",
          price: "1599.00",
          category: "accessories",
          imageUrl: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
          stock: 12,
        },
      ];

      for (const product of sampleProducts) {
        await storage.createProduct(product);
      }

      res.json({ message: "Sample products created successfully" });
    } catch (error) {
      console.error("Error seeding products:", error);
      res.status(500).json({ message: "Failed to seed products" });
    }
  });

  // User management routes
  
  // Liked products routes
  app.post("/api/user/liked-products", requireAuth, async (req, res) => {
    try {
      const { productId } = req.body;
      if (!productId) {
        return res.status(400).json({ message: "Product ID is required" });
      }
      console.log("ROUTES: Adding liked product:", productId);

      const likedProduct = await storage.addLikedProduct(req.user!.id, productId);
      res.json(likedProduct);
    } catch (error) {
      console.error("Error adding liked product:", error);
      res.status(500).json({ message: "Failed to add liked product" });
    }
  });

  app.delete("/api/user/liked-products/:productId", requireAuth, async (req, res) => {
    try {
      await storage.removeLikedProduct(req.user!.id, req.params.productId);
      res.json({ message: "Product removed from liked products" });
    } catch (error) {
      console.error("Error removing liked product:", error);
      res.status(500).json({ message: "Failed to remove liked product" });
    }
  });

  app.get("/api/user/liked-products", requireAuth, async (req, res) => {
    try {
      const likedProducts = await storage.getUserLikedProducts(req.user!.id);
      res.json(likedProducts);
    } catch (error) {
      console.error("Error fetching liked products:", error);
      res.status(500).json({ message: "Failed to fetch liked products" });
    }
  });

  app.get("/api/user/liked-products/:productId/check", requireAuth, async (req, res) => {
    try {
      const isLiked = await storage.isProductLiked(req.user!.id, req.params.productId);
      res.json({ isLiked });
    } catch (error) {
      console.error("Error checking liked product:", error);
      res.status(500).json({ message: "Failed to check liked product" });
    }
  });

  // User cart routes
  app.post("/api/user/cart", requireAuth, async (req, res) => {
    try {
      const { productId, quantity = 1 } = req.body;
      console.log("ROUTES: Adding to cart:", productId, quantity);

      if (!productId) {
        return res.status(400).json({ message: "Product ID is required" });
      }

      const cartItem = await storage.addToUserCart(req.user!.id, productId, quantity);
      res.json(cartItem);
    } catch (error) {
      console.error("Error adding to cart:", error);
      res.status(500).json({ message: "Failed to add to cart" });
    }
  });

  app.get("/api/user/cart", requireAuth, async (req, res) => {
    try {
      const cartItems = await storage.getUserCart(req.user!.id);
      res.json(cartItems);
    } catch (error) {
      console.error("Error fetching cart:", error);
      res.status(500).json({ message: "Failed to fetch cart" });
    }
  });

  app.put("/api/user/cart/:productId", requireAuth, async (req, res) => {
    try {
      const { quantity } = req.body;
      if (!quantity || quantity < 1) {
        return res.status(400).json({ message: "Valid quantity is required" });
      }

      const cartItem = await storage.updateCartQuantity(req.user!.id, req.params.productId, quantity);
      res.json(cartItem);
    } catch (error) {
      console.error("Error updating cart quantity:", error);
      res.status(500).json({ message: "Failed to update cart quantity" });
    }
  });

  app.delete("/api/user/cart/:productId", requireAuth, async (req, res) => {
    try {
      await storage.removeFromUserCart(req.user!.id, req.params.productId);
      res.json({ message: "Item removed from cart" });
    } catch (error) {
      console.error("Error removing from cart:", error);
      res.status(500).json({ message: "Failed to remove from cart" });
    }
  });

  app.delete("/api/user/cart", requireAuth, async (req, res) => {
    try {
      await storage.clearUserCart(req.user!.id);
      res.json({ message: "Cart cleared" });
    } catch (error) {
      console.error("Error clearing cart:", error);
      res.status(500).json({ message: "Failed to clear cart" });
    }
  });

  // Order history route
  app.get("/api/user/orders", requireAuth, async (req, res) => {
    try {
      const orders = await storage.getOrdersByUser(req.user!.id);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching user orders:", error);
      res.status(500).json({ message: "Failed to fetch order history" });
    }
  });

  // Kundali history route  
  app.get("/api/user/kundali-requests", requireAuth, async (req, res) => {
    try {
      const requests = await storage.getKundaliRequestsByUser(req.user!.id);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching user kundali requests:", error);
      res.status(500).json({ message: "Failed to fetch kundali history" });
    }
  });

  // Promotional banners routes
  app.get("/api/promotional-banners", async (req, res) => {
    try {
      const position = req.query.position as string;
      const banners = await storage.getActivePromotionalBanners(position);
      res.json(banners);
    } catch (error) {
      console.error("Error fetching promotional banners:", error);
      res.status(500).json({ message: "Failed to fetch promotional banners" });
    }
  });

  app.post("/api/promotional-banners", async (req, res) => {
    try {
      const bannerData = insertPromotionalBannerSchema.parse(req.body);
      const banner = await storage.createPromotionalBanner(bannerData);
      res.json(banner);
    } catch (error) {
      console.error("Error creating promotional banner:", error);
      res.status(500).json({ message: "Failed to create promotional banner" });
    }
  });

  // Add sample promotional banners
  app.post("/api/seed-promotional-banners", async (req, res) => {
    try {
      const sampleBanners = [
        {
          title: "🌟 New Year Special - 30% Off All Gemstone Rings!",
          description: "Start your cosmic journey with authentic gemstone rings. Limited time offer!",
          imageUrl: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=300&fit=crop",
          ctaText: "Shop Now",
          ctaLink: "/celestial-store?category=rings",
          discountCode: "NEWYEAR30",
          discountPercent: 30,
          validFrom: new Date(),
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          isActive: true,
          position: "top",
          priority: 10,
        },
        {
          title: "✨ Free Kundali Reading with Every Purchase Above ₹5000",
          description: "Unlock your celestial blueprint with our expert astrologers",
          imageUrl: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=800&h=300&fit=crop",
          ctaText: "Learn More",
          ctaLink: "/kundali",
          validFrom: new Date(),
          validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
          isActive: true,
          position: "banner",
          priority: 8,
        },
        {
          title: "🔮 AstroAI Chat - Get Instant Cosmic Guidance",
          description: "Chat with our AI astrologer for personalized insights available 24/7",
          imageUrl: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&h=300&fit=crop",
          ctaText: "Start Chat",
          ctaLink: "/astro-ai",
          validFrom: new Date(),
          validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
          isActive: true,
          position: "sidebar",
          priority: 5,
        },
      ];

      const createdBanners = [];
      for (const banner of sampleBanners) {
        const created = await storage.createPromotionalBanner(banner);
        createdBanners.push(created);
      }

      res.json({ 
        message: "Sample promotional banners created successfully", 
        count: createdBanners.length,
        banners: createdBanners 
      });
    } catch (error) {
      console.error("Error seeding promotional banners:", error);
      res.status(500).json({ message: "Failed to seed promotional banners" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

import type { Express, Request, Response, NextFunction} from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { getAstrologicalResponse, generateKundaliSummary } from "./services/gemini";
import { 
  insertProductSchema,
  updateProductSchema,
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
import multer from 'multer';
import bcrypt from "bcrypt";
import session from "express-session";
import connectPg from "connect-pg-simple";
import {supabaseAdmin} from "./supabaseAdminClient";

// Session configuration
const pgStore = connectPg(session);
const sessionStore = new pgStore({
  conString: process.env.DATABASE_URL,
  createTableIfMissing: true,
  ttl: 7 * 24 * 60 * 60, // 7 days
});

const upload = multer({ storage: multer.memoryStorage() });

// Authentication middleware
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}


declare module 'express-session' {
  interface SessionData {
    userId?: string;
    isAdmin?: boolean;
    adminUsername?: string;
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
      console.log("Authenticated user:");
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


  // Admin Authentication
  async function requireAdmin(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: "Admin authentication required: No token provided" });
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
      const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
      
      if (error || !user) {
        return res.status(401).json({ message: "Admin authentication required: Invalid token" });
      }
      
      // This is the crucial check for the admin role from the JWT!
      if (user.app_metadata?.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden: User is not an admin" });
      }

      // Attach the admin user to the request object for later use
      (req as any).user = user; 
      next();
    } catch (error) {
      console.error("Admin auth middleware error:", error);
      return res.status(500).json({ message: "Admin authentication error" });
    }
  }
  // NEW Admin Login route
  app.post("/api/admin/login", async (req, res) => {
    try {
      // Use email instead of username
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      
      const { data, error } = await supabaseAdmin.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return res.status(401).json({ message: error.message || "Invalid credentials" });
      }
      console.log("Admin logged in:", data.user);
      // Security check: Even with a valid password, ensure they are an admin.
      if (data.user?.app_metadata?.role !== 'admin') {
          // Log them out immediately
          await supabaseAdmin.auth.signOut();
          return res.status(403).json({ message: "Login successful, but you are not an authorized admin." });
      }
      
      // Send back the session (contains access_token) and user details
      res.json({ 
        success: true, 
        session: data.session,
        admin: { 
          email: data.user.email,
          role: data.user.app_metadata.role,
          id: data.user.id
        }
      });

    } catch (error) {
      console.error("Admin login error:", error);
      res.status(500).json({ message: "Admin login failed" });
    }
  });

  // NEW Admin Logout route
  app.post("/api/admin/logout", requireAdmin, async (req, res) => {
    try {
      // The token is validated by requireAdmin, now we just sign out.
      const authHeader = req.headers.authorization!;
      const token = authHeader.split(' ')[1];

      const { error } = await supabaseAdmin.auth.signOut(token);

      if (error) throw error;
      

      res.json({ message: "Admin logged out successfully" });
    } catch (error) {
      console.error("Admin logout error:", error);
      res.status(500).json({ message: "Admin logout failed" });
    }
  });

  // NEW Admin "me" route
  app.get("/api/admin/me", requireAdmin, async (req, res) => {
    // The user object is attached by the requireAdmin middleware
    const user = (req as any).user;
    res.json({ 
      admin: { 
        email: user.email, 
        role: user.app_metadata.role,
        id: user.id
      } 
    });
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

  // Admin Products API
  app.get("/api/admin/products", requireAdmin, async (req, res) => {
    try {
      // This calls the function you already have in storage.ts
      const allProducts = await storage.getAllAdminProducts(); 
      res.json(allProducts); // Send the products back as a JSON response
      console.log("Fetched all admin products, count:", allProducts.length);
    } catch (error) {
      console.error("Error fetching all admin products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.post("/api/admin/products", requireAdmin, upload.array('images', 10), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      const imageUrls: string[] = [];

      // 1. Upload images to Supabase Storage
      if (files) {
        for (const file of files) {
          const filePath = `products/${Date.now()}-${file.originalname}`;
          const { error: uploadError } = await supabaseAdmin.storage
            .from('product-images') // Make sure you have a bucket named 'product-images' in Supabase
            .upload(filePath, file.buffer, { contentType: file.mimetype });

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabaseAdmin.storage.from('product-images').getPublicUrl(filePath);
          imageUrls.push(publicUrl);
        }
      }

      // 2. Parse other form data
      const productData = {
        ...req.body,
        stock: parseInt(req.body.stock, 10)||0,
        isActive: req.body.isActive === 'true',
        specifications: JSON.parse(req.body.specifications || '[]'),
        imageUrls,
      };

      const product = await storage.createProduct(productData);
      res.json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  // --- REPLACE your old PUT route ---
  app.put("/api/admin/products/:id", requireAdmin, upload.array('images', 10), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      let imageUrls: string[] = JSON.parse(req.body.existingImageUrls || '[]');

      // 1. Upload NEW images
      if (files) {
        for (const file of files) {
          const filePath = `products/${Date.now()}-${file.originalname}`;
          const { error: uploadError } = await supabaseAdmin.storage
            .from('product-images')
            .upload(filePath, file.buffer, { contentType: file.mimetype });

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabaseAdmin.storage.from('product-images').getPublicUrl(filePath);
          imageUrls.push(publicUrl);
        }
      }

      // 2. Parse other form data
      const productData = {
        ...req.body,
        stock: parseInt(req.body.stock, 10) || 0,
        isActive: req.body.isActive === 'true',
        specifications: JSON.parse(req.body.specifications || '[]'),
        imageUrls,
      };

      console.log("Updating product with data:", productData);

      const product = await storage.updateProduct(req.params.id, productData);
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete("/api/admin/products/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteProduct(req.params.id);
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Admin Orders API

  
app.get("/api/admin/orders", requireAdmin, async (req, res) => {
  try {
    // You will need a function in your storage to get all orders.
    // The implementation of this function depends on your database.
    const orders = await storage.getAllOrders(); 
    res.json(orders);
  } catch (error) {
    console.error("Error fetching all orders:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

  app.get("/api/admin/orders/:id", requireAdmin, async (req, res) => {
  try {
    const order = await storage.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json(order);
  } catch (error) {
    console.error("Error fetching order details:", error);
    res.status(500).json({ message: "Failed to fetch order details" });
  }
});

  app.put("/api/admin/orders/:id", requireAdmin, async (req, res) => {

    try {
      const { status, trackingId, courierPartner, description } = req.body;
      const order = await storage.updateOrderStatus(req.params.id, status, trackingId, courierPartner, description);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Error updating order:", error);
      res.status(500).json({ message: "Failed to update order" });
    }
  });


  app.post("/api/orders", requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    // 1. Get shipping details from the request body
    const { 
      name, mobileNumber, addressLine1, addressLine2, 
      landmark, pincode, city, state, country
    } = req.body;

    // 2. Validate the new fields
    const requiredFields = { name, mobileNumber, addressLine1, pincode, city, state, country };
    for (const [key, value] of Object.entries(requiredFields)) {
      if (!value) {
        return res.status(400).json({ message: `Missing required field: ${key}` });
      }
    }

    const userCartItems = await storage.getUserCart(userId);
    if (userCartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const totalAmount = userCartItems.reduce(
      (sum, item) => sum + parseFloat(item.product.price) * item.quantity,
      0
    );

    // 3. Generate the unique, user-friendly Order Number
    const orderNumber = `NK_${Date.now()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // 4. Create the main Order record with all the new details
    const newOrder = await storage.createOrder({
      userId,
      totalAmount: totalAmount.toFixed(2),
      status: "new",
      orderNumber, // Add the new order number
      shippingName: name,
      mobileNumber,
      addressLine1,
      addressLine2, // Will be null if not provided
      landmark,     // Will be null if not provided
      pincode,
      city,
      state,
      country: "India", // Default to India for now
    });

    // Create OrderItems for each item in the cart (this part is the same)
    for (const cartItem of userCartItems) {
      await storage.createOrderItem({
        orderId: newOrder.id,
        productId: cartItem.productId,
        quantity: cartItem.quantity,
        price: cartItem.product.price,
      });
    }

    // Clear the user's cart (this part is the same)
    await storage.clearUserCart(userId);
    await storage.createOrUpdateUserAddress({
      userId, name, mobileNumber, addressLine1, addressLine2, landmark, pincode, city, state, country
    });

    res.status(201).json(newOrder);
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

      const userId = req.user!.id;
      const orders = await storage.getOrdersByUser(userId);
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

  app.get("/api/admin/dashboard-stats", requireAdmin, async (req, res) => {
    try {
      console.log("Fetching dashboard stats...");
      const stats = await storage.getDashboardOverview();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

app.get("/api/admin/kundali-requests", requireAdmin, async (req, res) => {
    try {
      const requests = await storage.getAllKundaliRequests();
      res.json(requests);
    } catch (error) {
      console.error("Error fetching kundali requests:", error);
      res.status(500).json({ message: "Failed to fetch kundali requests" });
    }
  });

  app.get("/api/user/addresses", requireAuth, async (req, res) => {
  try {
    const addresses = await storage.getUserAddresses(req.user!.id);
    res.json(addresses);
  } catch (error) {
    console.error("Error fetching user addresses:", error);
    res.status(500).json({ message: "Failed to fetch addresses" });
  }
});


  app.put("/api/admin/kundali-requests/:id", requireAdmin, async (req, res) => {
    try {
      const { status, reportUrl } = req.body;
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      await storage.updateKundaliStatus(req.params.id, status, reportUrl);
      console.log(`Kundali request ${req.params.id} updated to status: ${status}`);
      res.json({ message: "Kundali request updated successfully" });
    } catch (error) {
      console.error("Error updating kundali request:", error);
      res.status(500).json({ message: "Failed to update kundali request" });
    }
  });

  

  const httpServer = createServer(app);
  return httpServer;
}

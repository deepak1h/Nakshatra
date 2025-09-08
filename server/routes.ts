import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { getAstrologicalResponse, generateKundaliSummary } from "./services/gemini";
import { insertProductSchema, insertOrderSchema, insertKundaliRequestSchema, insertChatMessageSchema, insertContactMessageSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
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
  app.post("/api/kundali", async (req, res) => {
    try {
      const kundaliData = insertKundaliRequestSchema.parse(req.body);
      const request = await storage.createKundaliRequest(kundaliData);
      
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

  const httpServer = createServer(app);
  return httpServer;
}

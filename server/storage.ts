import {
  users,
  products,
  orders,
  orderItems,
  kundaliRequests,
  chatMessages,
  contactMessages,
  likedProducts,
  userCart,
  promotionalBanners,
  userSessions,
  type User,
  type InsertUser,
  type Product,
  type InsertProduct,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type KundaliRequest,
  type InsertKundaliRequest,
  type ChatMessage,
  type InsertChatMessage,
  type ContactMessage,
  type InsertContactMessage,
  type LikedProduct,
  type InsertLikedProduct,
  type UserCart,
  type InsertUserCart,
  type PromotionalBanner,
  type InsertPromotionalBanner,
  type UserSession,
  type InsertUserSession,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, lt, gte } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  updateLastLogin(id: string): Promise<void>;
  
  // Product operations
  getAllProducts(): Promise<Product[]>;
  getProductsByCategory(category: string): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProductStock(id: string, stock: number): Promise<void>;
  
  // Order operations
  createOrder(order: InsertOrder): Promise<Order>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  getOrdersByUser(userId: string): Promise<Order[]>;
  updateOrderStatus(id: string, status: string): Promise<void>;
  
  // Kundali operations
  createKundaliRequest(request: InsertKundaliRequest): Promise<KundaliRequest>;
  getKundaliRequestsByUser(userId: string): Promise<KundaliRequest[]>;
  updateKundaliStatus(id: string, status: string, reportUrl?: string): Promise<void>;
  
  // Chat operations
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatHistory(userId: string): Promise<ChatMessage[]>;
  
  // Contact operations
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  getAllContactMessages(): Promise<ContactMessage[]>;
  
  // Liked products operations
  addLikedProduct(userId: string, productId: string): Promise<LikedProduct>;
  removeLikedProduct(userId: string, productId: string): Promise<void>;
  getUserLikedProducts(userId: string): Promise<Product[]>;
  isProductLiked(userId: string, productId: string): Promise<boolean>;
  
  // User cart operations
  addToUserCart(userId: string, productId: string, quantity: number): Promise<UserCart>;
  removeFromUserCart(userId: string, productId: string): Promise<void>;
  getUserCart(userId: string): Promise<(UserCart & { product: Product })[]>;
  updateCartQuantity(userId: string, productId: string, quantity: number): Promise<UserCart>;
  clearUserCart(userId: string): Promise<void>;
  
  // Promotional banners operations
  getAllPromotionalBanners(): Promise<PromotionalBanner[]>;
  getActivePromotionalBanners(position?: string): Promise<PromotionalBanner[]>;
  createPromotionalBanner(banner: InsertPromotionalBanner): Promise<PromotionalBanner>;
  
  // User sessions operations
  createUserSession(userId: string, sessionToken: string, expiresAt: Date): Promise<UserSession>;
  getUserBySessionToken(sessionToken: string): Promise<User | undefined>;
  deleteUserSession(sessionToken: string): Promise<void>;
  deleteExpiredSessions(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const [user] = await db.update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateLastLogin(id: string): Promise<void> {
    await db.update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, id));
  }

  // Product operations
  async getAllProducts(): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.isActive, true));
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(and(eq(products.category, category), eq(products.isActive, true)));
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(insertProduct).returning();
    return product;
  }

  async updateProductStock(id: string, stock: number): Promise<void> {
    await db.update(products).set({ stock }).where(eq(products.id, id));
  }

  // Order operations
  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const [order] = await db.insert(orders).values(insertOrder).returning();
    return order;
  }

  async createOrderItem(insertOrderItem: InsertOrderItem): Promise<OrderItem> {
    const [orderItem] = await db.insert(orderItems).values(insertOrderItem).returning();
    return orderItem;
  }

  async getOrdersByUser(userId: string): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));
  }

  async updateOrderStatus(id: string, status: string): Promise<void> {
    await db.update(orders).set({ status }).where(eq(orders.id, id));
  }

  // Kundali operations
  async createKundaliRequest(insertRequest: InsertKundaliRequest): Promise<KundaliRequest> {
    const [request] = await db.insert(kundaliRequests).values(insertRequest).returning();
    return request;
  }

  async getKundaliRequestsByUser(userId: string): Promise<KundaliRequest[]> {
    return await db
      .select()
      .from(kundaliRequests)
      .where(eq(kundaliRequests.userId, userId))
      .orderBy(desc(kundaliRequests.createdAt));
  }

  async updateKundaliStatus(id: string, status: string, reportUrl?: string): Promise<void> {
    const updateData: any = { status };
    if (reportUrl) {
      updateData.reportUrl = reportUrl;
    }
    await db.update(kundaliRequests).set(updateData).where(eq(kundaliRequests.id, id));
  }

  // Chat operations
  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const [message] = await db.insert(chatMessages).values(insertMessage).returning();
    return message;
  }

  async getChatHistory(userId: string): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.userId, userId))
      .orderBy(chatMessages.createdAt);
  }

  // Contact operations
  async createContactMessage(insertMessage: InsertContactMessage): Promise<ContactMessage> {
    const [message] = await db.insert(contactMessages).values(insertMessage).returning();
    return message;
  }

  async getAllContactMessages(): Promise<ContactMessage[]> {
    return await db
      .select()
      .from(contactMessages)
      .orderBy(desc(contactMessages.createdAt));
  }

  // Liked products operations
  async addLikedProduct(userId: string, productId: string): Promise<LikedProduct> {
    console.log("liked product", userId, productId)
    const [likedProduct] = await db
      .insert(likedProducts)
      .values({ userId, productId })
      .onConflictDoNothing()
      .returning();
    return likedProduct;
  }

  async removeLikedProduct(userId: string, productId: string): Promise<void> {
    await db
      .delete(likedProducts)
      .where(and(eq(likedProducts.userId, userId), eq(likedProducts.productId, productId)));
  }

  async getUserLikedProducts(userId: string): Promise<Product[]> {
    const result = await db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        price: products.price,
        category: products.category,
        imageUrl: products.imageUrl,
        stock: products.stock,
        isActive: products.isActive,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
      })
      .from(likedProducts)
      .innerJoin(products, eq(likedProducts.productId, products.id))
      .where(eq(likedProducts.userId, userId))
      .orderBy(desc(likedProducts.createdAt));
    return result;
  }

  async isProductLiked(userId: string, productId: string): Promise<boolean> {
    const [result] = await db
      .select({ count: likedProducts.id })
      .from(likedProducts)
      .where(and(eq(likedProducts.userId, userId), eq(likedProducts.productId, productId)));
    return !!result;
  }

  // User cart operations
  async addToUserCart(userId: string, productId: string, quantity: number): Promise<UserCart> {
    // Check if item already exists in cart

    console.log("add to cart", userId, productId, quantity)
    const [existing] = await db
      .select()
      .from(userCart)
      .where(and(eq(userCart.userId, userId), eq(userCart.productId, productId)));

    if (existing) {
      // Update quantity
      const [updated] = await db
        .update(userCart)
        .set({ quantity: existing.quantity + quantity, updatedAt: new Date() })
        .where(and(eq(userCart.userId, userId), eq(userCart.productId, productId)))
        .returning();
      return updated;
    } else {
      // Add new item
      const [cartItem] = await db
        .insert(userCart)
        .values({ userId, productId, quantity })
        .returning();
      return cartItem;
    }
  }

  async removeFromUserCart(userId: string, productId: string): Promise<void> {
    await db
      .delete(userCart)
      .where(and(eq(userCart.userId, userId), eq(userCart.productId, productId)));
  }

  async getUserCart(userId: string): Promise<(UserCart & { product: Product })[]> {
    const result = await db
      .select({
        id: userCart.id,
        userId: userCart.userId,
        productId: userCart.productId,
        quantity: userCart.quantity,
        createdAt: userCart.createdAt,
        updatedAt: userCart.updatedAt,
        product: {
          id: products.id,
          name: products.name,
          description: products.description,
          price: products.price,
          category: products.category,
          imageUrl: products.imageUrl,
          stock: products.stock,
          isActive: products.isActive,
          createdAt: products.createdAt,
          updatedAt: products.updatedAt,
        },
      })
      .from(userCart)
      .innerJoin(products, eq(userCart.productId, products.id))
      .where(eq(userCart.userId, userId))
      .orderBy(desc(userCart.createdAt));
    
    return result.map(item => ({
      ...item,
      product: item.product,
    }));
  }

  async updateCartQuantity(userId: string, productId: string, quantity: number): Promise<UserCart> {
    const [updated] = await db
      .update(userCart)
      .set({ quantity, updatedAt: new Date() })
      .where(and(eq(userCart.userId, userId), eq(userCart.productId, productId)))
      .returning();
    return updated;
  }

  async clearUserCart(userId: string): Promise<void> {
    await db.delete(userCart).where(eq(userCart.userId, userId));
  }

  // Promotional banners operations
  async getAllPromotionalBanners(): Promise<PromotionalBanner[]> {
    return await db
      .select()
      .from(promotionalBanners)
      .orderBy(desc(promotionalBanners.priority), desc(promotionalBanners.createdAt));
  }

  async getActivePromotionalBanners(position?: string): Promise<PromotionalBanner[]> {
    const whereConditions = [
      eq(promotionalBanners.isActive, true),
      gte(promotionalBanners.validUntil, new Date())
    ];

    if (position) {
      whereConditions.push(eq(promotionalBanners.position, position));
    }

    return await db
      .select()
      .from(promotionalBanners)
      .where(and(...whereConditions))
      .orderBy(desc(promotionalBanners.priority), desc(promotionalBanners.createdAt));
  }

  async createPromotionalBanner(insertBanner: InsertPromotionalBanner): Promise<PromotionalBanner> {
    const [banner] = await db
      .insert(promotionalBanners)
      .values(insertBanner)
      .returning();
    return banner;
  }

  // User sessions operations
  async createUserSession(userId: string, sessionToken: string, expiresAt: Date): Promise<UserSession> {
    const [session] = await db
      .insert(userSessions)
      .values({ userId, sessionToken, expiresAt })
      .returning();
    return session;
  }

  async getUserBySessionToken(sessionToken: string): Promise<User | undefined> {
    const [result] = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
        password: users.password,
        phone: users.phone,
        dateOfBirth: users.dateOfBirth,
        preferences: users.preferences,
        isEmailVerified: users.isEmailVerified,
        lastLoginAt: users.lastLoginAt,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(userSessions)
      .innerJoin(users, eq(userSessions.userId, users.id))
      .where(
        and(
          eq(userSessions.sessionToken, sessionToken),
          gte(userSessions.expiresAt, new Date())
        )
      );
    return result;
  }

  async deleteUserSession(sessionToken: string): Promise<void> {
    await db.delete(userSessions).where(eq(userSessions.sessionToken, sessionToken));
  }

  async deleteExpiredSessions(): Promise<void> {
    await db.delete(userSessions).where(lt(userSessions.expiresAt, new Date()));
  }
}

export const storage = new DatabaseStorage();

import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  integer,
  decimal,
  timestamp,
  boolean,
  jsonb,
  uuid,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email", { length: 255 }).unique(),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  profileImageUrl: varchar("profile_image_url", { length: 500 }),
  password: varchar("password", { length: 255 }), // For local auth
  phone: varchar("phone", { length: 20 }),
  dateOfBirth: timestamp("date_of_birth"),
  preferences: jsonb("preferences"), // Store user preferences like zodiac sign, interests
  isEmailVerified: boolean("is_email_verified").default(false),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Products table
export const products = pgTable("products", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  imageUrl: varchar("image_url", { length: 500 }),
  stock: integer("stock").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Orders table
export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id),
  status: varchar("status", { length: 50 }).default("pending"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  shippingAddress: jsonb("shipping_address"),
  paymentStatus: varchar("payment_status", { length: 50 }).default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Order items table
export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: uuid("order_id").references(() => orders.id),
  productId: uuid("product_id").references(() => products.id),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Kundali requests table
export const kundaliRequests = pgTable("kundali_requests", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  gender: varchar("gender", { length: 20 }).notNull(),
  birthDate: timestamp("birth_date").notNull(),
  birthTime: varchar("birth_time", { length: 10 }).notNull(),
  birthPlace: varchar("birth_place", { length: 255 }).notNull(),
  fatherName: varchar("father_name", { length: 255 }),
  kundaliType: varchar("kundali_type", { length: 100 }).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { length: 50 }).default("pending"),
  reportUrl: varchar("report_url", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Chat messages table
export const chatMessages = pgTable("chat_messages", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id),
  message: text("message").notNull(),
  response: text("response"),
  isFromUser: boolean("is_from_user").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Contact messages table
export const contactMessages = pgTable("contact_messages", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  message: text("message").notNull(),
  status: varchar("status", { length: 50 }).default("unread"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Liked products table
export const likedProducts = pgTable("liked_products", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  productId: uuid("product_id").references(() => products.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userProductIndex: index().on(table.userId, table.productId),
}));

// User cart table (persistent cart for logged in users)
export const userCart = pgTable("user_cart", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  productId: uuid("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userProductIndex: index().on(table.userId, table.productId),
}));

// Promotional banners table
export const promotionalBanners = pgTable("promotional_banners", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  imageUrl: varchar("image_url", { length: 500 }),
  ctaText: varchar("cta_text", { length: 100 }),
  ctaLink: varchar("cta_link", { length: 500 }),
  discountCode: varchar("discount_code", { length: 50 }),
  discountPercent: integer("discount_percent"),
  validFrom: timestamp("valid_from"),
  validUntil: timestamp("valid_until"),
  isActive: boolean("is_active").default(true),
  position: varchar("position", { length: 50 }).default("top"), // top, bottom, sidebar
  priority: integer("priority").default(0), // higher priority shows first
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User sessions table
export const userSessions = pgTable("user_sessions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  sessionToken: varchar("session_token", { length: 255 }).unique().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
  kundaliRequests: many(kundaliRequests),
  chatMessages: many(chatMessages),
  likedProducts: many(likedProducts),
  userCart: many(userCart),
  userSessions: many(userSessions),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  orderItems: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export const productsRelations = relations(products, ({ many }) => ({
  orderItems: many(orderItems),
  likedProducts: many(likedProducts),
  userCart: many(userCart),
}));

export const kundaliRequestsRelations = relations(kundaliRequests, ({ one }) => ({
  user: one(users, {
    fields: [kundaliRequests.userId],
    references: [users.id],
  }),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  user: one(users, {
    fields: [chatMessages.userId],
    references: [users.id],
  }),
}));

export const likedProductsRelations = relations(likedProducts, ({ one }) => ({
  user: one(users, {
    fields: [likedProducts.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [likedProducts.productId],
    references: [products.id],
  }),
}));

export const userCartRelations = relations(userCart, ({ one }) => ({
  user: one(users, {
    fields: [userCart.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [userCart.productId],
    references: [products.id],
  }),
}));

export const userSessionsRelations = relations(userSessions, ({ one }) => ({
  user: one(users, {
    fields: [userSessions.userId],
    references: [users.id],
  }),
}));

// Zod schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).partial();

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
  createdAt: true,
});

export const insertKundaliRequestSchema = createInsertSchema(kundaliRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  birthDate: z.string().transform((val) => new Date(val)),
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export const insertContactMessageSchema = createInsertSchema(contactMessages).omit({
  id: true,
  createdAt: true,
});

export const insertLikedProductSchema = createInsertSchema(likedProducts).omit({
  id: true,
  createdAt: true,
});

export const insertUserCartSchema = createInsertSchema(userCart).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPromotionalBannerSchema = createInsertSchema(promotionalBanners).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserSessionSchema = createInsertSchema(userSessions).omit({
  id: true,
  createdAt: true,
});

// Authentication schemas
export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

export type KundaliRequest = typeof kundaliRequests.$inferSelect;
export type InsertKundaliRequest = z.infer<typeof insertKundaliRequestSchema>;

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;

export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;

export type LikedProduct = typeof likedProducts.$inferSelect;
export type InsertLikedProduct = z.infer<typeof insertLikedProductSchema>;

export type UserCart = typeof userCart.$inferSelect;
export type InsertUserCart = z.infer<typeof insertUserCartSchema>;

export type PromotionalBanner = typeof promotionalBanners.$inferSelect;
export type InsertPromotionalBanner = z.infer<typeof insertPromotionalBannerSchema>;

export type UserSession = typeof userSessions.$inferSelect;
export type InsertUserSession = z.infer<typeof insertUserSessionSchema>;

// Auth types
export type RegisterData = z.infer<typeof registerSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type ChangePasswordData = z.infer<typeof changePasswordSchema>;

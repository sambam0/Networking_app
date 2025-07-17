import { pgTable, text, serial, integer, boolean, timestamp, json, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password"), // Make password optional for Google OAuth users
  fullName: text("full_name").notNull(),
  age: integer("age"),
  hometown: text("hometown"),
  state: text("state"),
  college: text("college"),
  highSchool: text("high_school"),
  school: text("school"), // Keep for backward compatibility
  background: text("background"),
  aspirations: text("aspirations"),
  interests: text("interests").array(),
  socialLinks: json("social_links").$type<{ 
    linkedin?: string; 
    website?: string; 
    twitter?: string; 
    instagram?: string;
    github?: string;
    tiktok?: string;
    facebook?: string;
    youtube?: string;
  }>(),
  profilePhoto: text("profile_photo"),
  googleId: text("google_id").unique(), // Add Google ID for OAuth users
  authProvider: text("auth_provider").notNull().default("email"), // Track auth method
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  hostId: integer("host_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  location: text("location").notNull(),
  date: timestamp("date").notNull(),
  qrCode: text("qr_code").notNull().unique(),
  isActive: boolean("is_active").default(true).notNull(),
  isPublic: boolean("is_public").default(true).notNull(),
  visibleFields: jsonb("visible_fields").default({
    fullName: true,
    age: true,
    hometown: true,
    state: true,
    college: true,
    highSchool: true,
    school: true,
    background: true,
    aspirations: true,
    interests: true,
    socialLinks: true,
    profilePhoto: true
  }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const eventAttendees = pgTable("event_attendees", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").references(() => events.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

export const connections = pgTable("connections", {
  id: serial("id").primaryKey(),
  fromUserId: integer("from_user_id").references(() => users.id).notNull(),
  toUserId: integer("to_user_id").references(() => users.id).notNull(),
  eventId: integer("event_id").references(() => events.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  hostedEvents: many(events),
  eventAttendees: many(eventAttendees),
  connectionsFrom: many(connections, { relationName: "fromUser" }),
  connectionsTo: many(connections, { relationName: "toUser" }),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  host: one(users, {
    fields: [events.hostId],
    references: [users.id],
  }),
  attendees: many(eventAttendees),
  connections: many(connections),
}));

export const eventAttendeesRelations = relations(eventAttendees, ({ one }) => ({
  event: one(events, {
    fields: [eventAttendees.eventId],
    references: [events.id],
  }),
  user: one(users, {
    fields: [eventAttendees.userId],
    references: [users.id],
  }),
}));

export const connectionsRelations = relations(connections, ({ one }) => ({
  fromUser: one(users, {
    fields: [connections.fromUserId],
    references: [users.id],
    relationName: "fromUser",
  }),
  toUser: one(users, {
    fields: [connections.toUserId],
    references: [users.id],
    relationName: "toUser",
  }),
  event: one(events, {
    fields: [connections.eventId],
    references: [events.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
}).extend({
  confirmPassword: z.string().min(8).optional(),
}).refine((data) => {
  // Only require password confirmation for email auth
  if (data.authProvider === "email") {
    return data.password && data.confirmPassword && data.password === data.confirmPassword;
  }
  return true;
}, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Separate schema for Google OAuth signup
export const insertGoogleUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  password: true,
}).extend({
  authProvider: z.literal("google"),
  googleId: z.string(),
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  hostId: true,
  qrCode: true,
  createdAt: true,
}).extend({
  date: z.union([z.date(), z.string().datetime()]).transform((val) => {
    return typeof val === 'string' ? new Date(val) : val;
  }),
  visibleFields: z.object({
    fullName: z.boolean().default(true),
    age: z.boolean().default(true),
    hometown: z.boolean().default(true),
    state: z.boolean().default(true),
    college: z.boolean().default(true),
    highSchool: z.boolean().default(true),
    school: z.boolean().default(true),
    background: z.boolean().default(true),
    aspirations: z.boolean().default(true),
    interests: z.boolean().default(true),
    socialLinks: z.boolean().default(true),
    profilePhoto: z.boolean().default(true)
  }).default({
    fullName: true,
    age: true,
    hometown: true,
    state: true,
    college: true,
    highSchool: true,
    school: true,
    background: true,
    aspirations: true,
    interests: true,
    socialLinks: true,
    profilePhoto: true
  })
});

export const insertEventAttendeeSchema = createInsertSchema(eventAttendees).omit({
  id: true,
  joinedAt: true,
});

export const insertConnectionSchema = createInsertSchema(connections).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type EventAttendee = typeof eventAttendees.$inferSelect;
export type InsertEventAttendee = z.infer<typeof insertEventAttendeeSchema>;
export type Connection = typeof connections.$inferSelect;
export type InsertConnection = z.infer<typeof insertConnectionSchema>;

// Extended types for API responses
export type EventWithHost = Event & {
  host: User;
  attendeeCount: number;
};

export type EventWithAttendees = Event & {
  host: User;
  attendees: User[];
};

export type UserProfile = Omit<User, 'password'>;
export type GoogleUser = z.infer<typeof insertGoogleUserSchema>;

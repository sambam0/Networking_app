import { users, events, eventAttendees, connections, type User, type InsertUser, type Event, type InsertEvent, type EventAttendee, type InsertEventAttendee, type Connection, type InsertConnection, type EventWithHost, type EventWithAttendees, type UserProfile } from "@shared/schema";
import { nanoid } from "nanoid";
import { db } from "./db";
import { eq, and, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  createUser(user: InsertUser): Promise<UserProfile>;
  getUserById(id: number): Promise<UserProfile | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  updateUser(id: number, updates: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<UserProfile>;

  // Event operations
  createEvent(event: InsertEvent & { hostId: number }): Promise<Event>;
  getEventById(id: number): Promise<Event | undefined>;
  getEventByQrCode(qrCode: string): Promise<Event | undefined>;
  getEventsByHostId(hostId: number): Promise<Event[]>;
  getAllEvents(): Promise<EventWithHost[]>;
  updateEvent(id: number, updates: Partial<Omit<Event, 'id' | 'createdAt'>>): Promise<Event>;
  deleteEvent(id: number): Promise<boolean>;

  // Event attendee operations
  joinEvent(eventId: number, userId: number): Promise<EventAttendee>;
  leaveEvent(eventId: number, userId: number): Promise<boolean>;
  getEventAttendees(eventId: number): Promise<UserProfile[]>;
  getUserEvents(userId: number): Promise<Event[]>;
  isUserAttending(eventId: number, userId: number): Promise<boolean>;

  // Connection operations
  createConnection(connection: InsertConnection): Promise<Connection>;
  getUserConnections(userId: number): Promise<UserProfile[]>;
  getEventConnections(eventId: number, userId: number): Promise<UserProfile[]>;
}



export class DatabaseStorage implements IStorage {
  // User operations
  async createUser(user: InsertUser): Promise<UserProfile> {
    const { confirmPassword, ...userData } = user;
    const [newUser] = await db
      .insert(users)
      .values(userData)
      .returning();
    
    const { password, ...userProfile } = newUser;
    return userProfile;
  }

  async getUserById(id: number): Promise<UserProfile | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    if (!user) return undefined;
    
    const { password, ...userProfile } = user;
    return userProfile;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async updateUser(id: number, updates: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<UserProfile> {
    const [updatedUser] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    
    if (!updatedUser) throw new Error('User not found');
    
    const { password, ...userProfile } = updatedUser;
    return userProfile;
  }

  // Event operations
  async createEvent(event: InsertEvent & { hostId: number }): Promise<Event> {
    const qrCode = nanoid(12);
    const [newEvent] = await db
      .insert(events)
      .values({ ...event, qrCode })
      .returning();
    
    return newEvent;
  }

  async getEventById(id: number): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event || undefined;
  }

  async getEventByQrCode(qrCode: string): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.qrCode, qrCode));
    return event || undefined;
  }

  async getEventsByHostId(hostId: number): Promise<Event[]> {
    return await db.select().from(events).where(eq(events.hostId, hostId));
  }

  async getAllEvents(): Promise<EventWithHost[]> {
    const eventsWithHosts = await db
      .select({
        id: events.id,
        hostId: events.hostId,
        name: events.name,
        description: events.description,
        location: events.location,
        date: events.date,
        qrCode: events.qrCode,
        isActive: events.isActive,
        createdAt: events.createdAt,
        hostUser: {
          id: users.id,
          username: users.username,
          email: users.email,
          fullName: users.fullName,
          age: users.age,
          school: users.school,
          background: users.background,
          aspirations: users.aspirations,
          interests: users.interests,
          socialLinks: users.socialLinks,
          profilePhoto: users.profilePhoto,
          createdAt: users.createdAt,
        },
        attendeeCount: sql<number>`(SELECT COUNT(*) FROM ${eventAttendees} WHERE ${eventAttendees.eventId} = ${events.id})`
      })
      .from(events)
      .innerJoin(users, eq(events.hostId, users.id));

    return eventsWithHosts.map(event => ({
      id: event.id,
      hostId: event.hostId,
      name: event.name,
      description: event.description,
      location: event.location,
      date: event.date,
      qrCode: event.qrCode,
      isActive: event.isActive,
      createdAt: event.createdAt,
      host: {
        id: event.hostUser.id,
        username: event.hostUser.username,
        email: event.hostUser.email,
        fullName: event.hostUser.fullName,
        age: event.hostUser.age,
        school: event.hostUser.school,
        background: event.hostUser.background,
        aspirations: event.hostUser.aspirations,
        interests: event.hostUser.interests,
        socialLinks: event.hostUser.socialLinks,
        profilePhoto: event.hostUser.profilePhoto,
        createdAt: event.hostUser.createdAt,
      },
      attendeeCount: event.attendeeCount
    }));
  }

  async updateEvent(id: number, updates: Partial<Omit<Event, 'id' | 'createdAt'>>): Promise<Event> {
    const [updatedEvent] = await db
      .update(events)
      .set(updates)
      .where(eq(events.id, id))
      .returning();
    
    if (!updatedEvent) throw new Error('Event not found');
    return updatedEvent;
  }

  async deleteEvent(id: number): Promise<boolean> {
    const result = await db.delete(events).where(eq(events.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Event attendee operations
  async joinEvent(eventId: number, userId: number): Promise<EventAttendee> {
    // Check if already attending
    const [existing] = await db
      .select()
      .from(eventAttendees)
      .where(and(eq(eventAttendees.eventId, eventId), eq(eventAttendees.userId, userId)));
    
    if (existing) {
      return existing;
    }

    const [newAttendee] = await db
      .insert(eventAttendees)
      .values({ eventId, userId })
      .returning();
    
    return newAttendee;
  }

  async leaveEvent(eventId: number, userId: number): Promise<boolean> {
    const result = await db
      .delete(eventAttendees)
      .where(and(eq(eventAttendees.eventId, eventId), eq(eventAttendees.userId, userId)));
    
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getEventAttendees(eventId: number): Promise<UserProfile[]> {
    const attendees = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        fullName: users.fullName,
        age: users.age,
        school: users.school,
        background: users.background,
        aspirations: users.aspirations,
        interests: users.interests,
        socialLinks: users.socialLinks,
        profilePhoto: users.profilePhoto,
        createdAt: users.createdAt,
      })
      .from(eventAttendees)
      .innerJoin(users, eq(eventAttendees.userId, users.id))
      .where(eq(eventAttendees.eventId, eventId));

    return attendees;
  }

  async getUserEvents(userId: number): Promise<Event[]> {
    const userEvents = await db
      .select({
        id: events.id,
        hostId: events.hostId,
        name: events.name,
        description: events.description,
        location: events.location,
        date: events.date,
        qrCode: events.qrCode,
        isActive: events.isActive,
        createdAt: events.createdAt,
      })
      .from(eventAttendees)
      .innerJoin(events, eq(eventAttendees.eventId, events.id))
      .where(eq(eventAttendees.userId, userId));

    return userEvents;
  }

  async isUserAttending(eventId: number, userId: number): Promise<boolean> {
    const [attendee] = await db
      .select()
      .from(eventAttendees)
      .where(and(eq(eventAttendees.eventId, eventId), eq(eventAttendees.userId, userId)));
    
    return !!attendee;
  }

  // Connection operations
  async createConnection(connection: InsertConnection): Promise<Connection> {
    // Check if connection already exists (bidirectional)
    const [existing] = await db
      .select()
      .from(connections)
      .where(and(
        eq(connections.eventId, connection.eventId),
        sql`(${connections.fromUserId} = ${connection.fromUserId} AND ${connections.toUserId} = ${connection.toUserId}) OR 
            (${connections.fromUserId} = ${connection.toUserId} AND ${connections.toUserId} = ${connection.fromUserId})`
      ));
    
    if (existing) {
      return existing;
    }

    const [newConnection] = await db
      .insert(connections)
      .values(connection)
      .returning();
    
    return newConnection;
  }

  async getUserConnections(userId: number): Promise<UserProfile[]> {
    const userConnections = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        fullName: users.fullName,
        age: users.age,
        school: users.school,
        background: users.background,
        aspirations: users.aspirations,
        interests: users.interests,
        socialLinks: users.socialLinks,
        profilePhoto: users.profilePhoto,
        createdAt: users.createdAt,
      })
      .from(connections)
      .innerJoin(users, sql`${users.id} = CASE 
        WHEN ${connections.fromUserId} = ${userId} THEN ${connections.toUserId}
        ELSE ${connections.fromUserId}
      END`)
      .where(sql`${connections.fromUserId} = ${userId} OR ${connections.toUserId} = ${userId}`);

    return userConnections;
  }

  async getEventConnections(eventId: number, userId: number): Promise<UserProfile[]> {
    const eventConnections = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        fullName: users.fullName,
        age: users.age,
        school: users.school,
        background: users.background,
        aspirations: users.aspirations,
        interests: users.interests,
        socialLinks: users.socialLinks,
        profilePhoto: users.profilePhoto,
        createdAt: users.createdAt,
      })
      .from(connections)
      .innerJoin(users, sql`${users.id} = CASE 
        WHEN ${connections.fromUserId} = ${userId} THEN ${connections.toUserId}
        ELSE ${connections.fromUserId}
      END`)
      .where(and(
        eq(connections.eventId, eventId),
        sql`${connections.fromUserId} = ${userId} OR ${connections.toUserId} = ${userId}`
      ));

    return eventConnections;
  }
}

export const storage = new DatabaseStorage();

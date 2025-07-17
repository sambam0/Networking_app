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
  
  // Recommendation operations
  getRecommendedEvents(userId: number): Promise<EventWithHost[]>;
  getRecommendedPeople(userId: number, eventId?: number): Promise<UserProfile[]>;
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

  // Recommendation operations
  async getRecommendedEvents(userId: number): Promise<EventWithHost[]> {
    // Get user's profile to understand their interests
    const user = await this.getUserById(userId);
    if (!user || !user.interests || user.interests.length === 0) {
      // If user has no interests, return upcoming events they haven't joined
      const allEvents = await this.getAllEvents();
      const userEvents = await this.getUserEvents(userId);
      const userEventIds = new Set(userEvents.map(e => e.id));
      
      return allEvents
        .filter(event => !userEventIds.has(event.id) && new Date(event.date) > new Date())
        .slice(0, 5);
    }

    // Get all events the user hasn't joined
    const allEvents = await this.getAllEvents();
    const userEvents = await this.getUserEvents(userId);
    const userEventIds = new Set(userEvents.map(e => e.id));
    
    // Score events based on:
    // 1. Matching interests in description/name
    // 2. Events attended by people with similar interests
    // 3. Future events only
    const scoredEvents = await Promise.all(
      allEvents
        .filter(event => !userEventIds.has(event.id) && new Date(event.date) > new Date())
        .map(async (event) => {
          let score = 0;
          
          // Check for interest matches in event name/description
          user.interests.forEach(interest => {
            const interestLower = interest.toLowerCase();
            if (event.name.toLowerCase().includes(interestLower)) score += 3;
            if (event.description?.toLowerCase().includes(interestLower)) score += 2;
          });
          
          // Get attendees of this event
          const attendees = await this.getEventAttendees(event.id);
          
          // Check for shared interests with attendees
          attendees.forEach(attendee => {
            if (attendee.interests) {
              const sharedInterests = attendee.interests.filter(i => 
                user.interests?.includes(i)
              );
              score += sharedInterests.length * 0.5;
            }
            
            // Bonus for attendees from same location
            if (user.hometown && attendee.hometown && 
                user.hometown.toLowerCase() === attendee.hometown.toLowerCase()) {
              score += 1;
            } else if (user.state && attendee.state && 
                       user.state.toLowerCase() === attendee.state.toLowerCase()) {
              score += 0.5;
            }
            
            // Bonus for attendees from same schools
            if (user.college && attendee.college && 
                user.college.toLowerCase() === attendee.college.toLowerCase()) {
              score += 1.5;
            }
            if (user.highSchool && attendee.highSchool && 
                user.highSchool.toLowerCase() === attendee.highSchool.toLowerCase()) {
              score += 1;
            }
          });
          
          return { event, score };
        })
    );
    
    // Sort by score and return top recommendations
    return scoredEvents
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(({ event }) => event);
  }

  async getRecommendedPeople(userId: number, eventId?: number): Promise<UserProfile[]> {
    const user = await this.getUserById(userId);
    if (!user) return [];
    
    let potentialConnections: UserProfile[] = [];
    
    if (eventId) {
      // Get attendees of the specific event
      potentialConnections = await this.getEventAttendees(eventId);
    } else {
      // Get all users from events the user is attending
      const userEvents = await this.getUserEvents(userId);
      const allAttendees = await Promise.all(
        userEvents.map(event => this.getEventAttendees(event.id))
      );
      potentialConnections = allAttendees.flat();
    }
    
    // Get existing connections
    const existingConnections = await this.getUserConnections(userId);
    const connectedIds = new Set(existingConnections.map(c => c.id));
    
    // Filter out self and already connected users
    potentialConnections = potentialConnections.filter(
      person => person.id !== userId && !connectedIds.has(person.id)
    );
    
    // Remove duplicates
    const uniqueUsers = Array.from(
      new Map(potentialConnections.map(u => [u.id, u])).values()
    );
    
    // Enhanced scoring algorithm that considers location, education, interests, and aspirations
    const scoredUsers = uniqueUsers.map(person => {
      let score = 0;
      
      // Shared interests (highest weight - 5 points per interest)
      if (user.interests && person.interests) {
        const sharedInterests = user.interests.filter(i => 
          person.interests?.includes(i)
        );
        score += sharedInterests.length * 5;
      }
      
      // Location matching - hometown gets higher score than state
      if (user.hometown && person.hometown && 
          user.hometown.toLowerCase() === person.hometown.toLowerCase()) {
        score += 7; // Same hometown - very strong connection
      } else if (user.state && person.state && 
                 user.state.toLowerCase() === person.state.toLowerCase()) {
        score += 4; // Same state - moderate connection
      }
      
      // Education matching - college gets higher score than high school
      if (user.college && person.college && 
          user.college.toLowerCase() === person.college.toLowerCase()) {
        score += 8; // Same college - very strong academic connection
      }
      
      if (user.highSchool && person.highSchool && 
          user.highSchool.toLowerCase() === person.highSchool.toLowerCase()) {
        score += 6; // Same high school - strong local connection
      }
      
      // Legacy school field for backward compatibility
      if (user.school && person.school && user.school === person.school) {
        score += 6;
      }
      
      // Similar age (within 5 years) - graduated scoring
      if (user.age && person.age) {
        const ageDiff = Math.abs(user.age - person.age);
        if (ageDiff <= 2) {
          score += 3; // Very close age
        } else if (ageDiff <= 5) {
          score += 2; // Similar age
        }
      }
      
      // Aspirations keyword matching (enhanced)
      if (user.aspirations && person.aspirations) {
        const userWords = user.aspirations.toLowerCase().split(/\s+/);
        const personWords = person.aspirations.toLowerCase().split(/\s+/);
        const commonWords = userWords.filter(word => 
          word.length > 4 && personWords.includes(word)
        );
        score += commonWords.length * 2; // Career goal alignment
      }
      
      // Background similarity
      if (user.background && person.background) {
        const userWords = user.background.toLowerCase().split(/\s+/);
        const personWords = person.background.toLowerCase().split(/\s+/);
        const commonWords = userWords.filter(word => 
          word.length > 4 && personWords.includes(word)
        );
        score += commonWords.length * 1.5; // Professional background similarity
      }
      
      // Cross-field complementary matching (aspirations vs background)
      if (user.aspirations && person.background) {
        const userAspirationsLower = user.aspirations.toLowerCase();
        const personBackgroundLower = person.background.toLowerCase();
        
        // Enhanced keyword matching for complementary skills
        const keywords = ['design', 'tech', 'startup', 'business', 'engineering', 'product', 'marketing', 'data', 'finance', 'consulting'];
        keywords.forEach(keyword => {
          if (userAspirationsLower.includes(keyword) && personBackgroundLower.includes(keyword)) {
            score += 1;
          }
        });
      }
      
      return { person, score };
    });
    
    // Sort by score and return top recommendations
    return scoredUsers
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(({ person }) => person);
  }
}

export const storage = new DatabaseStorage();

import { users, events, eventAttendees, connections, type User, type InsertUser, type Event, type InsertEvent, type EventAttendee, type InsertEventAttendee, type Connection, type InsertConnection, type EventWithHost, type EventWithAttendees, type UserProfile } from "@shared/schema";
import { nanoid } from "nanoid";

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

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private events: Map<number, Event> = new Map();
  private eventAttendees: Map<number, EventAttendee> = new Map();
  private connections: Map<number, Connection> = new Map();
  private currentUserId = 1;
  private currentEventId = 1;
  private currentEventAttendeeId = 1;
  private currentConnectionId = 1;

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Create sample users
    const users: (InsertUser & { id: number })[] = [
      {
        id: 1,
        username: "sarah_johnson",
        email: "sarah@example.com",
        password: "password123",
        confirmPassword: "password123",
        fullName: "Sarah Johnson",
        age: 28,
        school: "Stanford University",
        background: "Product designer passionate about sustainable technology and creating user experiences that make a positive impact on the world.",
        aspirations: "Building the next generation of eco-friendly mobile applications that seamlessly integrate sustainable practices into daily life.",
        interests: ["UI/UX Design", "Rock Climbing", "Sustainability", "Photography", "Coffee"],
        socialLinks: {
          linkedin: "https://linkedin.com/in/sarah-johnson",
          website: "https://sarahjohnson.design"
        },
        profilePhoto: "https://pixabay.com/get/ga4d443bccc8a0e70fba5320bd0cf771f32843c0ce04b606d76263be56203e0c69e80a8d883a18afb6ee8e0e0d71647930918b0d1d8f5326fd40bd767b9f806d6_1280.jpg"
      },
      {
        id: 2,
        username: "michael_chen",
        email: "michael@example.com",
        password: "password123",
        confirmPassword: "password123",
        fullName: "Michael Chen",
        age: 26,
        school: "UC Berkeley",
        background: "Software engineer building AI solutions for social good.",
        aspirations: "Developing machine learning models that can help solve climate change and social inequality.",
        interests: ["AI/ML", "Chess", "Hiking", "Cooking"],
        socialLinks: {
          linkedin: "https://linkedin.com/in/michael-chen",
          website: "https://michaelchen.dev"
        },
        profilePhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=400"
      }
    ];

    users.forEach(user => {
      const { confirmPassword, ...userData } = user;
      this.users.set(user.id, {
        ...userData,
        createdAt: new Date()
      });
    });

    this.currentUserId = users.length + 1;
  }

  // User operations
  async createUser(user: InsertUser): Promise<UserProfile> {
    const id = this.currentUserId++;
    const { confirmPassword, ...userData } = user;
    const newUser: User = {
      ...userData,
      id,
      createdAt: new Date(),
    };
    this.users.set(id, newUser);
    const { password, ...userProfile } = newUser;
    return userProfile;
  }

  async getUserById(id: number): Promise<UserProfile | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const { password, ...userProfile } = user;
    return userProfile;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async updateUser(id: number, updates: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<UserProfile> {
    const user = this.users.get(id);
    if (!user) throw new Error('User not found');
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    const { password, ...userProfile } = updatedUser;
    return userProfile;
  }

  // Event operations
  async createEvent(event: InsertEvent & { hostId: number }): Promise<Event> {
    const id = this.currentEventId++;
    const qrCode = nanoid(12);
    const newEvent: Event = {
      ...event,
      id,
      qrCode,
      createdAt: new Date(),
    };
    this.events.set(id, newEvent);
    return newEvent;
  }

  async getEventById(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }

  async getEventByQrCode(qrCode: string): Promise<Event | undefined> {
    return Array.from(this.events.values()).find(event => event.qrCode === qrCode);
  }

  async getEventsByHostId(hostId: number): Promise<Event[]> {
    return Array.from(this.events.values()).filter(event => event.hostId === hostId);
  }

  async getAllEvents(): Promise<EventWithHost[]> {
    const events = Array.from(this.events.values());
    return events.map(event => {
      const host = this.users.get(event.hostId);
      const attendeeCount = Array.from(this.eventAttendees.values())
        .filter(attendee => attendee.eventId === event.id).length;
      
      if (!host) throw new Error('Host not found');
      const { password, ...hostProfile } = host;
      
      return {
        ...event,
        host: hostProfile,
        attendeeCount
      };
    });
  }

  async updateEvent(id: number, updates: Partial<Omit<Event, 'id' | 'createdAt'>>): Promise<Event> {
    const event = this.events.get(id);
    if (!event) throw new Error('Event not found');
    
    const updatedEvent = { ...event, ...updates };
    this.events.set(id, updatedEvent);
    return updatedEvent;
  }

  async deleteEvent(id: number): Promise<boolean> {
    return this.events.delete(id);
  }

  // Event attendee operations
  async joinEvent(eventId: number, userId: number): Promise<EventAttendee> {
    const existing = Array.from(this.eventAttendees.values())
      .find(attendee => attendee.eventId === eventId && attendee.userId === userId);
    
    if (existing) {
      return existing;
    }

    const id = this.currentEventAttendeeId++;
    const newAttendee: EventAttendee = {
      id,
      eventId,
      userId,
      joinedAt: new Date(),
    };
    this.eventAttendees.set(id, newAttendee);
    return newAttendee;
  }

  async leaveEvent(eventId: number, userId: number): Promise<boolean> {
    const attendeeEntry = Array.from(this.eventAttendees.entries())
      .find(([_, attendee]) => attendee.eventId === eventId && attendee.userId === userId);
    
    if (attendeeEntry) {
      this.eventAttendees.delete(attendeeEntry[0]);
      return true;
    }
    return false;
  }

  async getEventAttendees(eventId: number): Promise<UserProfile[]> {
    const attendeeIds = Array.from(this.eventAttendees.values())
      .filter(attendee => attendee.eventId === eventId)
      .map(attendee => attendee.userId);
    
    return attendeeIds.map(id => {
      const user = this.users.get(id);
      if (!user) throw new Error('User not found');
      const { password, ...userProfile } = user;
      return userProfile;
    });
  }

  async getUserEvents(userId: number): Promise<Event[]> {
    const eventIds = Array.from(this.eventAttendees.values())
      .filter(attendee => attendee.userId === userId)
      .map(attendee => attendee.eventId);
    
    return eventIds.map(id => {
      const event = this.events.get(id);
      if (!event) throw new Error('Event not found');
      return event;
    });
  }

  async isUserAttending(eventId: number, userId: number): Promise<boolean> {
    return Array.from(this.eventAttendees.values())
      .some(attendee => attendee.eventId === eventId && attendee.userId === userId);
  }

  // Connection operations
  async createConnection(connection: InsertConnection): Promise<Connection> {
    const id = this.currentConnectionId++;
    const newConnection: Connection = {
      ...connection,
      id,
      createdAt: new Date(),
    };
    this.connections.set(id, newConnection);
    return newConnection;
  }

  async getUserConnections(userId: number): Promise<UserProfile[]> {
    const connectionUserIds = Array.from(this.connections.values())
      .filter(conn => conn.fromUserId === userId || conn.toUserId === userId)
      .map(conn => conn.fromUserId === userId ? conn.toUserId : conn.fromUserId);
    
    return connectionUserIds.map(id => {
      const user = this.users.get(id);
      if (!user) throw new Error('User not found');
      const { password, ...userProfile } = user;
      return userProfile;
    });
  }

  async getEventConnections(eventId: number, userId: number): Promise<UserProfile[]> {
    const connectionUserIds = Array.from(this.connections.values())
      .filter(conn => conn.eventId === eventId && 
        (conn.fromUserId === userId || conn.toUserId === userId))
      .map(conn => conn.fromUserId === userId ? conn.toUserId : conn.fromUserId);
    
    return connectionUserIds.map(id => {
      const user = this.users.get(id);
      if (!user) throw new Error('User not found');
      const { password, ...userProfile } = user;
      return userProfile;
    });
  }
}

export const storage = new MemStorage();

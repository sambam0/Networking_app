import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertEventSchema, insertEventAttendeeSchema, insertConnectionSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'));
    }
  }
});

// Session user type
declare global {
  namespace Express {
    interface User {
      id: number;
      email: string;
      username: string;
    }
  }
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session?.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    next();
  };

  // Auth routes
  app.post('/api/auth/signup', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const user = await storage.createUser(userData);
      req.session.user = { id: user.id, email: user.email, username: user.username };
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Invalid data' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      req.session.user = { id: user.id, email: user.email, username: user.username };
      const { password: _, ...userProfile } = user;
      res.json(userProfile);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Invalid data' });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy(() => {
      res.json({ message: 'Logged out successfully' });
    });
  });

  app.get('/api/auth/me', requireAuth, async (req, res) => {
    try {
      const user = await storage.getUserById(req.session.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  // User routes
  app.get('/api/users/:id', requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUserById(id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.put('/api/users/:id', requireAuth, upload.single('profilePhoto'), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (id !== req.session.user.id) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      console.log('Raw req.body:', req.body);
      const updates = { ...req.body };
      console.log('Initial updates object:', updates);
      
      // Handle file upload
      if (req.file) {
        const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
        updates.profilePhoto = base64Image;
      }

      // Parse interests array if provided
      if (updates.interests && typeof updates.interests === 'string') {
        updates.interests = JSON.parse(updates.interests);
      }

      // Parse social links if provided
      if (updates.socialLinks && typeof updates.socialLinks === 'string') {
        try {
          updates.socialLinks = JSON.parse(updates.socialLinks);
        } catch (e) {
          // If parsing fails, remove the field
          delete updates.socialLinks;
        }
      }

      // Remove undefined and null values, keep empty strings
      const cleanedUpdates = Object.keys(updates).reduce((acc, key) => {
        if (updates[key] !== undefined && updates[key] !== null) {
          acc[key] = updates[key];
        }
        return acc;
      }, {} as any);

      // Check if we have any updates to make
      if (Object.keys(cleanedUpdates).length === 0) {
        return res.status(400).json({ message: 'No values to set' });
      }

      console.log('Updates to apply:', cleanedUpdates); // Debug log
      const user = await storage.updateUser(id, cleanedUpdates);
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Update failed' });
    }
  });

  // Event routes
  app.get('/api/events', requireAuth, async (req, res) => {
    try {
      const events = await storage.getAllEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/api/events/:id', requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const event = await storage.getEventById(id);
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }
      
      const host = await storage.getUserById(event.hostId);
      const attendees = await storage.getEventAttendees(id);
      
      res.json({
        ...event,
        host,
        attendees
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/api/events', requireAuth, async (req, res) => {
    try {
      const eventData = insertEventSchema.parse(req.body);
      const event = await storage.createEvent({
        ...eventData,
        hostId: req.session.user.id
      });
      res.json(event);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Invalid data' });
    }
  });

  app.get('/api/events/qr/:qrCode', requireAuth, async (req, res) => {
    try {
      const event = await storage.getEventByQrCode(req.params.qrCode);
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }
      res.json(event);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/api/events/:id/join', requireAuth, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const userId = req.session.user.id;
      
      const event = await storage.getEventById(eventId);
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }

      const attendee = await storage.joinEvent(eventId, userId);
      res.json(attendee);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Failed to join event' });
    }
  });

  app.delete('/api/events/:id/leave', requireAuth, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const userId = req.session.user.id;
      
      const success = await storage.leaveEvent(eventId, userId);
      if (!success) {
        return res.status(400).json({ message: 'Not attending this event' });
      }
      
      res.json({ message: 'Left event successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/api/events/:id/attendees', requireAuth, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const attendees = await storage.getEventAttendees(eventId);
      res.json(attendees);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/api/user/events', requireAuth, async (req, res) => {
    try {
      const events = await storage.getUserEvents(req.session.user.id);
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/api/user/hosted-events', requireAuth, async (req, res) => {
    try {
      const events = await storage.getEventsByHostId(req.session.user.id);
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Connection routes
  app.post('/api/connections', requireAuth, async (req, res) => {
    try {
      const connectionData = insertConnectionSchema.parse(req.body);
      const connection = await storage.createConnection({
        ...connectionData,
        fromUserId: req.session.user.id
      });
      res.json(connection);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Invalid data' });
    }
  });

  app.get('/api/user/connections', requireAuth, async (req, res) => {
    try {
      const connections = await storage.getUserConnections(req.session.user.id);
      res.json(connections);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertEventSchema, insertEventAttendeeSchema, insertConnectionSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";
import { setupAuth, passport } from "./auth";

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

const basicSignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const profileCompleteSchema = z.object({
  username: z.string().min(3),
  fullName: z.string().min(2),
  age: z.number().min(13).max(120),
  hometown: z.string().optional(),
  state: z.string().optional(),
  college: z.string().optional(),
  highSchool: z.string().optional(),
  background: z.string().optional(),
  aspirations: z.string().optional(),
  interests: z.string().optional(), // JSON string of array
  socialLinks: z.string().optional(), // JSON string of object
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);

  // Auth middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session?.user && !req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    next();
  };

  // Auth routes
  // Step 1: Basic signup with email/password
  app.post('/api/auth/signup-basic', async (req, res) => {
    try {
      const { email, password } = basicSignupSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Create basic user with temporary username
      const tempUsername = email.split('@')[0] + '_' + Date.now();
      const user = await storage.createUser({
        email,
        password,
        username: tempUsername,
        fullName: '', // Will be filled in during profile completion
        confirmPassword: password,
        authProvider: 'email',
        // Add default empty values for other fields
        age: null,
        hometown: null,
        state: null,
        college: null,
        highSchool: null,
        school: null,
        background: null,
        aspirations: null,
        interests: [],
        socialLinks: {},
      });
      
      req.session.user = { id: user.id, email: user.email, username: user.username };
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Invalid data' });
    }
  });

  // Step 2: Complete profile
  app.post('/api/auth/complete-profile', requireAuth, upload.single('profilePhoto'), async (req, res) => {
    try {
      const userId = req.session.user?.id || (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const profileData = profileCompleteSchema.parse(req.body);
      
      // Parse JSON fields
      const interests = profileData.interests ? JSON.parse(profileData.interests) : [];
      const socialLinks = profileData.socialLinks ? JSON.parse(profileData.socialLinks) : {};

      // Check if username is already taken (exclude current user)
      const existingUser = await storage.getUserByUsername(profileData.username);
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({ message: 'Username already taken' });
      }

      // Handle profile photo if uploaded
      let profilePhotoPath = undefined;
      if (req.file) {
        // In a real app, you'd save to cloud storage
        // For now, we'll store as base64 (not recommended for production)
        profilePhotoPath = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      }

      // Update user with complete profile
      const updatedUser = await storage.updateUser(userId, {
        username: profileData.username,
        fullName: profileData.fullName,
        age: profileData.age,
        hometown: profileData.hometown,
        state: profileData.state,
        college: profileData.college,
        highSchool: profileData.highSchool,
        background: profileData.background,
        aspirations: profileData.aspirations,
        interests,
        socialLinks,
        ...(profilePhotoPath && { profilePhoto: profilePhotoPath }),
      });

      // Update session
      req.session.user = { 
        id: updatedUser.id, 
        email: updatedUser.email, 
        username: updatedUser.username 
      };

      res.json(updatedUser);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Invalid data' });
    }
  });

  // Legacy full signup (keep for backward compatibility)
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

  // Google OAuth routes - only if credentials are available
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    app.get('/api/auth/google', 
      passport.authenticate('google', { scope: ['profile', 'email'] })
    );

    app.get('/api/auth/google/callback',
      passport.authenticate('google', { failureRedirect: '/login' }),
      (req, res) => {
        // Successful authentication, set session and redirect
        const user = req.user as any;
        req.session.user = { 
          id: user.id, 
          email: user.email, 
          username: user.username 
        };
        
        // Check if this is a new user who needs to complete their profile
        // Google users created with incomplete profile should go to completion
        console.log('Google OAuth user:', { 
          username: user.username, 
          fullName: user.fullName, 
          shouldComplete: user.username.includes('user_') || !user.fullName || user.fullName === '' 
        });
        
        if (user.username.includes('user_') || !user.fullName || user.fullName === '') {
          res.redirect('/signup/complete');
        } else {
          res.redirect('/dashboard');
        }
      }
    );
  } else {
    // Placeholder routes when Google OAuth is not configured
    app.get('/api/auth/google', (req, res) => {
      res.status(501).json({ message: 'Google OAuth not configured' });
    });
    
    app.get('/api/auth/google/callback', (req, res) => {
      res.status(501).json({ message: 'Google OAuth not configured' });
    });
  }

  app.get('/api/auth/me', requireAuth, async (req, res) => {
    try {
      const userId = req.session?.user?.id || (req.user as any)?.id;
      const user = await storage.getUserById(userId);
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
      const userId = req.session.user.id;
      
      // Check if user is attending this event or is the host
      const isHost = event.hostId === userId;
      const isAttending = await storage.isUserAttendingEvent(id, userId);

      // For public events, show attendees. For private events, only show if attending or host
      let attendees = [];
      if (event.isPublic || isHost || isAttending) {
        const allAttendees = await storage.getEventAttendees(id);
        
        // Filter attendee data based on event's visible fields settings
        const visibleFields = event.visibleFields || {
          fullName: true, age: true, hometown: true, state: true,
          college: true, highSchool: true, school: true, background: true,
          aspirations: true, interests: true, socialLinks: true, profilePhoto: true
        };

        attendees = allAttendees.map(attendee => {
          const filteredAttendee: any = { id: attendee.id };

          // Always include required fields
          filteredAttendee.fullName = attendee.fullName;

          // Include optional fields based on settings
          if (visibleFields.age) filteredAttendee.age = attendee.age;
          if (visibleFields.hometown) filteredAttendee.hometown = attendee.hometown;
          if (visibleFields.state) filteredAttendee.state = attendee.state;
          if (visibleFields.college) filteredAttendee.college = attendee.college;
          if (visibleFields.highSchool) filteredAttendee.highSchool = attendee.highSchool;
          if (visibleFields.school) filteredAttendee.school = attendee.school;
          if (visibleFields.background) filteredAttendee.background = attendee.background;
          if (visibleFields.aspirations) filteredAttendee.aspirations = attendee.aspirations;
          if (visibleFields.interests) filteredAttendee.interests = attendee.interests;
          if (visibleFields.socialLinks) filteredAttendee.socialLinks = attendee.socialLinks;
          if (visibleFields.profilePhoto) filteredAttendee.profilePhoto = attendee.profilePhoto;

          return filteredAttendee;
        });
      }
      
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
      const userId = req.session.user.id;

      // Get the event to check privacy settings
      const event = await storage.getEventById(eventId);
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }

      // Check if user is attending this event or is the host
      const isHost = event.hostId === userId;
      const isAttending = await storage.isUserAttendingEvent(eventId, userId);

      if (!isHost && !isAttending) {
        return res.status(403).json({ message: 'Access denied' });
      }

      // If event is private, only show attendees if user is currently at the event
      // For now, we'll assume that if user is attending, they have access
      // In a real app, you might check location or QR scan timestamp
      if (!event.isPublic && !isHost) {
        // Could implement additional checks here for "at event" status
      }

      const attendees = await storage.getEventAttendees(eventId);
      
      // Filter attendee data based on event's visible fields settings
      const visibleFields = event.visibleFields || {
        fullName: true, age: true, hometown: true, state: true,
        college: true, highSchool: true, school: true, background: true,
        aspirations: true, interests: true, socialLinks: true, profilePhoto: true
      };

      const filteredAttendees = attendees.map(attendee => {
        const filteredAttendee: any = { id: attendee.id };

        // Always include required fields
        filteredAttendee.fullName = attendee.fullName;

        // Include optional fields based on settings
        if (visibleFields.age) filteredAttendee.age = attendee.age;
        if (visibleFields.hometown) filteredAttendee.hometown = attendee.hometown;
        if (visibleFields.state) filteredAttendee.state = attendee.state;
        if (visibleFields.college) filteredAttendee.college = attendee.college;
        if (visibleFields.highSchool) filteredAttendee.highSchool = attendee.highSchool;
        if (visibleFields.school) filteredAttendee.school = attendee.school;
        if (visibleFields.background) filteredAttendee.background = attendee.background;
        if (visibleFields.aspirations) filteredAttendee.aspirations = attendee.aspirations;
        if (visibleFields.interests) filteredAttendee.interests = attendee.interests;
        if (visibleFields.socialLinks) filteredAttendee.socialLinks = attendee.socialLinks;
        if (visibleFields.profilePhoto) filteredAttendee.profilePhoto = attendee.profilePhoto;

        return filteredAttendee;
      });

      res.json(filteredAttendees);
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

  // Recommendation routes
  app.get('/api/recommendations/events', requireAuth, async (req, res) => {
    try {
      const recommendedEvents = await storage.getRecommendedEvents(req.session.user.id);
      res.json(recommendedEvents);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/api/recommendations/people', requireAuth, async (req, res) => {
    try {
      const eventId = req.query.eventId ? parseInt(req.query.eventId as string) : undefined;
      const recommendedPeople = await storage.getRecommendedPeople(req.session.user.id, eventId);
      res.json(recommendedPeople);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Admin routes (protected)
  const requireAdmin = async (req: any, res: any, next: any) => {
    if (!req.session?.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Check admin privileges using new system
    const adminCheck = await storage.checkAdminPrivileges(req.session.user.id);
    
    if (!adminCheck.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    // Attach admin info to request for use in routes
    req.adminLevel = adminCheck.adminLevel;
    req.isSystemAdmin = adminCheck.isSystemAdmin;
    
    next();
  };

  // Require super admin for sensitive operations
  const requireSuperAdmin = async (req: any, res: any, next: any) => {
    if (!req.session?.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const adminCheck = await storage.checkAdminPrivileges(req.session.user.id);
    
    if (!adminCheck.isAdmin || (adminCheck.adminLevel !== 'super' && !adminCheck.isSystemAdmin)) {
      return res.status(403).json({ message: 'Super admin access required' });
    }
    
    req.adminLevel = adminCheck.adminLevel;
    req.isSystemAdmin = adminCheck.isSystemAdmin;
    
    next();
  };

  // Get all users (admin only)
  app.get('/api/admin/users', requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error('Error fetching all users:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Get all events (admin only)
  app.get('/api/admin/events', requireAdmin, async (req, res) => {
    try {
      const events = await storage.getAllEventsWithDetails();
      res.json(events);
    } catch (error) {
      console.error('Error fetching all events:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Get all connections (admin only)
  app.get('/api/admin/connections', requireAdmin, async (req, res) => {
    try {
      const connections = await storage.getAllConnections();
      res.json(connections);
    } catch (error) {
      console.error('Error fetching all connections:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Get admin stats (admin only)
  app.get('/api/admin/stats', requireAdmin, async (req, res) => {
    try {
      const [users, events, connections] = await Promise.all([
        storage.getAllUsers(),
        storage.getAllEvents(),
        storage.getAllConnections()
      ]);

      const stats = {
        totalUsers: users.length,
        totalEvents: events.length,
        totalConnections: connections.length,
        activeToday: users.filter((user: any) => {
          // Check if user was active today (you can implement this logic)
          return new Date(user.createdAt || new Date()).toDateString() === new Date().toDateString();
        }).length
      };

      res.json(stats);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Admin management routes
  app.get('/api/admin/admins', requireSuperAdmin, async (req, res) => {
    try {
      const adminUsers = await storage.getAdminUsers();
      res.json(adminUsers);
    } catch (error) {
      console.error('Error fetching admin users:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/api/admin/admins', requireSuperAdmin, async (req, res) => {
    try {
      const { email, adminLevel } = req.body;
      
      if (!email || !adminLevel) {
        return res.status(400).json({ message: 'Email and admin level are required' });
      }

      if (!['super', 'standard', 'readonly'].includes(adminLevel)) {
        return res.status(400).json({ message: 'Invalid admin level' });
      }

      const newAdmin = await storage.grantAdminPrivileges(email, adminLevel, req.session.user.id);
      res.json(newAdmin);
    } catch (error) {
      console.error('Error granting admin privileges:', error);
      res.status(400).json({ message: error instanceof Error ? error.message : 'Failed to grant admin privileges' });
    }
  });

  app.delete('/api/admin/admins/:userId', requireSuperAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (userId === req.session.user.id) {
        return res.status(400).json({ message: 'Cannot revoke your own admin privileges' });
      }

      const success = await storage.revokeAdminPrivileges(userId);
      
      if (!success) {
        return res.status(404).json({ message: 'Admin not found or cannot revoke system admin' });
      }

      res.json({ message: 'Admin privileges revoked successfully' });
    } catch (error) {
      console.error('Error revoking admin privileges:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.patch('/api/admin/admins/:userId', requireSuperAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { adminLevel } = req.body;
      
      if (!adminLevel || !['super', 'standard', 'readonly'].includes(adminLevel)) {
        return res.status(400).json({ message: 'Valid admin level is required' });
      }

      const updatedAdmin = await storage.updateAdminLevel(userId, adminLevel);
      res.json(updatedAdmin);
    } catch (error) {
      console.error('Error updating admin level:', error);
      res.status(400).json({ message: error instanceof Error ? error.message : 'Failed to update admin level' });
    }
  });

  app.get('/api/admin/settings', requireAdmin, async (req, res) => {
    try {
      const adminCheck = await storage.checkAdminPrivileges(req.session.user.id);
      res.json({
        currentUser: {
          id: req.session.user.id,
          adminLevel: adminCheck.adminLevel,
          isSystemAdmin: adminCheck.isSystemAdmin,
        },
        permissions: {
          canManageAdmins: adminCheck.adminLevel === 'super' || adminCheck.isSystemAdmin,
          canViewData: true,
          canModifyData: adminCheck.adminLevel !== 'readonly',
        }
      });
    } catch (error) {
      console.error('Error fetching admin settings:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

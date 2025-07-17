import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Navbar from "@/components/layout/navbar";
import { 
  Users, 
  Calendar, 
  Activity, 
  Settings, 
  Eye, 
  MapPin, 
  Clock, 
  User as UserIcon,
  Database,
  TrendingUp,
  Shield,
  Search
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { type User, type Event } from "@shared/schema";
import { useState } from "react";

export default function AdminPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);

  // Fetch all data
  const { data: allUsers, isLoading: usersLoading } = useQuery({
    queryKey: ['/api/admin/users'],
  });

  const { data: allEvents, isLoading: eventsLoading } = useQuery({
    queryKey: ['/api/admin/events'],
  });

  const { data: adminStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/admin/stats'],
  });

  const { data: connections, isLoading: connectionsLoading } = useQuery({
    queryKey: ['/api/admin/connections'],
  });

  // Check if user has admin access (you can modify this logic)
  const isAdmin = user?.email === 'admin@realconnect.ing' || user?.id === 1;

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-2xl font-bold mb-4">Access Required</h1>
            <p className="text-muted-foreground mb-4">Please log in to access the admin panel</p>
            <Button onClick={() => setLocation("/login")}>Login</Button>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="text-muted-foreground mb-4">You don't have permission to access the admin panel</p>
            <Button onClick={() => setLocation("/dashboard")}>Back to Dashboard</Button>
          </div>
        </div>
      </div>
    );
  }

  const filteredUsers = allUsers?.filter((user: User) =>
    user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const filteredEvents = allEvents?.filter((event: Event) =>
    event.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">
              Development data viewer and system administration
            </p>
          </div>
          <Badge variant="destructive" className="gap-1">
            <Shield className="h-3 w-3" />
            Admin Access
          </Badge>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">
                    {statsLoading ? <Skeleton className="h-8 w-16" /> : adminStats?.totalUsers || allUsers?.length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Events</p>
                  <p className="text-2xl font-bold">
                    {statsLoading ? <Skeleton className="h-8 w-16" /> : adminStats?.totalEvents || allEvents?.length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Activity className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Connections</p>
                  <p className="text-2xl font-bold">
                    {statsLoading ? <Skeleton className="h-8 w-16" /> : adminStats?.totalConnections || connections?.length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-orange-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Active Today</p>
                  <p className="text-2xl font-bold">
                    {statsLoading ? <Skeleton className="h-8 w-16" /> : adminStats?.activeToday || "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search users, events, or any data..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Data Tabs */}
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users ({allUsers?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Events ({allEvents?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="connections" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Connections ({connections?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              System
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Complete user database with profiles and authentication data
                </p>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-4 p-4 border rounded">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-1/4 mb-2" />
                          <Skeleton className="h-3 w-1/3" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Auth Provider</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Interests</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user: User) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              {user.profilePhoto ? (
                                <img 
                                  src={user.profilePhoto} 
                                  alt={user.fullName || user.username} 
                                  className="h-8 w-8 rounded-full object-cover"
                                />
                              ) : (
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                  <UserIcon className="h-4 w-4 text-primary" />
                                </div>
                              )}
                              <div>
                                <p className="font-medium">{user.fullName || user.username}</p>
                                <p className="text-sm text-muted-foreground">@{user.username}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge variant={user.authProvider === 'google' ? 'default' : 'secondary'}>
                              {user.authProvider || 'email'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {user.hometown && user.state ? `${user.hometown}, ${user.state}` : 'Not set'}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {user.interests?.slice(0, 2).map((interest, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {interest}
                                </Badge>
                              ))}
                              {user.interests && user.interests.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{user.interests.length - 2}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={() => setSelectedUser(user)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>User Details: {user.fullName}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-sm font-medium">Full Name</label>
                                      <p className="text-sm text-muted-foreground">{user.fullName || 'Not set'}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Username</label>
                                      <p className="text-sm text-muted-foreground">{user.username}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Email</label>
                                      <p className="text-sm text-muted-foreground">{user.email}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Age</label>
                                      <p className="text-sm text-muted-foreground">{user.age || 'Not set'}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Location</label>
                                      <p className="text-sm text-muted-foreground">
                                        {user.hometown && user.state ? `${user.hometown}, ${user.state}` : 'Not set'}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Education</label>
                                      <p className="text-sm text-muted-foreground">
                                        {user.college || user.highSchool || 'Not set'}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <label className="text-sm font-medium">Background</label>
                                    <p className="text-sm text-muted-foreground">{user.background || 'Not set'}</p>
                                  </div>
                                  
                                  <div>
                                    <label className="text-sm font-medium">Aspirations</label>
                                    <p className="text-sm text-muted-foreground">{user.aspirations || 'Not set'}</p>
                                  </div>
                                  
                                  <div>
                                    <label className="text-sm font-medium">Interests</label>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {user.interests?.map((interest, idx) => (
                                        <Badge key={idx} variant="outline">
                                          {interest}
                                        </Badge>
                                      )) || <span className="text-sm text-muted-foreground">None set</span>}
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <label className="text-sm font-medium">Social Links</label>
                                    <div className="mt-1">
                                      {user.socialLinks && Object.keys(user.socialLinks).length > 0 ? (
                                        <div className="space-y-1">
                                          {Object.entries(user.socialLinks).map(([platform, url]) => (
                                            <div key={platform} className="flex justify-between text-sm">
                                              <span className="capitalize">{platform}:</span>
                                              <span className="text-muted-foreground">{url}</span>
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <span className="text-sm text-muted-foreground">None set</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>All Events</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Complete events database with attendance and host information
                </p>
              </CardHeader>
              <CardContent>
                {eventsLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="p-4 border rounded">
                        <Skeleton className="h-6 w-1/3 mb-2" />
                        <Skeleton className="h-4 w-1/2 mb-2" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Event</TableHead>
                        <TableHead>Date & Location</TableHead>
                        <TableHead>Host</TableHead>
                        <TableHead>Attendees</TableHead>
                        <TableHead>Privacy</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEvents.map((event: EventWithAttendees) => (
                        <TableRow key={event.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{event.name}</p>
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {event.description || 'No description'}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-1 text-sm">
                                <Clock className="h-3 w-3" />
                                {new Date(event.date).toLocaleDateString()} at {new Date(event.date).toLocaleTimeString()}
                              </div>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                {event.location}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {event.host ? (
                              <div>
                                <p className="font-medium">{event.host.fullName}</p>
                                <p className="text-sm text-muted-foreground">@{event.host.username}</p>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">Unknown</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {event.attendees?.length || 0} attendees
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={event.isPublic ? "default" : "secondary"}>
                              {event.isPublic ? "Public" : "Private"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={() => setSelectedEvent(event)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-3xl">
                                <DialogHeader>
                                  <DialogTitle>Event Details: {event.name}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-sm font-medium">Event Name</label>
                                      <p className="text-sm text-muted-foreground">{event.name}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Date & Time</label>
                                      <p className="text-sm text-muted-foreground">
                                        {new Date(event.date).toLocaleString()}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Location</label>
                                      <p className="text-sm text-muted-foreground">{event.location}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Privacy</label>
                                      <p className="text-sm text-muted-foreground">
                                        {event.isPublic ? "Public" : "Private"}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <label className="text-sm font-medium">Description</label>
                                    <p className="text-sm text-muted-foreground">{event.description || 'No description provided'}</p>
                                  </div>
                                  
                                  <div>
                                    <label className="text-sm font-medium">Host Information</label>
                                    {event.host ? (
                                      <div className="mt-1 p-3 bg-muted rounded">
                                        <p className="font-medium">{event.host.fullName}</p>
                                        <p className="text-sm text-muted-foreground">@{event.host.username}</p>
                                        <p className="text-sm text-muted-foreground">{event.host.email}</p>
                                      </div>
                                    ) : (
                                      <p className="text-sm text-muted-foreground">Host information not available</p>
                                    )}
                                  </div>
                                  
                                  <div>
                                    <label className="text-sm font-medium">
                                      Attendees ({event.attendees?.length || 0})
                                    </label>
                                    <div className="mt-1 max-h-32 overflow-y-auto">
                                      {event.attendees && event.attendees.length > 0 ? (
                                        <div className="space-y-2">
                                          {event.attendees.map((attendee: User) => (
                                            <div key={attendee.id} className="flex items-center space-x-2 p-2 bg-muted rounded">
                                              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                                                <UserIcon className="h-3 w-3 text-primary" />
                                              </div>
                                              <div>
                                                <p className="text-sm font-medium">{attendee.fullName}</p>
                                                <p className="text-xs text-muted-foreground">@{attendee.username}</p>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <p className="text-sm text-muted-foreground">No attendees yet</p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="connections" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>All Connections</CardTitle>
                <p className="text-sm text-muted-foreground">
                  User connections and networking data
                </p>
              </CardHeader>
              <CardContent>
                {connectionsLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : connections && connections.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User 1</TableHead>
                        <TableHead>User 2</TableHead>
                        <TableHead>Event</TableHead>
                        <TableHead>Connected At</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {connections.map((connection: any) => (
                        <TableRow key={`${connection.userId1}-${connection.userId2}-${connection.eventId}`}>
                          <TableCell>
                            {connection.user1 ? (
                              <div>
                                <p className="font-medium">{connection.user1.fullName}</p>
                                <p className="text-sm text-muted-foreground">@{connection.user1.username}</p>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">User {connection.userId1}</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {connection.user2 ? (
                              <div>
                                <p className="font-medium">{connection.user2.fullName}</p>
                                <p className="text-sm text-muted-foreground">@{connection.user2.username}</p>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">User {connection.userId2}</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {connection.event ? (
                              <div>
                                <p className="font-medium">{connection.event.name}</p>
                                <p className="text-sm text-muted-foreground">{new Date(connection.event.date).toLocaleDateString()}</p>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">Event {connection.eventId}</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {connection.createdAt ? new Date(connection.createdAt).toLocaleString() : 'Unknown'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No connections found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Environment</label>
                    <p className="text-sm text-muted-foreground">Development</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Database</label>
                    <p className="text-sm text-muted-foreground">PostgreSQL (Neon)</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Authentication</label>
                    <p className="text-sm text-muted-foreground">Session-based + Google OAuth</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Domain</label>
                    <p className="text-sm text-muted-foreground">realconnect.ing</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm">
                      <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                      <span>Calendar sync feature implemented</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                      <span>Google OAuth authentication active</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <div className="h-2 w-2 bg-purple-500 rounded-full"></div>
                      <span>Social media integration active</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
                      <span>Advanced recommendations engine active</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
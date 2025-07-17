import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth";
import { useState } from "react";
import { 
  Users, 
  Calendar, 
  MapPin, 
  MessageCircle, 
  ExternalLink,
  Mail,
  School,
  User as UserIcon,
  Heart,
  Clock
} from "lucide-react";
import { type UserProfile } from "@shared/schema";

interface Connection {
  id: number;
  connectedUser: UserProfile;
  event: {
    id: number;
    name: string;
    location: string;
    date: string;
  };
  createdAt: string;
}

interface ConnectionStats {
  totalConnections: number;
  recentConnections: number;
  topEvents: Array<{
    eventName: string;
    connectionCount: number;
  }>;
  connectionsByMonth: Array<{
    month: string;
    count: number;
  }>;
}

export function MyConnections() {
  const { user } = useAuth();
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null);

  const { data: connections, isLoading: connectionsLoading } = useQuery<Connection[]>({
    queryKey: ['/api/user/connections'],
  });

  const { data: stats, isLoading: statsLoading } = useQuery<ConnectionStats>({
    queryKey: ['/api/user/connection-stats'],
  });

  if (connectionsLoading || statsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatSocialLinks = (socialLinks: any) => {
    if (!socialLinks) return [];
    return Object.entries(socialLinks)
      .filter(([_, url]) => url && url.toString().trim() !== '')
      .map(([platform, url]) => ({ platform, url: url as string }));
  };

  return (
    <div className="space-y-6">
      {/* Connection Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {stats?.totalConnections || 0}
                </p>
                <p className="text-sm text-muted-foreground">Total Connections</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {stats?.recentConnections || 0}
                </p>
                <p className="text-sm text-muted-foreground">This Month</p>
              </div>
              <Clock className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-purple-600">
                  {stats?.topEvents?.length || 0}
                </p>
                <p className="text-sm text-muted-foreground">Events Networked</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Events for Networking */}
      {stats?.topEvents && stats.topEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Your Best Networking Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topEvents.map((event, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="font-medium">{event.eventName}</span>
                  <Badge variant="secondary">
                    {event.connectionCount} connections
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Connections List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Your Connections ({connections?.length || 0})
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            People you've connected with at events
          </p>
        </CardHeader>
        <CardContent>
          {connections && connections.length > 0 ? (
            <div className="space-y-4">
              {connections.map((connection) => (
                <div 
                  key={connection.id} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      {connection.connectedUser.profilePhoto ? (
                        <img
                          src={connection.connectedUser.profilePhoto}
                          alt={connection.connectedUser.fullName}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <UserIcon className="h-6 w-6 text-white" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{connection.connectedUser.fullName}</h3>
                        {connection.connectedUser.age && (
                          <Badge variant="outline" className="text-xs">
                            {connection.connectedUser.age}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{connection.event.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{connection.event.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(connection.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Quick Info Preview */}
                      <div className="flex items-center gap-2 mt-2">
                        {connection.connectedUser.hometown && connection.connectedUser.state && (
                          <Badge variant="secondary" className="text-xs">
                            <MapPin className="h-3 w-3 mr-1" />
                            {connection.connectedUser.hometown}, {connection.connectedUser.state}
                          </Badge>
                        )}
                        {connection.connectedUser.college && (
                          <Badge variant="secondary" className="text-xs">
                            <School className="h-3 w-3 mr-1" />
                            {connection.connectedUser.college}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {connection.connectedUser.email && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`mailto:${connection.connectedUser.email}`, '_blank')}
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedConnection(connection)}
                        >
                          <UserIcon className="h-4 w-4 mr-1" />
                          View Profile
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <UserIcon className="h-5 w-5" />
                            {connection.connectedUser.fullName}'s Profile
                          </DialogTitle>
                        </DialogHeader>
                        
                        {selectedConnection && (
                          <div className="space-y-6">
                            {/* Profile Header */}
                            <div className="flex items-center space-x-4">
                              {selectedConnection.connectedUser.profilePhoto ? (
                                <img
                                  src={selectedConnection.connectedUser.profilePhoto}
                                  alt={selectedConnection.connectedUser.fullName}
                                  className="h-16 w-16 rounded-full object-cover"
                                />
                              ) : (
                                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                  <UserIcon className="h-8 w-8 text-white" />
                                </div>
                              )}
                              <div>
                                <h2 className="text-xl font-semibold">{selectedConnection.connectedUser.fullName}</h2>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <span>Connected at {selectedConnection.event.name}</span>
                                  <span>•</span>
                                  <span>{new Date(selectedConnection.createdAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>

                            {/* Profile Details */}
                            <div className="grid md:grid-cols-2 gap-6">
                              <div className="space-y-4">
                                <div>
                                  <h3 className="font-semibold mb-2">Personal Info</h3>
                                  <div className="space-y-2 text-sm">
                                    {selectedConnection.connectedUser.age && (
                                      <div>Age: {selectedConnection.connectedUser.age}</div>
                                    )}
                                    {selectedConnection.connectedUser.hometown && selectedConnection.connectedUser.state && (
                                      <div className="flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        {selectedConnection.connectedUser.hometown}, {selectedConnection.connectedUser.state}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div>
                                  <h3 className="font-semibold mb-2">Education</h3>
                                  <div className="space-y-2 text-sm">
                                    {selectedConnection.connectedUser.college && (
                                      <div className="flex items-center gap-1">
                                        <School className="h-3 w-3" />
                                        {selectedConnection.connectedUser.college}
                                      </div>
                                    )}
                                    {selectedConnection.connectedUser.highSchool && (
                                      <div>{selectedConnection.connectedUser.highSchool}</div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-4">
                                {selectedConnection.connectedUser.background && (
                                  <div>
                                    <h3 className="font-semibold mb-2">Background</h3>
                                    <p className="text-sm">{selectedConnection.connectedUser.background}</p>
                                  </div>
                                )}

                                {selectedConnection.connectedUser.aspirations && (
                                  <div>
                                    <h3 className="font-semibold mb-2">Goals & Aspirations</h3>
                                    <p className="text-sm">{selectedConnection.connectedUser.aspirations}</p>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Interests */}
                            {selectedConnection.connectedUser.interests && selectedConnection.connectedUser.interests.length > 0 && (
                              <div>
                                <h3 className="font-semibold mb-2">Interests</h3>
                                <div className="flex flex-wrap gap-2">
                                  {selectedConnection.connectedUser.interests.map((interest, index) => (
                                    <Badge key={index} variant="secondary">{interest}</Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Social Links */}
                            {formatSocialLinks(selectedConnection.connectedUser.socialLinks).length > 0 && (
                              <div>
                                <h3 className="font-semibold mb-2">Social Links</h3>
                                <div className="flex flex-wrap gap-2">
                                  {formatSocialLinks(selectedConnection.connectedUser.socialLinks).map(({ platform, url }, index) => (
                                    <Button
                                      key={index}
                                      variant="outline"
                                      size="sm"
                                      onClick={() => window.open(url, '_blank')}
                                      className="flex items-center gap-1"
                                    >
                                      <ExternalLink className="h-3 w-3" />
                                      {platform.charAt(0).toUpperCase() + platform.slice(1)}
                                    </Button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No connections yet</h3>
              <p className="text-muted-foreground mb-4">
                Start networking at events to build your professional connections!
              </p>
              <Button onClick={() => window.location.href = '/events'}>
                <Calendar className="h-4 w-4 mr-2" />
                Find Events
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
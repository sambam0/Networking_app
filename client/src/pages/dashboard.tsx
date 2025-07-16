import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Navbar from "@/components/layout/navbar";
import { Calendar, Users, Plus, Clock, MapPin, QrCode } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { type Event, type EventWithHost } from "@shared/schema";
import { useState } from "react";

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [qrCodeInput, setQrCodeInput] = useState("");
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  
  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ['/api/events'],
  });

  const { data: userEvents, isLoading: userEventsLoading } = useQuery({
    queryKey: ['/api/user/events'],
  });

  const { data: hostedEvents, isLoading: hostedEventsLoading } = useQuery({
    queryKey: ['/api/user/hosted-events'],
  });

  const handleJoinEvent = () => {
    if (qrCodeInput.trim()) {
      setLocation(`/join/${qrCodeInput.trim()}`);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Please log in to continue</h1>
            <Link href="/login">
              <Button>Login</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {user.fullName}!
          </h1>
          <p className="text-muted-foreground">
            Discover meaningful connections at upcoming events
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Link href="/create-event">
            <Card className="bg-primary hover:bg-primary/90 transition-colors cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <Plus className="h-8 w-8 text-primary-foreground" />
                  <div>
                    <h3 className="text-lg font-semibold text-primary-foreground">Create Event</h3>
                    <p className="text-primary-foreground/80">Host your own networking event</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
            <DialogTrigger asChild>
              <Card className="bg-secondary hover:bg-secondary/90 transition-colors cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <QrCode className="h-8 w-8 text-secondary-foreground" />
                    <div>
                      <h3 className="text-lg font-semibold text-secondary-foreground">Join Event</h3>
                      <p className="text-secondary-foreground/80">Scan QR code to join an event</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <QrCode className="h-5 w-5" />
                  <span>Join Event</span>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Enter QR Code or Event Code
                  </label>
                  <Input
                    placeholder="Enter event code..."
                    value={qrCodeInput}
                    onChange={(e) => setQrCodeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleJoinEvent();
                      }
                    }}
                  />
                </div>
                <div className="flex gap-3">
                  <Button 
                    onClick={handleJoinEvent}
                    disabled={!qrCodeInput.trim()}
                    className="flex-1"
                  >
                    Join Event
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setJoinDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Get the event code from the host or scan their QR code
                </p>
              </div>
            </DialogContent>
          </Dialog>

          <Link href="/profile">
            <Card className="bg-accent hover:bg-accent/90 transition-colors cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <Users className="h-8 w-8 text-accent-foreground" />
                  <div>
                    <h3 className="text-lg font-semibold text-accent-foreground">Update Profile</h3>
                    <p className="text-accent-foreground/80">Keep your information current</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Upcoming Events */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Upcoming Events</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {eventsLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-3/4 mb-2" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                        <Skeleton className="h-8 w-20" />
                      </div>
                    ))}
                  </div>
                ) : events && events.length > 0 ? (
                  <div className="space-y-4">
                    {events.slice(0, 5).map((event: EventWithHost) => (
                      <Link key={event.id} href={`/events/${event.id}`}>
                        <div className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                          <div className="bg-primary/10 p-2 rounded-full">
                            <Calendar className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-foreground">{event.name}</h4>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <div className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>{new Date(event.date).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <MapPin className="h-4 w-4" />
                                <span>{event.location}</span>
                              </div>
                            </div>
                          </div>
                          <Badge variant="secondary">
                            {event.attendeeCount} attendees
                          </Badge>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No upcoming events</p>
                    <p className="text-sm text-muted-foreground">Check back later for new events</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Your Events */}
          <div className="space-y-6">
            {/* Events You're Attending */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Your Events</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userEventsLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="p-3 border rounded-lg">
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-3 w-2/3" />
                      </div>
                    ))}
                  </div>
                ) : userEvents && userEvents.length > 0 ? (
                  <div className="space-y-3">
                    {userEvents.map((event: Event) => (
                      <Link key={event.id} href={`/events/${event.id}`}>
                        <div className="p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                          <h5 className="font-medium text-foreground">{event.name}</h5>
                          <p className="text-sm text-muted-foreground">
                            {new Date(event.date).toLocaleDateString()}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No events joined yet</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Events You're Hosting */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Hosting</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {hostedEventsLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="p-3 border rounded-lg">
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-3 w-2/3" />
                      </div>
                    ))}
                  </div>
                ) : hostedEvents && hostedEvents.length > 0 ? (
                  <div className="space-y-3">
                    {hostedEvents.map((event: Event) => (
                      <Link key={event.id} href={`/events/${event.id}`}>
                        <div className="p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                          <h5 className="font-medium text-foreground">{event.name}</h5>
                          <p className="text-sm text-muted-foreground">
                            {new Date(event.date).toLocaleDateString()}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No hosted events</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

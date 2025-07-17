import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import Navbar from "@/components/layout/navbar";
import QRCode from "@/components/event/qr-code";
import AttendeeGrid from "@/components/event/attendee-grid";
import PeopleRecommendations from "@/components/recommendations/people-recommendations";
import { CalendarSync } from "@/components/calendar-sync";
import { Calendar, MapPin, Clock, Users, UserPlus, UserMinus, Lock, Unlock, Eye, EyeOff, Settings } from "lucide-react";
import { type EventWithAttendees } from "@shared/schema";

export default function EventDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: event, isLoading } = useQuery({
    queryKey: ['/api/events', id],
    enabled: !!id,
  });

  const { data: isAttending } = useQuery({
    queryKey: ['/api/events', id, 'attending'],
    queryFn: async () => {
      if (!user || !id) return false;
      const attendees = await fetch(`/api/events/${id}/attendees`, {
        credentials: 'include',
      }).then(res => res.json());
      return attendees.some((attendee: any) => attendee.id === user.id);
    },
    enabled: !!user && !!id,
  });

  const joinEventMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/events/${id}/join`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events', id] });
      queryClient.invalidateQueries({ queryKey: ['/api/events', id, 'attending'] });
      queryClient.invalidateQueries({ queryKey: ['/api/events', id, 'attendees'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/events'] });
      toast({
        title: "Joined Event!",
        description: "You've successfully joined the event.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to join event",
        variant: "destructive",
      });
    },
  });

  const leaveEventMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('DELETE', `/api/events/${id}/leave`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events', id] });
      queryClient.invalidateQueries({ queryKey: ['/api/events', id, 'attending'] });
      queryClient.invalidateQueries({ queryKey: ['/api/events', id, 'attendees'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/events'] });
      toast({
        title: "Left Event",
        description: "You've left the event.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to leave event",
        variant: "destructive",
      });
    },
  });

  const handleConnect = async (userId: number) => {
    if (!user || !id) return;

    try {
      await apiRequest('POST', '/api/connections', {
        toUserId: userId,
        eventId: parseInt(id),
      });
      toast({
        title: "Connection Request Sent!",
        description: "You've sent a connection request.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send connection",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Please log in to view this event</h1>
            <Button onClick={() => setLocation("/login")}>Login</Button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-4" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            </div>
            <div>
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Event not found</h1>
            <Button onClick={() => setLocation("/dashboard")}>Go to Dashboard</Button>
          </div>
        </div>
      </div>
    );
  }

  const isHost = user.id === event.hostId;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Event Details */}
          <div className="lg:col-span-2">
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">{event.name}</h1>
                    <div className="flex items-center space-x-4 text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(event.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{new Date(event.date).toLocaleTimeString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{event.location}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="flex items-center space-x-1">
                      <Users className="h-3 w-3" />
                      <span>{event.attendees?.length || 0} attendees</span>
                    </Badge>
                    {/* Privacy indicator */}
                    <Badge variant={event.isPublic ? "outline" : "secondary"} className="flex items-center space-x-1">
                      {event.isPublic ? <Unlock className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                      <span>{event.isPublic ? "Public" : "Private"}</span>
                    </Badge>
                    {isHost && <Badge variant="default">Host</Badge>}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {event.description && (
                  <p className="text-muted-foreground mb-6">{event.description}</p>
                )}
                
                <div className="flex flex-wrap gap-4">
                  {!isHost && (
                    <>
                      {isAttending ? (
                        <Button 
                          variant="outline" 
                          onClick={() => leaveEventMutation.mutate()}
                          disabled={leaveEventMutation.isPending}
                        >
                          <UserMinus className="h-4 w-4 mr-2" />
                          Leave Event
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => joinEventMutation.mutate()}
                          disabled={joinEventMutation.isPending}
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Join Event
                        </Button>
                      )}
                    </>
                  )}
                  
                  {/* Calendar Sync - Available to all users */}
                  <CalendarSync event={event} />
                  
                  {isHost && (
                    <Button 
                      variant="outline"
                      onClick={() => setLocation(`/events/${event.id}/settings`)}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Event Settings
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Attendees */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Meet the Attendees</span>
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  Browse detailed profiles of everyone attending this event. Connect with people who share your interests, background, or goals.
                </p>
              </CardHeader>
              <CardContent>
                <AttendeeGrid eventId={parseInt(id)} onConnect={handleConnect} />
              </CardContent>
            </Card>

            {/* People Recommendations for this Event */}
            {isAttending && (
              <PeopleRecommendations eventId={parseInt(id)} onConnect={handleConnect} />
            )}
          </div>

          {/* QR Code and Host Info */}
          <div className="space-y-6">
            <QRCode event={event} />
            
            {event.host && (
              <Card>
                <CardHeader>
                  <CardTitle>Event Host</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="bg-primary/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <Users className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground">{event.host.fullName}</h3>
                    {event.host.school && (
                      <p className="text-sm text-muted-foreground">{event.host.school}</p>
                    )}
                    {event.host.background && (
                      <p className="text-sm text-muted-foreground mt-2">{event.host.background}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

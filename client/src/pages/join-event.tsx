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
import { Calendar, MapPin, Clock, Users, UserPlus, QrCode } from "lucide-react";
import { type Event } from "@shared/schema";

export default function JoinEvent() {
  const { qrCode } = useParams();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: event, isLoading } = useQuery({
    queryKey: ['/api/events/qr', qrCode],
    enabled: !!qrCode,
  });

  const joinEventMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/events/${event.id}/join`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events', event.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/events'] });
      toast({
        title: "Joined Event!",
        description: "You've successfully joined the event.",
      });
      setLocation(`/events/${event.id}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to join event",
        variant: "destructive",
      });
    },
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center">Join Event</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <QrCode className="h-16 w-16 text-primary mx-auto mb-4" />
              <p className="text-muted-foreground mb-6">
                You need to be logged in to join events
              </p>
              <div className="space-y-3">
                <Button 
                  onClick={() => setLocation("/login")}
                  className="w-full"
                >
                  Login to Join
                </Button>
                <Button 
                  onClick={() => setLocation("/signup")}
                  variant="outline"
                  className="w-full"
                >
                  Create Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <Card className="w-full max-w-md">
            <CardHeader>
              <Skeleton className="h-6 w-3/4 mx-auto" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-16 w-16 mx-auto mb-4 rounded-full" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3 mx-auto mb-6" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center">Event Not Found</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <QrCode className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-6">
                This QR code doesn't match any active events
              </p>
              <Button 
                onClick={() => setLocation("/dashboard")}
                className="w-full"
              >
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="flex items-center justify-center py-20">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Join Event</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="bg-primary/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <QrCode className="h-8 w-8 text-primary" />
              </div>
              
              <h3 className="text-xl font-semibold text-foreground mb-2">{event.name}</h3>
              
              <div className="space-y-2 mb-6">
                <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(event.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{new Date(event.date).toLocaleTimeString()}</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{event.location}</span>
                </div>
              </div>

              {event.description && (
                <p className="text-muted-foreground text-sm mb-6">{event.description}</p>
              )}

              <div className="space-y-3">
                <Button 
                  onClick={() => joinEventMutation.mutate()}
                  disabled={joinEventMutation.isPending}
                  className="w-full"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  {joinEventMutation.isPending ? 'Joining...' : 'Join Event'}
                </Button>
                
                <Button 
                  onClick={() => setLocation(`/events/${event.id}`)}
                  variant="outline"
                  className="w-full"
                >
                  View Event Details
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarSync } from "@/components/calendar-sync";
import { Calendar, MapPin, Clock, Users, Lock, Unlock } from "lucide-react";
import { type Event, type EventWithHost } from "@shared/schema";

interface EventCardProps {
  event: Event | EventWithHost;
  showHost?: boolean;
  showCalendarSync?: boolean;
  variant?: "default" | "compact";
}

export function EventCard({ 
  event, 
  showHost = false, 
  showCalendarSync = true,
  variant = "default" 
}: EventCardProps) {
  const eventDate = new Date(event.date);
  const isUpcoming = eventDate > new Date();
  const host = 'host' in event ? event.host : null;
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className={variant === "compact" ? "pb-3" : ""}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className={`${variant === "compact" ? "text-lg" : "text-xl"} font-semibold mb-2`}>
              <Link href={`/events/${event.id}`} className="hover:underline">
                {event.name}
              </Link>
            </CardTitle>
            
            <div className={`flex flex-wrap gap-3 text-sm text-muted-foreground ${variant === "compact" ? "gap-2" : ""}`}>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{eventDate.toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span className="truncate max-w-32">{event.location}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 ml-4">
            {/* Attendee count */}
            <Badge variant="secondary" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{'attendeeCount' in event ? event.attendeeCount : 0}</span>
            </Badge>
            
            {/* Privacy indicator */}
            <Badge variant={event.isPublic ? "outline" : "secondary"} className="flex items-center gap-1">
              {event.isPublic ? <Unlock className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
              <span>{event.isPublic ? "Public" : "Private"}</span>
            </Badge>
            
            {/* Status badge */}
            <Badge variant={isUpcoming ? "default" : "secondary"}>
              {isUpcoming ? "Upcoming" : "Past"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className={variant === "compact" ? "pt-0" : ""}>
        {event.description && variant !== "compact" && (
          <p className="text-muted-foreground mb-4 line-clamp-2">
            {event.description}
          </p>
        )}
        
        {showHost && host && (
          <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
            <span>Hosted by</span>
            <span className="font-medium text-foreground">{host.fullName}</span>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <Link href={`/events/${event.id}`}>
            <Button variant="outline" size={variant === "compact" ? "sm" : "default"}>
              View Details
            </Button>
          </Link>
          
          {showCalendarSync && isUpcoming && (
            <CalendarSync 
              event={event} 
              variant="ghost" 
              size={variant === "compact" ? "sm" : "default"}
              showLabel={false}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface EventGridProps {
  events: (Event | EventWithHost)[];
  isLoading?: boolean;
  emptyMessage?: string;
  showHost?: boolean;
  variant?: "default" | "compact";
}

export function EventGrid({ 
  events, 
  isLoading = false, 
  emptyMessage = "No events found",
  showHost = false,
  variant = "default"
}: EventGridProps) {
  if (isLoading) {
    return (
      <div className={`grid gap-4 ${variant === "compact" ? "md:grid-cols-2 lg:grid-cols-3" : "md:grid-cols-1 lg:grid-cols-2"}`}>
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-6 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-4 bg-muted rounded w-full mb-2"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`grid gap-4 ${variant === "compact" ? "md:grid-cols-2 lg:grid-cols-3" : "md:grid-cols-1 lg:grid-cols-2"}`}>
      {events.map((event) => (
        <EventCard 
          key={event.id} 
          event={event} 
          showHost={showHost}
          variant={variant}
        />
      ))}
    </div>
  );
}
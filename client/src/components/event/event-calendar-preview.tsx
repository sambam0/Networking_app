import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarSync } from "@/components/calendar-sync";
import { Calendar, MapPin, Clock, Users } from "lucide-react";
import { type Event } from "@shared/schema";

interface EventCalendarPreviewProps {
  event: Event;
  onClose?: () => void;
}

export function EventCalendarPreview({ event, onClose }: EventCalendarPreviewProps) {
  const eventDate = new Date(event.date);
  const isUpcoming = eventDate > new Date();
  
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold mb-2">{event.name}</CardTitle>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
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
                <span>{event.location}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 mt-3">
          <Badge variant={isUpcoming ? "default" : "secondary"}>
            {isUpcoming ? "Upcoming" : "Past"}
          </Badge>
          {'attendeeCount' in event && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{event.attendeeCount}</span>
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {event.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
            {event.description}
          </p>
        )}
        
        <div className="space-y-3">
          <div className="text-sm font-medium text-foreground">
            Add to your calendar:
          </div>
          
          <CalendarSync 
            event={event} 
            variant="default"
            showLabel={true}
          />
          
          <div className="text-xs text-muted-foreground">
            Choose your preferred calendar app to automatically add this event with all details.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
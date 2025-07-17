import { Button } from "@/components/ui/button";
import { Calendar, ExternalLink, Download } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { type Event } from "@shared/schema";
import { 
  formatEventForCalendar, 
  generateGoogleCalendarUrl, 
  generateOutlookUrl, 
  generateYahooCalendarUrl, 
  downloadICSFile, 
  openCalendarUrl 
} from "@/utils/calendar";

interface CalendarSyncProps {
  event: Event;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  showLabel?: boolean;
}

export function CalendarSync({ event, variant = "outline", size = "default", showLabel = true }: CalendarSyncProps) {
  const eventData = formatEventForCalendar(event, 2); // 2 hour default duration
  
  const handleGoogleCalendar = () => {
    const url = generateGoogleCalendarUrl(eventData);
    openCalendarUrl(url);
  };

  const handleOutlookCalendar = () => {
    const url = generateOutlookUrl(eventData);
    openCalendarUrl(url);
  };

  const handleYahooCalendar = () => {
    const url = generateYahooCalendarUrl(eventData);
    openCalendarUrl(url);
  };

  const handleDownloadICS = () => {
    downloadICSFile(event, eventData);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className="gap-2">
          <Calendar className="h-4 w-4" />
          {showLabel && "Add to Calendar"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="font-medium">Add to Calendar</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Sync this event to your calendar
          </p>
        </div>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={handleGoogleCalendar}
          className="cursor-pointer"
        >
          <div className="flex items-center gap-2 w-full">
            <div className="w-4 h-4 rounded bg-blue-500 flex items-center justify-center">
              <span className="text-white text-xs font-bold">G</span>
            </div>
            <span>Google Calendar</span>
            <ExternalLink className="h-3 w-3 ml-auto" />
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem 
          onClick={handleOutlookCalendar}
          className="cursor-pointer"
        >
          <div className="flex items-center gap-2 w-full">
            <div className="w-4 h-4 rounded bg-blue-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">O</span>
            </div>
            <span>Outlook Calendar</span>
            <ExternalLink className="h-3 w-3 ml-auto" />
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem 
          onClick={handleYahooCalendar}
          className="cursor-pointer"
        >
          <div className="flex items-center gap-2 w-full">
            <div className="w-4 h-4 rounded bg-purple-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">Y</span>
            </div>
            <span>Yahoo Calendar</span>
            <ExternalLink className="h-3 w-3 ml-auto" />
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem 
          onClick={handleDownloadICS}
          className="cursor-pointer"
        >
          <div className="flex items-center gap-2 w-full">
            <Download className="h-4 w-4" />
            <div className="flex flex-col">
              <span>Download .ics file</span>
              <span className="text-xs text-muted-foreground">For Apple Calendar, etc.</span>
            </div>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface CalendarSyncBadgeProps {
  event: Event;
}

export function CalendarSyncBadge({ event }: CalendarSyncBadgeProps) {
  return (
    <Badge variant="secondary" className="gap-1 cursor-pointer hover:bg-secondary/80">
      <CalendarSync 
        event={event} 
        variant="ghost" 
        size="sm" 
        showLabel={false}
      />
    </Badge>
  );
}
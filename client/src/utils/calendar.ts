import { type Event } from "@shared/schema";

export interface CalendarEventData {
  title: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
  startDateString: string;
  endDateString: string;
  allDay?: boolean;
}

export function formatEventForCalendar(event: Event, duration: number = 2): CalendarEventData {
  const startDate = new Date(event.date);
  const endDate = new Date(startDate.getTime() + duration * 60 * 60 * 1000); // Default duration in hours
  
  return {
    title: event.name,
    description: event.description || `Join us at ${event.name}! Visit ${window.location.origin}/events/${event.id} for more details.`,
    location: event.location,
    startDate,
    endDate,
    startDateString: startDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
    endDateString: endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
    allDay: false
  };
}

export function generateGoogleCalendarUrl(eventData: CalendarEventData): string {
  const baseUrl = 'https://calendar.google.com/calendar/render';
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: eventData.title,
    dates: `${eventData.startDateString}/${eventData.endDateString}`,
    details: eventData.description,
    location: eventData.location,
    sf: 'true',
    output: 'xml'
  });
  
  return `${baseUrl}?${params.toString()}`;
}

export function generateOutlookUrl(eventData: CalendarEventData): string {
  const baseUrl = 'https://outlook.live.com/calendar/0/deeplink/compose';
  const params = new URLSearchParams({
    subject: eventData.title,
    startdt: eventData.startDate.toISOString(),
    enddt: eventData.endDate.toISOString(),
    body: eventData.description,
    location: eventData.location,
    path: '/calendar/action/compose'
  });
  
  return `${baseUrl}?${params.toString()}`;
}

export function generateYahooCalendarUrl(eventData: CalendarEventData): string {
  const baseUrl = 'https://calendar.yahoo.com/';
  const params = new URLSearchParams({
    v: '60',
    view: 'd',
    type: '20',
    title: eventData.title,
    st: eventData.startDateString,
    et: eventData.endDateString,
    desc: eventData.description,
    in_loc: eventData.location
  });
  
  return `${baseUrl}?${params.toString()}`;
}

export function generateICSContent(event: Event, eventData: CalendarEventData): string {
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//RealConnect//Event Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${event.id}@realconnect.ing`,
    `DTSTART:${eventData.startDateString}`,
    `DTEND:${eventData.endDateString}`,
    `SUMMARY:${eventData.title}`,
    `DESCRIPTION:${eventData.description.replace(/\n/g, '\\n')}`,
    `LOCATION:${eventData.location}`,
    `URL:${window.location.origin}/events/${event.id}`,
    'STATUS:CONFIRMED',
    'TRANSP:OPAQUE',
    `CREATED:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    `LAST-MODIFIED:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    'SEQUENCE:0',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  return icsContent;
}

export function downloadICSFile(event: Event, eventData: CalendarEventData): void {
  const icsContent = generateICSContent(event, eventData);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${event.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function openCalendarUrl(url: string): void {
  window.open(url, '_blank', 'noopener,noreferrer');
}
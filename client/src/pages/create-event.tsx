import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertEventSchema } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import Navbar from "@/components/layout/navbar";
import { Calendar, MapPin, Clock, QrCode, Lock, Unlock, Eye, EyeOff, Settings } from "lucide-react";

export default function CreateEvent() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(insertEventSchema),
    defaultValues: {
      name: "",
      description: "",
      location: "",
      date: new Date(),
      isActive: true,
      isPublic: true,
      visibleFields: {
        fullName: true,
        age: true,
        hometown: true,
        state: true,
        college: true,
        highSchool: true,
        school: true,
        background: true,
        aspirations: true,
        interests: true,
        socialLinks: true,
        profilePhoto: true
      }
    },
  });

  const createEventMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/events', data);
      return response.json();
    },
    onSuccess: (event) => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/hosted-events'] });
      
      toast({
        title: "Event Created!",
        description: "Your event has been created successfully.",
      });
      
      setLocation(`/events/${event.id}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create event",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    // Ensure the date is properly formatted
    const formattedData = {
      ...data,
      date: data.date instanceof Date ? data.date.toISOString() : data.date
    };
    createEventMutation.mutate(formattedData);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Please log in to create an event</h1>
            <Button onClick={() => setLocation("/login")}>Login</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-4 sm:mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">Create New Event</h1>
          <p className="text-muted-foreground">
            Host a gathering where authentic connections flourish
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 items-start">
          {/* Event Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Event Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Summer Networking Mixer" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="A casual networking event for professionals in tech..."
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="The Rooftop Lounge, 123 Main St" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date & Time</FormLabel>
                        <FormControl>
                          <Input 
                            type="datetime-local" 
                            {...field} 
                            value={field.value instanceof Date ? 
                              new Date(field.value.getTime() - field.value.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : 
                              field.value
                            }
                            onChange={(e) => {
                              const selectedDate = new Date(e.target.value);
                              field.onChange(selectedDate);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Event Privacy Settings */}
                  <div className="space-y-6 pt-6 border-t">
                    <div className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      <h3 className="text-lg font-semibold">Event Privacy & Visibility</h3>
                    </div>

                    <FormField
                      control={form.control}
                      name="isPublic"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base flex items-center gap-2">
                              {field.value ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                              {field.value ? "Public Event" : "Private Event"}
                            </FormLabel>
                            <FormDescription>
                              {field.value 
                                ? "Attendees can see who's coming before the event starts"
                                : "Attendees can only see other attendees once they arrive at the event"
                              }
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {/* Visible Fields Configuration */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        <h4 className="font-medium">Attendee Information Visibility</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Choose what information attendees can see about each other
                      </p>
                      
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { key: 'fullName', label: 'Full Name', required: true },
                          { key: 'age', label: 'Age' },
                          { key: 'hometown', label: 'Hometown' },
                          { key: 'state', label: 'State' },
                          { key: 'college', label: 'College' },
                          { key: 'highSchool', label: 'High School' },
                          { key: 'background', label: 'Background' },
                          { key: 'aspirations', label: 'Aspirations' },
                          { key: 'interests', label: 'Interests' },
                          { key: 'socialLinks', label: 'Social Media' },
                          { key: 'profilePhoto', label: 'Profile Photo' }
                        ].map((field) => (
                          <FormField
                            key={field.key}
                            control={form.control}
                            name={`visibleFields.${field.key}`}
                            render={({ field: formField }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={formField.value}
                                    onCheckedChange={formField.onChange}
                                    disabled={field.required}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel className={`text-sm ${field.required ? 'text-muted-foreground' : ''}`}>
                                    {field.label} {field.required && '(Required)'}
                                  </FormLabel>
                                </div>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full py-4 text-lg mt-12"
                    disabled={createEventMutation.isPending}
                  >
                    <QrCode className="h-5 w-5 mr-2" />
                    {createEventMutation.isPending ? 'Creating...' : 'Generate QR Code & Create Event'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Event Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {form.watch('name') || 'Your Event Name'}
                  </h3>
                  <p className="text-muted-foreground">
                    {form.watch('description') || 'Event description will appear here...'}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>
                      {form.watch('date') ? new Date(form.watch('date')).toLocaleDateString() : 'Date'} • 
                      {form.watch('date') ? new Date(form.watch('date')).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Time'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{form.watch('location') || 'Event location'}</span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium text-foreground mb-2">What happens next?</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Unique QR code will be generated</li>
                    <li>• Share the code with your guests</li>
                    <li>• Guests scan to join and create profiles</li>
                    <li>• Watch authentic connections form</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

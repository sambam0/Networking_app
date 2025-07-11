import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import Navbar from "@/components/layout/navbar";
import { Upload, X, Plus, User, Save } from "lucide-react";

const profileUpdateSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  age: z.number().min(13, "Must be at least 13 years old"),
  school: z.string().optional(),
  background: z.string().optional(),
  aspirations: z.string().optional(),
  socialLinks: z.object({
    linkedin: z.string().url().optional().or(z.literal("")),
    website: z.string().url().optional().or(z.literal("")),
    twitter: z.string().url().optional().or(z.literal("")),
  }).optional(),
});

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [interests, setInterests] = useState<string[]>(user?.interests || []);
  const [newInterest, setNewInterest] = useState("");
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const form = useForm({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      age: user?.age || 18,
      school: user?.school || "",
      background: user?.background || "",
      aspirations: user?.aspirations || "",
      socialLinks: {
        linkedin: user?.socialLinks?.linkedin || "",
        website: user?.socialLinks?.website || "",
        twitter: user?.socialLinks?.twitter || "",
      },
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const formData = new FormData();
      
      // Append all form fields
      Object.keys(data).forEach(key => {
        if (key === 'socialLinks') {
          formData.append(key, JSON.stringify(data[key]));
        } else {
          formData.append(key, data[key]);
        }
      });
      
      // Append interests
      formData.append('interests', JSON.stringify(interests));
      
      // Append profile photo if exists
      if (profilePhoto) {
        formData.append('profilePhoto', profilePhoto);
      }

      const response = await apiRequest('PUT', `/api/users/${user?.id}`, formData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      toast({
        title: "Profile Updated!",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const handleAddInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest("");
    }
  };

  const handleRemoveInterest = (interest: string) => {
    setInterests(interests.filter(i => i !== interest));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePhoto(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const onSubmit = async (data: any) => {
    updateProfileMutation.mutate(data);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Please log in to view your profile</h1>
            <Button>Login</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Your Profile</h1>
          <p className="text-muted-foreground">
            Update your information to make better connections
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Profile Preview</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <Avatar className="w-32 h-32 mx-auto mb-4">
                  <AvatarImage src={previewUrl || user.profilePhoto || undefined} alt={user.fullName} />
                  <AvatarFallback className="text-2xl">
                    {user.fullName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {form.watch('fullName') || user.fullName}
                </h3>
                
                <p className="text-muted-foreground mb-1">
                  {form.watch('age') || user.age} years old
                </p>
                
                {(form.watch('school') || user.school) && (
                  <p className="text-primary font-medium mb-4">
                    {form.watch('school') || user.school}
                  </p>
                )}
                
                {interests.length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-center">
                    {interests.slice(0, 3).map((interest, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {interest}
                      </Badge>
                    ))}
                    {interests.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{interests.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Profile Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Edit Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-6">
                        <FormField
                          control={form.control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Sarah Johnson" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="age"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Age</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="28" 
                                    {...field} 
                                    onChange={(e) => field.onChange(parseInt(e.target.value))} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="school"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>School</FormLabel>
                                <FormControl>
                                  <Input placeholder="Stanford University" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="background"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Background</FormLabel>
                              <FormControl>
                                <Textarea 
                                  rows={3} 
                                  placeholder="Tell others about yourself..." 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="aspirations"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Aspirations</FormLabel>
                              <FormControl>
                                <Textarea 
                                  rows={3} 
                                  placeholder="What are your goals and dreams?" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Profile Photo
                          </label>
                          <div className="border-2 border-dashed border-border rounded-xl p-6 text-center bg-muted/50 hover:border-primary transition-colors">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileChange}
                              className="hidden"
                              id="profile-photo"
                            />
                            <label htmlFor="profile-photo" className="cursor-pointer">
                              <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                              <p className="text-muted-foreground text-sm">
                                Click to upload new photo
                              </p>
                            </label>
                            {profilePhoto && (
                              <p className="text-sm text-primary mt-2">
                                Selected: {profilePhoto.name}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Interests & Hobbies
                          </label>
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <Input
                                placeholder="Add an interest..."
                                value={newInterest}
                                onChange={(e) => setNewInterest(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddInterest())}
                              />
                              <Button type="button" onClick={handleAddInterest} variant="outline">
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {interests.map((interest, index) => (
                                <Badge key={index} variant="secondary" className="text-sm">
                                  {interest}
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveInterest(interest)}
                                    className="ml-2 hover:text-destructive"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Social Links
                          </label>
                          <div className="space-y-3">
                            <FormField
                              control={form.control}
                              name="socialLinks.linkedin"
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input placeholder="LinkedIn profile URL" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="socialLinks.website"
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input placeholder="Personal website URL" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="socialLinks.twitter"
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input placeholder="Twitter profile URL" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-6 border-t border-border">
                      <Button 
                        type="submit" 
                        className="w-full py-4 text-lg"
                        disabled={updateProfileMutation.isPending}
                      >
                        <Save className="h-5 w-5 mr-2" />
                        {updateProfileMutation.isPending ? 'Saving...' : 'Save Profile'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

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
import { Upload, X, Plus, User, Save, Link, ExternalLink, Copy, Linkedin, Twitter, Instagram, Github, Video, Facebook, Globe } from "lucide-react";

const profileUpdateSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  age: z.number().min(13, "Must be at least 13 years old"),
  hometown: z.string().optional(),
  state: z.string().optional(),
  college: z.string().optional(),
  highSchool: z.string().optional(),
  school: z.string().optional(),
  background: z.string().optional(),
  aspirations: z.string().optional(),
  socialLinks: z.object({
    linkedin: z.string().optional().refine(val => !val || z.string().url().safeParse(val).success, "Invalid LinkedIn URL"),
    website: z.string().optional().refine(val => !val || z.string().url().safeParse(val).success, "Invalid website URL"),
    twitter: z.string().optional().refine(val => !val || z.string().url().safeParse(val).success, "Invalid Twitter URL"),
    instagram: z.string().optional().refine(val => !val || z.string().url().safeParse(val).success, "Invalid Instagram URL"),
    github: z.string().optional().refine(val => !val || z.string().url().safeParse(val).success, "Invalid GitHub URL"),
    tiktok: z.string().optional().refine(val => !val || z.string().url().safeParse(val).success, "Invalid TikTok URL"),
    facebook: z.string().optional().refine(val => !val || z.string().url().safeParse(val).success, "Invalid Facebook URL"),
    youtube: z.string().optional().refine(val => !val || z.string().url().safeParse(val).success, "Invalid YouTube URL"),
  }).optional(),
});

// Social media platform configuration
const socialPlatforms = [
  { 
    key: 'linkedin', 
    name: 'LinkedIn', 
    icon: Linkedin, 
    color: 'text-blue-600',
    placeholder: 'https://linkedin.com/in/yourname',
    baseUrl: 'https://linkedin.com/in/'
  },
  { 
    key: 'twitter', 
    name: 'X (Twitter)', 
    icon: Twitter, 
    color: 'text-black dark:text-white',
    placeholder: 'https://x.com/yourusername',
    baseUrl: 'https://x.com/'
  },
  { 
    key: 'instagram', 
    name: 'Instagram', 
    icon: Instagram, 
    color: 'text-pink-500',
    placeholder: 'https://instagram.com/yourusername',
    baseUrl: 'https://instagram.com/'
  },
  { 
    key: 'github', 
    name: 'GitHub', 
    icon: Github, 
    color: 'text-gray-800 dark:text-white',
    placeholder: 'https://github.com/yourusername',
    baseUrl: 'https://github.com/'
  },
  { 
    key: 'youtube', 
    name: 'YouTube', 
    icon: Video, 
    color: 'text-red-500',
    placeholder: 'https://youtube.com/@yourchannel',
    baseUrl: 'https://youtube.com/@'
  },
  { 
    key: 'tiktok', 
    name: 'TikTok', 
    icon: Video, 
    color: 'text-black dark:text-white',
    placeholder: 'https://tiktok.com/@yourusername',
    baseUrl: 'https://tiktok.com/@'
  },
  { 
    key: 'facebook', 
    name: 'Facebook', 
    icon: Facebook, 
    color: 'text-blue-700',
    placeholder: 'https://facebook.com/yourname',
    baseUrl: 'https://facebook.com/'
  },
  { 
    key: 'website', 
    name: 'Website', 
    icon: Globe, 
    color: 'text-green-600',
    placeholder: 'https://yourwebsite.com',
    baseUrl: 'https://'
  },
] as const;



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
      hometown: user?.hometown || "",
      state: user?.state || "",
      college: user?.college || "",
      highSchool: user?.highSchool || "",
      school: user?.school || "",
      background: user?.background || "",
      aspirations: user?.aspirations || "",
      socialLinks: {
        linkedin: user?.socialLinks?.linkedin || "",
        website: user?.socialLinks?.website || "",
        twitter: user?.socialLinks?.twitter || "",
        instagram: user?.socialLinks?.instagram || "",
        github: user?.socialLinks?.github || "",
        tiktok: user?.socialLinks?.tiktok || "",
        facebook: user?.socialLinks?.facebook || "",
        youtube: user?.socialLinks?.youtube || "",
      },
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const formData = new FormData();
      
      // Append all form fields, ensuring we include all values
      formData.append('fullName', data.fullName || '');
      formData.append('age', String(data.age || 18));
      formData.append('hometown', data.hometown || '');
      formData.append('state', data.state || '');
      formData.append('college', data.college || '');
      formData.append('highSchool', data.highSchool || '');
      formData.append('school', data.school || '');
      formData.append('background', data.background || '');
      formData.append('aspirations', data.aspirations || '');
      
      // Handle social links properly
      if (data.socialLinks) {
        formData.append('socialLinks', JSON.stringify(data.socialLinks));
      }
      
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
                
                <p className="text-muted-foreground mb-2">
                  {form.watch('age') || user.age} years old
                </p>
                
                {/* Location Information */}
                {((form.watch('hometown') || user.hometown) || (form.watch('state') || user.state)) && (
                  <p className="text-sm text-muted-foreground mb-2">
                    📍 {(form.watch('hometown') || user.hometown)}{((form.watch('hometown') || user.hometown) && (form.watch('state') || user.state)) ? ', ' : ''}{(form.watch('state') || user.state)}
                  </p>
                )}
                
                {/* Education Information */}
                {(form.watch('college') || user.college) && (
                  <p className="text-primary font-medium mb-1">
                    🎓 {form.watch('college') || user.college}
                  </p>
                )}
                
                {(form.watch('highSchool') || user.highSchool) && (
                  <p className="text-sm text-muted-foreground mb-2">
                    🏫 {form.watch('highSchool') || user.highSchool}
                  </p>
                )}
                
                {/* Legacy school field for backward compatibility */}
                {(form.watch('school') || user.school) && !(form.watch('college') || user.college) && !(form.watch('highSchool') || user.highSchool) && (
                  <p className="text-primary font-medium mb-4">
                    🎓 {form.watch('school') || user.school}
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
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 18)} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Location Section */}
                        <div className="space-y-4">
                          <h4 className="text-sm font-medium text-foreground">Location</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="hometown"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Hometown</FormLabel>
                                  <FormControl>
                                    <Input placeholder="San Francisco" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="state"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>State</FormLabel>
                                  <FormControl>
                                    <Input placeholder="California" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        {/* Education Section */}
                        <div className="space-y-4">
                          <h4 className="text-sm font-medium text-foreground">Education</h4>
                          <FormField
                            control={form.control}
                            name="college"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>College/University</FormLabel>
                                <FormControl>
                                  <Input placeholder="Stanford University" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="highSchool"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>High School</FormLabel>
                                <FormControl>
                                  <Input placeholder="Lincoln High School" {...field} />
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
                      </div>
                    </div>
                    
                    {/* Social Media Integration Section */}
                    <div className="col-span-full">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Link className="w-5 h-5" />
                            Social Media Integration
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            Connect your social profiles for easy networking and professional connections
                          </p>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="grid gap-4">
                            {socialPlatforms.map((platform) => {
                              const Icon = platform.icon;
                              const currentValue = form.watch(`socialLinks.${platform.key}`);
                              
                              return (
                                <div key={platform.key} className="space-y-2">
                                  <FormField
                                    control={form.control}
                                    name={`socialLinks.${platform.key}`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel className="flex items-center gap-2">
                                          <Icon className={`w-4 h-4 ${platform.color}`} />
                                          {platform.name}
                                        </FormLabel>
                                        <div className="flex gap-2">
                                          <FormControl>
                                            <Input
                                              placeholder={platform.placeholder}
                                              {...field}
                                              className="flex-1"
                                            />
                                          </FormControl>
                                          {currentValue && (
                                            <div className="flex gap-1">
                                              <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={async () => {
                                                  try {
                                                    await navigator.clipboard.writeText(currentValue);
                                                  } catch (err) {
                                                    console.error('Failed to copy:', err);
                                                  }
                                                }}
                                                className="px-3"
                                              >
                                                <Copy className="w-4 h-4" />
                                              </Button>
                                              <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => window.open(currentValue, '_blank')}
                                                className="px-3"
                                              >
                                                <ExternalLink className="w-4 h-4" />
                                              </Button>
                                            </div>
                                          )}
                                        </div>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  
                                  {platform.key !== 'website' && (
                                    <div className="flex items-center gap-2 ml-6">
                                      <span className="text-xs text-muted-foreground">Quick setup:</span>
                                      <div className="flex items-center gap-1">
                                        <span className="text-xs text-muted-foreground">{platform.baseUrl}</span>
                                        <Input
                                          placeholder="username"
                                          className="h-6 text-xs w-24"
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                              e.preventDefault();
                                              const username = e.currentTarget.value.trim();
                                              if (username) {
                                                const fullUrl = platform.baseUrl + username;
                                                form.setValue(`socialLinks.${platform.key}`, fullUrl);
                                                e.currentTarget.value = '';
                                              }
                                            }
                                          }}
                                        />
                                        <span className="text-xs text-muted-foreground">→ Press Enter</span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          
                          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                            <div className="flex items-start gap-2">
                              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                              <div>
                                <p className="font-medium text-sm">Pro Tips for Social Integration:</p>
                                <ul className="text-xs text-muted-foreground space-y-1 mt-1">
                                  <li>• Use your complete profile URLs for better professional presentation</li>
                                  <li>• LinkedIn connections are highly valued in professional networking</li>
                                  <li>• GitHub profiles showcase your technical skills to other attendees</li>
                                  <li>• Copy links to share with new connections quickly</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
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

import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { QrCode, UserCheck, MessageCircle, Calendar, Users, CheckCircle } from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Connect <span className="gradient-text">Authentically</span> at Every Event
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Move beyond small talk. RealConnect helps you discover meaningful connections through shared interests and authentic conversations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <>
                <Link href="/dashboard">
                  <Button size="lg" className="px-8 py-4 text-lg">
                    <Users className="h-5 w-5 mr-2" />
                    Go to Dashboard
                  </Button>
                </Link>
                <Link href="/create-event">
                  <Button size="lg" variant="secondary" className="px-8 py-4 text-lg">
                    <Calendar className="h-5 w-5 mr-2" />
                    Host an Event
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/signup">
                  <Button size="lg" className="px-8 py-4 text-lg">
                    <UserCheck className="h-5 w-5 mr-2" />
                    Create Your Profile
                  </Button>
                </Link>
                <Link href="/create-event">
                  <Button size="lg" variant="secondary" className="px-8 py-4 text-lg">
                    <Calendar className="h-5 w-5 mr-2" />
                    Host an Event
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">How RealConnect Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Simple steps to meaningful connections</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-card text-center shadow-lg">
              <CardContent className="p-8">
                <div className="bg-primary/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                  <QrCode className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">Scan & Join</h3>
                <p className="text-muted-foreground">Use your phone to scan the event QR code and instantly join the guest list</p>
              </CardContent>
            </Card>
            
            <Card className="bg-card text-center shadow-lg">
              <CardContent className="p-8">
                <div className="bg-secondary/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                  <UserCheck className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">Share Your Story</h3>
                <p className="text-muted-foreground">Create a profile with your interests, aspirations, and conversation starters</p>
              </CardContent>
            </Card>
            
            <Card className="bg-card text-center shadow-lg">
              <CardContent className="p-8">
                <div className="bg-accent/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                  <MessageCircle className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">Connect Meaningfully</h3>
                <p className="text-muted-foreground">Browse attendees and start conversations based on shared interests</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Event Creation Demo */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Create Events That Matter</h2>
              <p className="text-xl text-muted-foreground mb-8">Host gatherings where authentic connections flourish. Generate unique QR codes and watch meaningful conversations unfold.</p>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span className="text-muted-foreground">Generate unique QR codes instantly</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span className="text-muted-foreground">Manage guest lists effortlessly</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span className="text-muted-foreground">Foster authentic connections</span>
                </div>
              </div>
            </div>
            
            <Card className="bg-card shadow-lg">
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold text-foreground mb-6">Create New Event</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Event Name</label>
                    <div className="w-full px-4 py-3 bg-input border border-border rounded-xl text-foreground">
                      Summer Networking Mixer
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">Date</label>
                      <div className="w-full px-4 py-3 bg-input border border-border rounded-xl text-foreground">
                        July 15, 2024
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">Time</label>
                      <div className="w-full px-4 py-3 bg-input border border-border rounded-xl text-foreground">
                        7:00 PM
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Location</label>
                    <div className="w-full px-4 py-3 bg-input border border-border rounded-xl text-foreground">
                      The Rooftop Lounge, 123 Main St
                    </div>
                  </div>
                  
                  <Link href="/create-event">
                    <Button className="w-full py-4 text-lg">
                      <QrCode className="h-5 w-5 mr-2" />
                      Generate QR Code & Create Event
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Sample Attendees */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Discover Your Connections</h2>
            <p className="text-xl text-muted-foreground">Browse attendees and find conversation starters</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                name: "Sarah Johnson",
                school: "Stanford University",
                background: "Product Designer passionate about sustainable tech",
                interests: ["UI/UX", "Climbing"],
                avatar: "https://pixabay.com/get/ga4d443bccc8a0e70fba5320bd0cf771f32843c0ce04b606d76263be56203e0c69e80a8d883a18afb6ee8e0e0d71647930918b0d1d8f5326fd40bd767b9f806d6_1280.jpg"
              },
              {
                name: "Michael Chen",
                school: "UC Berkeley",
                background: "Software engineer building AI solutions",
                interests: ["AI/ML", "Chess"],
                avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=400"
              },
              {
                name: "Emma Rodriguez",
                school: "NYU",
                background: "Marketing strategist and travel enthusiast",
                interests: ["Marketing", "Travel"],
                avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=400"
              },
              {
                name: "David Kim",
                school: "MIT",
                background: "Entrepreneur building sustainable energy solutions",
                interests: ["Clean Tech", "Cycling"],
                avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=400"
              }
            ].map((person, index) => (
              <Card key={index} className="bg-card hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="text-center">
                    <Avatar className="w-20 h-20 mx-auto mb-4">
                      <AvatarImage src={person.avatar} alt={person.name} />
                      <AvatarFallback>{person.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{person.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{person.school}</p>
                    <p className="text-sm text-muted-foreground mb-4">{person.background}</p>
                    
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-1 justify-center">
                        {person.interests.map((interest, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {interest}
                          </Badge>
                        ))}
                      </div>
                      <div className="text-center">
                        <Link href="/signup">
                          <Button size="sm" className="w-full">
                            <MessageCircle className="h-4 w-4 mr-1" />
                            Connect
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Ready to Make Real Connections?</h2>
          <p className="text-xl text-muted-foreground mb-8">Join RealConnect and transform how you network at events</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="px-8 py-4 text-lg">
                <UserCheck className="h-5 w-5 mr-2" />
                Create Your Profile
              </Button>
            </Link>
            <Link href="/create-event">
              <Button size="lg" variant="secondary" className="px-8 py-4 text-lg">
                <Calendar className="h-5 w-5 mr-2" />
                Host Your First Event
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

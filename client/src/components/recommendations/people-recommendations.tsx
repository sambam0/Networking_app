import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Sparkles } from "lucide-react";
import ProfileCard from "@/components/profile/profile-card";
import { type UserProfile } from "@shared/schema";

interface PeopleRecommendationsProps {
  eventId?: number;
  onConnect?: (userId: number) => void;
  onViewProfile?: (userId: number) => void;
}

export default function PeopleRecommendations({ eventId, onConnect, onViewProfile }: PeopleRecommendationsProps) {
  const { data: people, isLoading } = useQuery({
    queryKey: ['/api/recommendations/people', eventId],
    queryFn: async () => {
      const url = eventId 
        ? `/api/recommendations/people?eventId=${eventId}`
        : '/api/recommendations/people';
      const response = await fetch(url, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch recommendations');
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            People You Should Meet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-16 w-16 rounded-full mx-auto mb-3" />
                  <Skeleton className="h-4 w-3/4 mx-auto mb-2" />
                  <Skeleton className="h-3 w-1/2 mx-auto" />
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!people || people.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            People You Should Meet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No recommendations available yet. Join more events to discover new connections!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          People You Should Meet
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Connect with people who share your interests
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {people.map((person: UserProfile) => (
            <ProfileCard 
              key={person.id} 
              user={person} 
              onConnect={onConnect}
              onViewProfile={onViewProfile}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
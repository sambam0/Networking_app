import { useQuery } from "@tanstack/react-query";
import { type UserProfile } from "@shared/schema";
import ProfileCard from "@/components/profile/profile-card";
import ProfileModal from "@/components/profile/profile-modal";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, MapPin, GraduationCap, Building, Users, Eye } from "lucide-react";

interface AttendeeGridProps {
  eventId: number;
  onConnect?: (userId: number) => void;
}

// Enhanced Attendee Card Component
function EnhancedAttendeeCard({ 
  attendee, 
  onConnect, 
  onViewProfile 
}: { 
  attendee: UserProfile; 
  onConnect?: (userId: number) => void; 
  onViewProfile: (userId: number) => void; 
}) {
  return (
    <Card className="h-full hover:shadow-lg transition-all duration-200 border border-border/50">
      <CardContent className="p-6">
        {/* Header with Avatar and Basic Info */}
        <div className="flex items-start gap-4 mb-4">
          <Avatar className="w-16 h-16 border-2 border-primary/10">
            <AvatarImage src={attendee.profilePhoto || undefined} alt={attendee.fullName} />
            <AvatarFallback className="text-lg bg-primary/5">
              {attendee.fullName?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-foreground truncate mb-1">
              {attendee.fullName}
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              {attendee.age} years old
            </p>
            
            {/* Location */}
            {(attendee.hometown || attendee.state) && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                <MapPin className="w-3 h-3" />
                <span className="truncate">
                  {attendee.hometown}{attendee.hometown && attendee.state ? ', ' : ''}{attendee.state}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Education Section */}
        <div className="space-y-2 mb-4">
          {attendee.college && (
            <div className="flex items-center gap-2 text-sm">
              <GraduationCap className="w-4 h-4 text-primary" />
              <span className="text-foreground font-medium truncate">{attendee.college}</span>
            </div>
          )}
          {attendee.highSchool && (
            <div className="flex items-center gap-2 text-sm">
              <Building className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground truncate">{attendee.highSchool}</span>
            </div>
          )}
          {/* Legacy school field for backward compatibility */}
          {attendee.school && !attendee.college && !attendee.highSchool && (
            <div className="flex items-center gap-2 text-sm">
              <GraduationCap className="w-4 h-4 text-primary" />
              <span className="text-foreground font-medium truncate">{attendee.school}</span>
            </div>
          )}
        </div>

        {/* Background Preview */}
        {attendee.background && (
          <div className="mb-4">
            <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
              {attendee.background}
            </p>
          </div>
        )}

        {/* Aspirations Preview */}
        {attendee.aspirations && (
          <div className="mb-4">
            <p className="text-xs text-primary/80 font-medium mb-1">Goals:</p>
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {attendee.aspirations}
            </p>
          </div>
        )}

        {/* Interests */}
        {attendee.interests && attendee.interests.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {attendee.interests.slice(0, 3).map((interest, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {interest}
                </Badge>
              ))}
              {attendee.interests.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{attendee.interests.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2 border-t border-border/30">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onViewProfile(attendee.id)}
            className="flex-1 text-xs"
          >
            <Eye className="w-3 h-3 mr-1" />
            View Full
          </Button>
          {onConnect && (
            <Button 
              size="sm" 
              onClick={() => onConnect(attendee.id)}
              className="flex-1 text-xs"
            >
              <MessageCircle className="w-3 h-3 mr-1" />
              Connect
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function AttendeeGrid({ eventId, onConnect }: AttendeeGridProps) {
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  const { data: attendees, isLoading } = useQuery({
    queryKey: ['/api/events', eventId, 'attendees'],
  });

  const handleViewProfile = (userId: number) => {
    const user = attendees?.find((attendee: UserProfile) => attendee.id === userId);
    if (user) {
      setSelectedUser(user);
    }
  };

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="h-full">
            <CardContent className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <Skeleton className="w-16 h-16 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </div>
              <Skeleton className="h-12 w-full mb-4" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-12" />
              </div>
              <div className="flex gap-2 mt-4">
                <Skeleton className="h-8 flex-1" />
                <Skeleton className="h-8 flex-1" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!attendees || attendees.length === 0) {
    return (
      <div className="text-center py-16">
        <Users className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
        <p className="text-muted-foreground text-lg font-medium mb-2">No attendees yet</p>
        <p className="text-muted-foreground text-sm">Be the first to join this event!</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {attendees.map((attendee: UserProfile) => (
          <EnhancedAttendeeCard
            key={attendee.id}
            attendee={attendee}
            onConnect={onConnect}
            onViewProfile={handleViewProfile}
          />
        ))}
      </div>
      
      <ProfileModal
        user={selectedUser}
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        onConnect={onConnect}
      />
    </>
  );
}

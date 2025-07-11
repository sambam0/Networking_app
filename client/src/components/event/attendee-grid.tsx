import { useQuery } from "@tanstack/react-query";
import { type UserProfile } from "@shared/schema";
import ProfileCard from "@/components/profile/profile-card";
import ProfileModal from "@/components/profile/profile-modal";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface AttendeeGridProps {
  eventId: number;
  onConnect?: (userId: number) => void;
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
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-card rounded-xl p-6">
            <Skeleton className="w-20 h-20 rounded-full mx-auto mb-4" />
            <Skeleton className="h-4 w-3/4 mx-auto mb-2" />
            <Skeleton className="h-3 w-1/2 mx-auto mb-3" />
            <Skeleton className="h-3 w-full mb-4" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-16" />
            </div>
            <Skeleton className="h-8 w-full mt-4" />
          </div>
        ))}
      </div>
    );
  }

  if (!attendees || attendees.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">No attendees yet</p>
        <p className="text-muted-foreground text-sm">Be the first to join this event!</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {attendees.map((attendee: UserProfile) => (
          <ProfileCard
            key={attendee.id}
            user={attendee}
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

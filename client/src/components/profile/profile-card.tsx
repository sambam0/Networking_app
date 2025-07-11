import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle } from "lucide-react";
import { type UserProfile } from "@shared/schema";

interface ProfileCardProps {
  user: UserProfile;
  onConnect?: (userId: number) => void;
  onViewProfile?: (userId: number) => void;
}

export default function ProfileCard({ user, onConnect, onViewProfile }: ProfileCardProps) {
  const handleConnect = () => {
    if (onConnect) {
      onConnect(user.id);
    }
  };

  const handleViewProfile = () => {
    if (onViewProfile) {
      onViewProfile(user.id);
    }
  };

  return (
    <Card className="bg-card hover:shadow-lg transition-shadow cursor-pointer group">
      <CardContent className="p-6">
        <div className="text-center">
          <Avatar className="w-20 h-20 mx-auto mb-4">
            <AvatarImage src={user.profilePhoto || undefined} alt={user.fullName} />
            <AvatarFallback className="text-lg">
              {user.fullName?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          
          <h3 className="text-lg font-semibold text-foreground mb-2">{user.fullName}</h3>
          {user.school && (
            <p className="text-sm text-muted-foreground mb-3">{user.school}</p>
          )}
          
          {user.background && (
            <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
              {user.background}
            </p>
          )}
          
          {user.interests && user.interests.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4 justify-center">
              {user.interests.slice(0, 2).map((interest, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="text-xs"
                >
                  {interest}
                </Badge>
              ))}
              {user.interests.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{user.interests.length - 2}
                </Badge>
              )}
            </div>
          )}
          
          <div className="flex gap-2">
            {onViewProfile && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleViewProfile}
                className="flex-1"
              >
                View Profile
              </Button>
            )}
            {onConnect && (
              <Button 
                size="sm" 
                onClick={handleConnect}
                className="flex-1"
              >
                <MessageCircle className="h-4 w-4 mr-1" />
                Connect
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

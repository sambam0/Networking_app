import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, ExternalLink, Globe, Linkedin } from "lucide-react";
import { type UserProfile } from "@shared/schema";

interface ProfileModalProps {
  user: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onConnect?: (userId: number) => void;
}

export default function ProfileModal({ user, isOpen, onClose, onConnect }: ProfileModalProps) {
  if (!user) return null;

  const handleConnect = () => {
    if (onConnect) {
      onConnect(user.id);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">Profile Details</DialogTitle>
        </DialogHeader>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <Avatar className="w-32 h-32 mx-auto mb-4">
              <AvatarImage src={user.profilePhoto || undefined} alt={user.fullName} />
              <AvatarFallback className="text-2xl">
                {user.fullName?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            
            <h3 className="text-2xl font-bold text-foreground mb-2">{user.fullName}</h3>
            <p className="text-muted-foreground mb-1">{user.age} years old</p>
            {user.school && (
              <p className="text-primary font-medium mb-6">{user.school}</p>
            )}
            
            {user.socialLinks && (
              <div className="space-y-3">
                {user.socialLinks.linkedin && (
                  <a 
                    href={user.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center space-x-2 text-secondary hover:text-secondary/80 transition-colors"
                  >
                    <Linkedin className="h-4 w-4" />
                    <span>LinkedIn</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                {user.socialLinks.website && (
                  <a 
                    href={user.socialLinks.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center space-x-2 text-secondary hover:text-secondary/80 transition-colors"
                  >
                    <Globe className="h-4 w-4" />
                    <span>Website</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            )}
          </div>
          
          <div className="md:col-span-2 space-y-6">
            {user.background && (
              <div>
                <h4 className="text-lg font-semibold text-foreground mb-3">Background</h4>
                <p className="text-muted-foreground">{user.background}</p>
              </div>
            )}
            
            {user.aspirations && (
              <div>
                <h4 className="text-lg font-semibold text-foreground mb-3">Current Aspirations</h4>
                <p className="text-muted-foreground">{user.aspirations}</p>
              </div>
            )}
            
            {user.interests && user.interests.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-foreground mb-3">Interests & Hobbies</h4>
                <div className="flex flex-wrap gap-2">
                  {user.interests.map((interest, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="text-sm"
                    >
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            <div>
              <h4 className="text-lg font-semibold text-foreground mb-3">Conversation Starters</h4>
              <div className="space-y-2">
                {user.interests && user.interests.length > 0 && (
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      💡 Ask me about {user.interests[0]}
                    </p>
                  </div>
                )}
                {user.school && (
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      🎓 I love talking about my experiences at {user.school}
                    </p>
                  </div>
                )}
                {user.aspirations && (
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      🚀 Happy to share insights about my goals and projects
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {onConnect && (
              <div className="pt-6 border-t border-border">
                <Button 
                  onClick={handleConnect}
                  className="w-full"
                  size="lg"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Start a Conversation
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

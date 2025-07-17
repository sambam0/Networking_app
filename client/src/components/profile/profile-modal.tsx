import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, ExternalLink, Globe, Linkedin, Twitter, Instagram, Github, Video, Facebook } from "lucide-react";
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
          <DialogDescription className="sr-only">
            View detailed profile information for {user.fullName}
          </DialogDescription>
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
            <p className="text-muted-foreground mb-3">{user.age} years old</p>
            
            {/* Location Information */}
            {(user.hometown || user.state) && (
              <div className="mb-3">
                <p className="text-sm font-medium text-foreground mb-1">📍 Location</p>
                <p className="text-muted-foreground">
                  {user.hometown}{user.hometown && user.state ? ', ' : ''}{user.state}
                </p>
              </div>
            )}
            
            {/* Education Information */}
            {(user.college || user.highSchool || user.school) && (
              <div className="mb-6">
                <p className="text-sm font-medium text-foreground mb-2">🎓 Education</p>
                {user.college && (
                  <p className="text-primary font-medium mb-1">{user.college}</p>
                )}
                {user.highSchool && (
                  <p className="text-muted-foreground mb-1">{user.highSchool}</p>
                )}
                {user.school && !user.college && !user.highSchool && (
                  <p className="text-primary font-medium">{user.school}</p>
                )}
              </div>
            )}
            
            {/* Social Media Links */}
            {user.socialLinks && Object.values(user.socialLinks).some(link => link) && (
              <div className="mb-6">
                <p className="text-sm font-medium text-foreground mb-3">🔗 Connect</p>
                <div className="grid grid-cols-2 gap-2">
                  {user.socialLinks.linkedin && (
                    <a 
                      href={user.socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors text-blue-600 dark:text-blue-400"
                    >
                      <Linkedin className="h-4 w-4" />
                      <span className="text-xs font-medium">LinkedIn</span>
                    </a>
                  )}
                  {user.socialLinks.twitter && (
                    <a 
                      href={user.socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-700 dark:text-gray-300"
                    >
                      <Twitter className="h-4 w-4" />
                      <span className="text-xs font-medium">X</span>
                    </a>
                  )}
                  {user.socialLinks.instagram && (
                    <a 
                      href={user.socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 bg-pink-50 dark:bg-pink-900/20 hover:bg-pink-100 dark:hover:bg-pink-900/30 rounded-lg transition-colors text-pink-600 dark:text-pink-400"
                    >
                      <Instagram className="h-4 w-4" />
                      <span className="text-xs font-medium">Instagram</span>
                    </a>
                  )}
                  {user.socialLinks.github && (
                    <a 
                      href={user.socialLinks.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-700 dark:text-gray-300"
                    >
                      <Github className="h-4 w-4" />
                      <span className="text-xs font-medium">GitHub</span>
                    </a>
                  )}
                  {user.socialLinks.youtube && (
                    <a 
                      href={user.socialLinks.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors text-red-600 dark:text-red-400"
                    >
                      <Video className="h-4 w-4" />
                      <span className="text-xs font-medium">YouTube</span>
                    </a>
                  )}
                  {user.socialLinks.facebook && (
                    <a 
                      href={user.socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors text-blue-700 dark:text-blue-300"
                    >
                      <Facebook className="h-4 w-4" />
                      <span className="text-xs font-medium">Facebook</span>
                    </a>
                  )}
                  {user.socialLinks.tiktok && (
                    <a 
                      href={user.socialLinks.tiktok}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-700 dark:text-gray-300"
                    >
                      <Video className="h-4 w-4" />
                      <span className="text-xs font-medium">TikTok</span>
                    </a>
                  )}
                  {user.socialLinks.website && (
                    <a 
                      href={user.socialLinks.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors text-green-600 dark:text-green-400"
                    >
                      <Globe className="h-4 w-4" />
                      <span className="text-xs font-medium">Website</span>
                    </a>
                  )}
                </div>
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

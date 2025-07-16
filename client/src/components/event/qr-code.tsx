import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, Share2, Copy } from "lucide-react";
import { generateQRCodeDataURL, downloadQRCode } from "@/lib/qr-utils";
import { useToast } from "@/hooks/use-toast";
import { type Event } from "@shared/schema";

interface QRCodeProps {
  event: Event;
}

export default function QRCode({ event }: QRCodeProps) {
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const generateQR = async () => {
      setIsLoading(true);
      const joinUrl = `${window.location.origin}/join/${event.qrCode}`;
      const dataURL = await generateQRCodeDataURL(joinUrl);
      setQrCodeDataURL(dataURL);
      setIsLoading(false);
    };
    generateQR();
  }, [event.qrCode]);

  const handleDownload = async () => {
    await downloadQRCode(`${window.location.origin}/join/${event.qrCode}`, `${event.name}-qr-code.png`);
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/join/${event.qrCode}`;
    
    if (navigator.share) {
      await navigator.share({
        title: event.name,
        text: `Join "${event.name}" on RealConnect`,
        url: shareUrl,
      });
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link Copied!",
        description: "Event link has been copied to clipboard.",
      });
    }
  };

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(event.qrCode);
    toast({
      title: "Event Code Copied!",
      description: "Event code has been copied to clipboard.",
    });
  };

  return (
    <Card className="bg-card shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl text-center">Event QR Code</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-white rounded-xl p-6 text-center mb-6">
          {isLoading ? (
            <Skeleton className="w-64 h-64 mx-auto mb-4" />
          ) : (
            <img 
              src={qrCodeDataURL} 
              alt="Event QR Code" 
              className="mx-auto mb-4 rounded-lg w-64 h-64"
            />
          )}
          <p className="text-gray-800 font-medium">{event.name}</p>
          <p className="text-gray-600 text-sm">
            {new Date(event.date).toLocaleDateString()} • {new Date(event.date).toLocaleTimeString()}
          </p>
          <div className="mt-4 p-3 bg-gray-100 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Event Code:</p>
            <div className="flex items-center justify-between gap-2">
              <p className="text-lg font-mono font-bold text-gray-800 tracking-wider">{event.qrCode}</p>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCopyCode}
                className="text-gray-600 hover:text-gray-800"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="flex gap-3">
          <Button 
            onClick={handleDownload}
            variant="outline"
            className="flex-1"
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button 
            onClick={handleShare}
            className="flex-1"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

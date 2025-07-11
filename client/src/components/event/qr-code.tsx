import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Share2 } from "lucide-react";
import { generateQRCodeDataURL, downloadQRCode } from "@/lib/qr-utils";
import { type Event } from "@shared/schema";

interface QRCodeProps {
  event: Event;
}

export default function QRCode({ event }: QRCodeProps) {
  const qrCodeDataURL = generateQRCodeDataURL(event.qrCode);

  const handleDownload = () => {
    downloadQRCode(event.qrCode, `${event.name}-qr-code.png`);
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
    }
  };

  return (
    <Card className="bg-card shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl text-center">Event QR Code</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-white rounded-xl p-6 text-center mb-6">
          <img 
            src={qrCodeDataURL} 
            alt="Event QR Code" 
            className="mx-auto mb-4 rounded-lg"
          />
          <p className="text-gray-800 font-medium">{event.name}</p>
          <p className="text-gray-600 text-sm">
            {new Date(event.date).toLocaleDateString()} • {new Date(event.date).toLocaleTimeString()}
          </p>
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

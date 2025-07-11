export function generateQRCodeDataURL(text: string): string {
  // Simple QR code placeholder - in production, use a proper QR code library
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return '';
  
  canvas.width = 200;
  canvas.height = 200;
  
  // Fill with white background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 200, 200);
  
  // Create a simple pattern for QR code simulation
  ctx.fillStyle = '#000000';
  
  // Draw corner squares
  ctx.fillRect(10, 10, 30, 30);
  ctx.fillRect(160, 10, 30, 30);
  ctx.fillRect(10, 160, 30, 30);
  
  // Draw some random pattern in the middle
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      if (Math.random() > 0.5) {
        ctx.fillRect(60 + i * 8, 60 + j * 8, 8, 8);
      }
    }
  }
  
  return canvas.toDataURL();
}

export function downloadQRCode(qrCode: string, filename: string) {
  const dataURL = generateQRCodeDataURL(qrCode);
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataURL;
  link.click();
}

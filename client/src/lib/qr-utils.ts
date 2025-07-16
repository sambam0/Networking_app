import QRCode from 'qrcode';

export async function generateQRCodeDataURL(text: string): Promise<string> {
  try {
    const options = {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      width: 256,
    };
    
    const dataURL = await QRCode.toDataURL(text, options);
    return dataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    return '';
  }
}

export async function downloadQRCode(qrCode: string, filename: string) {
  const dataURL = await generateQRCodeDataURL(qrCode);
  if (!dataURL) {
    console.error('Failed to generate QR code for download');
    return;
  }
  
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataURL;
  link.click();
}

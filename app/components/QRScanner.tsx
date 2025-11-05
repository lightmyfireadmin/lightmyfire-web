'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface QRScannerProps {
  onScan: (decodedText: string) => void;
  onClose: () => void;
}

export default function QRScanner({ onScan, onClose }: QRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const startScanner = async () => {
      try {
        const scanner = new Html5Qrcode('qr-reader');
        scannerRef.current = scanner;

        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        };

        await scanner.start(
          { facingMode: 'environment' }, // Use back camera
          config,
          (decodedText) => {
            // Successfully scanned
            onScan(decodedText);
            stopScanner();
          },
          (errorMessage) => {
            // Scanning error - ignore most errors as they're normal
            // Only log actual issues
          }
        );

        setIsScanning(true);
      } catch (err) {
        console.error('Error starting QR scanner:', err);
        setError('Unable to access camera. Please ensure you have granted camera permissions.');
      }
    };

    const stopScanner = async () => {
      if (scannerRef.current && isScanning) {
        try {
          await scannerRef.current.stop();
          scannerRef.current.clear();
        } catch (err) {
          console.error('Error stopping scanner:', err);
        }
      }
    };

    startScanner();

    return () => {
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onScan]);

  const handleClose = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg max-w-md w-full p-6 relative">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
          aria-label="Close scanner"
        >
          <XMarkIcon className="h-6 w-6 text-foreground" />
        </button>

        {/* Header */}
        <h2 className="text-xl font-semibold text-foreground mb-4">Scan QR Code</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Point your camera at the QR code on the lighter sticker
        </p>

        {/* Scanner area */}
        <div
          id="qr-reader"
          className="w-full rounded-lg overflow-hidden border-2 border-primary"
        ></div>

        {/* Error message */}
        {error && (
          <div className="mt-4 p-3 bg-error/10 text-error rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Instructions */}
        <div className="mt-4 p-3 bg-primary/5 rounded-lg">
          <p className="text-xs text-muted-foreground">
            💡 <strong>Tip:</strong> Hold your device steady and ensure the QR code is well-lit and in focus.
          </p>
        </div>
      </div>
    </div>
  );
}

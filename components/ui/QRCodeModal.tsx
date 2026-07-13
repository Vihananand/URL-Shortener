import { motion, AnimatePresence } from "motion/react";
import { QRCodeCanvas } from "qrcode.react";
import { Download, X } from "lucide-react";
import { useRef } from "react";
import { showToast } from "./Toast";
interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
}
export default function QRCodeModal({ isOpen, onClose, url }: QRCodeModalProps) {
  const qrRef = useRef<HTMLDivElement>(null);
  const handleDownload = () => {
    try {
      const canvas = qrRef.current?.querySelector("canvas");
      if (!canvas) return;
      const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      let filename = "qrcode.png";
      try {
        const path = new URL(url).pathname.slice(1);
        if (path) filename = `qrcode-${path}.png`;
      } catch (e) {
      }
      downloadLink.download = filename;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      showToast.success("QR Code downloaded!");
    } catch (err) {
      console.error(err);
      showToast.error("Failed to download QR code");
    }
  };
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm pointer-events-auto relative shadow-2xl"
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
              <h3 className="text-lg font-semibold text-text mb-1">QR Code</h3>
              <p className="text-sm text-muted mb-6">Scan to open the short link.</p>
              <div className="bg-white p-4 rounded-xl flex items-center justify-center mb-6 shadow-inner" ref={qrRef}>
                <QRCodeCanvas 
                  value={url} 
                  size={200} 
                  bgColor={"#ffffff"} 
                  fgColor={"#000000"} 
                  level={"H"} 
                  includeMargin={false} 
                />
              </div>
              <button
                onClick={handleDownload}
                className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 py-2.5 rounded-xl font-medium transition-colors cursor-pointer"
              >
                <Download size={16} />
                Download PNG
              </button>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

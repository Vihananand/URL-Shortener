import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function DisabledLinkPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
      <div className="max-w-md w-full bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden">
        
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent opacity-50"></div>
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-yellow-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(234,179,8,0.2)]">
            <AlertTriangle className="w-8 h-8 text-yellow-500" />
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-3">
            Link Disabled
          </h1>
          
          <p className="text-gray-400 mb-8 leading-relaxed">
            This short link has been temporarily or permanently disabled. Please contact the administrator who provided you with this link for further assistance.
          </p>
          
          <Link href="/" className="w-full">
            <Button variant="primary" className="w-full">
              Return to Homepage
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

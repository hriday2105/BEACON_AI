import { Link } from 'wouter';
import { Shield } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div
          className="text-8xl font-black font-mono-display mb-4"
          style={{ color: '#00e5ff', textShadow: '0 0 40px rgba(0,229,255,0.5)' }}
        >
          404
        </div>
        <div className="flex items-center justify-center gap-2 mb-4">
          <Shield className="w-5 h-5" style={{ color: 'rgba(0,229,255,0.5)' }} />
          <p className="font-mono-data text-sm text-muted-foreground tracking-widest uppercase">
            SIGNAL LOST — PAGE NOT FOUND
          </p>
        </div>
        <p className="text-sm text-muted-foreground mb-8">
          This sector is outside BeaconAI's coverage area.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded font-mono-display text-xs tracking-widest font-bold"
          style={{ background: '#00e5ff', color: '#0a0f1e', boxShadow: '0 0 16px rgba(0,229,255,0.3)' }}
        >
          RETURN TO COMMAND CENTER
        </Link>
      </div>
    </div>
  );
}

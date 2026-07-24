import { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { useGetStats } from '@workspace/api-client-react';
import {
  Shield, Radio, CreditCard, Eye, Newspaper, Map,
  ArrowRight, Activity
} from 'lucide-react';

const features = [
  {
    href: '/scam',
    icon: Shield,
    title: 'SCAM DETECTOR',
    desc: 'Analyze WhatsApp messages, SMS, and emails for deceptive patterns. AI-trained on thousands of Indian scam templates.',
    tag: 'NLP ENGINE',
  },
  {
    href: '/phishing',
    icon: Radio,
    title: 'PHISHING SCANNER',
    desc: 'Instantly verify suspicious URLs against known phishing domains, spoofed bank sites, and malicious redirects.',
    tag: 'URL ANALYSIS',
  },
  {
    href: '/payment',
    icon: CreditCard,
    title: 'PAYMENT FRAUD',
    desc: 'Forensic analysis of UPI screenshots, fake receipts, and doctored transaction records from Paytm, GPay, PhonePe.',
    tag: 'IMAGE FORENSICS',
  },
  {
    href: '/deepfake',
    icon: Eye,
    title: 'DEEPFAKE DETECTOR',
    desc: 'Neural network-based detection of synthetic media — AI-generated faces, voice cloning, and video manipulation.',
    tag: 'NEURAL SCAN',
  },
  {
    href: '/news',
    icon: Newspaper,
    title: 'FACT CHECKER',
    desc: 'Real-time verification of viral claims, political misinformation, and fabricated news circulating on Indian social media.',
    tag: 'FACT ENGINE',
  },
  {
    href: '/map',
    icon: Map,
    title: 'THREAT MAP',
    desc: 'Live intelligence map of scam hotspots across India. Community-sourced reports and city-level threat density.',
    tag: 'GEO INTEL',
  },
];

function AnimatedStat({ label, value, suffix = '' }: { label: string; value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started) setStarted(true);
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started || value === 0) return;
    const duration = 1500;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        setDisplay(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [started, value]);

  const formatted = display >= 1000000
    ? `${(display / 1000000).toFixed(1)}M`
    : display >= 1000
    ? `${(display / 1000).toFixed(1)}K`
    : display.toString();

  return (
    <div ref={ref} className="text-center p-4" data-testid={`stat-${label.toLowerCase().replace(' ', '-')}`}>
      <div
        className="font-mono-display text-3xl sm:text-4xl font-bold mb-1"
        style={{ color: '#00e5ff', textShadow: '0 0 20px rgba(0,229,255,0.5)' }}
      >
        {formatted}{suffix}
      </div>
      <div className="text-xs font-mono-data text-muted-foreground tracking-widest uppercase">{label}</div>
    </div>
  );
}

function RadarAnimation() {
  return (
    <div className="relative w-72 h-72 mx-auto">
      {/* Outer rings */}
      {[1, 0.75, 0.5, 0.25].map((scale, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            inset: `${(1 - scale) * 50}%`,
            border: `1px solid rgba(0, 229, 255, ${0.08 + i * 0.06})`,
          }}
        />
      ))}

      {/* Grid lines */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full h-px" style={{ background: 'rgba(0,229,255,0.1)' }} />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-full w-px" style={{ background: 'rgba(0,229,255,0.1)' }} />
      </div>

      {/* Sweep gradient */}
      <div
        className="absolute inset-0 rounded-full animate-radar-sweep"
        style={{
          background: 'conic-gradient(from 0deg, transparent 270deg, rgba(0,229,255,0.15) 300deg, rgba(0,229,255,0.4) 360deg)',
        }}
      />

      {/* Center dot */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="w-3 h-3 rounded-full"
          style={{
            background: '#00e5ff',
            boxShadow: '0 0 16px rgba(0,229,255,0.8), 0 0 32px rgba(0,229,255,0.4)',
          }}
        />
      </div>

      {/* Ping dots */}
      {[
        { top: '25%', left: '60%', delay: '0s' },
        { top: '55%', left: '30%', delay: '0.7s' },
        { top: '70%', left: '65%', delay: '1.4s' },
        { top: '35%', left: '40%', delay: '2.1s' },
      ].map((pos, i) => (
        <div
          key={i}
          className="absolute w-2 h-2"
          style={{ top: pos.top, left: pos.left, transform: 'translate(-50%, -50%)' }}
        >
          <div
            className="absolute inset-0 rounded-full animate-radar-ping"
            style={{
              background: '#00e5ff',
              animationDelay: pos.delay,
            }}
          />
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: '#00e5ff', boxShadow: '0 0 6px rgba(0,229,255,0.8)' }}
          />
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const { data: stats } = useGetStats();

  return (
    <div className="min-h-[100dvh] pt-14">
      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        {/* Background gradient */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0,229,255,0.06) 0%, transparent 70%)',
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text */}
            <div className="order-2 lg:order-1">
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded mb-6 text-xs font-mono-data tracking-widest"
                style={{
                  background: 'rgba(0,229,255,0.08)',
                  border: '1px solid rgba(0,229,255,0.2)',
                  color: '#00e5ff',
                }}
              >
                <Activity className="w-3 h-3 animate-pulse" />
                INDIA THREAT INTELLIGENCE ACTIVE
              </div>

              <h1 className="cyber-heading text-5xl sm:text-6xl lg:text-7xl font-black mb-4 leading-none">
                <span style={{ color: '#00e5ff', textShadow: '0 0 40px rgba(0,229,255,0.5)' }}>BEACON</span>
                <span className="text-white">AI</span>
              </h1>

              <p
                className="text-base sm:text-lg font-mono-data leading-relaxed mb-8 max-w-lg"
                style={{ color: 'rgba(195, 240, 248, 0.7)' }}
              >
                Radiating protective signals. Cutting through the fog of online threats for everyday Indians.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/scam"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded font-mono-display text-xs tracking-widest font-bold transition-all duration-200 hover:scale-105"
                  style={{
                    background: '#00e5ff',
                    color: '#0a0f1e',
                    boxShadow: '0 0 20px rgba(0,229,255,0.4)',
                  }}
                  data-testid="button-start-scan"
                >
                  <Shield className="w-4 h-4" />
                  START SCAN
                </Link>
                <Link
                  href="/map"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded font-mono-display text-xs tracking-widest font-bold transition-all duration-200 hover:scale-105"
                  style={{
                    background: 'transparent',
                    color: '#00e5ff',
                    border: '1px solid rgba(0,229,255,0.4)',
                  }}
                  data-testid="button-view-map"
                >
                  <Map className="w-4 h-4" />
                  VIEW MAP
                </Link>
              </div>

              {/* Live indicator */}
              <div className="mt-8 flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ background: '#22d3ee', boxShadow: '0 0 6px rgba(34,211,238,0.8)' }}
                  />
                  <span className="text-xs font-mono-data text-muted-foreground tracking-wider">SYSTEMS ONLINE</span>
                </div>
                <div className="h-3 w-px bg-border" />
                <span className="text-xs font-mono-data text-muted-foreground tracking-wider">5 THREAT MODULES ACTIVE</span>
              </div>
            </div>

            {/* Radar */}
            <div className="order-1 lg:order-2 flex justify-center">
              <RadarAnimation />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section
        className="py-10"
        style={{
          borderTop: '1px solid rgba(0,229,255,0.1)',
          borderBottom: '1px solid rgba(0,229,255,0.1)',
          background: 'rgba(0,229,255,0.02)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <AnimatedStat label="Total Scans" value={stats?.totalScans ?? 0} />
            <AnimatedStat label="Threats Blocked" value={stats?.threatsBlocked ?? 0} />
            <AnimatedStat label="Accuracy Rate" value={stats?.accuracyRate ?? 0} suffix="%" />
            <AnimatedStat label="Community Reports" value={stats?.communityReports ?? 0} />
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-10">
            <h2
              className="cyber-heading text-xl sm:text-2xl font-bold mb-2"
              style={{ color: '#00e5ff' }}
            >
              THREAT DETECTION MODULES
            </h2>
            <p className="text-sm text-muted-foreground font-mono-data tracking-wider">
              Six specialized AI engines protecting you from every angle of digital deception.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map(({ href, icon: Icon, title, desc, tag }) => (
              <Link
                key={href}
                href={href}
                className="group block p-5 rounded transition-all duration-300 hover:scale-[1.01]"
                style={{
                  background: 'rgba(10,20,40,0.8)',
                  border: '1px solid rgba(0,229,255,0.12)',
                }}
                data-testid={`card-feature-${title.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="p-2.5 rounded"
                    style={{
                      background: 'rgba(0,229,255,0.08)',
                      border: '1px solid rgba(0,229,255,0.2)',
                    }}
                  >
                    <Icon
                      className="w-5 h-5 transition-all duration-300 group-hover:scale-110"
                      style={{ color: '#00e5ff' }}
                    />
                  </div>
                  <span
                    className="text-[9px] font-mono-data tracking-widest px-2 py-1 rounded"
                    style={{
                      background: 'rgba(0,229,255,0.06)',
                      border: '1px solid rgba(0,229,255,0.15)',
                      color: 'rgba(0,229,255,0.6)',
                    }}
                  >
                    {tag}
                  </span>
                </div>

                <h3
                  className="cyber-heading text-sm font-bold mb-2 group-hover:text-cyan-400 transition-colors"
                  style={{ color: 'rgba(195,240,248,0.9)' }}
                >
                  {title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-4">{desc}</p>

                <div
                  className="flex items-center gap-1 text-xs font-mono-data tracking-widest opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: '#00e5ff' }}
                >
                  LAUNCH MODULE
                  <ArrowRight className="w-3 h-3" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="py-8"
        style={{ borderTop: '1px solid rgba(0,229,255,0.1)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="font-mono-display text-sm tracking-widest">
            <span style={{ color: '#00e5ff' }}>BEACON</span>
            <span className="text-white">AI</span>
          </div>
          <p className="text-xs font-mono-data text-muted-foreground text-center">
            Protecting everyday Indians from digital threats. Built for Bharat.
          </p>
          <p className="text-xs font-mono-data text-muted-foreground">
            v2.4.1 &bull; SYSTEMS NOMINAL
          </p>
        </div>
      </footer>
    </div>
  );
}

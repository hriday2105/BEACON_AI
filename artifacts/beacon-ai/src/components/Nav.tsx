import { Link, useLocation } from 'wouter';
import { Shield, Radio, CreditCard, Eye, Newspaper, Map, Zap } from 'lucide-react';

const navItems = [
  { href: '/', label: 'COMMAND', icon: Zap },
  { href: '/scam', label: 'SCAM', icon: Shield },
  { href: '/phishing', label: 'PHISHING', icon: Radio },
  { href: '/payment', label: 'PAYMENT', icon: CreditCard },
  { href: '/deepfake', label: 'DEEPFAKE', icon: Eye },
  { href: '/news', label: 'FACT CHECK', icon: Newspaper },
  { href: '/map', label: 'THREAT MAP', icon: Map },
];

export default function Nav() {
  const [location] = useLocation();

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 border-b"
      style={{
        background: 'rgba(10, 15, 30, 0.85)',
        backdropFilter: 'blur(16px)',
        borderColor: 'rgba(0, 229, 255, 0.15)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="relative w-7 h-7">
              <svg viewBox="0 0 28 28" fill="none" className="w-7 h-7">
                <circle cx="14" cy="14" r="13" stroke="#00e5ff" strokeWidth="1.5" strokeOpacity="0.4" />
                <circle cx="14" cy="14" r="8" stroke="#00e5ff" strokeWidth="1" strokeOpacity="0.6" />
                <circle cx="14" cy="14" r="3" fill="#00e5ff" />
                <line x1="14" y1="1" x2="14" y2="8" stroke="#00e5ff" strokeWidth="1.5" />
                <line x1="14" y1="20" x2="14" y2="27" stroke="#00e5ff" strokeWidth="1.5" strokeOpacity="0.4" />
              </svg>
            </div>
            <span className="font-mono-display text-base font-700 tracking-widest">
              <span style={{ color: '#00e5ff' }}>BEACON</span>
              <span className="text-white">AI</span>
            </span>
          </Link>

          {/* Nav items - hidden on small mobile */}
          <div className="hidden sm:flex items-center gap-1">
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive = location === href || (href !== '/' && location.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={`
                    flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] tracking-widest transition-all duration-200
                    font-mono-data
                    ${isActive
                      ? 'nav-item-active'
                      : 'text-muted-foreground hover:text-cyan-400 border-b-2 border-transparent hover:border-cyan-400/30'
                    }
                  `}
                  data-testid={`nav-${label.toLowerCase().replace(' ', '-')}`}
                >
                  <Icon className="w-3 h-3" />
                  {label}
                </Link>
              );
            })}
          </div>

          {/* Mobile: compact icons */}
          <div className="flex sm:hidden items-center gap-0.5">
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive = location === href || (href !== '/' && location.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={`p-2 rounded transition-colors ${isActive ? 'text-cyan-400' : 'text-muted-foreground'}`}
                  data-testid={`nav-mobile-${label.toLowerCase().replace(' ', '-')}`}
                >
                  <Icon className="w-4 h-4" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}

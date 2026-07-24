interface PageLayoutProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

export default function PageLayout({ title, subtitle, icon, children }: PageLayoutProps) {
  return (
    <div className="min-h-[100dvh] pt-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Page Header */}
        <div className="mb-8 pb-6" style={{ borderBottom: '1px solid rgba(0, 229, 255, 0.12)' }}>
          <div className="flex items-center gap-3 mb-2">
            <div style={{ color: '#00e5ff', filter: 'drop-shadow(0 0 8px rgba(0,229,255,0.5))' }}>
              {icon}
            </div>
            <h1
              className="cyber-heading text-2xl sm:text-3xl font-bold"
              style={{ color: '#00e5ff', textShadow: '0 0 20px rgba(0,229,255,0.4)' }}
            >
              {title}
            </h1>
          </div>
          <p className="text-sm text-muted-foreground font-mono-data tracking-wider pl-9">
            {subtitle}
          </p>
        </div>

        {children}
      </div>
    </div>
  );
}

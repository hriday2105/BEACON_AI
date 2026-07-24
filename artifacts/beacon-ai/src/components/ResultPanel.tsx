import { Shield, AlertTriangle, CheckCircle, XCircle, Activity } from 'lucide-react';

interface Indicator {
  label: string;
  confidence: number;
  riskLevel: 'safe' | 'suspicious' | 'dangerous';
}

interface ResultData {
  verdict: string | boolean;
  confidence: number;
  riskLevel: 'safe' | 'suspicious' | 'dangerous';
  summary: string;
  category?: string | null;
  indicators: Indicator[];
  recommendations: string[];
  domain?: string;
}

interface ResultPanelProps {
  result: ResultData | null;
  isLoading: boolean;
  loadingText?: string;
}

const riskConfig = {
  safe: {
    color: '#22d3ee',
    bgClass: 'bg-risk-safe',
    borderClass: 'risk-safe',
    icon: CheckCircle,
    label: 'SAFE',
  },
  suspicious: {
    color: '#fbbf24',
    bgClass: 'bg-risk-suspicious',
    borderClass: 'risk-suspicious',
    icon: AlertTriangle,
    label: 'SUSPICIOUS',
  },
  dangerous: {
    color: '#f87171',
    bgClass: 'bg-risk-dangerous',
    borderClass: 'risk-dangerous',
    icon: XCircle,
    label: 'THREAT DETECTED',
  },
};

export default function ResultPanel({ result, isLoading, loadingText = 'ANALYZING...' }: ResultPanelProps) {
  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-6 p-8">
        {/* Animated scanner */}
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 rounded-full border-2 border-cyan-400/20" />
          <div className="absolute inset-2 rounded-full border border-cyan-400/30" />
          <div
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-400"
            style={{ animation: 'radar-sweep 1s linear infinite' }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Activity className="w-8 h-8 text-cyan-400" style={{ filter: 'drop-shadow(0 0 8px #00e5ff)' }} />
          </div>
        </div>
        <div className="text-center">
          <p className="font-mono-data text-cyan-400 text-sm tracking-widest cyber-glow-text">NEURAL NET ACTIVE</p>
          <p className="font-mono-data text-muted-foreground text-xs tracking-widest mt-1">{loadingText}</p>
        </div>
        <div className="flex gap-1">
          {[0,1,2,3,4].map(i => (
            <div
              key={i}
              className="w-1.5 h-6 bg-cyan-400/40 rounded-sm"
              style={{
                animation: `pulse 1.2s ease-in-out ${i * 0.15}s infinite`,
                animationFillMode: 'both',
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div
        className="h-full flex flex-col items-center justify-center gap-4 p-8 rounded"
        style={{
          border: '2px dashed rgba(0, 229, 255, 0.2)',
          background: 'rgba(0, 229, 255, 0.02)',
        }}
      >
        <div className="relative">
          <Shield
            className="w-16 h-16"
            style={{ color: 'rgba(0, 229, 255, 0.3)', filter: 'drop-shadow(0 0 12px rgba(0,229,255,0.15))' }}
          />
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(0,229,255,0.05) 0%, transparent 70%)',
              animation: 'pulse-ring 3s ease-in-out infinite',
            }}
          />
        </div>
        <div className="text-center">
          <p className="font-mono-data text-muted-foreground text-sm tracking-widest uppercase">
            AWAITING SIGNAL
          </p>
          <p className="text-xs text-muted-foreground/50 mt-2 font-mono-data">
            Submit a scan to receive analysis
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-cyan-400/40">
          <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
          <span className="text-xs font-mono-data tracking-widest">BEACON READY</span>
        </div>
      </div>
    );
  }

  const config = riskConfig[result.riskLevel];
  const RiskIcon = config.icon;

  return (
    <div className="space-y-4 h-full overflow-y-auto pr-1">
      {/* Verdict header */}
      <div
        className={`p-4 rounded ${config.bgClass}`}
        style={{ border: `1px solid ${config.color}30` }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <RiskIcon className="w-5 h-5" style={{ color: config.color }} />
            <span
              className="font-mono-display text-xs tracking-widest font-bold uppercase"
              style={{ color: config.color }}
            >
              {config.label}
            </span>
          </div>
          <span
            className="font-mono-data text-xs px-2 py-0.5 rounded"
            style={{
              color: config.color,
              background: `${config.color}15`,
              border: `1px solid ${config.color}30`,
            }}
          >
            {String(result.verdict).replace(/_/g, ' ').toUpperCase()}
          </span>
        </div>

        {/* Confidence bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono-data text-muted-foreground tracking-widest">CONFIDENCE</span>
            <span className="text-xs font-mono-data" style={{ color: config.color }}>
              {result.confidence.toFixed(1)}%
            </span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${result.confidence}%`,
                background: `linear-gradient(90deg, ${config.color}80, ${config.color})`,
                boxShadow: `0 0 8px ${config.color}60`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Summary */}
      {result.summary && (
        <div
          className="p-3 rounded"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <p className="text-xs font-mono-data text-muted-foreground tracking-wider mb-1 uppercase">Summary</p>
          <p className="text-sm text-foreground/90 leading-relaxed">{result.summary}</p>
          {result.category && (
            <span
              className="mt-2 inline-block text-xs font-mono-data px-2 py-0.5 rounded"
              style={{ background: 'rgba(0,229,255,0.1)', color: '#00e5ff', border: '1px solid rgba(0,229,255,0.2)' }}
            >
              {result.category}
            </span>
          )}
          {result.domain && (
            <span
              className="mt-2 inline-block text-xs font-mono-data px-2 py-0.5 rounded ml-2"
              style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              {result.domain}
            </span>
          )}
        </div>
      )}

      {/* Indicators */}
      {result.indicators.length > 0 && (
        <div>
          <p className="text-xs font-mono-data text-muted-foreground tracking-widest uppercase mb-2">
            Threat Indicators ({result.indicators.length})
          </p>
          <div className="space-y-1.5">
            {result.indicators.map((ind, i) => {
              const indConfig = riskConfig[ind.riskLevel];
              return (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 rounded"
                  style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${indConfig.color}20` }}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ background: indConfig.color, boxShadow: `0 0 4px ${indConfig.color}` }}
                    />
                    <span className="text-xs text-foreground/80 truncate">{ind.label}</span>
                  </div>
                  <span
                    className="text-xs font-mono-data ml-2 shrink-0"
                    style={{ color: indConfig.color }}
                  >
                    {ind.confidence.toFixed(0)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {result.recommendations.length > 0 && (
        <div>
          <p className="text-xs font-mono-data text-muted-foreground tracking-widest uppercase mb-2">
            Recommended Actions
          </p>
          <div className="space-y-1.5">
            {result.recommendations.map((rec, i) => (
              <div
                key={i}
                className="flex items-start gap-2 p-2 rounded text-xs"
                style={{ background: 'rgba(0,229,255,0.04)', border: '1px solid rgba(0,229,255,0.12)' }}
              >
                <span
                  className="font-mono-data shrink-0 mt-0.5"
                  style={{ color: '#00e5ff' }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="text-foreground/80 leading-relaxed">{rec}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

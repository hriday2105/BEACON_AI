import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useGetReports, useGetHotspots, useSubmitReport, getGetReportsQueryKey, getGetHotspotsQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Map, X, TrendingUp, Clock, AlertTriangle } from 'lucide-react';
import PageLayout from '@/components/PageLayout';

// India SVG map city coordinates (approximate, normalized 0-100)
const cityCoords: Record<string, { x: number; y: number }> = {
  'Mumbai': { x: 22, y: 58 },
  'Delhi': { x: 38, y: 28 },
  'Bangalore': { x: 32, y: 74 },
  'Hyderabad': { x: 38, y: 64 },
  'Chennai': { x: 40, y: 76 },
  'Kolkata': { x: 60, y: 42 },
  'Pune': { x: 26, y: 60 },
  'Ahmedabad': { x: 22, y: 45 },
  'Jaipur': { x: 32, y: 34 },
  'Lucknow': { x: 46, y: 34 },
  'Chandigarh': { x: 36, y: 22 },
  'Bhopal': { x: 38, y: 48 },
  'Patna': { x: 54, y: 38 },
  'Nagpur': { x: 40, y: 54 },
  'Surat': { x: 22, y: 52 },
  'Indore': { x: 32, y: 50 },
  'Kochi': { x: 28, y: 82 },
  'Guwahati': { x: 68, y: 32 },
  'Bhubaneswar': { x: 54, y: 56 },
  'Visakhapatnam': { x: 50, y: 62 },
};

// Simplified India outline path points (SVG path for decorative India shape)
const INDIA_PATH = `
  M 180 20 L 200 22 L 230 28 L 250 35 L 260 45 L 255 55 L 260 65 L 280 70 L 295 78
  L 300 90 L 295 105 L 285 115 L 280 128 L 288 140 L 290 155 L 280 165 L 270 172
  L 255 178 L 248 188 L 238 198 L 225 205 L 218 215 L 208 228 L 200 238 L 192 250
  L 180 258 L 168 262 L 158 256 L 145 248 L 132 240 L 122 228 L 115 215 L 108 202
  L 100 195 L 90 185 L 82 170 L 78 155 L 72 140 L 68 125 L 70 112 L 75 100
  L 72 88 L 78 75 L 88 65 L 100 58 L 108 48 L 115 38 L 128 30 L 145 24 L 160 20 Z
`;

const scamTypes = [
  'UPI Fraud',
  'KYC Scam',
  'Loan Scam',
  'Job Fraud',
  'Investment Scam',
  'Phishing',
  'Lottery Scam',
  'Romance Scam',
  'OTP Fraud',
  'Other',
];

const indianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan',
  'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal',
];

const reportSchema = z.object({
  scamType: z.string().min(1, 'Select a scam type'),
  city: z.string().min(2, 'Enter your city'),
  state: z.string().min(1, 'Select your state'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
});

type ReportForm = z.infer<typeof reportSchema>;

function IndiaMap({ hotspots }: { hotspots: { city: string; state: string; count: number; topScamType: string }[] }) {
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);

  // Map hotspot cities to coords
  const activeCities = hotspots
    .map(h => ({ ...h, coords: cityCoords[h.city] }))
    .filter(h => h.coords);

  const maxCount = Math.max(...hotspots.map(h => h.count), 1);

  return (
    <div className="relative w-full h-full flex items-center justify-center" style={{ minHeight: 400 }}>
      {/* Radar sweep */}
      <div
        className="absolute inset-0 pointer-events-none flex items-center justify-center"
        style={{ opacity: 0.15 }}
      >
        <div
          className="w-96 h-96 rounded-full animate-radar-sweep"
          style={{
            background: 'conic-gradient(from 0deg, transparent 270deg, rgba(0,229,255,0.3) 310deg, rgba(0,229,255,0.6) 360deg)',
          }}
        />
      </div>

      {/* India SVG */}
      <svg
        viewBox="60 10 250 260"
        className="w-full h-full"
        style={{ maxHeight: 480 }}
      >
        {/* Grid lines */}
        {[...Array(8)].map((_, i) => (
          <line
            key={`h${i}`}
            x1="60" y1={10 + i * 33} x2="310" y2={10 + i * 33}
            stroke="rgba(0,229,255,0.06)" strokeWidth="0.5"
          />
        ))}
        {[...Array(8)].map((_, i) => (
          <line
            key={`v${i}`}
            x1={60 + i * 31} y1="10" x2={60 + i * 31} y2="270"
            stroke="rgba(0,229,255,0.06)" strokeWidth="0.5"
          />
        ))}

        {/* India shape */}
        <path
          d={INDIA_PATH}
          fill="rgba(0,229,255,0.04)"
          stroke="rgba(0,229,255,0.25)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* City pins */}
        {activeCities.map(({ city, count, topScamType, coords }) => {
          const intensity = count / maxCount;
          const r = 4 + intensity * 10;
          const color = intensity > 0.7 ? '#f87171' : intensity > 0.4 ? '#fbbf24' : '#22d3ee';
          const cx = 60 + (coords.x / 100) * 250;
          const cy = 10 + (coords.y / 100) * 260;

          return (
            <g
              key={city}
              onMouseEnter={() => setHoveredCity(city)}
              onMouseLeave={() => setHoveredCity(null)}
              style={{ cursor: 'pointer' }}
            >
              {/* Pulse ring */}
              <circle
                cx={cx} cy={cy} r={r + 4}
                fill="none"
                stroke={color}
                strokeWidth="1"
                opacity="0.4"
                style={{ animation: 'map-ping 2s cubic-bezier(0,0,0.2,1) infinite' }}
              />
              {/* Main dot */}
              <circle
                cx={cx} cy={cy} r={r / 2 + 2}
                fill={color}
                opacity="0.9"
                style={{ filter: `drop-shadow(0 0 ${r}px ${color})` }}
              />

              {/* Tooltip */}
              {hoveredCity === city && (
                <g>
                  <rect
                    x={cx + 8} y={cy - 24}
                    width={110} height={42}
                    rx="3"
                    fill="rgba(10,15,30,0.95)"
                    stroke="rgba(0,229,255,0.3)"
                    strokeWidth="1"
                  />
                  <text x={cx + 14} y={cy - 10} fill="#00e5ff" fontSize="7" fontFamily="Orbitron,monospace">
                    {city.toUpperCase()}
                  </text>
                  <text x={cx + 14} y={cy + 1} fill="rgba(195,240,248,0.7)" fontSize="6" fontFamily="Share Tech Mono,monospace">
                    {count} reports
                  </text>
                  <text x={cx + 14} y={cy + 12} fill="rgba(195,240,248,0.5)" fontSize="5.5" fontFamily="Share Tech Mono,monospace">
                    {topScamType}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* City labels (no hotspot) */}
        {Object.entries(cityCoords)
          .filter(([city]) => !activeCities.find(a => a.city === city))
          .map(([city, coords]) => {
            const cx = 60 + (coords.x / 100) * 250;
            const cy = 10 + (coords.y / 100) * 260;
            return (
              <circle key={city} cx={cx} cy={cy} r="2" fill="rgba(0,229,255,0.2)" />
            );
          })}
      </svg>

      {/* Legend */}
      <div
        className="absolute bottom-4 left-4 p-2 rounded text-xs font-mono-data"
        style={{ background: 'rgba(10,15,30,0.85)', border: '1px solid rgba(0,229,255,0.15)' }}
      >
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ background: '#f87171' }} />
          <span style={{ color: '#f87171' }}>HIGH RISK</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ background: '#fbbf24' }} />
          <span style={{ color: '#fbbf24' }}>MEDIUM</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: '#22d3ee' }} />
          <span style={{ color: '#22d3ee' }}>LOW</span>
        </div>
      </div>
    </div>
  );
}

function SubmitReportModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const mutation = useSubmitReport();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<ReportForm>({
    resolver: zodResolver(reportSchema),
    defaultValues: { scamType: '', city: '', state: '', description: '' },
  });

  const onSubmit = (data: ReportForm) => {
    mutation.mutate(
      { data },
      {
        onSuccess: () => {
          setSubmitted(true);
          queryClient.invalidateQueries({ queryKey: getGetReportsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetHotspotsQueryKey() });
          setTimeout(onClose, 2000);
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-md rounded p-6 z-10"
        style={{
          background: 'rgba(10,15,30,0.97)',
          border: '1px solid rgba(0,229,255,0.25)',
          boxShadow: '0 0 48px rgba(0,229,255,0.15)',
        }}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="cyber-heading text-sm font-bold" style={{ color: '#00e5ff' }}>
            SUBMIT THREAT REPORT
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded transition-colors hover:text-cyan-400 text-muted-foreground"
            data-testid="button-close-modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.3)' }}>
              <AlertTriangle className="w-6 h-6" style={{ color: '#22d3ee' }} />
            </div>
            <p className="font-mono-data text-sm" style={{ color: '#22d3ee' }}>REPORT SUBMITTED</p>
            <p className="text-xs text-muted-foreground font-mono-data mt-1">Thank you for helping protect India.</p>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="scamType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-mono-data text-muted-foreground tracking-widest uppercase">Scam Type</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="w-full rounded px-3 py-2 text-sm font-mono-data focus:outline-none"
                        style={{
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(0,229,255,0.2)',
                          color: 'rgba(195,240,248,0.9)',
                        }}
                        data-testid="select-scam-type"
                      >
                        <option value="">Select type...</option>
                        {scamTypes.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </FormControl>
                    <FormMessage className="text-xs font-mono-data" />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-mono-data text-muted-foreground tracking-widest uppercase">City</FormLabel>
                      <FormControl>
                        <input
                          {...field}
                          placeholder="Mumbai"
                          className="w-full rounded px-3 py-2 text-sm font-mono-data focus:outline-none"
                          style={{
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(0,229,255,0.2)',
                            color: 'rgba(195,240,248,0.9)',
                          }}
                          data-testid="input-city"
                        />
                      </FormControl>
                      <FormMessage className="text-xs font-mono-data" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-mono-data text-muted-foreground tracking-widest uppercase">State</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          className="w-full rounded px-3 py-2 text-sm font-mono-data focus:outline-none"
                          style={{
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(0,229,255,0.2)',
                            color: 'rgba(195,240,248,0.9)',
                          }}
                          data-testid="select-state"
                        >
                          <option value="">State...</option>
                          {indianStates.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </FormControl>
                      <FormMessage className="text-xs font-mono-data" />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-mono-data text-muted-foreground tracking-widest uppercase">Description</FormLabel>
                    <FormControl>
                      <textarea
                        {...field}
                        rows={4}
                        placeholder="Describe what happened — the more detail, the better for the community..."
                        className="w-full rounded px-3 py-2 text-sm font-mono-data resize-none focus:outline-none"
                        style={{
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(0,229,255,0.2)',
                          color: 'rgba(195,240,248,0.9)',
                        }}
                        data-testid="input-description"
                      />
                    </FormControl>
                    <FormMessage className="text-xs font-mono-data" />
                  </FormItem>
                )}
              />

              <button
                type="submit"
                disabled={mutation.isPending}
                className="w-full py-2.5 rounded font-mono-display text-xs tracking-widest font-bold disabled:opacity-50"
                style={{ background: '#00e5ff', color: '#0a0f1e', boxShadow: '0 0 12px rgba(0,229,255,0.3)' }}
                data-testid="button-submit-report"
              >
                {mutation.isPending ? 'TRANSMITTING...' : 'SUBMIT REPORT'}
              </button>
            </form>
          </Form>
        )}
      </div>
    </div>
  );
}

export default function CommunityMap() {
  const [showModal, setShowModal] = useState(false);
  const { data: reports = [], isLoading: reportsLoading } = useGetReports();
  const { data: hotspots = [], isLoading: hotspotsLoading } = useGetHotspots();

  return (
    <PageLayout
      title="THREAT MAP"
      subtitle="Live intelligence map of scam hotspots across India — community-sourced, real-time threat intelligence"
      icon={<Map className="w-7 h-7" />}
    >
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Map area - takes 2/3 */}
        <div
          className="xl:col-span-2 rounded overflow-hidden relative"
          style={{
            background: 'rgba(5,10,20,0.9)',
            border: '1px solid rgba(0,229,255,0.15)',
            minHeight: 480,
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: '1px solid rgba(0,229,255,0.1)' }}
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs font-mono-data text-muted-foreground tracking-widest">
                INDIA THREAT GRID — LIVE
              </span>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="px-3 py-1.5 rounded text-xs font-mono-display tracking-widest font-bold transition-all hover:scale-105"
              style={{
                background: 'rgba(0,229,255,0.1)',
                border: '1px solid rgba(0,229,255,0.3)',
                color: '#00e5ff',
              }}
              data-testid="button-submit-report-open"
            >
              + SUBMIT REPORT
            </button>
          </div>

          <IndiaMap hotspots={hotspots} />
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Hotspots */}
          <div
            className="rounded p-4"
            style={{ background: 'rgba(10,20,40,0.8)', border: '1px solid rgba(0,229,255,0.12)' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4" style={{ color: '#00e5ff' }} />
              <h3 className="text-xs font-mono-data tracking-widest uppercase" style={{ color: '#00e5ff' }}>
                Top Hotspots
              </h3>
            </div>

            {hotspotsLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-10 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
                ))}
              </div>
            ) : hotspots.length === 0 ? (
              <p className="text-xs font-mono-data text-muted-foreground">No hotspot data available</p>
            ) : (
              <div className="space-y-2">
                {hotspots.slice(0, 8).map((h, i) => (
                  <div
                    key={`${h.city}-${i}`}
                    className="flex items-center justify-between p-2 rounded"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                    data-testid={`hotspot-${i}`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-mono-display font-bold shrink-0"
                        style={{ background: 'rgba(0,229,255,0.1)', color: '#00e5ff' }}
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <div>
                        <p className="text-xs font-mono-data" style={{ color: 'rgba(195,240,248,0.9)' }}>
                          {h.city}
                        </p>
                        <p className="text-[10px] text-muted-foreground">{h.topScamType}</p>
                      </div>
                    </div>
                    <span
                      className="text-xs font-mono-data"
                      style={{ color: h.count > 100 ? '#f87171' : h.count > 50 ? '#fbbf24' : '#22d3ee' }}
                    >
                      {h.count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Reports */}
          <div
            className="rounded p-4"
            style={{ background: 'rgba(10,20,40,0.8)', border: '1px solid rgba(0,229,255,0.12)' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4" style={{ color: '#00e5ff' }} />
              <h3 className="text-xs font-mono-data tracking-widest uppercase" style={{ color: '#00e5ff' }}>
                Recent Reports
              </h3>
            </div>

            {reportsLoading ? (
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-16 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
                ))}
              </div>
            ) : reports.length === 0 ? (
              <p className="text-xs font-mono-data text-muted-foreground">No reports yet. Be the first to report!</p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {reports.slice(0, 10).map((r) => (
                  <div
                    key={r.id}
                    className="p-2.5 rounded"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                    data-testid={`report-${r.id}`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span
                        className="text-[10px] font-mono-data px-1.5 py-0.5 rounded"
                        style={{ background: 'rgba(0,229,255,0.08)', color: '#00e5ff', border: '1px solid rgba(0,229,255,0.15)' }}
                      >
                        {r.scamType}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono-data shrink-0">
                        {r.city}, {r.state}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{r.description}</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[10px] text-muted-foreground/50 font-mono-data">
                        {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                      <span className="text-[10px] font-mono-data" style={{ color: 'rgba(0,229,255,0.5)' }}>
                        {r.upvotes} signals
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showModal && <SubmitReportModal onClose={() => setShowModal(false)} />}
    </PageLayout>
  );
}

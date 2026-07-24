import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAnalyzeNews } from '@workspace/api-client-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Newspaper, Link2 } from 'lucide-react';
import PageLayout from '@/components/PageLayout';
import ResultPanel from '@/components/ResultPanel';

const schema = z.object({
  claim: z.string().min(20, 'Claim must be at least 20 characters'),
  sourceUrl: z.string().url('Enter a valid URL').or(z.literal('')).optional(),
});

type FormData = z.infer<typeof schema>;

export default function FactChecker() {
  const [result, setResult] = useState<ReturnType<typeof useAnalyzeNews>['data']>(undefined);
  const mutation = useAnalyzeNews();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { claim: '', sourceUrl: '' },
  });

  const onSubmit = (data: FormData) => {
    setResult(undefined);
    mutation.mutate(
      {
        data: {
          claim: data.claim,
          sourceUrl: data.sourceUrl || null,
        },
      },
      { onSuccess: (res) => setResult(res) }
    );
  };

  return (
    <PageLayout
      title="FACT CHECKER"
      subtitle="Real-time verification of viral claims, political misinformation, and fabricated news circulating on Indian social media"
      icon={<Newspaper className="w-7 h-7" />}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Input */}
        <div
          className="p-5 rounded"
          style={{ background: 'rgba(10,20,40,0.8)', border: '1px solid rgba(0,229,255,0.12)' }}
        >
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* Claim textarea */}
              <FormField
                control={form.control}
                name="claim"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-mono-data text-muted-foreground tracking-widest uppercase">
                      Claim to Verify
                    </FormLabel>
                    <FormControl>
                      <textarea
                        {...field}
                        rows={8}
                        placeholder="Enter the viral claim, news headline, or WhatsApp forward you want to verify..."
                        className="w-full rounded px-4 py-3 text-sm font-mono-data resize-none focus:outline-none transition-all duration-200"
                        style={{
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(0,229,255,0.15)',
                          color: 'rgba(195,240,248,0.9)',
                          caretColor: '#00e5ff',
                        }}
                        onFocus={e => e.target.style.borderColor = 'rgba(0,229,255,0.5)'}
                        onBlur={e => e.target.style.borderColor = 'rgba(0,229,255,0.15)'}
                        data-testid="input-claim"
                      />
                    </FormControl>
                    <FormMessage className="text-xs font-mono-data" />
                  </FormItem>
                )}
              />

              {/* Optional URL */}
              <FormField
                control={form.control}
                name="sourceUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-mono-data text-muted-foreground tracking-widest uppercase">
                      Source URL (Optional)
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                          <Link2 className="w-4 h-4" style={{ color: 'rgba(0,229,255,0.3)' }} />
                        </div>
                        <input
                          {...field}
                          type="url"
                          placeholder="https://news-article-source.com"
                          className="w-full rounded pl-10 pr-4 py-3 text-sm font-mono-data focus:outline-none transition-all duration-200"
                          style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(0,229,255,0.15)',
                            color: 'rgba(195,240,248,0.9)',
                            caretColor: '#00e5ff',
                          }}
                          onFocus={e => e.target.style.borderColor = 'rgba(0,229,255,0.5)'}
                          onBlur={e => e.target.style.borderColor = 'rgba(0,229,255,0.15)'}
                          data-testid="input-source-url"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs font-mono-data" />
                  </FormItem>
                )}
              />

              {/* Verdict legend */}
              <div
                className="p-3 rounded text-xs font-mono-data grid grid-cols-2 gap-2"
                style={{
                  background: 'rgba(0,229,255,0.04)',
                  border: '1px solid rgba(0,229,255,0.12)',
                }}
              >
                {[
                  { v: 'TRUE', c: '#22d3ee' },
                  { v: 'LIKELY TRUE', c: '#34d399' },
                  { v: 'UNVERIFIED', c: '#fbbf24' },
                  { v: 'LIKELY FALSE', c: '#f97316' },
                  { v: 'FALSE', c: '#f87171' },
                ].map(({ v, c }) => (
                  <div key={v} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: c }} />
                    <span style={{ color: c }}>{v}</span>
                  </div>
                ))}
              </div>

              <button
                type="submit"
                disabled={mutation.isPending}
                className="w-full py-3 rounded font-mono-display text-xs tracking-widest font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01]"
                style={{
                  background: '#00e5ff',
                  color: '#0a0f1e',
                  boxShadow: '0 0 16px rgba(0,229,255,0.3)',
                }}
                data-testid="button-verify-claim"
              >
                {mutation.isPending ? 'VERIFYING...' : 'VERIFY CLAIM'}
              </button>
            </form>
          </Form>
        </div>

        {/* Right: Result */}
        <div
          className="p-5 rounded min-h-96"
          style={{ background: 'rgba(10,20,40,0.8)', border: '1px solid rgba(0,229,255,0.12)' }}
        >
          <p className="text-xs font-mono-data text-muted-foreground tracking-widest uppercase mb-4">
            Fact-Check Result
          </p>
          <ResultPanel
            result={result ?? null}
            isLoading={mutation.isPending}
            loadingText="CROSS-REFERENCING SOURCES..."
          />
        </div>
      </div>
    </PageLayout>
  );
}

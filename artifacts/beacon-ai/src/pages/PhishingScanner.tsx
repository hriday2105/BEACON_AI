import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAnalyzePhishing } from '@workspace/api-client-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Radio, Link2 } from 'lucide-react';
import PageLayout from '@/components/PageLayout';
import ResultPanel from '@/components/ResultPanel';

const schema = z.object({
  url: z.string().url('Enter a valid URL (include https://)'),
});

type FormData = z.infer<typeof schema>;

export default function PhishingScanner() {
  const [result, setResult] = useState<ReturnType<typeof useAnalyzePhishing>['data']>(undefined);
  const mutation = useAnalyzePhishing();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { url: '' },
  });

  const onSubmit = (data: FormData) => {
    setResult(undefined);
    mutation.mutate(
      { data: { url: data.url } },
      { onSuccess: (res) => setResult(res) }
    );
  };

  return (
    <PageLayout
      title="PHISHING SCANNER"
      subtitle="Scan URLs for phishing patterns, spoofed domains, malicious redirects, and deceptive subdomains"
      icon={<Radio className="w-7 h-7" />}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Input */}
        <div
          className="p-5 rounded"
          style={{ background: 'rgba(10,20,40,0.8)', border: '1px solid rgba(0,229,255,0.12)' }}
        >
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-mono-data text-muted-foreground tracking-widest uppercase">
                      Suspicious URL
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                          <Link2 className="w-4 h-4" style={{ color: 'rgba(0,229,255,0.4)' }} />
                        </div>
                        <input
                          {...field}
                          type="url"
                          placeholder="https://suspicious-link.example.com"
                          className="w-full rounded pl-10 pr-4 py-3 text-sm font-mono-data focus:outline-none transition-all duration-200"
                          style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(0,229,255,0.15)',
                            color: 'rgba(195,240,248,0.9)',
                            caretColor: '#00e5ff',
                          }}
                          onFocus={e => e.target.style.borderColor = 'rgba(0,229,255,0.5)'}
                          onBlur={e => e.target.style.borderColor = 'rgba(0,229,255,0.15)'}
                          data-testid="input-url"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs font-mono-data" />
                  </FormItem>
                )}
              />

              {/* Info box */}
              <div
                className="p-3 rounded text-xs font-mono-data"
                style={{
                  background: 'rgba(0,229,255,0.04)',
                  border: '1px solid rgba(0,229,255,0.12)',
                  color: 'rgba(195,240,248,0.6)',
                }}
              >
                <p className="mb-1" style={{ color: '#00e5ff' }}>WHAT WE CHECK</p>
                <ul className="space-y-0.5 text-xs">
                  <li>— Domain age and registration patterns</li>
                  <li>— SSL certificate validity and mismatches</li>
                  <li>— Known phishing database cross-reference</li>
                  <li>— URL obfuscation and redirect chains</li>
                  <li>— Lookalike domains mimicking banks, UPI apps</li>
                </ul>
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
                data-testid="button-scan-url"
              >
                {mutation.isPending ? 'SCANNING...' : 'SCAN URL'}
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
            Phishing Analysis
          </p>
          <ResultPanel
            result={result ?? null}
            isLoading={mutation.isPending}
            loadingText="SCANNING URL..."
          />
        </div>
      </div>
    </PageLayout>
  );
}

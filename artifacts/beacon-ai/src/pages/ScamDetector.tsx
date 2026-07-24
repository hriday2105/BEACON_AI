import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAnalyzeScam } from '@workspace/api-client-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Shield } from 'lucide-react';
import PageLayout from '@/components/PageLayout';
import ResultPanel from '@/components/ResultPanel';

const schema = z.object({
  message: z.string().min(10, 'Message must be at least 10 characters'),
  platform: z.string().min(1, 'Select a platform'),
});

type FormData = z.infer<typeof schema>;

const platforms = [
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'sms', label: 'SMS' },
  { value: 'email', label: 'Email' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'other', label: 'Other' },
];

export default function ScamDetector() {
  const [result, setResult] = useState<ReturnType<typeof useAnalyzeScam>['data']>(undefined);
  const mutation = useAnalyzeScam();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { message: '', platform: 'whatsapp' },
  });

  const onSubmit = (data: FormData) => {
    setResult(undefined);
    mutation.mutate(
      { data: { message: data.message, platform: data.platform } },
      { onSuccess: (res) => setResult(res) }
    );
  };

  return (
    <PageLayout
      title="SCAM DETECTOR"
      subtitle="Analyze suspicious messages for deceptive patterns, urgency manipulation, and known scam templates"
      icon={<Shield className="w-7 h-7" />}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Input */}
        <div
          className="p-5 rounded"
          style={{ background: 'rgba(10,20,40,0.8)', border: '1px solid rgba(0,229,255,0.12)' }}
        >
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* Platform selector */}
              <FormField
                control={form.control}
                name="platform"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-mono-data text-muted-foreground tracking-widest uppercase">
                      Source Platform
                    </FormLabel>
                    <FormControl>
                      <div className="flex flex-wrap gap-2">
                        {platforms.map(({ value, label }) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => field.onChange(value)}
                            className="px-3 py-1.5 rounded text-xs font-mono-data tracking-widest transition-all duration-150"
                            style={field.value === value ? {
                              background: 'rgba(0,229,255,0.12)',
                              border: '1px solid rgba(0,229,255,0.5)',
                              color: '#00e5ff',
                              boxShadow: '0 0 8px rgba(0,229,255,0.2)',
                            } : {
                              background: 'rgba(255,255,255,0.04)',
                              border: '1px solid rgba(255,255,255,0.1)',
                              color: 'rgba(195,240,248,0.5)',
                            }}
                            data-testid={`platform-${value}`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs font-mono-data" />
                  </FormItem>
                )}
              />

              {/* Message textarea */}
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-mono-data text-muted-foreground tracking-widest uppercase">
                      Suspicious Message
                    </FormLabel>
                    <FormControl>
                      <textarea
                        {...field}
                        rows={10}
                        placeholder="Paste the suspicious message here..."
                        className="w-full rounded px-4 py-3 text-sm font-mono-data resize-none focus:outline-none transition-all duration-200"
                        style={{
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(0,229,255,0.15)',
                          color: 'rgba(195,240,248,0.9)',
                          caretColor: '#00e5ff',
                        }}
                        onFocus={e => e.target.style.borderColor = 'rgba(0,229,255,0.5)'}
                        onBlur={e => e.target.style.borderColor = 'rgba(0,229,255,0.15)'}
                        data-testid="input-message"
                      />
                    </FormControl>
                    <FormMessage className="text-xs font-mono-data" />
                  </FormItem>
                )}
              />

              <button
                type="submit"
                disabled={mutation.isPending}
                className="w-full py-3 rounded font-mono-display text-xs tracking-widest font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01]"
                style={{
                  background: '#00e5ff',
                  color: '#0a0f1e',
                  boxShadow: '0 0 16px rgba(0,229,255,0.3)',
                }}
                data-testid="button-initiate-scan"
              >
                {mutation.isPending ? 'SCANNING...' : 'INITIATE SCAN'}
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
            Analysis Result
          </p>
          <ResultPanel
            result={result ?? null}
            isLoading={mutation.isPending}
            loadingText="SCANNING MESSAGE..."
          />
        </div>
      </div>
    </PageLayout>
  );
}

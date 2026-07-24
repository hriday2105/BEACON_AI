import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAnalyzePayment } from '@workspace/api-client-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CreditCard } from 'lucide-react';
import PageLayout from '@/components/PageLayout';
import ResultPanel from '@/components/ResultPanel';
import UploadZone from '@/components/UploadZone';

const schema = z.object({
  imageBase64: z.string().min(1, 'Upload a payment screenshot'),
  platform: z.string().min(1, 'Select a platform'),
});

type FormData = z.infer<typeof schema>;

const platforms = [
  { value: 'upi', label: 'Generic UPI' },
  { value: 'paytm', label: 'Paytm' },
  { value: 'gpay', label: 'Google Pay' },
  { value: 'phonepe', label: 'PhonePe' },
  { value: 'netbanking', label: 'Net Banking' },
  { value: 'other', label: 'Other' },
];

export default function PaymentDetector() {
  const [result, setResult] = useState<ReturnType<typeof useAnalyzePayment>['data']>(undefined);
  const mutation = useAnalyzePayment();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { imageBase64: '', platform: 'upi' },
  });

  const onSubmit = (data: FormData) => {
    setResult(undefined);
    mutation.mutate(
      { data: { imageBase64: data.imageBase64, platform: data.platform } },
      { onSuccess: (res) => setResult(res) }
    );
  };

  const imageValue = form.watch('imageBase64');

  return (
    <PageLayout
      title="PAYMENT FRAUD DETECTOR"
      subtitle="Forensic analysis of UPI receipts, fake transaction screenshots, and doctored payment records"
      icon={<CreditCard className="w-7 h-7" />}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Input */}
        <div
          className="p-5 rounded"
          style={{ background: 'rgba(10,20,40,0.8)', border: '1px solid rgba(0,229,255,0.12)' }}
        >
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* Upload zone */}
              <FormField
                control={form.control}
                name="imageBase64"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-mono-data text-muted-foreground tracking-widest uppercase">
                      Payment Screenshot
                    </FormLabel>
                    <FormControl>
                      <UploadZone
                        value={field.value}
                        onChange={(dataUrl) => {
                          field.onChange(dataUrl);
                          form.setValue('imageBase64', dataUrl);
                        }}
                        accept="image/*"
                        mediaType="image"
                        label="Drop payment screenshot here or click to browse"
                      />
                    </FormControl>
                    <FormMessage className="text-xs font-mono-data" />
                  </FormItem>
                )}
              />

              {/* Platform selector */}
              <FormField
                control={form.control}
                name="platform"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-mono-data text-muted-foreground tracking-widest uppercase">
                      Payment Platform
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

              <button
                type="submit"
                disabled={mutation.isPending || !imageValue}
                className="w-full py-3 rounded font-mono-display text-xs tracking-widest font-bold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.01]"
                style={{
                  background: '#00e5ff',
                  color: '#0a0f1e',
                  boxShadow: imageValue ? '0 0 16px rgba(0,229,255,0.3)' : 'none',
                }}
                data-testid="button-initiate-forensic-scan"
              >
                {mutation.isPending ? 'ANALYZING...' : 'INITIATE FORENSIC SCAN'}
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
            Forensic Analysis
          </p>
          <ResultPanel
            result={result ?? null}
            isLoading={mutation.isPending}
            loadingText="FORENSIC SCAN IN PROGRESS..."
          />
        </div>
      </div>
    </PageLayout>
  );
}

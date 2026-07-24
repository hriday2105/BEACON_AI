import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAnalyzeDeepfake } from '@workspace/api-client-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Eye } from 'lucide-react';
import PageLayout from '@/components/PageLayout';
import ResultPanel from '@/components/ResultPanel';
import UploadZone from '@/components/UploadZone';

const schema = z.object({
  mediaBase64: z.string().min(1, 'Upload an image or video file'),
  mediaType: z.enum(['image', 'video']),
});

type FormData = z.infer<typeof schema>;

export default function DeepfakeDetector() {
  const [result, setResult] = useState<ReturnType<typeof useAnalyzeDeepfake>['data']>(undefined);
  const [tab, setTab] = useState<'image' | 'video'>('image');
  const mutation = useAnalyzeDeepfake();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { mediaBase64: '', mediaType: 'image' },
  });

  const onSubmit = (data: FormData) => {
    setResult(undefined);
    mutation.mutate(
      { data: { mediaBase64: data.mediaBase64, mediaType: data.mediaType } },
      { onSuccess: (res) => setResult(res) }
    );
  };

  const handleTabChange = (newTab: 'image' | 'video') => {
    setTab(newTab);
    form.setValue('mediaType', newTab);
    form.setValue('mediaBase64', '');
  };

  const mediaValue = form.watch('mediaBase64');

  return (
    <PageLayout
      title="DEEPFAKE DETECTOR"
      subtitle="Neural network analysis to detect synthetic media — AI-generated faces, voice cloning, and video manipulation"
      icon={<Eye className="w-7 h-7" />}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Input */}
        <div
          className="p-5 rounded"
          style={{ background: 'rgba(10,20,40,0.8)', border: '1px solid rgba(0,229,255,0.12)' }}
        >
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* Tab toggle */}
              <div>
                <p className="text-xs font-mono-data text-muted-foreground tracking-widest uppercase mb-2">
                  Media Type
                </p>
                <div
                  className="flex rounded overflow-hidden"
                  style={{ border: '1px solid rgba(0,229,255,0.2)', background: 'rgba(255,255,255,0.03)' }}
                >
                  {(['image', 'video'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => handleTabChange(t)}
                      className="flex-1 py-2 text-xs font-mono-display tracking-widest font-bold transition-all duration-200"
                      style={tab === t ? {
                        background: 'rgba(0,229,255,0.15)',
                        color: '#00e5ff',
                        boxShadow: 'inset 0 0 12px rgba(0,229,255,0.1)',
                      } : {
                        color: 'rgba(195,240,248,0.4)',
                      }}
                      data-testid={`tab-${t}`}
                    >
                      {t.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Upload zone */}
              <FormField
                control={form.control}
                name="mediaBase64"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-mono-data text-muted-foreground tracking-widest uppercase">
                      Upload {tab === 'image' ? 'Image' : 'Video'}
                    </FormLabel>
                    <FormControl>
                      <UploadZone
                        value={field.value}
                        onChange={(dataUrl) => {
                          field.onChange(dataUrl);
                          form.setValue('mediaBase64', dataUrl);
                        }}
                        accept={tab === 'image' ? 'image/*' : 'video/*'}
                        mediaType={tab}
                        label={tab === 'image'
                          ? 'Drop image here — faces, screenshots, graphics'
                          : 'Drop video here — MP4, MOV, WebM accepted'}
                      />
                    </FormControl>
                    <FormMessage className="text-xs font-mono-data" />
                  </FormItem>
                )}
              />

              {/* Info */}
              <div
                className="p-3 rounded text-xs font-mono-data"
                style={{
                  background: 'rgba(0,229,255,0.04)',
                  border: '1px solid rgba(0,229,255,0.12)',
                  color: 'rgba(195,240,248,0.6)',
                }}
              >
                <p className="mb-1" style={{ color: '#00e5ff' }}>NEURAL SCAN DETECTS</p>
                <ul className="space-y-0.5">
                  <li>— GAN-generated face synthesis artifacts</li>
                  <li>— Facial landmark inconsistencies</li>
                  <li>— Frequency domain manipulation traces</li>
                  <li>— Temporal inconsistencies in video frames</li>
                </ul>
              </div>

              <button
                type="submit"
                disabled={mutation.isPending || !mediaValue}
                className="w-full py-3 rounded font-mono-display text-xs tracking-widest font-bold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.01]"
                style={{
                  background: '#00e5ff',
                  color: '#0a0f1e',
                  boxShadow: mediaValue ? '0 0 16px rgba(0,229,255,0.3)' : 'none',
                }}
                data-testid="button-start-neural-scan"
              >
                {mutation.isPending ? 'NEURAL NET ACTIVE...' : 'START NEURAL SCAN'}
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
            Neural Analysis
          </p>
          <ResultPanel
            result={result ?? null}
            isLoading={mutation.isPending}
            loadingText="RUNNING NEURAL SCAN..."
          />
        </div>
      </div>
    </PageLayout>
  );
}

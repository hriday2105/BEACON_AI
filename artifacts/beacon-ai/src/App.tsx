import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import Nav from '@/components/Nav';
import Home from '@/pages/Home';
import ScamDetector from '@/pages/ScamDetector';
import PhishingScanner from '@/pages/PhishingScanner';
import PaymentDetector from '@/pages/PaymentDetector';
import DeepfakeDetector from '@/pages/DeepfakeDetector';
import FactChecker from '@/pages/FactChecker';
import CommunityMap from '@/pages/CommunityMap';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      retry: 1,
    },
  },
});

function Router() {
  return (
    <>
      <Nav />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/scam" component={ScamDetector} />
        <Route path="/phishing" component={PhishingScanner} />
        <Route path="/payment" component={PaymentDetector} />
        <Route path="/deepfake" component={DeepfakeDetector} />
        <Route path="/news" component={FactChecker} />
        <Route path="/map" component={CommunityMap} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

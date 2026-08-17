import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute, OnboardingRoute, GuestRoute } from './lib/routeGuards'

import Home from './routes/Home';
import LandingPage from './routes/LandingPage';
import Auth from './routes/Auth';
import NotFound from './routes/NotFound';
import Onboarding from './routes/Onboarding';
import SkinScan from './routes/SkinScan';
import ThemeToggle from './components/ui/ThemeToggle';
import { ThemeProvider } from './context/ThemeContext';
import Journal from './routes/Journal';
import Cycle from './routes/Cycle';

// Import icons for the bottom nav
import { 
  ArrowLeftIcon, 
  House, 
  CornersOut, 
  Drop, 
  BookOpen 
} from '@phosphor-icons/react';
import ProductCheck from './routes/ProductCheck';

const Navbar = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (location.pathname.startsWith('/auth')) {
    return (
      <div className="absolute top-0 left-0 z-50 p-6">
        <Link 
          to="/" 
          className="flex items-center gap-2 text-sm font-medium text-foreground/60 transition-colors hover:text-foreground"
        >
          <ArrowLeftIcon size={30} className='text-foreground' />
        </Link>
      </div>
    );
  }

  if (location.pathname.startsWith('/onboarding')) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background shadow-xs shadow-foreground/5">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          to="/"
          className="font-display text-xl font-bold tracking-tight text-foreground"
        >
          GlowCycle
        </Link>

        <div className="flex items-center gap-4 md:gap-5">
          {loading ? null : user ? (
            <>
              {/* Desktop Links - Hidden on mobile */}
              <div className="hidden items-center gap-5 md:flex">
                <Link to="/dashboard" className="text-sm font-bold text-foreground/70 transition-colors hover:text-foreground">
                  Home
                </Link>
                <Link to="/skinscan" className="text-sm font-bold text-foreground/70 transition-colors hover:text-foreground">
                  Skin Scan
                </Link>
                <Link to="/cycle" className="text-sm font-bold text-foreground/70 transition-colors hover:text-foreground">
                  Your Cycle
                </Link>
                <Link to="/journal" className="text-sm font-bold text-foreground/70 transition-colors hover:text-foreground">
                  Journal
                </Link>
              </div>
              
              {/* Theme Toggle - Visible on all screens */}
              <ThemeToggle />
            </>
          ) : (
            <>
              <Link to="/auth?mode=login" className="text-sm font-bold text-foreground/70 transition-colors hover:text-foreground">
                Login
              </Link>
              <Link to="/auth?mode=signup" className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-background transition-colors hover:bg-primary-hover">
                Get started
              </Link>
              <ThemeToggle />
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

const BottomNav = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Don't show bottom nav if loading, not logged in, or on auth/onboarding routes
  if (loading || !user) return null;
  if (location.pathname.startsWith('/auth') || location.pathname.startsWith('/onboarding')) return null;

  const tabs = [
    { name: 'Home', path: '/dashboard', icon: House },
    { name: 'Scan', path: '/skinscan', icon: CornersOut },
    { name: 'Cycle', path: '/cycle', icon: Drop },
    { name: 'Journal', path: '/journal', icon: BookOpen },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background pb-safe md:hidden">
      <div className="flex items-center justify-around px-2 pt-2 pb-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname.startsWith(tab.path);
          
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`flex min-w-[64px] flex-col items-center gap-1 p-2 text-xs transition-colors ${
                isActive 
                  ? 'text-primary font-bold' 
                  : 'text-foreground/50 font-medium hover:text-foreground'
              }`} 
            >
              <Icon size={24} weight={isActive ? "fill" : "regular"} />
              <span>{tab.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="flex min-h-screen flex-col bg-background font-sans text-foreground">
            
            <Navbar />

            {/* Added pb-20 on mobile so content isn't hidden behind the BottomNav */}
            <main className="flex-1 pb-20 md:pb-0">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="*" element={<NotFound />} />
                
                <Route path="/auth" element={
                  <GuestRoute>
                    <Auth />
                  </GuestRoute>
                } />

                <Route path="/check" element={<ProductCheck />} />        

                <Route path="/onboarding" element={
                  <OnboardingRoute>
                    <Onboarding />
                  </OnboardingRoute>
                } />

                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                } />
                <Route path="/skinscan" element={
                  <ProtectedRoute>
                    <SkinScan />
                  </ProtectedRoute>
                } />
                <Route path="/cycle" element={
                  <ProtectedRoute>
                    <Cycle />
                  </ProtectedRoute>
                } />
                <Route path="/journal" element={
                  <ProtectedRoute>
                    <Journal />
                  </ProtectedRoute>
                } />

              </Routes>
            </main>
            
            <BottomNav />
            
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
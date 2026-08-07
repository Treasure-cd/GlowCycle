import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute, OnboardingRoute, GuestRoute } from './lib/routeGuards';

import Home from './routes/Home';
import LandingPage from './routes/LandingPage';
import Auth from './routes/Auth';
import NotFound from './routes/NotFound';
import Onboarding from './routes/Onboarding';
import SkinScan from './routes/SkinScan';


const Navbar = () => {
  const { user } = useAuth();

  return (
    <nav className="flex items-center gap-6 p-4 border-b border-border bg-surface">
      <Link to="/" className="text-xl font-bold text-primary hover:text-primary-hover transition-colors">
        GlowCycle
      </Link>
      
      <div className="flex gap-4">
        {user ? (
          <Link to="/dashboard" className="hover:text-primary transition-colors">
            Tracker
          </Link>
        ) : (
          <>
            <Link to="/" className="hover:text-primary transition-colors">
              Get Started
            </Link>
            <Link to="/auth" className="hover:text-primary transition-colors">
              Login
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-background text-foreground font-sans">
          
          <Navbar />

          <main>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="*" element={<NotFound />} />
              

              <Route path="/auth" element={
                <GuestRoute>
                  <Auth />
                </GuestRoute>
              } />


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
            </Routes>
          </main>
          
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
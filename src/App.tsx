import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './routes/Home';
import LandingPage from './routes/LandingPage';
import Auth from './routes/Auth';
import NotFound from './routes/NotFound';
import Onboarding from './routes/Onboarding';
import SkinScan from './routes/SkinScan';

const App = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background text-foreground font-sans">
        
        {/* Simple Navigation */}
        <nav className="flex items-center gap-6 p-4 border-b border-border bg-surface">
          <Link to="/" className="text-xl font-bold text-primary hover:text-primary-hover transition-colors">
            GlowCycle
          </Link>
          <div className="flex gap-4">
            <Link to="/tracker" className="hover:text-primary transition-colors">
              Tracker
            </Link>
            <Link to="/login" className="hover:text-primary transition-colors">
              Login
            </Link>
          </div>
        </nav>

        <main>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/skinscan" element={<SkinScan />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        
      </div>
    </BrowserRouter>
  );
};

export default App;
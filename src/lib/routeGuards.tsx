import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface RouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: RouteProps) => {
  const { user, userData, loading } = useAuth();


  if (loading) return <div className="p-8 text-center">Loading...</div>; 
  
  if (!user) return <Navigate to="/" replace />;
  if (userData && !userData.onboardingComplete) return <Navigate to="/onboarding" replace />;
  
  return children;
};

export const OnboardingRoute = ({ children }: RouteProps) => {
  const { user, userData, loading } = useAuth();

  if (loading) return null;
  
  if (!user) return <Navigate to="/auth" replace />;
  if (userData && userData.onboardingComplete) return <Navigate to="/dashboard" replace />;
  
  return children;
};

export const GuestRoute = ({ children }: RouteProps) => {
  const { user, userData, loading } = useAuth();

if (loading) return null;
  
  if (user) {
    if (!userData || !userData.onboardingComplete) return <Navigate to="/onboarding" replace />;
    
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};
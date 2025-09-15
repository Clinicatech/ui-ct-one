import { Outlet } from 'react-router-dom';
import { Toaster } from '../components/ui/sonner';
import { AuthProvider } from '../contexts/AuthContext';

export function AppLayout() {
  return (
    <AuthProvider>
      <div className="size-full">
        <Outlet />
        <Toaster />
      </div>
    </AuthProvider>
  );
}

import { createContext, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  isAuthenticated: boolean;
  userEmail: string;
  userPassword: string;
  login: (email: string, password: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const navigate = useNavigate();

  const login = (email: string, password: string) => {
    setIsAuthenticated(true);
    setUserEmail(email);
    setUserPassword(password);
    navigate('/main');
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserEmail('');
    setUserPassword('');
    navigate('/login');
  };

  const value = {
    isAuthenticated,
    userEmail,
    userPassword,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext };

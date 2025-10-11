import { createContext, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  isAuthenticated: boolean;
  userEmail: string;
  userName: string;
  userEntidade: string;
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
  const [userName, setUserName] = useState('');
  const [userEntidade, setUserEntidade] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const navigate = useNavigate();

  const login = (email: string, password: string) => {
    setIsAuthenticated(true);
    setUserEmail(email);
    setUserPassword(password);
    
    // Buscar dados do usuário do localStorage
    const userData = localStorage.getItem('ct_one_user');
    if (userData) {
      const user = JSON.parse(userData);
      setUserName(user.nome || '');
      setUserEntidade(user.entidade || '');
    }
    
    navigate('/main');
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserEmail('');
    setUserName('');
    setUserEntidade('');
    setUserPassword('');
    navigate('/login');
  };

  const value = {
    isAuthenticated,
    userEmail,
    userName,
    userEntidade,
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

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/api";
import { TOKEN_COOKIE_KEY, USER_COOKIE_KEY } from "@/utils/constants";
import { BrowserStorage } from "@/utils/browserStorage";

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = BrowserStorage.getLocalStorage(TOKEN_COOKIE_KEY);
    const storedUser = BrowserStorage.getLocalStorage(USER_COOKIE_KEY);
    
    if (token && storedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(storedUser));
     

    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login(email, password);
      if (response.success && response.token && response.user) {
        localStorage.setItem(TOKEN_COOKIE_KEY, response.token);
        localStorage.setItem(USER_COOKIE_KEY, JSON.stringify(response.user));
        setIsAuthenticated(true);
        setUser(response.user);
        navigate("pages/home");
      } else {
        throw new Error(response.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error in AuthContext:", error);
      throw error;
    }
  };

  const logout = () => {
    BrowserStorage.deleteLocalStorage(TOKEN_COOKIE_KEY);
    BrowserStorage.deleteLocalStorage(USER_COOKIE_KEY);
    setIsAuthenticated(false);
    setUser(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

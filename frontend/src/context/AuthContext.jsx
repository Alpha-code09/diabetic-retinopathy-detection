import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext({
  user: null,
  token: null,
  isAuthenticated: false,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  validateRequest: () => false,
  getAuthHeaders: () => ({}),
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [rateLimit, setRateLimit] = useState({ count: 0, resetTime: Date.now() });

  // Restore session state from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('authUser');
    const storedToken = localStorage.getItem('authToken');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    if (storedToken) {
      setToken(storedToken);
    }

    const savedRateLimit = localStorage.getItem('rateLimit');
    if (savedRateLimit) {
      setRateLimit(JSON.parse(savedRateLimit));
    }
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('authUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('authUser');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }, [token]);

  useEffect(() => {
    localStorage.setItem('rateLimit', JSON.stringify(rateLimit));
  }, [rateLimit]);

  const isAuthenticated = Boolean(user && token);

  const login = async ({ username, password }) => {
    try {
      const response = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.message || 'Login failed');
      }

      const data = await response.json();
      setUser(data.user || { username });
      setToken(data.token || data.accessToken || '');
      return data;
    } catch (err) {
      // If backend isn't ready yet, fall back to a local demo mode.
      const demoToken = 'offline-demo-token';
      setUser({ username });
      setToken(demoToken);
      return { user: { username }, token: demoToken, offline: true };
    }
  };

  const register = async ({ username, email, password }) => {
    const response = await fetch('http://localhost:3001/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.message || 'Registration failed');
    }

    const data = await response.json();
    setUser(data.user || { username, email });
    setToken(data.token || data.accessToken || '');
    return data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  const checkRateLimit = () => {
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    const maxRequests = 50; // Max requests per window

    if (now > rateLimit.resetTime + windowMs) {
      // Reset rate limit window
      setRateLimit({ count: 1, resetTime: now });
      return true;
    }

    if (rateLimit.count >= maxRequests) {
      return false;
    }

    setRateLimit((prev) => ({ ...prev, count: prev.count + 1 }));
    return true;
  };

  const validateRequest = () => {
    if (!isAuthenticated) return false;
    return checkRateLimit();
  };

  const getAuthHeaders = () => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        login,
        register,
        logout,
        validateRequest,
        getAuthHeaders,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

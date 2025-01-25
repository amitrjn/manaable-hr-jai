import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'employee' | 'manager' | 'admin';
  department: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  token: null,
  setAuth: (user, token) => set({ user, token }),
  logout: () => set({ user: null, token: null }),
}));

export const login = async (email: string, password: string) => {
  try {
    console.log('Login attempt:', { email, apiUrl: import.meta.env.VITE_API_URL });
    
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    console.log('Login response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Login failed:', {
        status: response.status,
        error: errorData
      });
      throw new Error('Login failed');
    }

    const data = await response.json();
    console.log('Login successful:', {
      userId: data.user.id,
      role: data.user.role,
      tokenLength: data.token.length
    });
    
    useAuth.getState().setAuth(data.user, data.token);
    console.log('Auth state updated:', {
      currentUser: useAuth.getState().user,
      hasToken: Boolean(useAuth.getState().token)
    });
    
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const register = async (userData: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  department: string;
  role?: 'employee' | 'manager' | 'admin';
}) => {
  try {
    const credentials = 'user:96e2524ebb7defb99ae5b0fa12f60955';
    const base64Credentials = btoa(credentials);
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${base64Credentials}`,
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error('Registration failed');
    }

    const data = await response.json();
    useAuth.getState().setAuth(data.user, data.token);
    return data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

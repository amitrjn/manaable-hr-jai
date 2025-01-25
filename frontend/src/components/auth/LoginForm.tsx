import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { login } from '@/lib/auth';

export function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      console.log('Attempting login with:', { 
        email,
        timestamp: new Date().toISOString(),
        apiUrl: import.meta.env.VITE_API_URL
      });
      const response = await login(email, password);
      console.log('Login successful:', {
        userId: response.user.id,
        role: response.user.role,
        email: response.user.email,
        timestamp: new Date().toISOString()
      });
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', {
        error: err,
        email,
        apiUrl: import.meta.env.VITE_API_URL,
        timestamp: new Date().toISOString()
      });
      setError(err instanceof Error ? err.message : 'Authentication failed. Please try again or contact support if the issue persists.');
    }
  };

  return (
    <Card className="w-[350px] mx-auto mt-20">
      <CardHeader>
        <CardTitle>Login</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button type="submit" className="w-full">
            Login
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

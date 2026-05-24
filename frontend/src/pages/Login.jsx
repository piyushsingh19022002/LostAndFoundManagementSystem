import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { showSuccess, showError, showWarning } from '../utils/toast';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const { email, password } = formData;

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    // Form Validation Toast
    if (!email) {
      showWarning('Email is required.');
      return;
    }
    if (!password) {
      showWarning('Password is required.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await API.post('/auth/login', { email, password });
      
      if (response.data) {
        localStorage.setItem('token', response.data.token);
        setUser(response.data);
        showSuccess(`Welcome back, ${response.data.name}!`);
        navigate('/dashboard');
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4 relative">
      {/* Background blobs for premium feel */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-[var(--glow-color)] rounded-full blur-3xl -z-10 animate-pulse"></div>

      <Card className="w-full max-w-md border border-border-subtle shadow-2xl p-8 rounded-3xl">
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-slate-950/20 border border-[var(--accent-primary)]/35 text-[var(--accent-primary)] items-center justify-center font-bold text-xl mb-4 shadow-[0_4px_16px_var(--glow-color)]">
            F
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-[var(--text-primary)] mb-2 uppercase">Welcome Back</h2>
          <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider font-mono">Log in to manage reports and claim requests</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          <Input
            label="Email Address"
            type="email"
            name="email"
            placeholder="name@example.com"
            value={email}
            onChange={onChange}
            required
            autoComplete="email"
          />

          <div>
            <div className="flex items-center justify-between mb-1.5 font-mono">
              <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">
                Password
              </label>
              <Link 
                to="/forgot-password" 
                className="text-[10px] font-bold text-[var(--accent-primary)] hover:underline uppercase tracking-wider"
              >
                Forgot Password?
              </Link>
            </div>
            <Input
              type="password"
              name="password"
              placeholder="••••••••"
              value={password}
              onChange={onChange}
              required
              autoComplete="current-password"
            />
          </div>

          <Button 
            type="submit" 
            variant="primary" 
            className="w-full justify-center" 
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-8 text-center border-t border-border-subtle pt-6 font-mono">
          <p className="text-xs text-[var(--text-secondary)]">
            Don't have an account?{' '}
            <Link 
              to="/register" 
              className="font-bold text-[var(--accent-primary)] hover:underline uppercase tracking-wider"
            >
              Register here
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Login;

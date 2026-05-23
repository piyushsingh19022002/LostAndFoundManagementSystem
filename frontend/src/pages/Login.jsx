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
    <div className="flex items-center justify-center min-h-[75vh] px-4">
      {/* Background blobs for premium feel */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-rose-500/10 rounded-full blur-3xl -z-10 animate-pulse delay-700"></div>

      <Card className="w-full max-w-md border border-slate-800 shadow-2xl p-8 bg-slate-900/60 backdrop-blur-xl">
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-indigo-600 items-center justify-center text-white font-bold text-xl mb-4 shadow shadow-indigo-500/20">
            F
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white mb-2">Welcome Back</h2>
          <p className="text-sm text-slate-400">Log in to manage reports and claim requests</p>
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
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-semibold text-slate-300">
                Password
              </label>
              <Link 
                to="/forgot-password" 
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
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

        <div className="mt-8 text-center border-t border-slate-800/80 pt-6">
          <p className="text-sm text-slate-400">
            Don't have an account?{' '}
            <Link 
              to="/register" 
              className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
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

import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { showSuccess, showError, showWarning } from '../utils/toast';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const { name, email, password, confirmPassword } = formData;

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    // Client-side validations with UX Warning Toasts
    if (!name.trim()) {
      showWarning('Please enter your full name.');
      return;
    }
    if (!email.trim()) {
      showWarning('Please enter your email address.');
      return;
    }
    // Simple email regex test
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showWarning('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      showWarning('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      showWarning('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await API.post('/auth/register', { name, email, password });
      
      if (response.data) {
        localStorage.setItem('token', response.data.token);
        setUser(response.data);
        showSuccess('Account registered successfully! Welcome to FoundIt.');
        navigate('/dashboard');
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4 py-8">
      {/* Background decoration blobs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-rose-500/10 rounded-full blur-3xl -z-10 animate-pulse delay-700"></div>

      <Card className="w-full max-w-md border border-slate-800 shadow-2xl p-8 bg-slate-900/60 backdrop-blur-xl">
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-indigo-600 items-center justify-center text-white font-bold text-xl mb-4 shadow shadow-indigo-500/20">
            F
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white mb-2">Create Account</h2>
          <p className="text-sm text-slate-400">Join us to locate lost items and submit claim reports</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <Input
            label="Full Name"
            type="text"
            name="name"
            placeholder="John Doe"
            value={name}
            onChange={onChange}
            required
            autoComplete="name"
          />

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

          <Input
            label="Password"
            type="password"
            name="password"
            placeholder="••••••••"
            value={password}
            onChange={onChange}
            required
            autoComplete="new-password"
          />

          <Input
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={onChange}
            required
            autoComplete="new-password"
          />

          <Button 
            type="submit" 
            variant="primary" 
            className="w-full justify-center" 
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Register'}
          </Button>
        </form>

        <div className="mt-8 text-center border-t border-slate-800/80 pt-6">
          <p className="text-sm text-slate-400">
            Already have an account?{' '}
            <Link 
              to="/login" 
              className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Register;

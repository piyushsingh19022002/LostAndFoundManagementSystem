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
    <div className="flex items-center justify-center min-h-[80vh] px-4 py-8 relative">
      {/* Background decoration blobs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-[var(--glow-color)] rounded-full blur-3xl -z-10 animate-pulse"></div>

      <Card className="w-full max-w-md border border-border-subtle shadow-2xl p-8 rounded-3xl">
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-slate-950/20 border border-[var(--accent-primary)]/35 text-[var(--accent-primary)] items-center justify-center font-bold text-xl mb-4 shadow-[0_4px_16px_var(--glow-color)]">
            F
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-[var(--text-primary)] mb-2 uppercase">Create Account</h2>
          <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider font-mono">Join us to locate lost items and submit claim reports</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <Input
            label="Full Name"
            type="text"
            name="name"
            placeholder="Your Name"
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

        <div className="mt-8 text-center border-t border-border-subtle pt-6 font-mono">
          <p className="text-xs text-[var(--text-secondary)]">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-bold text-[var(--accent-primary)] hover:underline uppercase tracking-wider"
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

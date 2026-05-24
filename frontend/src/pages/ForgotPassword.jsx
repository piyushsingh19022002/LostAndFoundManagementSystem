import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await API.post('/auth/forgot-password', { email });
      setMessage(response.data.message || 'A reset link has been dispatched to your email.');
      setEmail('');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4 relative">
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-[var(--glow-color)] rounded-full blur-3xl -z-10 animate-pulse"></div>

      <Card className="w-full max-w-md border border-border-subtle shadow-2xl p-8 rounded-3xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-extrabold tracking-tight text-[var(--text-primary)] mb-2 uppercase">Forgot Password</h2>
          <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider font-mono">Enter your email to receive a password reset link</p>
        </div>

        {message && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 p-3.5 rounded-2xl text-xs font-mono text-center mb-5 uppercase tracking-wide">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 p-3.5 rounded-2xl text-xs font-mono text-center mb-5 uppercase tracking-wide">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-6">
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            required
            disabled={loading}
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full justify-center"
            disabled={loading}
          >
            {loading ? 'Sending Link...' : 'Send Reset Link'}
          </Button>
        </form>

        <div className="mt-8 text-center border-t border-border-subtle pt-6 font-mono">
          <Link to="/login" className="text-xs font-bold text-[var(--accent-primary)] hover:underline uppercase tracking-wider">
            ← Back to Login
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default ForgotPassword;

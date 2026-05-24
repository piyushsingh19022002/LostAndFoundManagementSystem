import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // Client-side validations
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const response = await API.put(`/auth/reset-password/${token}`, { password });
      setMessage(response.data.message || 'Password reset successfully!');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired password reset token.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4 relative">
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-[var(--glow-color)] rounded-full blur-3xl -z-10 animate-pulse"></div>

      <Card className="w-full max-w-md border border-border-subtle shadow-2xl p-8 rounded-3xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-extrabold tracking-tight text-[var(--text-primary)] mb-2 uppercase">Reset Password</h2>
          <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider font-mono">Set and confirm your new account password</p>
        </div>

        {message && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 p-3.5 rounded-2xl text-xs font-mono text-center mb-5 uppercase tracking-wide">
            {message}
            <div className="text-[10px] mt-1.5 opacity-80">
              Redirecting you to Login in a moment...
            </div>
          </div>
        )}

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 p-3.5 rounded-2xl text-xs font-mono text-center mb-5 uppercase tracking-wide">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-5">
          <Input
            label="New Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min 6 characters"
            required
            disabled={loading || !!message}
          />

          <Input
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repeat your password"
            required
            disabled={loading || !!message}
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full justify-center"
            disabled={loading || !!message}
          >
            {loading ? 'Resetting Password...' : 'Reset Password'}
          </Button>
        </form>

        <div className="mt-8 text-center border-t border-border-subtle pt-6 font-mono">
          <Link to="/login" className="text-xs font-bold text-[var(--accent-primary)] hover:underline uppercase tracking-wider">
            Back to Login
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default ResetPassword;

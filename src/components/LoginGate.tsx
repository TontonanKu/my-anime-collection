import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';

interface LoginGateProps {
  children: React.ReactNode;
}

export function LoginGate({ children }: LoginGateProps) {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <>{children}</>;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    setTimeout(() => {
      const success = login(password);
      setLoading(false);
      if (!success) {
        setError('Password salah. Coba lagi.');
        setShake(true);
        setTimeout(() => setShake(false), 500);
        setPassword('');
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-primary-container/15 border border-primary-container/30 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary-container text-[32px]">lock</span>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="font-display font-extrabold text-[24px] text-on-surface mb-1">
            Area Terbatas
          </h1>
          <p className="text-secondary text-[14px]">
            Masukkan password untuk melanjutkan
          </p>
        </div>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          animate={shake ? { x: [-8, 8, -8, 8, 0] } : { x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="mb-4">
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              placeholder="Password..."
              autoFocus
              className="w-full bg-surface-container border border-border rounded-xl px-4 py-3.5 text-on-surface text-[15px] font-mono placeholder-outline/50 focus:outline-none focus:border-primary-container transition-colors"
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-400 text-[12px] font-mono mb-4 text-center"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full bg-primary-container text-white font-mono font-bold text-sm uppercase tracking-wider py-3.5 rounded-xl transition-all hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">login</span>
                <span>Masuk</span>
              </>
            )}
          </button>
        </motion.form>

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="w-full mt-4 text-secondary text-[13px] font-mono py-2 hover:text-on-surface transition-colors"
        >
          ← Kembali
        </button>
      </motion.div>
    </div>
  );
}

import { useNavigate } from 'react-router-dom';
import { PageTransition } from '../components/PageTransition';

export function NotFound() {
  const navigate = useNavigate();
  return (
    <PageTransition>
      <div className="flex flex-col items-center justify-center h-screen px-8 text-center">
        <p className="text-on-surface font-semibold mb-2">Page not found</p>
        <button
          onClick={() => navigate('/')}
          className="text-primary-container text-sm font-mono uppercase tracking-widest mt-2"
        >
          Back to Collection
        </button>
      </div>
    </PageTransition>
  );
}

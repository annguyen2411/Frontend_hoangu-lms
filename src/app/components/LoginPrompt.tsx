import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router';
import { LogIn } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { AuthModal } from './AuthModal';

interface LoginPromptProps {
  title?: string;
  message?: string;
}

export function LoginPrompt({ 
  title = "Đăng nhập để tiếp tục", 
  message = "Bạn cần đăng nhập trước khi tiếp tục trải nghiệm các tính năng của HoaNgữ LMS." 
}: LoginPromptProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchParams] = useSearchParams();
  
  useEffect(() => {
    const auth = searchParams.get('auth');
    if (auth === 'login' || auth === 'register') {
      setIsModalOpen(true);
    }
  }, [searchParams]);

  return (
    <>
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <LogIn className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>
          <p className="text-gray-600 mb-6">{message}</p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => setIsModalOpen(true)} className="px-8">
              Đăng nhập
            </Button>
            <Button 
              variant="outline" 
              className="px-8"
              onClick={() => {
                const params = new URLSearchParams(window.location.search);
                params.set('mode', 'register');
                window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`);
                setIsModalOpen(true);
              }}
            >
              Đăng ký
            </Button>
          </div>
        </div>
      </div>
      
      <AuthModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          const params = new URLSearchParams(window.location.search);
          params.delete('mode');
          window.history.replaceState({}, '', `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`);
        }} 
      />
    </>
  );
}

export function LoadingSpinner() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
    </div>
  );
}

export function useAuthModal() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialMode, setInitialMode] = useState<'login' | 'register'>('login');
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'login' || mode === 'register') {
      setInitialMode(mode);
      setIsModalOpen(true);
    }
  }, [searchParams]);

  const openLogin = () => {
    setInitialMode('login');
    setIsModalOpen(true);
  };

  const openRegister = () => {
    setInitialMode('register');
    setIsModalOpen(true);
    setSearchParams({ mode: 'register' });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSearchParams({});
  };

  return {
    isModalOpen,
    initialMode,
    openLogin,
    openRegister,
    closeModal,
    AuthModalComponent: () => (
      <AuthModal 
        isOpen={isModalOpen} 
        onClose={closeModal}
        initialMode={initialMode}
      />
    )
  };
}
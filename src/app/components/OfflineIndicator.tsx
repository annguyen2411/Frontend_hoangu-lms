import { useEffect, useState } from 'react';
import { WifiOff, Wifi, CloudOff, Cloud } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { syncManager } from '../utils/offlineStorage';

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();
  const [showBanner, setShowBanner] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Show banner when connection changes
    if (!isOnline) {
      setShowBanner(true);
    } else {
      // When back online, sync data
      handleSync();
      
      // Hide banner after 5 seconds
      const timer = setTimeout(() => {
        setShowBanner(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncManager.syncPendingData();
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed top-0 left-0 right-0 z-50"
        >
          <div
            className={`px-4 py-3 ${
              isOnline
                ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                : 'bg-gradient-to-r from-yellow-500 to-orange-500'
            } text-white shadow-lg`}
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isOnline ? (
                  <>
                    <Wifi className="h-5 w-5" />
                    <span className="font-semibold">Đã kết nối trở lại</span>
                    {isSyncing && (
                      <span className="text-sm text-white/90">
                        Đang đồng bộ dữ liệu...
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <WifiOff className="h-5 w-5" />
                    <span className="font-semibold">Bạn đang offline</span>
                    <span className="text-sm text-white/90">
                      Dữ liệu sẽ được đồng bộ khi có mạng
                    </span>
                  </>
                )}
              </div>

              <button
                onClick={() => setShowBanner(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Floating offline status indicator (bottom right)
export function OfflineStatusDot() {
  const isOnline = useOnlineStatus();

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <div
        className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-lg backdrop-blur-sm transition-all ${
          isOnline
            ? 'bg-green-500/90 text-white'
            : 'bg-yellow-500/90 text-white'
        }`}
      >
        {isOnline ? (
          <>
            <Cloud className="h-4 w-4" />
            <span className="text-sm font-semibold hidden sm:inline">Online</span>
          </>
        ) : (
          <>
            <CloudOff className="h-4 w-4" />
            <span className="text-sm font-semibold hidden sm:inline">Offline</span>
          </>
        )}
        <div
          className={`w-2 h-2 rounded-full animate-pulse ${
            isOnline ? 'bg-white' : 'bg-white'
          }`}
        />
      </div>
    </div>
  );
}

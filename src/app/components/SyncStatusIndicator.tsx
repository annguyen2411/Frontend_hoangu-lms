import { useState, useEffect } from 'react';
import { Cloud, CloudOff, RefreshCw, AlertCircle } from 'lucide-react';
import { syncQueue } from '../utils/syncQueue';
import { motion, AnimatePresence } from 'motion/react';

export function SyncStatusIndicator() {
  const [pendingCount, setPendingCount] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const updateStatus = () => {
      setPendingCount(syncQueue.getPendingCount());
      setIsOnline(navigator.onLine);
    };

    updateStatus();
    const interval = setInterval(updateStatus, 3000);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetrySync = () => {
    syncQueue.retryAllFailed();
  };

  if (isOnline && pendingCount === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 right-4 z-50"
    >
      <div
        onClick={() => setShowDetails(!showDetails)}
        className={`px-4 py-3 rounded-lg shadow-lg cursor-pointer transition-all ${
          isOnline
            ? 'bg-blue-500 text-white'
            : 'bg-orange-500 text-white'
        }`}
      >
        <div className="flex items-center gap-3">
          {isOnline ? (
            pendingCount > 0 ? (
              <RefreshCw className="h-5 w-5 animate-spin" />
            ) : (
              <Cloud className="h-5 w-5" />
            )
          ) : (
            <CloudOff className="h-5 w-5" />
          )}
          <div>
            <p className="font-semibold text-sm">
              {isOnline
                ? pendingCount > 0
                  ? `Đang đồng bộ ${pendingCount} mục...`
                  : 'Đã đồng bộ'
                : 'Chế độ offline'
              }
            </p>
            {!isOnline && pendingCount > 0 && (
              <p className="text-xs opacity-90">
                {pendingCount} thay đổi chưa đồng bộ
              </p>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showDetails && pendingCount > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-foreground">Chi tiết đồng bộ</h4>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDetails(false);
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-2">
              {syncQueue.getQueue().slice(0, 5).map((task) => (
                <div
                  key={task.id}
                  className="flex items-start gap-2 p-2 bg-accent rounded text-sm"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-foreground capitalize">
                      {task.type.replace('_', ' ')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {task.status === 'pending' && '⏳ Chờ đồng bộ'}
                      {task.status === 'syncing' && '🔄 Đang đồng bộ'}
                      {task.status === 'completed' && '✅ Hoàn thành'}
                      {task.status === 'failed' && '❌ Thất bại'}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {syncQueue.getFailedTasks().length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRetrySync();
                }}
                className="w-full mt-3 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors"
              >
                Thử lại các mục thất bại
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

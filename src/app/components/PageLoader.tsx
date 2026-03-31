export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-electric-blue border-r-transparent"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Đang tải...</p>
      </div>
    </div>
  );
}


export default function LoadingDashboard() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="animate-pulse text-center">
        <p className="text-lg font-medium">Loading your dashboard...</p>
        <div className="mt-4 h-2 w-48 bg-gray-300 rounded"></div>
        <div className="mt-2 h-2 w-32 bg-gray-300 rounded"></div>
      </div>
    </div>
  );
}

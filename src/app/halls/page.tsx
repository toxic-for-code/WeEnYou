import { Suspense } from 'react';
import HallsContent from './HallsContent';

// A simple loading UI to show while the client component loads
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-700">Redirecting...</h2>
        <p className="text-gray-500">Please wait while we redirect you to the browse page.</p>
      </div>
    </div>
  );
}

export default function HallsRedirectPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <HallsContent />
    </Suspense>
  );
} 
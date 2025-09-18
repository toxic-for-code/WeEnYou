import { Suspense } from 'react';
import BrowseContent from './BrowseContent';

// A simple loading UI to show while the client component loads
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 via-white to-gray-50 font-sans relative overflow-x-hidden flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-700">Loading search results...</h2>
        <p className="text-gray-500">Please wait while we fetch the latest venues for you.</p>
      </div>
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <BrowseContent />
    </Suspense>
  );
}

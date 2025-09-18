import { Suspense } from 'react';
import BookNowContent from './BookNowContent';

// A simple loading UI to show while the client component loads
function LoadingFallback() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-700">Loading hall details...</h2>
        <p className="text-gray-500">Please wait while we fetch the hall information.</p>
      </div>
    </div>
  );
}

export default function BookNowPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <BookNowContent />
    </Suspense>
  );
} 
 
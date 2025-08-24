import { Suspense } from 'react';
import AuthCallbackContent from './auth-callback-context';

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Connecting to GitHub...</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
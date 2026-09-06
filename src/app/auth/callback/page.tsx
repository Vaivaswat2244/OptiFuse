import { Suspense } from 'react';
import AuthCallbackContent from './auth-callback-context';
import CloudLoader from '@/components/ui/cloud-loader';

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <main className="sky flex min-h-[calc(100vh-4rem)] items-center justify-center p-6">
        <CloudLoader label="Connecting to GitHub…" />
      </main>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}

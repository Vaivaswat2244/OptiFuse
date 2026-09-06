"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import CloudLoader from '@/components/ui/cloud-loader';

interface AuthResponse {
  username: string;
  token: string;
}

export default function AuthCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('code');
    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    if (code && API_URL) {
      fetch(`${API_URL}/api/auth/github/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
      .then(res => {
        if (!res.ok) {
          throw new Error("Failed to authenticate with backend.");
        }
        return res.json() as Promise<AuthResponse>; 
      })
      .then(data => {
        localStorage.setItem('optifuse_api_token', data.token);
        router.push('/dashboard');
      })
      .catch((err: Error) => {
        console.error(err);
        setError(err.message);
      });
    } else if (!code) {
      setError("No authorization code received from GitHub");
    } else if (!API_URL) {
      setError("API configuration error");
    }
  }, [searchParams, router]);

  if (error) {
    return (
      <main className="sky flex min-h-[calc(100vh-4rem)] items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-5">
          <Alert variant="destructive">
            <AlertCircle />
            <AlertTitle>Authentication error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button className="w-full" onClick={() => router.push('/login')}>
            Return to sign in
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="sky flex min-h-[calc(100vh-4rem)] items-center justify-center p-6">
      <CloudLoader label="Authenticating with Optifuse…" />
    </main>
  );
}

"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-600">
          <h2 className="text-xl font-semibold mb-2">Authentication Error</h2>
          <p>{error}</p>
          <button 
            onClick={() => router.push('/login')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p>Authenticating with Optifuse...</p>
      </div>
    </div>
  );
}
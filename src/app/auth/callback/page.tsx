"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

interface AuthResponse {
  username: string;
  token: string;
}

export default function AuthCallback() {
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
    }
  }, [searchParams, router]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return <div>Authenticating with Optifuse...</div>;
}
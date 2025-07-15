import Link from 'next/link';

export default function LoginPage() {
  const GITHUB_CLIENT_ID = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;

  if (!GITHUB_CLIENT_ID) {
    return (
      <main style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Configuration Error</h2>
        <p>GitHub Client ID is not configured. Please check your environment variables.</p>
      </main>
    );
  }
  
  const GITHUB_AUTH_URL = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=read:user,repo`;

  return (
    <main style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div>
        <h2>Login to Optifuse</h2>
        <p>Please log in using your GitHub account to continue.</p>
        <Link href={GITHUB_AUTH_URL}>
          <button style={{ width: '100%', padding: '1rem 2rem', fontSize: '1.2rem', marginTop: '1rem' }}>
            Login with GitHub
          </button>
        </Link>
      </div>
    </main>
  );
}
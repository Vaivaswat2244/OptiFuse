import Link from 'next/link';

export default function LandingPage() {
  return (
    <main style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', gap: '2rem' }}>
      <h1>Welcome to Optifuse</h1>
      <p>The best way to manage your GitHub projects.</p>
      <Link href="/login">
        <button style={{ padding: '0.8rem 1.5rem', fontSize: '1rem', cursor: 'pointer' }}>
          Get Started
        </button>
      </Link>
    </main>
  );
}
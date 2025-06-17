'use client';

import { useSession, signIn, signOut } from 'next-auth/react';

export default function AuthButtons() {
  const { data: session, status } = useSession();
  if (status === 'loading') return null;
  if (session) {
    return (
      <button
        onClick={() => signOut()}
        className="ml-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Sign Out
      </button>
    );
  }
  return (
    <>
      <a
        href="/auth/signin"
        className="ml-4 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
      >
        Sign In
      </a>
      <a
        href="/auth/signup"
        className="ml-2 px-4 py-2 bg-secondary-600 text-white rounded hover:bg-secondary-700"
      >
        Sign Up
      </a>
      <a
        href="/auth/admin-signin"
        className="ml-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
      >
        Admin Sign In
      </a>
    </>
  );
} 
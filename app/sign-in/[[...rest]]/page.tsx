// app/sign-in/[[...rest]]/page.tsx
"use client";


import { SignIn } from '@clerk/nextjs';

export default function UnifiedAuthPage() {
  return (
    <main className='flex min-h-screen items-center justify-center bg-background px-4'>
      <SignIn 
        path='/sign-in' 
        routing='path'
        signUpUrl='/sign-in' 
        forceRedirectUrl='/dashboard'
        signUpForceRedirectUrl='/onboarding'
      />
    </main>
  );
}

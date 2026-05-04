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
          appearance={{
            elements: {
              socialButtonsButton: {
                backgroundColor: 'transparent',
                border: '1px solid #e5e7eb',
                color: '#374151',
                padding: '0.75rem 1rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                width: '100%',
                justifyContent: 'flex-start',
                gap: '0.75rem',
              },
              socialButtonsButtonIcon: {
                width: '20px',
                height: '20px',
              },
              socialButtonsButtonText: {
                '&': {
                  fontSize: '0.875rem',
                  fontWeight: '500',
                },
              },
            },
          }}
        />
      </main>
    );
  }

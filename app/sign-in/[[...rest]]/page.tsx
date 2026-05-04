// app/sign-in/[[...rest]]/page.tsx
"use client";


import { SignIn } from '@clerk/nextjs';
import { useEffect, useRef } from 'react';

export default function UnifiedAuthPage() {
  const observerRef = useRef<MutationObserver | null>(null);

  useEffect(() => {
    // Function to update social button text
    const updateSocialButtonText = () => {
      const socialButtons = document.querySelectorAll('.cl-socialButtonsBlockButtonText');
      socialButtons.forEach((textElement) => {
        if (textElement && textElement.textContent) {
          const text = textElement.textContent.toLowerCase();
          if (text.includes('google')) {
            textElement.textContent = 'Google';
          } else if (text.includes('linkedin')) {
            textElement.textContent = 'Linkedin';
          }
        }
      });
    };

    // Initial update
    setTimeout(updateSocialButtonText, 200);

    // Set up MutationObserver to watch for changes
    observerRef.current = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' || mutation.type === 'characterData') {
          updateSocialButtonText();
        }
      });
    });

    // Start observing the document body for changes
    observerRef.current.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    // Cleanup on unmount
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

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
            socialButtons: {
              '&': {
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              },
            },
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
// app/sign-in/[[...rest]]/page.tsx
"use client";

import { useQuery } from "convex/react";
import { ChevronRight } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { SignIn } from '@clerk/nextjs';
import { useEffect, useRef } from 'react';

export default function UnifiedAuthPage() {
  const observerRef = useRef<MutationObserver | null>(null);
  const userCount = useQuery(api.users.countUsers);
  const liveUserCount = typeof userCount === 'number' ? userCount : 0;

  useEffect(() => {
    // Function to update social button text
    const updateSocialButtonText = () => {
      const elements = document.querySelectorAll('.cl-socialButtonsBlockButtonText');
      elements.forEach((el) => {
        if (el.textContent?.includes("Continue with")) {
          el.textContent = el.textContent.replace("Continue with ", "");
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
    <main className='relative grid min-h-screen w-full grid-cols-1 overflow-hidden bg-zinc-50 lg:grid-cols-2'>
      <section className='relative hidden flex-col items-center justify-center border-r border-zinc-200 bg-zinc-50/50 lg:flex'>
        <div className='relative z-20 flex flex-col items-center gap-12 p-12 text-center'>
          <div className='flex flex-col items-center gap-6'>
            <div className='max-w-md space-y-4'>
              <Badge className='mb-1.5 gap-1 md:mb-2' variant='outline'>
                <svg aria-hidden='true' className='text-emerald-600' width='12' height='12' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'>
                  <path d='M6.00016 11.1998L2.80016 7.99984L1.86683 8.93317L6.00016 13.0665L15.0002 4.0665L14.0668 3.13317L6.00016 11.1998Z' fill='currentColor' />
                </svg>
                Laipni lūdzam
              </Badge>
              <h1 className='text-2xl font-bold tracking-tight text-zinc-950 md:text-3xl'>
                Informācijas platforma ar MI
              </h1>
              <p className='space-y-4 text-xs leading-relaxed text-zinc-500'>
                <span className='block'>
                  Profesionāla speciālistu, pakalpojumu, veikalu un dažādu rīku platforma. Piemērota individuālai un biznesa lietošanai. Pievienojies!
                </span>
                <span className='block font-medium text-zinc-600'>
                  <>
                    Pievienojies{' '}
                    <span className='font-bold text-zinc-950'>
                      {liveUserCount}
                    </span>{' '}
                    lietotājiem
                  </>
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className='absolute left-full top-1/2 z-30 flex size-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50'>
          <ChevronRight className='size-6 text-zinc-400' strokeWidth={1.5} />
        </div>
      </section>

      <section className='relative flex flex-col overflow-y-auto bg-white'>
        <div className='relative z-20 flex flex-1 items-center justify-center p-6 md:p-10 lg:p-12'>
          <div className='flex w-full max-w-full items-center justify-center'>
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
          </div>
        </div>
      </section>
    </main>
  );
}
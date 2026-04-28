// app/sign-in/[[...rest]]/page.tsx
"use client";

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-xl bg-white/80 shadow-xl p-8 flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-6 text-center">Ienākt savā kontā</h1>
        <SignIn appearance={{
          elements: {
            card: "shadow-none bg-transparent border-none",
            formButtonPrimary: "bg-primary hover:bg-primary/90 text-white font-semibold",
          },
        }} />
      </div>
    </div>
  );
}

// app/sign-in/[[...rest]]/page.tsx
"use client";


import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <SignIn />
    </div>
  );
}

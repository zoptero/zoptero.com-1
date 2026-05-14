import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Grip } from "lucide-react";
import { useAuth, UserButton } from "@clerk/nextjs";

export function HeroUserMenu() {
  const { isSignedIn } = useAuth();

  return (
    <div className="flex items-center gap-2">
      {isSignedIn && (
        <>
          <Button
            variant="ghost"
            size="icon"
            asChild
            aria-label="Uz sākumlapu"
            className="h-7 w-7 rounded-full transition-colors hover:bg-accent hover:text-primary"
          >
            <Link href="/dashboard">
              <Grip className="w-5 h-5" />
            </Link>
          </Button>
          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-8 w-8 rounded-lg",
                userButtonTrigger: "flex items-center gap-2 h-10",
              },
            }}
          />
        </>
      )}
      {!isSignedIn && (
        <Link
          href="/sign-in"
          className="font-medium text-primary hover:underline transition-colors flex items-center gap-1 text-sm"
        >
          Ienākt
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-7-7 7 7-7 7" />
          </svg>
        </Link>
      )}
    </div>
  );
}
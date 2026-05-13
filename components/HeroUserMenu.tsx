
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Grip } from "lucide-react";
import { useAuth, UserButton } from "@clerk/nextjs";

export function HeroUserMenu() {
  const { isSignedIn } = useAuth();
  return (
    <div className="flex items-center gap-2 w-full justify-end md:w-auto md:justify-start">
      {isSignedIn && (
        <>
          <Button
            variant="ghost"
            size="icon"
            asChild
            aria-label="Uz sākumlapu"
            className="h-7 w-7 rounded-lg p-0 transition-colors hover:bg-accent hover:text-primary"
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
                userButtonPopover:
                  "w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg z-50",
              },
            }}
          />
        </>
      )}
      {!isSignedIn && (
        <Button variant="default" size="sm" asChild>
          <Link href="/sign-in" className="flex items-center gap-2">
            Ienākt
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="inline ms-1 h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-7-7 7 7-7 7" />
            </svg>
          </Link>
        </Button>
      )}
    </div>
  );
}

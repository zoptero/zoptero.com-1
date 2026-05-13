
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Grip } from "lucide-react";
import { useAuth, UserButton } from "@clerk/nextjs";

export function HeroUserMenu() {
  const { isSignedIn } = useAuth();
  return (
    <div className="flex items-center gap-2 w-full justify-end md:w-auto md:justify-start">
      {isSignedIn ? (
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
      ) : (
        <Button variant="outline" className="rounded-full" size="sm" asChild>
          <Link href="/sign-in">Ienākt</Link>
        </Button>
      )}
    </div>
  );
}

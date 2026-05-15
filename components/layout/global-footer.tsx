
import Link from "next/link";
import { cn } from "@/lib/utils";
import ThemeSwitch from "@/components/layout/header/theme-switch";

type GlobalFooterProps = {
  className?: string;
};

export function GlobalFooter({ className }: GlobalFooterProps) {
  return (
    <footer
      className={cn(
        "flex w-full flex-none flex-col items-center justify-center py-1.5 text-center text-xs text-muted-foreground md:py-2",
        className,
      )}
    >
      <div className="flex w-full flex-col items-center justify-center gap-1 text-center md:gap-1.5">
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 mb-3" style={{ marginBottom: 2 }}>
          <span>&copy; Zoptero</span>
          <span className="hidden md:inline">·</span>
          <Link href="/dashboard/contacts" className="hover:text-primary no-underline">
            Kontakti
          </Link>
          <span className="hidden md:inline">·</span>
          <Link href="/dashboard/privacy-policy" className="hover:text-primary no-underline">
            Privātuma politika
          </Link>
          <span className="hidden md:inline">·</span>
          <Link href="/dashboard/terms-of-services" className="hover:text-primary no-underline">
            Lietošanas noteikumi
          </Link>
          <ThemeSwitch />
        </div>
      </div>
    </footer>
  );
}
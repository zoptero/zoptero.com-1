
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
        "flex w-full flex-none flex-col items-center justify-center py-2 text-center text-xs text-muted-foreground md:py-3",
        className,
      )}
    >
      <div className="flex w-full flex-col items-center justify-center gap-1.5 text-center md:gap-2">
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 mb-5" style={{ marginBottom: 20 }}>
          <span>&copy; Zoptero</span>
          <span className="hidden md:inline">·</span>
          <Link href="#" className="hover:text-primary no-underline">
            Par mums
          </Link>
          <span className="hidden md:inline">·</span>
          <Link href="#" className="hover:text-primary no-underline">
            Kontakti
          </Link>
          <span className="hidden md:inline">·</span>
          <Link href="#" className="hover:text-primary no-underline">
            Privātuma politika
          </Link>
          <span className="hidden md:inline">·</span>
          <Link href="#" className="hover:text-primary no-underline">
            Sīkdatņu politika
          </Link>
          <ThemeSwitch />
        </div>
      </div>
    </footer>
  );
}
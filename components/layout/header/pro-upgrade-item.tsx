import Link from "next/link";
import { Sparkles } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

export function ProUpgradeItem() {
  return (
    <DropdownMenuItem asChild>
      <Link href="https://zoptero.com/pricing" target="_blank">
        <Sparkles className="mr-2 h-4 w-4" /> Upgrade to Pro
      </Link>
    </DropdownMenuItem>
  );
}
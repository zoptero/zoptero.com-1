import { CheckIcon } from "lucide-react";

export default function BadgeHero() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium bg-background text-foreground">
      <CheckIcon aria-hidden="true" className="text-emerald-600" size={12} />
      Informācijas platforma ar MI
    </span>
  );
}

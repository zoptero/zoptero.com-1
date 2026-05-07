import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4">
      <Badge className="gap-1 mb-4" variant="outline">
        <svg aria-hidden="true" className="text-emerald-600" width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.00016 11.1998L2.80016 7.99984L1.86683 8.93317L6.00016 13.0665L15.0002 4.0665L14.0668 3.13317L6.00016 11.1998Z" fill="currentColor"/></svg>
        Informācijas platforma
      </Badge>
      <h1 className="text-center font-bold tracking-tight text-3xl md:text-5xl lg:text-7xl mb-4">404</h1>
      <p className="text-center text-muted-foreground mb-8 max-w-md text-[12px]">Atvaino, šī lapa neeksistē vai ir pārvietota.</p>
      <div className="flex flex-col sm:flex-row gap-2">
        <Button size="lg" asChild>
          <Link href="/dashboard">Doties uz sākumu</Link>
        </Button>
        <Button size="lg" variant="ghost">
          Sazināties ar atbalstu <ArrowRight className="ms-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

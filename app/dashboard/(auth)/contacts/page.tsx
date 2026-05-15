import { generateMeta } from "@/lib/utils";

export async function generateMetadata() {
  return generateMeta({
    title: "Kontakti",
    description:
      "Kontaktinformācija Zoptero. Sazinieties ar mums, ja jums ir jautājumi vai nepieciešama palīdzība.",
    canonical: "/dashboard/contacts"
  });
}

export default function ContactsPage() {
  return (
    <>
      <div className="mb-4 flex flex-row items-center justify-between space-y-2 lg:pl-2.5">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Kontakti</h1>
          <p className="text-muted-foreground text-sm">
            Kā sazināties ar mums.
          </p>
        </div>
      </div>

      <div className="space-y-6 lg:pl-2.5">
        <div className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">E-pasts</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Vispārīgiem jautājumiem un atbalstam:
            </p>
            <p className="text-sm font-medium text-foreground">
              <a href="mailto:sos@zoptero.com" className="text-primary hover:underline">
                sos@zoptero.com
              </a>
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">Atbalsta stundas</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Darba dienās no plkst. <strong className="text-foreground font-medium">9:00 līdz 18:00</strong>. Cenšamies atbildēt pēc iespējas ātrāk.
            </p>
          </div>

        </div>
      </div>
    </>
  );
}

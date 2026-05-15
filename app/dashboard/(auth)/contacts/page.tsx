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
            Kā sazināties ar mums, ja jums ir jautājumi vai nepieciešama palīdzība.
          </p>
        </div>
      </div>

      <div className="space-y-6 lg:pl-2.5">
        <div className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">E-pasts</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Vispārīgiem jautājumiem un atbalstam rakstiet uz:{" "}
              <a href="mailto:sos@zoptero.com" className="text-primary hover:underline">
                sos@zoptero.com
              </a>
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">Sociālie tīkli</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Seko mums sociālajos tīklos, lai uzzinātu jaunumus un aktuālo informāciju:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground text-sm leading-relaxed space-y-1">
              <li>
                <span className="font-medium">Facebook:</span>{" "}
                <a href="#" className="text-primary hover:underline">facebook.com/Zoptero</a>
              </li>
              <li>
                <span className="font-medium">Instagram:</span>{" "}
                <a href="#" className="text-primary hover:underline">instagram.com/Zoptero</a>
              </li>
              <li>
                <span className="font-medium">LinkedIn:</span>{" "}
                <a href="#" className="text-primary hover:underline">linkedin.com/company/Zoptero</a>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">Atbalsta stundas</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Mūsu atbalsta komanda ir pieejama darba dienās no plkst. 9:00 līdz 18:00.
              Cenšamies atbildēt uz visiem jautājumiem 24 stundu laikā.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">Pārkāpumu ziņošana</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Ja esat pamanījis platformas noteikumu pārkāpumu, lūdzu, ziņojiet par to uz:{" "}
              <a href="mailto:sos@zoptero.com" className="text-primary hover:underline">
                sos@zoptero.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
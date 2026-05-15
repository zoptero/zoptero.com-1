import { generateMeta } from "@/lib/utils";

export async function generateMetadata() {
  return generateMeta({
    title: "Privātuma politika",
    description:
      "Privātuma politika Zoptero. Uzzini, kā mēs apkopojam, izmantojam un aizsargājam jūsu personas datus.",
    canonical: "/dashboard/privacy-policy"
  });
}

export default function PrivacyPolicyPage() {
  return (
    <>
      <div className="mb-4 flex flex-row items-center justify-between space-y-2 lg:pl-2.5">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Privātuma politika</h1>
          <p className="text-muted-foreground text-sm">
            Kā apkopojam, izmantojam un aizsargājam jūsu personas datus.
          </p>
        </div>
      </div>

      <div className="space-y-6 lg:pl-2.5">
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-foreground">I. Personas datu apstrāde</h2>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">1. Informācija, ko mēs apkopojam</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Mēs apkopojam informāciju, ko jūs mums sniedzat tieši, piemēram, jūsu vārdu, e-pasta adresi un jebkuru citu informāciju, kuru izvēlaties norādīt, izmantojot mūsu pakalpojumus.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">2. Kā mēs izmantojam jūsu informāciju</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Mēs izmantojam apkopoto informāciju, lai nodrošinātu, uzturētu un uzlabotu mūsu pakalpojumus, sazinātos ar jums, kā arī lai izpildītu normatīvajos aktos noteiktos juridiskos pienākumus.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">3. Informācijas publiskošana un nodošana trešajām personām</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Publicējot informāciju un padarot to redzamu mūsu platformā/mājaslapā, jūs sniedzat mums tiesības un pilnvarojumu apstrādāt šo informāciju, lai nodrošinātu attiecīgo funkcionalitāti. Tāpat jūs piekrītat, ka šādā veidā publiskotajai informācijai var piekļūt trešās personas (piemēram, citi platformas lietotāji vai mūsu sadarbības partneri, kas palīdz nodrošināt pakalpojumu sniegšanu).
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">4. Datu aizsardzība</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Mēs īstenojam atbilstošus tehniskos un organizatoriskos pasākumus, lai aizsargātu jūsu personas datus pret neatļautu piekļuvi, mainīšanu, izpaušanu vai iznīcināšanu.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">5. Jūsu tiesības un atbildība</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Jums ir tiesības piekļūt saviem personas datiem, labot vai dzēst tos. Tomēr, izmantojot portālu, jūs pats uzņematies pilnu atbildību par to, kādu informāciju par sevi izvēlaties publicēt.
            </p>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Visa atbildība par publicētās informācijas patiesumu, precizitāti un atbilstību likumdošanai gulstas tikai uz lietotāju.
            </p>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Zoptero neatbild par lietotāju ievietoto saturu un neuzņemas pienākumu pārbaudīt tā patiesumu.
            </p>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Lietotājam ir tiesības iebilst pret datu apstrādi, taču tas var ierobežot iespēju izmantot platformas publiskās funkcijas.
            </p>
          </div>
        </div>

        <hr className="border-t border-border" />

        <div className="space-y-4">
          <h2 className="text-base font-semibold text-foreground">II. Sīkdatņu politika</h2>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">6. Kas ir sīkdatnes?</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Sīkdatnes ir mazi teksta faili, kas tiek saglabāti jūsu ierīcē (datorā vai mobilajā ierīcē), kad apmeklējat tīmekļa vietni. Tās plaši izmanto, lai vietnes darbotos efektīvāk un sniegtu informāciju vietnes īpašniekiem.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">7. Kā mēs izmantojam sīkdatnes?</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Mēs izmantojam sīkdatnes vairākiem mērķiem:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground text-sm leading-relaxed space-y-1">
              <li><strong>Nepieciešamās sīkdatnes:</strong> Būtiskas, lai vietne funkcionētu (piemēram, lai jūs varētu pierakstīties savā profilā).</li>
              <li><strong>Analītiskās sīkdatnes:</strong> Palīdz mums saprast, kā apmeklētāji mijiedarbojas ar vietni, lai mēs varētu uzlabot tās darbību.</li>
              <li><strong>Funkcionālās sīkdatnes:</strong> Atceras jūsu izvēles (piemēram, valodas iestatījumus).</li>
              <li><strong>Reklāmas sīkdatnes:</strong> Var tikt izmantotas, lai rādītu jums atbilstošākas reklāmas vai ierobežotu reklāmas rādīšanas biežumu.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">8. Trešo pušu sīkdatnes</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Dažos gadījumos mēs izmantojam trešo pušu nodrošinātās sīkdatnes (piemēram, Google Analytics), lai sekotu līdzi vietnes lietošanas statistikai. Šīs trešās puses apstrādā datus saskaņā ar savām privātuma politikām.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">9. Kā jūs varat kontrolēt sīkdatnes?</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Jums ir tiesības izvēlēties, vai pieņemt sīkdatnes:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground text-sm leading-relaxed space-y-1">
              <li><strong>Pārlūkprogrammas iestatījumi:</strong> Jūs varat iestatīt pārlūkprogrammu tā, lai tā noraidītu visas sīkdatnes.</li>
              <li><strong>Piekrišanas rīks:</strong> Apmeklējot vietni pirmo reizi, varat pielāgot sīkdatņu iestatījumus.</li>
            </ul>
            <p className="text-muted-foreground text-sm leading-relaxed">
              <em>Piezīme:</em> Noraidot nepieciešamās sīkdatnes, dažas vietnes funkcijas var nedarboties.
            </p>
          </div>
        </div>

        <hr className="border-t border-border" />

        <div className="space-y-4">
          <h2 className="text-base font-semibold text-foreground">III. Noslēguma noteikumi</h2>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">10. Izmaiņas politikas saturā</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Mēs varam laiku pa laikam atjaunināt šo politiku. Jebkuras izmaiņas tiks publicētas šajā lapā, norādot atjaunināšanas datumu.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">11. Saziņa ar mums</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Ja jums ir kādi jautājumi par šo politiku, lūdzu, sazinieties ar mums:{" "}
              <a href="mailto:sos@zoptero.com" className="text-primary hover:underline">
                sos@zoptero.com
              </a>
              .
            </p>
          </div>

          <p className="text-muted-foreground text-sm italic">
            Pēdējās izmaiņas: 2026. gada 15. maijā
          </p>
        </div>
      </div>
    </>
  );
}
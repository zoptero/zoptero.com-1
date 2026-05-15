import { generateMeta } from "@/lib/utils";

export async function generateMetadata() {
  return generateMeta({
    title: "Lietošanas noteikumi",
    description:
      "Lietošanas noteikumi Zoptero. Noteikumi un vadlīnijas mūsu pakalpojumu izmantošanai.",
    canonical: "/dashboard/terms-of-services"
  });
}

export default function TermsOfServicesPage() {
  return (
    <>
      <div className="mb-4 flex flex-row items-center justify-between space-y-2 lg:pl-2.5">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Lietošanas noteikumi</h1>
          <p className="text-muted-foreground text-sm">
            Noteikumi un vadlīnijas mūsu pakalpojumu izmantošanai.
          </p>
        </div>
      </div>

      <div className="space-y-6 lg:pl-2.5">
        <div className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">1. Noteikumu pieņemšana</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Izmantojot Zoptero platformu, jūs pilnībā piekrītat šiem lietošanas noteikumiem. Ja nepiekrītat kādam no šiem punktiem, lūdzu, pārtrauciet pakalpojuma izmantošanu.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">2. Lietotāja atbildība un satura patiesums</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Lietotājs ir personīgi un pilnībā atbildīgs par informāciju, ko viņš izvēlas publicēt platformā.
            </p>
            <ul className="list-disc pl-6 text-muted-foreground text-sm leading-relaxed space-y-1">
              <li>Visa atbildība par publicētās informācijas patiesumu, precizitāti un tiesiskumu ir tikai un vienīgi lietotāja ziņā.</li>
              <li>Zoptero nodrošina tikai tehnisko platformu un iespēju informācijas publicēšanai, un mēs neuzņemamies nekādu atbildību par lietotāju ievietoto saturu vai tā sekām.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">3. Aizliegtais saturs un darbības</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Platformā ir stingri aizliegts publicēt, kopīgot vai jebkādā veidā izplatīt sekojošu saturu:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground text-sm leading-relaxed space-y-1">
              <li><strong>Seksuāls saturs un pornogrāfija:</strong> Jebkāda veida pornogrāfiska satura, kailfoto vai klaji seksuāla rakstura materiālu publicēšana ir stingri aizliegta.</li>
              <li><strong>Aizskaroša informācija:</strong> Saturs, kas aizskar citu personu godu, cieņu vai privātumu.</li>
              <li><strong>Naida kurināšana:</strong> Jebkāda veida naida runa, kas vērsta pret rasi, tautību, reliģiju vai citām grupām.</li>
              <li><strong>Medicīniskas manipulācijas:</strong> Aicinājumi uz nepārbaudītām, bīstamām vai nelikumīgām medicīniskām manipulācijām.</li>
              <li><strong>Ideoloģiskie ierobežojumi:</strong> Ir aizliegts popularizēt un izplatīt LGBT un citas perversijas atbalstošu saturu vai propagandu.</li>
              <li><strong>Nelikumīgs saturs:</strong> Jebkāda informācija, kas pārkāpj Latvijas Republikas likumdošanu.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">4. Portāla tiesības</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Zoptero patur tiesības bez iepriekšēja brīdinājuma un pēc saviem ieskatiem dzēst jebkuru lietotāja ievietoto informāciju vai bloķēt piekļuvi portālam, ja tiek konstatēts šo noteikumu pārkāpums.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">5. Atbildības ierobežošana</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Mēs neuzņemamies atbildību par jebkādiem zaudējumiem vai kaitējumu, kas var rasties platformas lietošanas rezultātā vai paļaujoties uz citu lietotāju publicēto informāciju.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">6. Saziņa</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Jautājumu vai pārkāpumu ziņošanas gadījumā, lūdzu, rakstiet uz:{" "}
              <a href="mailto:sos@zoptero.com" className="text-primary hover:underline">
                sos@zoptero.com
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
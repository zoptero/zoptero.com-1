import { QRCodeSVG } from "qrcode.react";
import React from "react";

export default function TabQr({ slugValue }: any) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="rounded-md border bg-background p-6 flex flex-col items-center">
        <QRCodeSVG
          value={slugValue ? `https://zoptero.com/${slugValue}` : "https://zoptero.com/"}
          size={180}
          bgColor="#fff"
          fgColor="#000"
          level="H"
          includeMargin={false}
        />
        <div className="mt-3 text-xs text-muted-foreground text-center">
          Noskenē mani un uzzini vairāk!
        </div>
      </div>
    </div>
  );
}

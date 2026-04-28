// app/sign-in/[[...rest]]/page.tsx
"use client";


import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <SignIn
        localization={{
          locale: "lv-LV",
          translations: {
            "signIn.title": "Ienākt Zoptero",
            "signIn.subtitle": "Lūdzu, ievadiet savus datus, lai turpinātu.",
            "signIn.start.title": "Ienākt Zoptero",
            "signIn.start.subtitle": "Lūdzu, ievadiet savus datus, lai turpinātu.",
            "signIn.start.emailLabel": "E-pasts",
            "signIn.start.passwordLabel": "Parole",
            "signIn.start.identifierLabel": "E-pasts vai lietotājvārds",
            "signIn.start.passwordForgotLink": "Aizmirsi paroli?",
            "signIn.start.continueButton": "Turpināt",
            "signIn.alternativeMethods.title": "Vai turpiniet ar",
            "signIn.socialButtonsBlockButton": "Turpināt ar {{provider|titleize}}",
            "signIn.formFieldLabel__identifier": "E-pasts vai lietotājvārds",
            "signIn.formFieldLabel__password": "Parole",
            "signIn.formFieldInputPlaceholder__identifier": "Ievadiet e-pastu vai lietotājvārdu",
            "signIn.formFieldInputPlaceholder__password": "Ievadiet paroli",
            "signIn.footerAction__signUp": "Nav konta? Reģistrēties",
            // Add more keys as needed for full localization
          },
        }}
      />
    </div>
  );
}

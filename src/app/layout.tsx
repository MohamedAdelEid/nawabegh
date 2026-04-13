import localFont from "next/font/local";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import "leaflet/dist/leaflet.css";
import { AppProviders } from "@/shared/presentation/providers";
import "@/shared/presentation/styles/globals.css";

const ibmPlexSansArabic = localFont({
  src: [
    {
      path: "../../public/fonts/IBM_Plex_Sans_Arabic/IBMPlexSansArabic-Thin.ttf",
      weight: "100",
      style: "normal",
    },
    {
      path: "../../public/fonts/IBM_Plex_Sans_Arabic/IBMPlexSansArabic-ExtraLight.ttf",
      weight: "200",
      style: "normal",
    },
    {
      path: "../../public/fonts/IBM_Plex_Sans_Arabic/IBMPlexSansArabic-Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/IBM_Plex_Sans_Arabic/IBMPlexSansArabic-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/IBM_Plex_Sans_Arabic/IBMPlexSansArabic-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/IBM_Plex_Sans_Arabic/IBMPlexSansArabic-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/IBM_Plex_Sans_Arabic/IBMPlexSansArabic-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-ibm-plex-sans-arabic",
  display: "swap",
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();
  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
      <body className={ibmPlexSansArabic.variable}>
        <NextIntlClientProvider messages={messages}>
          <AppProviders>{children}</AppProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

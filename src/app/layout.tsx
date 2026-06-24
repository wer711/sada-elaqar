import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "صدى العقار — مساعد التسويق العقاري",
  description:
    "حوّل بيانات أي عقار إلى محتوى تسويقي احترافي في ثوانٍ معدودة. مساعدك العقاري لتسويق أسرع وأكثر إقناعاً في الخليج والشرق الأوسط.",
  keywords: [
    "تسويق عقاري",
    "عقارات الخليج",
    "تسويق عقارات",
    "محتوى تسويقي",
    "مساعد عقاري",
    "صدى العقار",
  ],
  authors: [{ name: "صدى العقار" }],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16.png", type: "image/png", sizes: "16x16" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-icon.svg" },
    ],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "صدى العقار — مساعد التسويق العقاري",
    description:
      "حوّل بيانات أي عقار إلى محتوى تسويقي احترافي في ثوانٍ معدودة",
    type: "website",
    locale: "ar_AR",
  },
  twitter: {
    card: "summary",
    title: "صدى العقار — مساعد التسويق العقاري",
    description:
      "حوّل بيانات أي عقار إلى محتوى تسويقي احترافي في ثوانٍ معدودة",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${geistMono.variable} antialiased bg-[#FBF8F2] text-[#211F1A] font-[Tajawal]`}
      >
        {children}
        <Toaster richColors position="top-center" dir="rtl" />

        {/* ====== سكربت تتبع صدى العقار — يبدأ هنا ====== */}
        <Script id="sada-config" strategy="beforeInteractive">
          {`
            window.sadaConfig = {
              endpoint: 'https://dashboard-iota-nine-75.vercel.app/api/track',
              debug: false,
              autoPageviews: true,
              autoClicks: true,
            };
            // Defensive: wrap sada.track in try/catch so tracking errors never
            // break the site's own fetch calls or show console errors.
            window.__sadaSafeTrack = function(name, props) {
              try {
                if (window.sada && typeof window.sada.track === 'function') {
                  window.sada.track(name, props);
                }
              } catch(e) {
                // Silently ignore tracking errors — never break user experience
              }
            };
          `}
        </Script>
        <Script
          src="https://dashboard-iota-nine-75.vercel.app/track.js"
          strategy="afterInteractive"
          async
          onError={() => {
            // If track.js fails to load, stub out window.sada so calls don't throw
            if (typeof window !== 'undefined' && !window.sada) {
              window.sada = {
                track: () => {},
                page: () => {},
                setVisitor: () => {},
              };
            }
          }}
        />
        {/* ====== نهاية سكربت التتبع ====== */}
      </body>
    </html>
  );
}

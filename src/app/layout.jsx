import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import AuthProvider from "@/components/providers/auth-provider";
import QueryProvider from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "sonner";
import { StoreProvider } from "@/components/providers/store-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

export const metadata = {
  metadataBase: new URL(baseUrl || "https://posify.com"),

  title: {
    default: "POSify - Modern Point of Sale System",
    template: "%s | POSify",
  },

  description:
    "Transform your restaurant or retail business with POSify's modern POS system.",

  keywords: ["POS system", "restaurant POS", "retail POS", "analytics"],

  authors: [{ name: "POSify Team" }],
  creator: "POSify",
  publisher: "POSify",

  alternates: {
    canonical: "/",
  },

  openGraph: {
    title: "POSify - Modern Point of Sale System",
    description: "Transform your business with POSify's modern POS system.",
    url: "/",
    siteName: "POSify",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "POSify",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "POSify",
    description: "Modern POS system",
    images: ["/og-image.png"],
    creator: "@posify",
  },

  robots: {
    index: true,
    follow: true,
  },

  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },

  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('posify-ui-theme') || 'dark';
                  const root = document.documentElement;

                  if (theme === 'system') {
                    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    root.classList.add(systemDark ? 'dark' : 'light');
                  } else {
                    root.classList.add(theme);
                  }
                } catch {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />

        <ThemeProvider defaultTheme="dark" storageKey="posify-ui-theme">
          <QueryProvider>
            <AuthProvider>
              <StoreProvider>
                {children}
                <Toaster position="top-right" richColors />
              </StoreProvider>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

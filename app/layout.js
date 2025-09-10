import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/auth-provider";
import QueryProvider from "@/components/query-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: "POSify - Modern Point of Sale System",
    template: "%s | POSify",
  },
  description:
    "Transform your restaurant or retail business with POSify's modern POS system. Features include menu management, order processing, real-time analytics, multi-location support, and white-label solutions.",
  keywords: [
    "POS system",
    "point of sale",
    "restaurant POS",
    "retail POS",
    "menu management",
    "order processing",
    "analytics",
    "multi-location",
    "white-label POS",
    "SaaS POS",
  ],
  authors: [{ name: "POSify Team" }],
  creator: "POSify",
  publisher: "POSify",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://posify.com"
  ),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "POSify - Modern Point of Sale System",
    description:
      "Transform your restaurant or retail business with POSify's modern POS system. Features include menu management, order processing, real-time analytics, and multi-location support.",
    url: "/",
    siteName: "POSify",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "POSify - Modern Point of Sale System",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "POSify - Modern Point of Sale System",
    description:
      "Transform your restaurant or retail business with POSify's modern POS system.",
    images: ["/og-image.png"],
    creator: "@posify",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="shortcut icon" href="/favicon.svg" type="image/svg+xml" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('posify-ui-theme') || 'dark';
                const root = document.documentElement;
                root.classList.remove('light', 'dark');

                if (theme === 'system') {
                  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  root.classList.add(systemTheme);
                } else {
                  root.classList.add(theme);
                }
              } catch (e) {
                document.documentElement.classList.add('dark');
              }
            `,
          }}
        />
      </head>
      <body>
        <ThemeProvider defaultTheme="dark" storageKey="posify-ui-theme">
          <QueryProvider>
            <AuthProvider>
              {children}
              <Toaster position="top-right" richColors />
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

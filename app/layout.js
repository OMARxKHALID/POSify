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
  title: "POSify - Point of Sale System",
  description: "Modern POS system for restaurants and retail businesses",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <head>
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

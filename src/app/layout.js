import "./globals.css";
import LayoutShell from "@/components/LayoutShell";
import ServiceWorkerRegistrar from "@/components/ServiceWorkerRegistrar";

export const viewport = {
  themeColor: "#000000",
};

export const metadata = {
  title: "PlacementFlow",
  description:
    "Share and explore placement interview experiences from your college. Discover real stories, tips, and insights from placed students.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PlacementFlow",
  },
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    title: "PlacementFlow",
    description: "Share and explore placement interview experiences",
    siteName: "PlacementFlow",
  },
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png",   sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-white text-black antialiased font-sans">
        <ServiceWorkerRegistrar />
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}

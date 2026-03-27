import { Fraunces } from "next/font/google";
import "./globals.css";

export const metadata = {
  title: "Tankobonbon Release Tracker",
  description: "Follow series on Tankobonbon and keep tabs on upcoming releases.",
  icons: { icon: "/favicon.svg", },
  openGraph: {
    title: "Tankobonbon Release Tracker",
    description:
      "Follow series on Tankobonbon and keep tabs on upcoming releases.",
    url: "https://tracker.tankobonbon.com",
    siteName: "Tankobonbon",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_PH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tankobonbon Release Tracker",
    description:
      "Track upcoming manga releases and manage your pre-orders.",
    images: ["/og-image.png"],
  },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#efebe3" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1115" },
  ],
};

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-fraunces",
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={fraunces.variable}>
      <body>{children}</body>
    </html>
  );
}

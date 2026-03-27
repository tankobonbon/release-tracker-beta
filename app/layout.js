import { Fraunces } from "next/font/google";
import "./globals.css";

export const metadata = {
  title: "Tankobonbon Release Tracker",
  description: "Follow series on Tankobonbon and keep tabs on upcoming releases.",
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

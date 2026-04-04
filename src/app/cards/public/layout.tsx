import type { Metadata } from "next";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Digital Business Card - MyKard",
  description: "View and connect with this professional's digital business card.",
};

export default function PublicCardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className={`${poppins.variable} antialiased`}
      style={{
        margin: 0,
        padding: 0,
        backgroundColor: '#f9fafb',
        fontFamily: 'var(--font-poppins), system-ui, sans-serif',
        minHeight: '100vh',
      }}
    >
      {children}
    </div>
  );
}

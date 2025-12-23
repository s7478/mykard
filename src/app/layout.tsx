import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { AuthProvider } from "@/components/providers/auth-provider";
import { ToastProvider } from "@/components/providers/toast-provider";
import FirebaseConfigProvider from "@/components/FirebaseConfigProvider";
import { VersionChecker } from "@/components/VersionChecker";
import "./globals.css";

const poppins= Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});


export const metadata: Metadata = {
  title: "MyKard",
  description: "Create a credible professional profile that showcases your expertise and connects you with opportunities.",
  icons: {
    icon: [
      { url: "/assets/my1.png", rel: "icon", type: "image/png" },
      { url: "/assets/my1.png", rel: "shortcut icon", type: "image/png" },
    ],
    apple: [{ url: "/assets/my1.png", rel: "apple-touch-icon", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Firebase config from server-side environment variables
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || '',
  };

  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body suppressHydrationWarning className={`${poppins.variable} antialiased`}>
        <FirebaseConfigProvider config={firebaseConfig}>
          <AuthProvider>
            <VersionChecker />
            <ToastProvider />
            {children}
          </AuthProvider>
        </FirebaseConfigProvider>
      </body>
    </html>
  );
}
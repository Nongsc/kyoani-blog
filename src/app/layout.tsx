import type { Metadata } from "next";
import { Noto_Sans_SC } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getSiteSettings } from "@/lib/articles";

const notoSansSC = Noto_Sans_SC({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-sans",
});

export const metadata: Metadata = {
  title: "Kyoani Blog",
  description: "A serene reading experience inspired by Kyoto Animation's Violet Evergarden",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteSettings = await getSiteSettings();
  
  return (
    <html lang="en" className={notoSansSC.variable}>
      <body className="min-h-screen flex flex-col">
        <Header siteTitle={siteSettings.site_title} />
        <main className="flex-1 pt-16">
          {children}
        </main>
        <Footer
          siteTitle={siteSettings.site_title}
          siteAuthor={siteSettings.site_author}
          hitokotoEnabled={siteSettings.hitokoto_enabled}
          hitokotoType={siteSettings.hitokoto_type}
          footerCopyright={siteSettings.footer_copyright}
          footerIcp={siteSettings.footer_icp}
          footerTechLinks={siteSettings.footer_tech_links}
        />
      </body>
    </html>
  );
}

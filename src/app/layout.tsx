import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { MaintenanceBanner } from "@/components/layout/MaintenanceBanner";
import { getEdgeFeatureFlags } from "@/lib/cloudflare/edge-feature-flags";
import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-sans",
  subsets: ["vietnamese", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Cổng kiến thức bảo hiểm",
    template: "%s · Bảo hiểm FTI",
  },
  description:
    "Tra cứu BHXH, BHYT, BHTN và chế độ lao động theo tài liệu đã duyệt.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { maintenanceBannerVi } = await getEdgeFeatureFlags();

  return (
    <html lang="vi" className={`${beVietnamPro.variable} h-full`}>
      <body className="flex min-h-full flex-col font-sans antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-card focus:px-3 focus:py-2 focus:text-sm focus:shadow-md"
        >
          Bỏ qua điều hướng
        </a>
        <MaintenanceBanner message={maintenanceBannerVi} />
        <SiteHeader />
        <main id="main" className="flex flex-1 flex-col bg-background">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import { AppChrome } from "@/components/layout/app-chrome";
import { getEdgeFeatureFlags } from "@/lib/cloudflare/edge-feature-flags";
import { getSiteUrl } from "@/lib/site-url";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildSiteJsonLd } from "@/lib/seo/structured-data";
import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-sans",
  subsets: ["vietnamese", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "Cổng HR FPT Telecom",
    template: "%s · Cổng HR FPT Telecom",
  },
  description:
    "Self-service nhân viên và tra cứu BHXH, BHYT, BHTN theo tài liệu đã duyệt.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
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
        <JsonLd data={buildSiteJsonLd()} />
        <AppChrome maintenanceBannerVi={maintenanceBannerVi}>
          {children}
        </AppChrome>
      </body>
    </html>
  );
}

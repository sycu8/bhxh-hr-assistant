import { MarketingHeroSection } from "@/components/marketing/MarketingHeroSection";
import { TrustBadgesRow } from "@/components/marketing/TrustBadgesRow";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { SafetyNotice } from "@/components/marketing/SafetyNotice";
import { PrivacyNotice } from "@/components/marketing/PrivacyNotice";
import { OfficialSourcesStrip } from "@/components/marketing/OfficialSourcesStrip";
import { PublishedLegalPreview } from "@/components/marketing/PublishedLegalPreview";
import { HomePopularFaqs } from "@/components/home/home-popular-faqs";
import { HomeSalaryTools } from "@/components/home/home-salary-tools";
import { HomeTopics } from "@/components/home/home-topics";
import { getPopularFaqs } from "@/lib/db/home-queries";
import { getPublishedLegalUpdates } from "@/lib/db/crawl-queries";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [popularFaqs, publishedLegal] = await Promise.all([
    getPopularFaqs(6),
    getPublishedLegalUpdates(),
  ]);

  return (
    <div className="flex flex-col">
      <MarketingHeroSection />

      <div className="mx-auto w-full max-w-6xl space-y-12 px-4 py-12 sm:space-y-16 sm:px-6 sm:py-14 lg:space-y-20 lg:py-16">
        <TrustBadgesRow />
        <HomeTopics />
        <HowItWorks />
        <HomePopularFaqs faqs={popularFaqs} />
        <HomeSalaryTools />
        <PublishedLegalPreview published={publishedLegal} />
        <SafetyNotice />
        <PrivacyNotice />
        <OfficialSourcesStrip />
      </div>
    </div>
  );
}

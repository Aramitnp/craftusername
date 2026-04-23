import prisma from "@/lib/prisma";
import { config as defaultConfig } from "@/config/content";

const defaultContent = {
  seoTitle: defaultConfig.home.seoTitle,
  seoDescription: defaultConfig.home.seoDescription,
  heroTitle: defaultConfig.home.heroTitle,
  heroSubtitle: defaultConfig.home.heroSubtitle,
  searchPlaceholder: defaultConfig.home.searchPlaceholder,
  searchButton: defaultConfig.home.searchButton,
  supportedPlatformsTitle: defaultConfig.home.supportedPlatformsTitle,
  supportedPlatformsDesc: defaultConfig.home.supportedPlatformsDesc,
  explanationTitle: defaultConfig.seoContent.explanationTitle,
  explanationText: defaultConfig.seoContent.explanationText,
  faq: defaultConfig.seoContent.faq,
  relatedToolsTitle: defaultConfig.seoContent.relatedToolsTitle,
  relatedTools: defaultConfig.seoContent.relatedTools,
  // How It Works
  howItWorksTitle: "How It Works",
  howItWorksStep1Title: "Enter a Username",
  howItWorksStep1Text: "Type the username you want to check into the search bar above.",
  howItWorksStep2Title: "We Check All Platforms",
  howItWorksStep2Text: "Our system instantly queries multiple social media and web platforms.",
  howItWorksStep3Title: "See Your Results",
  howItWorksStep3Text: "Get a clear overview of where your desired username is available or taken.",
  // Popular Platforms
  popularPlatformsTitle: "Check By Platform",
  popularPlatformsDesc: "Jump directly to a platform-specific username checker.",
};

const defaultSeo = {
  siteName: defaultConfig.global.siteName,
  canonicalUrl: "https://craftusername.com",
  mainTitle: "CraftUsername | Check Username Availability",
  mainDescription: defaultConfig.global.description,
  ogTitle: "CraftUsername | Check Username Availability Across Platforms",
  ogDescription: "Instantly check if your desired username is available on Instagram, Twitter, GitHub, and more.",
  ogImage: "",
  platformTitleTemplate: "{Platform} Username Checker | CraftUsername",
  platformDescriptionTemplate: "Check if your desired username is available on {Platform}.",
  platformOgTitleTemplate: "{Platform} Username Checker | CraftUsername",
  platformOgDescTemplate: "Is your username taken on {Platform}? Find out instantly with CraftUsername.",
  platformOgImage: "",
  headerScripts: "",
  bodyScripts: "",
};

export async function getSiteConfig() {
  const siteConfig = await prisma.siteConfig.findUnique({
    where: { id: "global" },
  });

  if (!siteConfig) {
    return { content: defaultContent, seo: defaultSeo };
  }

  // Merge with defaults so new fields always have values
  const content = { ...defaultContent, ...JSON.parse(siteConfig.content) };
  const seo = { ...defaultSeo, ...JSON.parse(siteConfig.seo) };

  return { content, seo };
}

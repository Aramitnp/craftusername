import prisma from "@/lib/prisma";
import { config as defaultConfig } from "@/config/content";

const defaultContent = {
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
  // Footer
  footer: {
    brand: {
      logo: "",
      description: "CraftUsername helps you check username availability across multiple social media platforms instantly."
    },
    columns: [
      {
        id: "col-1",
        title: "Popular Username Checkers",
        sortOrder: 1,
        isActive: true,
        links: [
          { id: "link-1", label: "Instagram Username Checker", url: "/instagram", openInNewTab: false, sortOrder: 1, isActive: true },
          { id: "link-2", label: "TikTok Username Checker", url: "/tiktok", openInNewTab: false, sortOrder: 2, isActive: true },
          { id: "link-3", label: "YouTube Username Checker", url: "/youtube", openInNewTab: false, sortOrder: 3, isActive: true },
          { id: "link-4", label: "Discord Username Checker", url: "/discord", openInNewTab: false, sortOrder: 4, isActive: true },
          { id: "link-5", label: "Pinterest Username Checker", url: "/pinterest", openInNewTab: false, sortOrder: 5, isActive: true }
        ]
      },
      {
        id: "col-2",
        title: "Username Ideas & Guides",
        sortOrder: 2,
        isActive: true,
        links: [
          { id: "link-6", label: "Aesthetic Username Ideas", url: "/blog/tag/aesthetic", openInNewTab: false, sortOrder: 1, isActive: true },
          { id: "link-7", label: "Cool Username Ideas", url: "/blog/tag/cool", openInNewTab: false, sortOrder: 2, isActive: true },
          { id: "link-8", label: "Username Ideas for Girls", url: "/blog/tag/girls", openInNewTab: false, sortOrder: 3, isActive: true },
          { id: "link-9", label: "Gaming Username Ideas", url: "/blog/tag/gaming", openInNewTab: false, sortOrder: 4, isActive: true }
        ]
      },
      {
        id: "col-3",
        title: "Company & Legal",
        sortOrder: 3,
        isActive: true,
        links: [
          { id: "link-10", label: "About", url: "/about", openInNewTab: false, sortOrder: 1, isActive: true },
          { id: "link-11", label: "Contact", url: "/contact", openInNewTab: false, sortOrder: 2, isActive: true },
          { id: "link-12", label: "Privacy Policy", url: "/privacy-policy", openInNewTab: false, sortOrder: 3, isActive: true },
          { id: "link-13", label: "Terms & Conditions", url: "/terms-and-conditions", openInNewTab: false, sortOrder: 4, isActive: true }
        ]
      }
    ]
  }
};

const defaultSeo = {
  siteName: defaultConfig.global.siteName,
  canonicalUrl: "https://craftusername.com",
  mainTitle: "CraftUsername | Check Username Availability",
  mainDescription: defaultConfig.global.description,
  ogTitle: "CraftUsername | Check Username Availability Across Platforms",
  ogDescription: "Instantly check if your desired username is available on Instagram, Twitter, GitHub, and more.",
  ogImage: "",
  headerScripts: "",
  bodyScripts: "",
};

export async function getSiteConfig() {
  let siteConfig = null;
  try {
    siteConfig = await prisma.siteConfig.findUnique({
      where: { id: "global" },
    });
  } catch (error) {
    console.warn("Could not fetch siteConfig from DB, using defaults.", error);
  }

  if (!siteConfig) {
    return { content: defaultContent, seo: defaultSeo };
  }

  // Merge with defaults so new fields always have values
  const parsedContent = JSON.parse(siteConfig.content);
  const content = {
    ...defaultContent,
    ...parsedContent,
    // Deep merge for footer to ensure defaults exist if missing entirely
    footer: parsedContent.footer || defaultContent.footer,
  };
  const seo = { ...defaultSeo, ...JSON.parse(siteConfig.seo) };

  return { content, seo };
}

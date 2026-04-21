import prisma from "./src/lib/prisma";
import { config as defaultConfig } from "./src/config/content";

async function run() {
  try {
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
    };

    const defaultSeo = {
      siteName: defaultConfig.global.siteName,
      canonicalUrl: "https://craftusername.com",
      mainTitle: "CraftUsername | Check Username Availability",
      mainDescription: defaultConfig.global.description,
      platformTitleTemplate: "{Platform} Username Checker | CraftUsername",
      platformDescriptionTemplate: "Check if your desired username is available on {Platform}.",
    };

    let siteConfig = await prisma.siteConfig.create({
      data: {
        id: "global",
        content: JSON.stringify(defaultContent),
        seo: JSON.stringify(defaultSeo),
      },
    });
    console.log("Created:", siteConfig.id);
  } catch (e) {
    console.error("Error creating:", e);
  }
}
run();

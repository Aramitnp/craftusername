import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // --- Platforms ---
  const platforms = [
    {
      id: "3f5ebadf-2c46-4f99-ba23-0362d9d602ba",
      name: "Instagram",
      slug: "instagram-username",
      logo: "https://commons.wikimedia.org/wiki/File:Instagram_icon.png",
      profileUrlPattern: "https://www.instagram.com/{username}",
      isActive: true,
      sortOrder: 0,
      checkMethod: "GET",
    },
  ];

  for (const p of platforms) {
    await prisma.platform.upsert({
      where: { slug: p.slug },
      update: p,
      create: p,
    });
    console.log(`  ✅ Platform: ${p.name}`);
  }

  // --- Site Config ---
  const defaultContent = {
    heroTitle: "Find Your Perfect Identity.",
    heroSubtitle: "Search across platforms in seconds.",
    searchPlaceholder: "Enter a username...",
    searchButton: "Check Availability",
    supportedPlatformsTitle: "Supported Platforms",
    supportedPlatformsDesc:
      "We check your username across these platforms instantly.",
    explanationTitle: "Why use CraftUsername?",
    explanationText:
      "Finding the right username across all your desired social media and professional platforms can be a hassle. CraftUsername automates this by checking availability on multiple sites at once, ensuring you secure your digital identity.",
    faq: [
      {
        question: "Is this tool free?",
        answer: "Yes, checking usernames is completely free.",
      },
      {
        question: "How accurate is the checker?",
        answer:
          "We check the live public profile URLs. While highly accurate, some platforms may temporarily block requests, resulting in an 'Unknown' status.",
      },
      {
        question: "How many platforms do you support?",
        answer:
          "We support all major social media platforms and are constantly adding more.",
      },
    ],
    relatedToolsTitle: "More Tools Coming Soon",
    relatedTools: [
      {
        title: "Stylish Username Generator",
        description:
          "Generate unique aesthetic usernames for your profiles.",
      },
      {
        title: "Username Ideas Planner",
        description:
          "Save and plan your brand identity across the web.",
      },
    ],
  };

  const defaultSeo = {
    siteName: "CraftUsername",
    canonicalUrl: "https://craftusername.com",
    mainTitle: "CraftUsername | Check Username Availability",
    mainDescription:
      "Check username availability across multiple platforms instantly.",
    platformTitleTemplate: "{Platform} Username Checker | CraftUsername",
    platformDescriptionTemplate:
      "Check if your desired username is available on {Platform}.",
  };

  await prisma.siteConfig.upsert({
    where: { id: "global" },
    update: {
      content: JSON.stringify(defaultContent),
      seo: JSON.stringify(defaultSeo),
    },
    create: {
      id: "global",
      content: JSON.stringify(defaultContent),
      seo: JSON.stringify(defaultSeo),
    },
  });
  console.log("  ✅ SiteConfig: global");

  console.log("🎉 Seed complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

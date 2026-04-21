import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { username, platformIds } = await request.json();

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 });
    }

    // Fetch platforms to check
    const platforms = await prisma.platform.findMany({
      where: {
        id: { in: platformIds },
        isActive: true,
      },
    });

    const results = await Promise.all(
      platforms.map(async (platform) => {
        const url = platform.profileUrlPattern.replace("{username}", encodeURIComponent(username));
        let status: "Available" | "Taken" | "Unknown" = "Unknown";

        try {
          const method = platform.checkMethod === "HEAD" ? "HEAD" : "GET";
          const res = await fetch(url, {
            method,
            headers: {
              "User-Agent": "Mozilla/5.0 (compatible; CraftUsernameBot/1.0)",
            },
            // Don't follow redirects to prevent false positives for sites that redirect 404s to home
            redirect: "manual", 
            // Abort after 5s
            signal: AbortSignal.timeout(5000),
          });

          // A 404 typically means the profile doesn't exist -> Available
          if (res.status === 404) {
            status = "Available";
          } 
          // 200 generally means it's taken
          else if (res.status >= 200 && res.status < 400) {
            status = "Taken";
          } else {
            // Some other status code (403, 500)
            status = "Unknown";
          }
        } catch (error) {
          console.error(`Error checking ${platform.name} for ${username}:`, error);
          status = "Unknown";
        }

        return {
          platformId: platform.id,
          platformName: platform.name,
          platformLogo: platform.logo,
          profileUrl: url,
          status,
        };
      })
    );

    return NextResponse.json(results);
  } catch (error) {
    console.error("Checker API Error:", error);
    return NextResponse.json({ error: "Failed to check username" }, { status: 500 });
  }
}

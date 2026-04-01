import type { ShortenedUrl, DashboardStats } from "@/types";
import { generateShortCode } from "@/lib/utils";

export const BASE_URL = "https://url-shortener-chi-seven.vercel.app";

export const mockUrls: ShortenedUrl[] = [
  {
    id: "1",
    originalUrl: "https://www.google.com/search?q=url+shortener+best+practices",
    shortCode: "ggl-srch",
    shortUrl: `${BASE_URL}/ggl-srch`,
    clicks: 1_242,
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
  },
  {
    id: "2",
    originalUrl: "https://github.com/vercel/next.js/tree/main/packages/next",
    shortCode: "nextjs",
    shortUrl: `${BASE_URL}/nextjs`,
    clicks: 874,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
  },
  {
    id: "3",
    originalUrl: "https://tailwindcss.com/docs/installation",
    shortCode: "tw-docs",
    shortUrl: `${BASE_URL}/tw-docs`,
    clicks: 523,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
  },
  {
    id: "4",
    originalUrl: "https://www.figma.com/design/abc123/My-Design-System",
    shortCode: "figma-ds",
    shortUrl: `${BASE_URL}/figma-ds`,
    clicks: 319,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
  },
  {
    id: "5",
    originalUrl: "https://ui.shadcn.com/docs/components/button",
    shortCode: "shadui",
    shortUrl: `${BASE_URL}/shadui`,
    clicks: 201,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    isActive: false,
  },
  {
    id: "6",
    originalUrl: "https://framer.com/motion/introduction/",
    shortCode: "fmotion",
    shortUrl: `${BASE_URL}/fmotion`,
    clicks: 88,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    isActive: true,
  },
];

export function createMockUrl(originalUrl: string, customSlug?: string): ShortenedUrl {
  const shortCode = customSlug || generateShortCode();
  return {
    id: Date.now().toString(),
    originalUrl,
    shortCode,
    shortUrl: `${BASE_URL}/${shortCode}`,
    clicks: 0,
    createdAt: new Date().toISOString(),
    isActive: true,
  };
}

export function getMockStats(urls: ShortenedUrl[]): DashboardStats {
  return {
    totalUrls: urls.length,
    totalClicks: urls.reduce((sum, u) => sum + u.clicks, 0),
    activeUrls: urls.filter((u) => u.isActive).length,
    topUrl: urls.length > 0
      ? [...urls].sort((a, b) => b.clicks - a.clicks)[0]
      : null,
  };
}

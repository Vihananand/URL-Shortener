export interface ShortenedUrl {
  id: string;
  originalUrl: string;
  shortCode: string;
  shortUrl: string;
  clicks: number;
  createdAt: string;
  isActive: boolean;
}

export interface DashboardStats {
  totalUrls: number;
  totalClicks: number;
  activeUrls: number;
  topUrl: ShortenedUrl | null;
}

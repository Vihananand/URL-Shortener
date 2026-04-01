const rawAppUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const APP_URL = rawAppUrl.replace(/\/$/, "");
export const APP_DOMAIN = APP_URL.replace(/^https?:\/\//, "");

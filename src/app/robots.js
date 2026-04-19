export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://posify.com";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/", "/_next/", "/organization/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

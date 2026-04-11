import { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://bee.cm";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow:     ["/", "/products/", "/shops/", "/categories/", "/flash-sales", "/jobs"],
        disallow:  [
          "/admin/", "/vendor/", "/delivery/",
          "/api/",
          "/checkout", "/cart", "/orders/",
          "/wallet", "/account/", "/referral",
          "/sign-in", "/sign-up",
        ],
      },
      // Bloquer les bots malveillants connus
      {
        userAgent: ["AhrefsBot", "SemrushBot", "DotBot"],
        disallow:  ["/"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host:    BASE,
  };
}

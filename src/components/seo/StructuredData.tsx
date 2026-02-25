/**
 * JSON-LD Structured Data Components
 * Adds schema.org markup for better SEO using useEffect + DOM injection
 */
import { useEffect } from "react";

function useJsonLd(schema: Record<string, unknown>, id: string) {
  useEffect(() => {
    const existing = document.getElementById(id);
    if (existing) existing.remove();

    const script = document.createElement("script");
    script.id = id;
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      const el = document.getElementById(id);
      if (el) el.remove();
    };
  }, [id]);
}

interface OrganizationSchemaProps {
  name?: string;
  url?: string;
  logo?: string;
}

export function OrganizationSchema({
  name = "ZIVO",
  url = "https://hizovo.com",
  logo = "https://hizovo.com/og-image.png",
}: OrganizationSchemaProps) {
  useJsonLd(
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name,
      url,
      logo,
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        url: `${url}/help`,
      },
    },
    "ld-organization"
  );
  return null;
}

interface WebsiteSearchSchemaProps {
  url?: string;
}

export function WebsiteSearchSchema({ url = "https://hizovo.com" }: WebsiteSearchSchemaProps) {
  useJsonLd(
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "ZIVO",
      url,
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${url}/flights?search={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    "ld-website"
  );
  return null;
}

interface BreadcrumbSchemaItem {
  name: string;
  url: string;
}

export function BreadcrumbStructuredData({ items }: { items: BreadcrumbSchemaItem[] }) {
  useJsonLd(
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: item.url,
      })),
    },
    "ld-breadcrumb"
  );
  return null;
}

interface FAQSchemaItem {
  question: string;
  answer: string;
}

export function FAQStructuredData({ faqs }: { faqs: FAQSchemaItem[] }) {
  useJsonLd(
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    },
    "ld-faq"
  );
  return null;
}

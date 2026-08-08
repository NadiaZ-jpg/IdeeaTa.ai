import { ResourceArticlePage, resourceMetadata } from "@/components/ResourcePage";

export const metadata = resourceMetadata("es", "faq");

export default function Page() {
  return <ResourceArticlePage locale="es" slug="faq" />;
}

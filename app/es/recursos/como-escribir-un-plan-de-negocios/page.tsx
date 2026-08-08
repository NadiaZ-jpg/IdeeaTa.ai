import { ResourceArticlePage, resourceMetadata } from "@/components/ResourcePage";

export const metadata = resourceMetadata("es", "guide");

export default function Page() {
  return <ResourceArticlePage locale="es" slug="guide" />;
}

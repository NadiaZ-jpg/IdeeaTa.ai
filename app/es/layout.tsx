import { getSiteMetadata } from "@/lib/siteMetadata";
import { HtmlLang } from "@/components/HtmlLang";

export const metadata = getSiteMetadata("es");

export default function EsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HtmlLang locale="es" />
      {children}
    </>
  );
}

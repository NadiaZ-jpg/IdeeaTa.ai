import { getSiteMetadata } from "@/lib/siteMetadata";
import { HtmlLang } from "@/components/HtmlLang";
import LocalePreferredSetter from "@/components/LocalePreferredSetter";

export const metadata = getSiteMetadata("es");

export default function EsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HtmlLang locale="es" />
      <LocalePreferredSetter locale="es" />
      {children}
    </>
  );
}

import { getSiteMetadata } from "@/lib/siteMetadata";
import { HtmlLang } from "@/components/HtmlLang";
import LocalePreferredSetter from "@/components/LocalePreferredSetter";

export const metadata = getSiteMetadata("en");

export default function EnLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HtmlLang locale="en" />
      <LocalePreferredSetter locale="en" />
      {children}
    </>
  );
}

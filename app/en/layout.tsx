import { getSiteMetadata } from "@/lib/siteMetadata";
import { HtmlLang } from "@/components/HtmlLang";

export const metadata = getSiteMetadata("en");

export default function EnLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HtmlLang locale="en" />
      {children}
    </>
  );
}

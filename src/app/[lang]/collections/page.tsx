import { InstitutionalPage, institutionalMetadata } from "@/components/site/institutional-page";

export const generateMetadata = () => institutionalMetadata("collections");

export default function Page() {
  return <InstitutionalPage page="collections" />;
}

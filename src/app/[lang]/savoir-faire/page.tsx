import { InstitutionalPage, institutionalMetadata } from "@/components/site/institutional-page";

export const generateMetadata = () => institutionalMetadata("craftsmanship");

export default function Page() {
  return <InstitutionalPage page="craftsmanship" />;
}

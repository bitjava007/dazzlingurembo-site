import { InstitutionalPage, institutionalMetadata } from "@/components/site/institutional-page";

export const generateMetadata = () => institutionalMetadata("showroom");

export default function Page() {
  return <InstitutionalPage page="showroom" />;
}

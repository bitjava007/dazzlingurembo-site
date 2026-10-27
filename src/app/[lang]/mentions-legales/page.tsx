import { InstitutionalPage, institutionalMetadata } from "@/components/site/institutional-page";

export const generateMetadata = () => institutionalMetadata("legal");

export default function Page() {
  return <InstitutionalPage page="legal" />;
}

import { InstitutionalPage, institutionalMetadata } from "@/components/site/institutional-page";

export const generateMetadata = () => institutionalMetadata("models");

export default function Page() {
  return <InstitutionalPage page="models" />;
}

import { InstitutionalPage, institutionalMetadata } from "@/components/site/institutional-page";

export const generateMetadata = () => institutionalMetadata("story");

export default function Page() {
  return <InstitutionalPage page="story" />;
}

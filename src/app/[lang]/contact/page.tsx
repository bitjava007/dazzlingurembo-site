import { InstitutionalPage, institutionalMetadata } from "@/components/site/institutional-page";

export const generateMetadata = () => institutionalMetadata("contact");

export default function Page() {
  return <InstitutionalPage page="contact" />;
}

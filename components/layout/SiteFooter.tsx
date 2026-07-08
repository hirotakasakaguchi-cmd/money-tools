import { siteConfig } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="mt-10 border-t border-[#eadfce] pt-6 text-xs leading-6 text-[#7a6a58]">
      <p>{siteConfig.disclaimer}</p>
      <p className="mt-4">© {new Date().getFullYear()} {siteConfig.name}</p>
    </footer>
  );
}

import { siteConfig } from "@/config/site";

export function SiteHeader() {
  return (
    <header className="flex items-center justify-between gap-4">
      <a href="/" className="flex items-center gap-3" aria-label={`${siteConfig.name}のトップへ`}>
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#6f9b79] text-lg font-bold text-white shadow-sm">
          ¥
        </span>
        <span className="text-base font-bold text-[#33291f]">{siteConfig.name}</span>
      </a>
    </header>
  );
}

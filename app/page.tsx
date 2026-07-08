import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Container } from "@/components/ui/Container";
import { ToolGrid } from "@/components/tools/ToolGrid";
import { tools } from "@/features/tools/data/tools";
import { siteConfig } from "@/config/site";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Container className="pb-10 pt-5 sm:pb-14 sm:pt-8">
        <SiteHeader />

        <section className="mt-7">
          <div className="inline-flex max-w-full items-center rounded-full border border-[#eadfce] bg-white/70 px-3 py-1 text-xs font-medium leading-5 text-[#7a6a58]">
            Instagramからすぐ使える無料ツール集
          </div>

          <h1 className="mt-4 text-4xl font-bold leading-tight tracking-normal text-[#33291f] sm:text-5xl">
            {siteConfig.name}
          </h1>

          <p className="mt-4 max-w-xl text-base leading-8 text-[#6f5f4f] sm:text-lg">
            {siteConfig.description}
          </p>
        </section>

        <section className="mt-7" aria-labelledby="tools-heading">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 id="tools-heading" className="text-xl font-bold text-[#33291f]">
                無料ツール
              </h2>
              <p className="mt-1 text-sm leading-6 text-[#7a6a58]">
                気になるテーマから、少しずつ整理していきましょう。
              </p>
            </div>
          </div>

          <ToolGrid tools={tools} />
        </section>

        <SiteFooter />
      </Container>
    </main>
  );
}

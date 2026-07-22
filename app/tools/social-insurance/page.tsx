import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Container } from "@/components/ui/Container";
import { ToolFooter } from "@/components/ui/ToolFooter";
import { SocialInsuranceSimulator } from "@/features/social-insurance/components/SocialInsuranceSimulator";

export default function SocialInsurancePage() {
  return (
    <main className="min-h-screen">
      <Container className="pb-10 pt-5 sm:pb-14 sm:pt-8">
        <SiteHeader />

        <div className="mt-6">
          <a href="/" className="text-sm font-bold text-[#5d8666]">
            ← ツール一覧へ戻る
          </a>
        </div>

        <section className="mt-6">
          <div className="inline-flex rounded-full border border-[#eadfce] bg-white/75 px-3 py-1 text-xs font-bold text-[#6f5f4f]">
            社会保険
          </div>
          <h1 className="mt-4 text-3xl font-bold leading-tight text-[#33291f] sm:text-4xl">
            社会保険シミュレーター
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#6f5f4f] sm:text-base">
            今の働き方と変更後の働き方を比べて、年間手取りと将来の厚生年金メリットを確認できます。
          </p>
        </section>

        <SocialInsuranceSimulator />

        <ToolFooter />
        <SiteFooter />
      </Container>
    </main>
  );
}

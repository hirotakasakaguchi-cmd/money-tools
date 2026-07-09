import Link from "next/link";
import { buttonClassName } from "@/components/ui/Button";
import { INSTAGRAM_URL } from "@/config/links";

export function ToolFooter() {
  return (
    <section
      aria-label="他の無料ツールとInstagram"
      className="mt-8 rounded-lg border border-[#eadfce] bg-white/90 p-4 shadow-[0_10px_30px_rgba(92,67,39,0.08)] sm:p-5"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg bg-[#fffdf8] p-4">
          <h2 className="text-base font-bold text-[#33291f]">
            🏠 他の無料ツール
          </h2>
          <Link href="/" className={buttonClassName("primary", "mt-4")}>
            一覧を見る
          </Link>
        </div>

        <div className="rounded-lg bg-[#fffdf8] p-4">
          <h2 className="text-base font-bold text-[#33291f]">📱 Instagram</h2>
          <p className="mt-3 text-sm leading-6 text-[#6f5f4f]">
            お金の悩みを図解や試算で分かりやすく。
            <br />
            このツールで解決できない悩みは、
            <br />
            DMでお気軽にご相談ください😊
          </p>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClassName("primary", "mt-4")}
          >
            Instagramへ
          </a>
        </div>
      </div>
    </section>
  );
}

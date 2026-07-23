export function R8SimulationAssumptionsSection() {
  return (
    <div className="text-xs leading-6 text-[#6f5f4f]">
      <p>
        令和8年度の料率・税制を12カ月続けた場合の概算です。実際の給与明細や徴収額とは差が出る場合があります。
      </p>
      <details className="mt-3 rounded-lg bg-[#faf7f1] p-3">
        <summary className="cursor-pointer font-bold text-[#4c4034]">
          計算に含まれないものを確認する
        </summary>
        <ul className="mt-2 space-y-1">
          <li>
            住民税は所得割のみの概算で、均等割・森林環境税などは反映していません。
          </li>
          <li>
            所得税は給与収入のみの概算で、配偶者控除・扶養控除・生命保険料控除などは反映していません。
          </li>
          <li>
            月平均手取りは年間手取りを12で割った平均で、毎月の実際の支給額を表すものではありません。
          </li>
        </ul>
      </details>
    </div>
  );
}

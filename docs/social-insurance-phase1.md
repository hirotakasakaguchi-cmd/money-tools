# 社会保険シミュレーター v2 Phase 1仕様

この文書は、GitHub Issue #1で確定した社会保険シミュレーター v2 Phase 1の
実装仕様を記録します。計算式と制度値のlegacyベースラインは、
[社会保険シミュレーター現行計算ベースライン](social-insurance-calculation-baseline.md)
を参照してください。

本シミュレーターは概算結果と確認材料を提供するもので、社会保険への加入可否、
扶養可否、配偶者手当の支給可否を法的に判定するものではありません。

## Phase 1概要

対象ユーザーは、単一の勤務先で時給制により働き、現在と変更後の働き方が
本人手取りと世帯の現金収支へ与える影響を比較したい利用者です。

相談目的は次の3種類です。

1. 現在と変更後の年間手取りを比較する
2. 現在の手取りを維持できるか確認する
3. 扶養内と社会保険加入を比較する

画面は入力変更だけでは計算しません。「試算する」を押したときだけ実行し、
入力変更後は以前の結果を消去します。Phase 1の実行入口は
`executeSimulation()`だけです。UIは計算、警告、結論のルールを再実装しません。

## 実行フロー

```text
FormState
  → parseSimulationForm()
  → calculateV2Simulation()
  → validateSimulation()
  → createSummaryConclusion()
  → SimulationExecutionResult
  → UI表示
```

`executeSimulation()`は、フォーム変換に失敗した場合は`invalid`を直ちに返します。
成功した場合は、正規化済み入力、計算結果、確認警告、相談目的別の結論をまとめた
`success`を返します。

## 入力モデル

- フォーム入力は`FormState`で文字列として保持する
- 現在と変更後は共通の`ScenarioFormState`を利用する
- ドメイン変換後は共通の`Scenario`を利用する
- UIは単一勤務先で、ドメインの`workplaces`はreadonly 1要素tupleとする
- 現在と変更後の配偶者手当は各Scenarioへ独立して保持する
- 空欄、不正文字列、NaN、Infinityを暗黙に0へ変換しない

## 結果モデル

Phase 1の主要結果は、次の3要素を分離します。

- 本人の年間手取り
- 配偶者手当の年間額と差額
- 世帯の年間現金収支と差額

本人手取りは、配偶者手当を無効にしたlegacy入力を
`calculateSocialInsurance()`へ渡して計算します。配偶者手当はv2層で独立して計算し、
本人手取りへ加算しません。

配偶者手当の扱いは次のとおりです。

- `received`: 月額の12カ月分
- `notReceived`: 0円
- `unknown`: `null`

`null`は未確認を表し、0円とは異なります。現在または変更後が`unknown`の場合、
配偶者手当差と世帯現金収支差も`null`になり、UIは「未確認」と表示します。
本人手取り差は引き続き数値として計算します。

`SimulationResult.legacyCalculation`には、既存詳細表示で利用する次の概算値を
保持します。

- 標準報酬月額
- 年間増加労働時間
- 1時間あたり現金リターン
- 厚生年金増加見込み
- 90歳までの総リターン
- legacyコメント

これらのlegacy詳細値を、v2の本人手取り、配偶者手当、世帯現金収支と
取り違えてはいけません。

## invalidとwarning

必須入力不足、数値不正、未選択はフォームエラーです。`invalid`は
`fieldErrors`だけを返して試算を停止し、部分的な結果、警告、結論を表示しません。

確認警告は法的判定ではなく、試算を止めない非blocking情報です。Phase 1には
次の4種類があります。

- 週20時間未満で社会保険加入を選択
- 週37.5時間以上で扶養内を選択
- 推計年収130万円超で扶養内を選択
- 配偶者手当の受給状態が不明

警告はcurrent、proposedの順に返し、各警告は確認対象の`fieldPaths`と
具体的な`recommendedAction`を持ちます。UIは警告ルールや表示順を再実装せず、
`executeSimulation()`が返した配列をそのまま表示します。

## 相談目的別の結論

- 年間手取り比較は`personalTakeHomeDifferenceYen`を参照する
- 手取り維持確認も`personalTakeHomeDifferenceYen`を参照する
- 扶養内／社会保険加入比較は`householdDifferenceYen`を参照する

世帯現金収支差が`null`の場合、扶養内／社会保険加入比較の結論はneutralとし、
金額を推測せず「確定できない」旨を表示します。結論は結果の要約であり、加入可否や
扶養可否を断定しません。

## UI挙動とアクセシビリティ

- 初期表示では結果、結論、警告、invalid案内を表示しない
- 「試算する」を押したときだけ`executeSimulation()`を呼び出す
- 入力または相談目的の変更時は以前の実行結果を消去する
- success時は結果領域へフォーカスし、画面内へスクロールする
- invalid時は先頭の`fieldPath`に対応する入力へフォーカスする
- `prefers-reduced-motion: reduce`ではsmooth scrollを使用しない
- 結果領域は`tabIndex={-1}`でプログラム的にフォーカス可能にする
- 結果表示の`aria-live="polite"`を維持する

フォーカスとスクロールはsubmit後だけ実行し、初期表示や入力変更だけでは
実行しません。同じstatusの連続試算でも、新しい実行結果ごとに再実行します。

## Phase 1対象外

- 令和8年度への料率・税制更新
- 65歳以上の計算仕様の精緻化
- 賞与、毎月固定手当、一時手当
- 複数勤務先、掛け持ち勤務
- 事業所規模や加入義務の自動判定
- 社会保険加入可否、扶養可否、配偶者手当支給可否の法的断定
- 損益分岐探索、手取り最大化、最適な働き方の自動提案
- 新制度対応
- 個別相談AIとの統合
- CI導入とNode.js／pnpmバージョン固定

これらはIssue #3〜#6などの後続Issueで個別に扱います。Phase 1の変更と
制度値更新やlegacy Golden値の更新を同じPRへ混在させません。

## 回帰基準

`calculateSocialInsurance()`の18件のlegacy characterization／Goldenテストを
変更せず維持します。Golden値の変更が必要な場合は、理由と制度差分を確認できる
別Issue・別PRで扱います。

Phase 1の統合テストは、フォーム状態から明示的な試算を通して、success、invalid、
unknown、警告、目的別結論、入力変更、再試算、フォーカス対象、legacy詳細値までを
一連の流れとして確認します。

## 検証コマンド

```bash
pnpm test
pnpm test:coverage
pnpm lint
pnpm build
```

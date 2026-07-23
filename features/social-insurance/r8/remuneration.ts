type StandardMonthlyRemunerationBand = readonly [
  upperExclusiveYen: number | null,
  standardMonthlyRemunerationYen: number,
];

/**
 * Health-insurance grades from the R8 Fukuoka branch contribution table.
 *
 * Official source:
 * https://www.kyoukaikenpo.or.jp/assets/R8_40fukuoka.pdf
 */
const HEALTH_STANDARD_MONTHLY_REMUNERATION_BANDS = [
  [63_000, 58_000],
  [73_000, 68_000],
  [83_000, 78_000],
  [93_000, 88_000],
  [101_000, 98_000],
  [107_000, 104_000],
  [114_000, 110_000],
  [122_000, 118_000],
  [130_000, 126_000],
  [138_000, 134_000],
  [146_000, 142_000],
  [155_000, 150_000],
  [165_000, 160_000],
  [175_000, 170_000],
  [185_000, 180_000],
  [195_000, 190_000],
  [210_000, 200_000],
  [230_000, 220_000],
  [250_000, 240_000],
  [270_000, 260_000],
  [290_000, 280_000],
  [310_000, 300_000],
  [330_000, 320_000],
  [350_000, 340_000],
  [370_000, 360_000],
  [395_000, 380_000],
  [425_000, 410_000],
  [455_000, 440_000],
  [485_000, 470_000],
  [515_000, 500_000],
  [545_000, 530_000],
  [575_000, 560_000],
  [605_000, 590_000],
  [635_000, 620_000],
  [665_000, 650_000],
  [695_000, 680_000],
  [730_000, 710_000],
  [770_000, 750_000],
  [810_000, 790_000],
  [855_000, 830_000],
  [905_000, 880_000],
  [955_000, 930_000],
  [1_005_000, 980_000],
  [1_055_000, 1_030_000],
  [1_115_000, 1_090_000],
  [1_175_000, 1_150_000],
  [1_235_000, 1_210_000],
  [1_295_000, 1_270_000],
  [1_355_000, 1_330_000],
  [null, 1_390_000],
] as const satisfies readonly StandardMonthlyRemunerationBand[];

/**
 * Employee-pension grades from the same official R8 table. The table states
 * that the pension range starts below 93,000 yen and ends at 635,000 yen or
 * more, while health insurance continues through its own 50 grades.
 */
const PENSION_STANDARD_MONTHLY_REMUNERATION_BANDS = [
  [93_000, 88_000],
  [101_000, 98_000],
  [107_000, 104_000],
  [114_000, 110_000],
  [122_000, 118_000],
  [130_000, 126_000],
  [138_000, 134_000],
  [146_000, 142_000],
  [155_000, 150_000],
  [165_000, 160_000],
  [175_000, 170_000],
  [185_000, 180_000],
  [195_000, 190_000],
  [210_000, 200_000],
  [230_000, 220_000],
  [250_000, 240_000],
  [270_000, 260_000],
  [290_000, 280_000],
  [310_000, 300_000],
  [330_000, 320_000],
  [350_000, 340_000],
  [370_000, 360_000],
  [395_000, 380_000],
  [425_000, 410_000],
  [455_000, 440_000],
  [485_000, 470_000],
  [515_000, 500_000],
  [545_000, 530_000],
  [575_000, 560_000],
  [605_000, 590_000],
  [635_000, 620_000],
  [null, 650_000],
] as const satisfies readonly StandardMonthlyRemunerationBand[];

export function resolveR8HealthStandardMonthlyRemuneration(
  monthlyRemunerationYen: number,
): number {
  return resolveStandardMonthlyRemuneration(
    monthlyRemunerationYen,
    HEALTH_STANDARD_MONTHLY_REMUNERATION_BANDS,
  );
}

export function resolveR8PensionStandardMonthlyRemuneration(
  monthlyRemunerationYen: number,
): number {
  return resolveStandardMonthlyRemuneration(
    monthlyRemunerationYen,
    PENSION_STANDARD_MONTHLY_REMUNERATION_BANDS,
  );
}

function resolveStandardMonthlyRemuneration(
  monthlyRemunerationYen: number,
  bands: readonly StandardMonthlyRemunerationBand[],
) {
  assertNonNegativeSafeInteger(
    monthlyRemunerationYen,
    "monthlyRemunerationYen",
  );

  const band = bands.find(
    ([upperExclusiveYen]) =>
      upperExclusiveYen === null ||
      monthlyRemunerationYen < upperExclusiveYen,
  );

  if (!band) {
    throw new RangeError(
      "monthlyRemunerationYen is outside the supported remuneration table.",
    );
  }

  return band[1];
}

function assertNonNegativeSafeInteger(value: number, fieldName: string) {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError(`${fieldName} must be a non-negative safe integer.`);
  }
}

/**
 * Fuzzy Mamdani Engine
 * Variables:
 * 1. Kondisi Aset (0-100): Baik (0-40), Rusak Ringan (30-70), Rusak Berat (60-100)
 * 2. Umur Ekonomis (0-10 years): Baru (0-4), Sedang (3-7), Lama (6-10)
 * 3. Biaya Pemeliharaan (% of price): Rendah (0-30), Sedang (25-65), Tinggi (60-100)
 *
 * Output: Kelayakan Penghapusan (0-100)
 * Status: Tidak Layak (0-40), Dipertimbangkan (30-70), Layak (60-100)
 */

type Membership = {
  name: string;
  value: number;
};

export function trimf(x: number, a: number, b: number, c: number): number {
  if (x <= a || x >= c) return 0;
  if (x === b) return 1;
  if (x > a && x < b) return (x - a) / (b - a);
  if (x > b && x < c) return (c - x) / (c - b);
  return 0;
}

export function trapmf(x: number, a: number, b: number, c: number, d: number): number {
  if (x <= a || x >= d) return 0;
  if (x >= b && x <= c) return 1;
  if (x > a && x < b) return (x - a) / (b - a);
  if (x > c && x < d) return (d - x) / (d - c);
  return 0;
}

// 1. Fuzzification (Aligned with Indonesian BMN/BMD guidelines & 30%-50% BMBP rules)
export function getKondisiMembership(x: number): Membership[] {
  return [
    { name: "Baik", value: trapmf(x, -1, 0, 30, 45) },
    { name: "Rusak Ringan", value: trimf(x, 30, 50, 70) },
    { name: "Rusak Berat", value: trapmf(x, 55, 75, 100, 101) },
  ];
}

export function getUmurMembership(x: number): Membership[] {
  return [
    { name: "Baru", value: trapmf(x, -1, 0, 3, 5) },
    { name: "Sedang", value: trimf(x, 3, 5, 7) },
    { name: "Lama", value: trapmf(x, 5, 7, 10, 11) }, // Useful life ended (>7 years)
  ];
}

export function getBiayaMembership(x: number): Membership[] {
  return [
    { name: "Rendah", value: trapmf(x, -1, 0, 20, 30) }, // Under BMBP lower limit (30%)
    { name: "Sedang", value: trimf(x, 20, 35, 50) },     // Between 30% and 50%
    { name: "Tinggi", value: trapmf(x, 40, 50, 100, 101) }, // Exceeds legal BMBP limit (>50%)
  ];
}

export function getTotalPerbaikanMembership(x: number): Membership[] {
  return [
    { name: "Jarang", value: trapmf(x, -1, 0, 1, 3) },
    { name: "Normal", value: trimf(x, 1, 3, 5) },
    { name: "Sering", value: trapmf(x, 3, 5, 10, 101) },
  ];
}

// 2. Inference Rules (PP 27/2014 & BMN/BMD Asset Logic)
export function evaluateRules(kondisi: number, umur: number, biaya: number, totalPerbaikan: number) {
  const muKondisi = getKondisiMembership(kondisi);
  const muUmur = getUmurMembership(umur);
  const muBiaya = getBiayaMembership(biaya);
  const muTotal = getTotalPerbaikanMembership(totalPerbaikan);

  const rules: { output: string; weight: number }[] = [];

  muKondisi.forEach((k) => {
    muUmur.forEach((u) => {
      muBiaya.forEach((b) => {
        muTotal.forEach((t) => {
          let output = "Diperbaiki"; // Default action is to repair and keep
          const weight = Math.min(k.value, u.value, b.value, t.value);

          if (weight > 0) {
            // 1. LAYAK HAPUS (Disposal/Penghapusan):
            // - Asset is completely broken (Kondisi "Rusak Berat")
            // - Or useful life is expired ("Lama") and needs uneconomical repair costs ("Tinggi" >50% BMBP)
            // - Or high maintenance frequency ("Sering") and high costs ("Tinggi")
            if (
              k.name === "Rusak Berat" || 
              (u.name === "Lama" && b.name === "Tinggi") ||
              (t.name === "Sering" && b.name === "Tinggi")
            ) {
              output = "Layak Hapus";
            } 
            // 2. DILELANG (Auction/Penjualan):
            // - Useful life is expired ("Lama") but asset is still "Baik" or "Rusak Ringan" with manageable repair costs (generates PNBP/state revenue)
            // - Or asset is middle-aged ("Sedang") but has high repair costs ("Tinggi") while not completely broken (better to auction than to repair)
            else if (
              (u.name === "Lama" && (k.name === "Baik" || k.name === "Rusak Ringan") && b.name !== "Tinggi") ||
              (u.name === "Sedang" && b.name === "Tinggi" && k.name !== "Rusak Berat")
            ) {
              output = "Dilelang";
            }
            // 3. TIDAK MEMERLUKAN TINDAKAN (No Action Required):
            // - Condition is still Good ("Baik") and asset is not yet expired ("Baru" or "Sedang")
            // - And repair cost is low ("Rendah") and repairs are infrequent ("Jarang" or "Normal")
            else if (
              k.name === "Baik" &&
              u.name !== "Lama" &&
              b.name === "Rendah" &&
              t.name !== "Sering"
            ) {
              output = "Tidak Memerlukan Tindakan";
            }
            // 4. DIPERBAIKI (Retain & Repair / Maintenance):
            // - Young or middle-aged assets in "Baik" or "Rusak Ringan" with some issues, medium cost, or normal repairs
            else {
              output = "Diperbaiki";
            }
            rules.push({ output, weight });
          }
        });
      });
    });
  });

  return rules;
}

// 3. Defuzzification (Centroid Method with revised output bounds for 4 categories)
export function defuzzify(rules: { output: string; weight: number }[]): number | null {
  let numerator = 0;
  let denominator = 0;

  for (let x = 0; x <= 100; x += 2) {
    let maxMu = 0;
    rules.forEach((rule) => {
      let mu = 0;
      if (rule.output === "Tidak Memerlukan Tindakan") mu = trapmf(x, -1, 0, 20, 30);
      if (rule.output === "Diperbaiki") mu = trimf(x, 25, 40, 55);
      if (rule.output === "Dilelang") mu = trimf(x, 50, 62.5, 75);
      if (rule.output === "Layak Hapus") mu = trapmf(x, 70, 85, 100, 101);

      maxMu = Math.max(maxMu, Math.min(mu, rule.weight));
    });

    numerator += x * maxMu;
    denominator += maxMu;
  }

  return denominator === 0 ? null : numerator / denominator;
}

export function calculateAssetEligibility(
  kondisiScore: number, 
  umur: number, 
  biayaPercent: number,
  totalPerbaikan: number = 0
) {
  // Cap the inputs to their defined domains to prevent out of bounds (null) scores
  const cappedKondisi = Math.min(100, Math.max(0, kondisiScore));
  const cappedUmur = Math.min(10, Math.max(0, umur));
  const cappedBiaya = Math.min(100, Math.max(0, biayaPercent));
  const cappedTotal = Math.min(10, Math.max(0, totalPerbaikan));

  const rules = evaluateRules(cappedKondisi, cappedUmur, cappedBiaya, cappedTotal);
  
  if (rules.length === 0) {
    return { score: null, status: null };
  }

  const score = defuzzify(rules);
  if (score === null) {
    return { score: null, status: null };
  }

  let status: "Layak Hapus" | "Dilelang" | "Diperbaiki" | "Tidak Memerlukan Tindakan" = "Tidak Memerlukan Tindakan";
  if (score < 25) status = "Tidak Memerlukan Tindakan";
  else if (score < 50) status = "Diperbaiki";
  else if (score < 75) status = "Dilelang";
  else status = "Layak Hapus";

  return { score, status };
}

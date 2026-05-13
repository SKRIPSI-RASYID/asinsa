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

// 1. Fuzzification
export function getKondisiMembership(x: number): Membership[] {
  return [
    { name: "Baik", value: trapmf(x, -1, 0, 30, 50) },
    { name: "Rusak Ringan", value: trimf(x, 30, 50, 70) },
    { name: "Rusak Berat", value: trapmf(x, 50, 70, 100, 101) },
  ];
}

export function getUmurMembership(x: number): Membership[] {
  return [
    { name: "Baru", value: trapmf(x, -1, 0, 3, 5) },
    { name: "Sedang", value: trimf(x, 3, 5, 7) },
    { name: "Lama", value: trapmf(x, 5, 7, 10, 11) },
  ];
}

export function getBiayaMembership(x: number): Membership[] {
  return [
    { name: "Rendah", value: trapmf(x, -1, 0, 20, 40) },
    { name: "Sedang", value: trimf(x, 20, 50, 80) },
    { name: "Tinggi", value: trapmf(x, 60, 80, 100, 101) },
  ];
}

export function getTotalPerbaikanMembership(x: number): Membership[] {
  return [
    { name: "Jarang", value: trapmf(x, -1, 0, 1, 3) },
    { name: "Normal", value: trimf(x, 1, 3, 5) },
    { name: "Sering", value: trapmf(x, 3, 5, 10, 101) },
  ];
}

// 2. Inference Rules
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
          let output = "Dipertimbangkan";
          const weight = Math.min(k.value, u.value, b.value, t.value);

          if (weight > 0) {
            // Priority 1: High frequency or very bad condition
            if (k.name === "Rusak Berat" || t.name === "Sering" || (u.name === "Lama" && b.name === "Tinggi")) {
              output = "Layak Hapus";
            } 
            // Priority 2: Good condition and new
            else if (k.name === "Baik" && u.name === "Baru" && t.name === "Jarang") {
              output = "Tidak Layak Hapus";
            }
            rules.push({ output, weight });
          }
        });
      });
    });
  });

  // If no rules fired, default to Dipertimbangkan
  if (rules.length === 0) {
    rules.push({ output: "Dipertimbangkan", weight: 0.001 });
  }

  return rules;
}

// 3. Defuzzification (Centroid Method)
export function defuzzify(rules: { output: string; weight: number }[]): number {
  let numerator = 0;
  let denominator = 0;

  for (let x = 0; x <= 100; x += 2) {
    let maxMu = 0;
    rules.forEach((rule) => {
      let mu = 0;
      if (rule.output === "Tidak Layak Hapus") mu = trapmf(x, -1, 0, 30, 50);
      if (rule.output === "Dipertimbangkan") mu = trimf(x, 30, 50, 70);
      if (rule.output === "Layak Hapus") mu = trapmf(x, 50, 70, 100, 101);

      maxMu = Math.max(maxMu, Math.min(mu, rule.weight));
    });

    numerator += x * maxMu;
    denominator += maxMu;
  }

  return denominator === 0 ? 50 : numerator / denominator;
}

export function calculateAssetEligibility(
  kondisiScore: number, 
  umur: number, 
  biayaPercent: number,
  totalPerbaikan: number = 0
) {
  const rules = evaluateRules(kondisiScore, umur, biayaPercent, totalPerbaikan);
  const score = defuzzify(rules);

  let status: "Layak Hapus" | "Dipertimbangkan" | "Tidak Layak Hapus" = "Dipertimbangkan";
  if (score < 40) status = "Tidak Layak Hapus";
  else if (score > 60) status = "Layak Hapus";

  return { score, status };
}

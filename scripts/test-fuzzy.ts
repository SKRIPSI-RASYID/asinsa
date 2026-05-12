import { calculateAssetEligibility } from "../lib/fuzzy-engine.js"

function test() {
  console.log("Testing Fuzzy Engine...")

  // Case 1: Brand New, Good Condition
  const case1 = calculateAssetEligibility(10, 1, 5)
  console.log("Case 1 (New, Good):", case1)

  // Case 2: Old, Heavily Damaged, High Maintenance
  const case2 = calculateAssetEligibility(90, 8, 80)
  console.log("Case 2 (Old, Damaged):", case2)

  // Case 3: Middle ground
  const case3 = calculateAssetEligibility(50, 5, 40)
  console.log("Case 3 (Middle):", case3)
}

test()

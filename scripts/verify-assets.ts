import { Asset } from "../types"

const testAssets: Partial<Asset>[] = [
  {
    name: "Test Laptop",
    code: "TST-001",
    purchase_year: 2020,
    condition: "Baik",
  }
]

function verify() {
  console.log("Verifying Asset Handling...")
  testAssets.forEach(asset => {
    if (!asset.name || !asset.code) {
      throw new Error("Invalid asset data")
    }
    console.log(`Verified asset: ${asset.name} (${asset.code})`)
  })
  console.log("Verification Complete.")
}

verify()

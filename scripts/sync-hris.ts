import "dotenv/config";
import { runFullHrisSync } from "../src/lib/services/hris-sync.service";

async function main() {
  const result = await runFullHrisSync();
  console.log("HRIS sync completed:", JSON.stringify(result, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

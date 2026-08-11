import { createClient } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';

const client = createClient({ chain: studionet });

async function main() {
  console.log("waitForTransactionReceipt function:");
  console.log(client.waitForTransactionReceipt.toString());
}

main().catch(console.error);

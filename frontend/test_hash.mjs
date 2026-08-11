import { createClient } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';

const client = createClient({ chain: studionet });

async function main() {
  const hash = "0xa4126275efcbf664be2824defc2000f90b2098b381d9fd6d280329979a66d6ae";
  console.log("Fetching transaction receipt for:", hash);
  try {
    const receipt = await client.getTransaction({ hash });
    console.log("Receipt:", JSON.stringify(receipt, null, 2));
    
    // Also test waitForTransactionReceipt
    const waitReceipt = await client.waitForTransactionReceipt({ hash, retries: 2 });
    console.log("Wait Receipt:", JSON.stringify(waitReceipt, null, 2));
  } catch (e) {
    console.error("Error:", e);
  }
}

main().catch(console.error);

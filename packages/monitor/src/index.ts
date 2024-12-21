import { Monitor } from "./monitor";

async function main() {
  const monitor = new Monitor({
    contractAddress: process.env.CONTRACT_ADDRESS!,
    rpcUrl: process.env.RPC_URL!,
  });

  await monitor.start();
}

main().catch(console.error);

import { Provider, Wallet, bn, Address, BytesLike } from 'fuels';
import { testnetProviderUrl } from './lib';
import 'dotenv/config';
import { env } from './env';



// Replace with your local node or testnet URL
const NETWORK_URL = testnetProviderUrl;

// Replace with your private keys (these are just examples, never use real keys in public code)
const WALLET_PVT_KEY_1 = env.VITE_SENDERS_PVT_KEY as BytesLike; // Sender's private key

const WALLET_PVT_KEY_2 = env.VITE_RECIEVERS_PVT_KEY as BytesLike; // Receiver's private key


async function main() {
    // Connect to the provider
    const provider = new Provider(NETWORK_URL);

    // Get the base asset ID (ETH)
    const baseAssetId = await provider.getBaseAssetId();

    // Create wallet instances
    const sender = Wallet.fromPrivateKey(WALLET_PVT_KEY_1, provider);
    const receiver = Wallet.fromPrivateKey(WALLET_PVT_KEY_2, provider);

    // Amount to transfer (in base units, e.g., 1_000_000 = 0.001 ETH if 1 ETH = 1e9 units)
    const amountToTransfer = bn(100_000);

    // Transfer
    const response = await sender.transfer(
        receiver.address,
        amountToTransfer,
        baseAssetId
    );

    // Wait for transaction to be mined
    await response.waitForResult();


    const txId = response.id
    console.log({ txId })

    console.log("Tx link: https://app-testnet.fuel.network/tx/" + txId + "/simple")

    // Check balances
    const senderBalance = await sender.getBalance(baseAssetId);
    const receiverBalance = await receiver.getBalance(baseAssetId);

    console.log('Sender balance:', senderBalance.toString());
    console.log('Receiver balance:', receiverBalance.toString());
}

main().catch(console.error);

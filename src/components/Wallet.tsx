import { useDisconnect, useWallet, useBalance } from "@fuels/react";
import { useEffect, useState } from "react";
import { Address, bn } from "fuels";

import Button from "./Button";
import LocalFaucet from "./LocalFaucet";
import { isLocal, renderFormattedBalance } from "../lib.tsx";
import { useBaseAssetId } from "../hooks/useBaseAssetId.tsx";
import { useNotification } from "../hooks/useNotification.tsx";

export default function Wallet() {
  const { disconnect } = useDisconnect();
  const { wallet } = useWallet();
  const { baseAssetId } = useBaseAssetId();

  const address = wallet?.address.toB256() || "";

  const { balance, refetch } = useBalance({ address, assetId: baseAssetId });

  // Transfer form state
  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);
  const { errorNotification, transactionSubmitNotification, transactionSuccessNotification } = useNotification();

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    const interval = setInterval(() => refetch(), 5000);
    return () => clearInterval(interval);
  }, [refetch]);

  // Add transfer handler
  const handleTransfer = async () => {
    if (!wallet || !destination || !amount) return;
    setIsTransferring(true);
    try {
      const tx = await wallet.transfer(
        Address.fromB256(destination),
        bn(amount),
        baseAssetId
      );
      transactionSubmitNotification(tx.id);
      await tx.waitForResult();
      transactionSuccessNotification(tx.id);
      setDestination("");
      setAmount("");
      refetch();
    } catch (error) {
      console.error(error);
      errorNotification("Error transferring funds. Check your balance and the destination address.");
    }
    setIsTransferring(false);
  };

  return (
    <>
      <div>
        <h3 className="mb-1 text-sm font-medium dark:text-zinc-300/70">
          Address
        </h3>
        <div className="flex flex-col md:flex-row items-center justify-between text-base dark:text-zinc-50">
          <input
            type="text"
            value={address}
            className="w-2/3 bg-gray-800 rounded-md mb-2 md:mb-0 px-2 py-1 mr-3 truncate font-mono"
            disabled
          />
          <Button onClick={() => disconnect()} className="w-1/3">
            Disconnect
          </Button>
        </div>
      </div>
      <div>
        <h3 className="mb-1 text-sm font-medium dark:text-zinc-300/70">
          Balance
        </h3>
        <div className="flex items-center justify-between text-base dark:text-zinc-50">
          <input
            type="text"
            value={balance ? `${renderFormattedBalance(balance)} ETH` : ""}
            className="w-2/3 bg-gray-800 rounded-md px-2 py-1 mr-3 truncate font-mono"
            disabled
          />
          <Button onClick={() => refetch()} className="w-1/3">
            Refresh
          </Button>
        </div>
      </div>
      <div>
        <h3 className="mb-1 text-sm font-medium dark:text-zinc-300/70">
          Transfer
        </h3>
        <div className="flex flex-col md:flex-row items-center justify-between text-base dark:text-zinc-50 gap-2">
          <input
            type="text"
            placeholder="Destination Address"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="w-full bg-gray-800 rounded-md px-2 py-1 font-mono"
            disabled={isTransferring}
          />
          <input
            type="number"
            placeholder="Amount (in base units)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-gray-800 rounded-md px-2 py-1 font-mono"
            disabled={isTransferring}
          />
          <Button
            onClick={handleTransfer}
            className="w-full md:w-1/3"
            disabled={isTransferring || !wallet || !destination || !amount}
          >
            {isTransferring ? "Transferring..." : "Send"}
          </Button>
        </div>
      </div>
      <div>
        <p>
          Fuel supports a range of wallets. This dApp utilizes wallet connectors
          to provide simple wallet integration. You can read more about them{" "}
          <a
            href="https://docs.fuel.network/docs/wallet/dev/connectors/"
            className="text-green-500/80 transition-colors hover:text-green-500"
            target="_blank"
            rel="noreferrer"
          >
            here
          </a>
          .
        </p>
      </div>
      {isLocal && <LocalFaucet refetch={refetch} />}
    </>
  );
}

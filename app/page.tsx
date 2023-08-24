"use client";
import { useGetBalance } from "@/components/useBalance";
import { useWeb3Context } from "./providers";

export default function Home() {
  const { address, network, embeddedNetwork, login, switchChain, logout } =
    useWeb3Context();
  const { getBalance, balance } = useGetBalance();

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {!address ? (
        <button onClick={login}>Login</button>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          <button onClick={logout}>Logout</button>
          <p>Address: {address}</p>
          <p>Selected Network: {network}</p>
          <p>Embedded Network: {embeddedNetwork}</p>
          <p>Balance: {balance}</p>
          <button onClick={getBalance}>Get cUSD Balance</button>
          <button onClick={() => switchChain?.(1)}>Switch to Mainnet</button>
          <button onClick={() => switchChain?.(44787)}>
            Switch to Alfajores
          </button>
        </div>
      )}
    </main>
  );
}

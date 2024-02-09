"use client";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { WalletClient, createWalletClient, custom } from "viem";
import { usePrivy, useWallets, PrivyProvider } from "@privy-io/react-auth";
import { celoAlfajores } from "viem/chains";

interface IWeb3 {
  isAuthenticated: boolean;
  web3: WalletClient | undefined;
  address: string;
  loading: boolean;
  login: () => void;
  logout: () => Promise<void>;
  switchChain?: (chainId: number) => Promise<void>;
}

const Web3Context = createContext<IWeb3 | null>(null);

const Web3Provider: React.FC<PropsWithChildren> = (props) => {
  const { login, ready, authenticated, user, logout } = usePrivy();
  const { wallets } = useWallets();
  const [web3, setWeb3] = useState<WalletClient | undefined>();
  const embeddedWallet = useMemo(
    () => wallets.find((wallet) => wallet.address === user?.wallet?.address),
    [wallets, user?.wallet?.address],
  );
  useEffect(() => {
    let active = true;
    if (embeddedWallet) {
      load();
    }
    return () => {
      active = false;
    };

    async function load() {
      console.log("Switching chain to alfajores");
      await embeddedWallet?.switchChain(44787);
      const provider = await embeddedWallet?.getEthereumProvider();
      if (!active || !provider) {
        return;
      }
      setWeb3(
        createWalletClient({
          transport: custom(provider),
          chain: celoAlfajores,
          account: embeddedWallet?.address as any,
        }),
      );
    }
  }, [embeddedWallet]);

  return (
    <Web3Context.Provider
      {...props}
      value={{
        web3,
        address: user?.wallet?.address || "",
        loading: !ready,
        isAuthenticated: authenticated,
        login,
        logout,
      }}
    />
  );
};

export function useWeb3Context() {
  const ctx = useContext(Web3Context);
  if (ctx === null) {
    throw new Error("Missing web3 context");
  }
  return ctx;
}

export function Providers({ children }: React.PropsWithChildren) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={{
        defaultChain: celoAlfajores as any,
        loginMethods: ["email", "wallet", "google"],
        appearance: {
          theme: "light",
          accentColor: "#676FFF",
          showWalletLoginFirst: true,
        },
      }}
    >
      <Web3Provider>{children}</Web3Provider>
    </PrivyProvider>
  );
}

"use client";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ethers } from "ethers";
import { usePrivy, useWallets, PrivyProvider } from "@privy-io/react-auth";

export const WALLET_KEY = "flowcarbon:walletLabel";
export const NETWORK_KEY = "flowcarbon:networkId";

//Network we receive from an API
interface Network {
  id: number;
  chain_id: number;
}

interface IWeb3 {
  isAuthenticated: boolean;
  web3: ethers.BrowserProvider | null;
  address: string;
  loading: boolean;
  ens?: string;
  network?: number;
  embeddedNetwork?: string;
  login: () => void;
  logout: () => Promise<void>;
  switchChain?: (chainId: number) => Promise<void>;
}

const NETWORKS: Network[] = [
  {
    id: 1,
    chain_id: 1,
  },
  {
    id: 2,
    chain_id: 44787,
  },
];

const Web3Context = createContext<IWeb3 | null>(null);

const Web3Provider: React.FC<PropsWithChildren> = (props) => {
  const { login, ready, authenticated, user, logout } = usePrivy();
  const { wallets } = useWallets();
  const [web3, setWeb3] = useState<any>();
  const [selectedNetwork, setSelectedNetwork] = useState<Network | undefined>(
    undefined,
  );
  const embeddedWallet = useMemo(
    () => wallets.find((wallet) => wallet.address === user?.wallet?.address),
    [wallets, user?.wallet?.address],
  );
  useEffect(() => {
    let active = true;
    if (ready && authenticated && embeddedWallet && selectedNetwork) {
      load();
    }
    return () => {
      active = false;
    };

    async function load() {
      setWeb3(undefined);
      const provider = await embeddedWallet?.getEthersProvider();
      console.log("Updating provider");
      await embeddedWallet?.switchChain(selectedNetwork!.chain_id);
      if (!active) {
        return;
      }
      console.log(
        "Switched chain",
        selectedNetwork!.chain_id,
        embeddedWallet?.chainId,
      );
      setWeb3(provider);
    }
  }, [embeddedWallet, ready, authenticated, selectedNetwork]);

  useEffect(() => {
    if (embeddedWallet?.chainId) {
      const connectedId = embeddedWallet?.chainId.split(":").at(1);
      const networkIndex = NETWORKS.findIndex(
        ({ chain_id }) => chain_id + "" === connectedId,
      );
      if (networkIndex === -1) {
        setSelectedNetwork(NETWORKS[1]);
      } else {
        setSelectedNetwork(NETWORKS[networkIndex]);
      }
    }
  }, [embeddedWallet]);

  const switchChain = async (chainId: number) => {
    await embeddedWallet?.switchChain(chainId).catch((e) => {
      console.log(e);
    });
    setSelectedNetwork(NETWORKS.find(({ chain_id }) => chain_id === chainId));
  };

  return (
    <Web3Context.Provider
      {...props}
      value={{
        web3,
        address: embeddedWallet?.address || "",
        loading: !ready,
        isAuthenticated: authenticated,
        login,
        logout,
        network: selectedNetwork?.chain_id,
        embeddedNetwork: embeddedWallet?.chainId,
        switchChain,
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

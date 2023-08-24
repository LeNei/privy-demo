import { useCallback, useState } from "react";
import { useWeb3Context } from "@/app/providers";
import { ethers } from "ethers";

const TEMP_ABI = [
  {
    constant: true,
    inputs: [
      {
        name: "_owner",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        name: "balance",
        type: "uint256",
      },
    ],
    payable: false,
    type: "function",
  },
];

export function useGetBalance() {
  const { web3, address } = useWeb3Context();
  const [balance, setBalance] = useState<string>();

  const getBalance = useCallback(() => {
    if (!web3 || !address) return;
    const contract = new ethers.Contract(
      "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1",
      TEMP_ABI,
      web3,
    );
    contract.balanceOf(address).then((balance) => {
      setBalance(balance.toString());
    });
  }, [web3, address]);

  return { getBalance, balance };
}

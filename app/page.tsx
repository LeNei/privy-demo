"use client";
import { celoAlfajores } from "viem/chains";
import { useWeb3Context } from "./providers";

const abi = [
  {
    name: "allowance",
    type: "function",
    inputs: [
      {
        name: "owner",
        type: "address",
        internalType: "address",
      },
      {
        name: "spender",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    name: "approve",
    type: "function",
    inputs: [
      {
        name: "spender",
        type: "address",
        internalType: "address",
      },
      {
        name: "amount",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "nonpayable",
  },
];

export default function Home() {
  const { address, web3, login, logout } = useWeb3Context();

  const requestApprove = async () => {
    if (!web3) return;
    web3.writeContract({
      address: "0x64b132CDd42eC90DeF32eFD0113C9cB4c3e1Dc48" as any,
      abi,
      functionName: "approve",
      args: [
        "0x06a93b5c662f5E65A3c544828D1076D68506BAAA",
        "1000000000000000000",
      ],
      account: address as any,
      chain: celoAlfajores,
    });
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {!address ? (
        <button onClick={login}>Login</button>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          <button onClick={logout}>Logout</button>
          <p>Address: {address}</p>
          <button
            className="px-2 py-1 rounded-lg bg-blue-600"
            onClick={requestApprove}
          >
            Request Approve
          </button>
        </div>
      )}
    </main>
  );
}

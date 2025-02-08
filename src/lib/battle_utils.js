import { ethers } from "ethers";

export const CONTRACT_ADDRESS = "0xb66fbfaCE829Ae1A2269143707B3A2D41B2a5fC4";
export const ABI = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "token1",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "token2",
        type: "uint256",
      },
    ],
    name: "battle",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_aiContract",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "token1",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "token2",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "winner",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint8",
        name: "score1",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "uint8",
        name: "score2",
        type: "uint8",
      },
    ],
    name: "BattleResult",
    type: "event",
  },
  {
    inputs: [],
    name: "aiContract",
    outputs: [
      {
        internalType: "contract IContract",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

export async function battle(token1, token2, signer) {
  try {
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
    const tx = await contract.battle(token1, token2);
    const receipt = await signer.provider.waitForTransaction(tx.hash);

    console.log("Battled:", receipt);
    return receipt;
  } catch (error) {
    console.error("Battle Error:", error);
  }
}

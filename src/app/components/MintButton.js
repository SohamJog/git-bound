"use client";

import { useState } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, ABI } from "@/lib/utils";

export default function MintSBTButton({ signer, userSkills }) {
  const [minting, setMinting] = useState(false);
  const [txHash, setTxHash] = useState(null);

  const mintSBT = async () => {
    if (!signer) {
      alert("Please connect your wallet first.");
      return;
    }

    try {
      setMinting(true);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

      const userAddress = await signer.getAddress();
      const metadataURI = `data:application/json;base64,${btoa(JSON.stringify(userSkills))}`;

      const tx = await contract.mint(userAddress, metadataURI);
      await tx.wait();

      setTxHash(tx.hash);
      alert("SBT Minted Successfully!");
    } catch (error) {
      console.error("Minting Failed:", error);
      alert("Transaction failed. Make sure you have enough gas fees.");
    } finally {
      setMinting(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <button 
        onClick={mintSBT} 
        className="px-4 py-2 bg-green-600 text-white rounded"
        disabled={minting}
      >
        {minting ? "Minting..." : "Mint SBT"}
      </button>

      {txHash && (
        <p className="mt-2">
          View Transaction:{" "}
          <a 
            href={`https://goerli.etherscan.io/tx/${txHash}`} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-400 underline"
          >
            Etherscan
          </a>
        </p>
      )}
    </div>
  );
}

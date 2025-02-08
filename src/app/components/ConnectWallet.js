"use client";

import { useState } from "react";
import { ethers } from "ethers";
import { connectWallet } from "@/lib/utils";

export default function ConnectWalletButton({ onWalletConnected, setUserAddress }) {
  const [walletAddress, setWalletAddress] = useState(null);
  const [connecting, setConnecting] = useState(false);

  return (
    <button
      onClick={() =>
        connectWallet(setWalletAddress, setConnecting, onWalletConnected, setUserAddress)
      }
      className={`px-6 py-3 text-lg font-bold rounded-xl shadow-md transition-all duration-200
    ${
      connecting
        ? "bg-gray-400 text-gray-200 cursor-not-allowed"
        : "bg-gradient-to-b from-yellow-300 to-yellow-500 text-yellow-900 hover:scale-105 hover:shadow-lg"
    }`}
      disabled={connecting}
    >
      {connecting
        ? "Connecting..."
        : walletAddress
        ? `Connected: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
        : "Connect Wallet"}
    </button>
  );
}

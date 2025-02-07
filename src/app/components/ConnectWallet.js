"use client";

import { useState } from "react";
import { ethers } from "ethers";

export default function ConnectWalletButton({ onWalletConnected }) {
  const [walletAddress, setWalletAddress] = useState(null);
  const [connecting, setConnecting] = useState(false);

  const connectWallet = async () => {
    try {
      let signer = null;

      let provider;
      if (window.ethereum == null) {
        // If MetaMask is not installed, we use the default provider,
        // which is backed by a variety of third-party services (such
        // as INFURA). They do not have private keys installed,
        // so they only have read-only access
        console.log("MetaMask not installed; using read-only defaults");
        provider = ethers.getDefaultProvider();
      } else {
        setConnecting(true);
        provider = new ethers.BrowserProvider(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" });
        signer = await provider.getSigner();
      }

      const address = await signer.getAddress();

      setWalletAddress(address);
      onWalletConnected(signer); // Pass signer to parent component
    } catch (error) {
      console.error("Wallet connection failed:", error);
      alert(
        "Failed to connect wallet. Ensure MetaMask is installed and unlocked."
      );
    } finally {
      setConnecting(false);
    }
  };

  return (
    <button
      onClick={connectWallet}
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

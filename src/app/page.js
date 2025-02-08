"use client";
import { NavBar } from "./components/Navbar";
import { Button } from "./components/ui/Button";
import { Card } from "./components/ui/Card";
import { createAvatar } from "@dicebear/core";
import { croodles } from "@dicebear/collection";
import { useState, useEffect } from "react";
import RPSGame from "./components/RPSGame";
import CompeteBox from "./components/CompeteBox";
import FAQ from "./components/FAQ";
import { getBalance } from "@/lib/utils";
import MintPopup from "./components/MintPopup";

export default function Home() {
  const avatar = createAvatar(croodles, {
    seed: "John Doe",
  });
  const avatar_2 = createAvatar(croodles, {
    seed: "Soham_|-|-",
  });
  const avatar_3 = createAvatar(croodles, {
    seed: "S)n!o",
  });

  const svg = avatar.toDataUri();
  const svg_2 = avatar_2.toDataUri();
  const svg_3 = avatar_3.toDataUri();

  const [signer, setSigner] = useState(null);
  const [showGame, setShowGame] = useState(false);
  const [showCompete, setShowCompete] = useState(false);
  const [ownsToken, setOwnsToken] = useState(false);
  const [showMintBox, setShowMintBox] = useState(false);
  const [userAddress, setUserAddress] = useState(null);

  useEffect(() => {
    const fetchAddressAndBalance = async () => {
      if (signer) {
        try {
          const address = await signer.getAddress();

          const balance = await getBalance(signer);
          setOwnsToken(balance > 0);
        } catch (error) {
          console.error("Error fetching address or balance:", error);
        }
      }
    };

    fetchAddressAndBalance();
  }, [signer]);

  return (
    <div className="min-h-screen bg-bgDark text-white flex flex-col items-center">
      <NavBar setSigner={setSigner} setUserAddress={setUserAddress} />
      <div className="text-center mt-10">
        <h1 className="text-4xl font-pixel text-primary">
          Welcome to Proof-of-Defeat
        </h1>
        <p className="text-lg text-gray-300 mt-3">
          Train your NFT and battle against others!
        </p>
      </div>

      <div className="mt-16 flex gap-6">
        {/* Step 1 - Mint */}
        <Card
          title="STEP 1: MINT YOUR PoD"
          imageUrl={svg_3}
          description="Mint a personalized Proof-of-Defeat NFT that learns and evolves with your gameplay."
          activated={!!signer}
          action={() => setShowMintBox(true)}
          lockedMessage="Connect your wallet to mint."
        />

        {/* Step 2 - Train */}
        <Card
          title="STEP 2: TRAIN YOUR AI"
          imageUrl={svg}
          description="Battle against your NFT to shape its strategy. The more you train, the smarter it gets!"
          activated={ownsToken}
          action={() => setShowGame(true)}
          lockedMessage="Mint your NFT first to start training!"
        />

        {/* Step 3 - Compete */}
        <Card
          title="STEP 3: BATTLE OTHER NFTs"
          imageUrl={svg_2}
          description="Enter the arena and test your AI against others! Compete, win, and claim rewards."
          activated={ownsToken}
          action={() => setShowCompete(true)}
          lockedMessage="Train your NFT first to compete!"
        />
      </div>

      {showGame && <RPSGame onClose={() => setShowGame(false)} />}
      {showCompete && <CompeteBox onClose={() => setShowCompete(false)} />}
      {showMintBox && (
        <MintPopup
          onClose={() => setShowMintBox(false)}
          signer={signer}
          userAddress={userAddress}
          ownsToken={ownsToken}
        />
      )}
      <div className="min-h-screen bg-bgDark text-white flex flex-col items-center">
        {/* Other sections */}
        <FAQ />
      </div>
    </div>
  );
}

"use client";
import { NavBar } from "./components/Navbar";
import { Button } from "./components/ui/Button";
import { Card } from "./components/ui/Card";
import { createAvatar } from "@dicebear/core";
import { croodles } from "@dicebear/collection";
import { useState } from "react";
import RPSGame from "./components/RPSGame";
import CompeteBox from "./components/CompeteBox";
import FAQ from "./components/FAQ";

export default function Home() {
  const avatar = createAvatar(croodles, {
    seed: "John Doe",
  });
  const avatar_2 = createAvatar(croodles, {
    seed: "Soham_|-|-",
  });

  const svg = avatar.toDataUri();
  const svg_2 = avatar_2.toDataUri();

  const [signer, setSigner] = useState(null);
  const [showGame, setShowGame] = useState(false);
  const [showCompete, setShowCompete] = useState(false);

  return (
    <div className="min-h-screen bg-bgDark text-white flex flex-col items-center">
      <NavBar setSigner={setSigner} />
      <div className="text-center mt-10">
        <h1 className="text-4xl font-pixel text-primary">
          Welcome to Proof-of-Defeat
        </h1>
        <p className="text-lg text-gray-300 mt-3">
          Train your NFT and battle against others!
        </p>
      </div>

      {/* Buttons */}
      <div className="mt-10 flex gap-6">
        {signer && <Button className="bg-primary">Mint</Button>}

        <Button className="bg-primary">Compete</Button>
        <a href="#faq">
          <Button className="bg-primary">FAQ</Button>
        </a>
      </div>

      {/* NFT Preview */}
      <div className="mt-16 flex gap-6">
        <div onClick={() => setShowGame(true)}>
          <Card title="TRAIN" imageUrl={svg} description="Train me to fight!" />
        </div>
        <div
          onClick={() => {
            setShowCompete(true);
          }}
        >
          <Card
            title="COMPETE"
            imageUrl={svg_2}
            description="Compete against other NFTs!"
          />
        </div>
      </div>

      {showGame && <RPSGame onClose={() => setShowGame(false)} />}
      {showCompete && <CompeteBox onClose={() => setShowCompete(false)} />}
      <div className="min-h-screen bg-bgDark text-white flex flex-col items-center">
        {/* Other sections */}
        <FAQ />
      </div>
    </div>
  );
}

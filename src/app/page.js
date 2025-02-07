"use client";
import { NavBar } from "./components/Navbar";
import { Button } from "./components/ui/Button";
import { Card } from "./components/ui/Card";

export default function Home() {
  return (
    <div className="min-h-screen bg-bgDark text-white flex flex-col items-center">
      <NavBar />
      <div className="text-center mt-10">
        <h1 className="text-4xl font-pixel text-primary">Welcome to Proof-of-Defeat</h1>
        <p className="text-lg text-gray-300 mt-3">Train your NFT and battle against others!</p>
      </div>

      {/* Buttons */}
      <div className="mt-10 flex gap-6">
        <Button className="bg-primary">Mint</Button>
        <Button className="bg-primary">Compete</Button>
        <Button className="bg-primary">FAQ</Button>
      </div>

      {/* NFT Preview */}
      <div className="mt-16 flex gap-6">
        <Card title="Your AI NFT" imageUrl="/nft-placeholder.png" description="Train me to fight!" />
        <Card title="Opponent AI" imageUrl="/nft-opponent.png" description="Defeat me in battle!" />
      </div>
    </div>
  );
}

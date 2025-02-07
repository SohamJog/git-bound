import { Button } from "./ui/Button";

export const NavBar = () => {
  return (
    <nav className="flex justify-between items-center p-4 bg-bgDark text-white">
      <h1 className="text-2xl font-pixel">🎮 OnChainAI</h1>
      <div className="flex gap-4">
        <Button className="bg-secondary">Mint</Button>
        <Button className="bg-secondary">Compete</Button>
        <Button className="bg-secondary">FAQ</Button>
        <Button className="bg-primary">Connect Wallet</Button>
      </div>
    </nav>
  );
};

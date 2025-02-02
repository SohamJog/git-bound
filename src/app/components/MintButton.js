import { useState } from "react";
import { mintSBT } from "../../lib/mintSBT";

export default function MintButton({ userSkills }) {
  const [minting, setMinting] = useState(false);
  const [txHash, setTxHash] = useState(null);

  const handleMint = async () => {
    setMinting(true);
    try {
      const tx = await mintSBT(userSkills);
      setTxHash(tx.hash);
      alert("SBT Minted Successfully!");
    } catch (error) {
      alert("Minting failed. Check console for details.");
    }
    setMinting(false);
  };

  return (
    <div className="flex flex-col items-center">
      <button 
        onClick={handleMint} 
        disabled={minting} 
        className="px-4 py-2 bg-blue-600 text-white rounded"
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

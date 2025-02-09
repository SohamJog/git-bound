import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { battle, ABI } from "@/lib/battle_utils";
import { getBalance } from "@/lib/train_utils";
import { ethers } from "ethers";

const CompeteBox = ({ onClose, signer, userToken }) => {
  const [opponentToken, setOpponentToken] = useState("");
  const [battling, setBattling] = useState(false);
  const [result, setResult] = useState(null);

  const contractInterface = new ethers.Interface(ABI);

  const handleBattle = async () => {
    if (!userToken || !opponentToken) return;

    try {
      setBattling(true);
      setResult(null);

      const receipt = await battle(userToken, opponentToken, signer);
      console.log("Battle Receipt:", receipt);

      const logs = receipt.logs;
      console.log("Logs:", logs);

      // Decode the event using ABI
      const event = contractInterface.parseLog(logs[0]);

      // Extract winner
      const winnerToken = event.args.winner.toString();
      setResult(`Winner Token ID: ${winnerToken}`);
    } catch (error) {
      console.error("Battle Error:", error);
      setResult("Battle Failed!");
    } finally {
      setBattling(false);
    }
  };
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-yellow-200 p-8 rounded-3xl shadow-xl text-center w-[450px] border-8 border-pink-200"
      >
        <h2 className="text-3xl font-bold mb-4 text-yellow-800">Compete</h2>

        {/* Display User's Token */}
        <div className="mb-4 text-lg text-black">
          {userToken ? (
            <p>
              Your NFT Token ID: <span className="font-bold">{userToken}</span>
            </p>
          ) : (
            <p className="text-red-600">You don’t own an NFT.</p>
          )}
        </div>

        {/* Input Opponent's Token ID */}
        <input
          type="text"
          placeholder="Enter opponent's Token ID"
          value={opponentToken}
          onChange={(e) => setOpponentToken(e.target.value)}
          className="w-full p-2 rounded-md bg-gray-700 text-white placeholder-gray-400 outline-none"
        />

        {/* Battle Button */}
        <button
          onClick={handleBattle}
          className={`w-full mt-4 py-2 rounded-lg ${
            userToken && opponentToken
              ? "bg-green-500 hover:bg-green-600 text-white"
              : "bg-gray-500 cursor-not-allowed"
          } transition`}
          disabled={!userToken || !opponentToken || battling}
        >
          {battling ? "Battling..." : "Start Battle"}
        </button>

        {/* Battle Result Display */}
        {result && (
          <div className="mt-4 p-3 bg-gray-800 text-white rounded-md">
            {result}
          </div>
        )}

        {/* Back Button */}
        <button
          onClick={onClose}
          className="mt-6 bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-800"
        >
          Back
        </button>
      </motion.div>
    </div>
  );
};

export default CompeteBox;

/*
Winner: 0x00000000000000000000000000000000000000000000000000000000000000030000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000300000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000

*/

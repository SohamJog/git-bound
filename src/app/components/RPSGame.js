import { useState } from "react";
import { motion } from "framer-motion";
import { chooseMove, updateQValue } from "@/lib/utils";

const moves = ["Rock", "Paper", "Scissors"];
const icons = { Rock: "✊", Paper: "✋", Scissors: "✌️" };

const RPSGame = ({ onClose, signer, userAddress }) => {
  const [playerMove, setPlayerMove] = useState(null);
  const [aiMove, setAiMove] = useState(null);
  const [result, setResult] = useState("");
  const [score, setScore] = useState({ player: 0, ai: 0, draws: 0 });
  const [loading, setLoading] = useState(false);

  const determineWinner = (player, ai) => {
    if (player === ai) {
      setScore((prev) => ({ ...prev, draws: prev.draws + 1 }));
      return { message: "It's a Draw! 🤝", reward: 0 };
    }
    if (
      (player === "Rock" && ai === "Scissors") ||
      (player === "Paper" && ai === "Rock") ||
      (player === "Scissors" && ai === "Paper")
    ) {
      setScore((prev) => ({ ...prev, player: prev.player + 1 }));
      return { message: "You Win! 🎉", reward: 1 };
    } else {
      setScore((prev) => ({ ...prev, ai: prev.ai + 1 }));
      return { message: "AI Wins! 🤖", reward: -1 };
    }
  };

  const convertMoveToIndex = (move) => {
    return moves.indexOf(move);
  };

  const playRound = async (move) => {
    setPlayerMove(move);
    setLoading(true);

    try {
      // 🔹 Call contract to get AI move
      const aiChoice = await chooseMove(signer, convertMoveToIndex(move));
      const aiMoveIndex = parseInt(aiChoice, 10);
      const aiMoveStr = moves[aiMoveIndex];

      setAiMove(aiMoveStr);

      // 🔹 Determine result
      const { message, reward } = determineWinner(move, aiMoveStr);
      setResult(message);

      // 🔹 Call contract to update Q-table with the reward
      await updateQValue(signer, convertMoveToIndex(move), reward);
    } catch (error) {
      console.error("Error playing round:", error);
    } finally {
      setLoading(false);
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
        <h2 className="text-3xl font-bold mb-4 text-yellow-800">
          Rock, Paper, Scissors
        </h2>

        <div className="flex justify-center gap-6 mb-6">
          {moves.map((move) => (
            <button
              key={move}
              onClick={() => playRound(move)}
              className="rps-button text-5xl"
              disabled={loading}
            >
              {icons[move]}
            </button>
          ))}
        </div>

        {playerMove && aiMove && (
          <div className="mb-6 text-black">
            <p className="text-lg">
              You:{" "}
              <span className="font-bold text-yellow-700">
                {icons[playerMove]}
              </span>
            </p>
            <p className="text-lg">
              AI:{" "}
              <span className="font-bold text-yellow-700">{icons[aiMove]}</span>
            </p>
            <p className="text-xl font-bold mt-4">{result}</p>
          </div>
        )}

        <div className="text-lg font-bold text-yellow-800">
          <p>Player Wins: {score.player}</p>
          <p>AI Wins: {score.ai}</p>
          <p>Draws: {score.draws}</p>
        </div>

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

export default RPSGame;

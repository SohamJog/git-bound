import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const moves = ["Rock", "Paper", "Scissors"];
const icons = { Rock: "✊", Paper: "✋", Scissors: "✌️" };

const getRandomMove = () => moves[Math.floor(Math.random() * moves.length)];

const RPSGame = ({ onClose }) => {
  const [playerMove, setPlayerMove] = useState(null);
  const [aiMove, setAiMove] = useState(null);
  const [result, setResult] = useState("");
  const [score, setScore] = useState({ player: 0, ai: 0, draws: 0 });

  const determineWinner = (player, ai) => {
    if (
      (player === "Rock" && ai === "Rock") ||
      (player === "Paper" && ai === "Paper") ||
      (player === "Scissors" && ai === "Scissors")
    ) {
      setScore((prev) => ({ ...prev, draws: prev.draws + 1 }));
      return "It's a Draw! 🤝";
    }
    if (
      (player === "Rock" && ai === "Scissors") ||
      (player === "Paper" && ai === "Rock") ||
      (player === "Scissors" && ai === "Paper")
    ) {
      setScore((prev) => ({ ...prev, player: prev.player + 1 }));
      return "You Win! 🎉";
    } else {
      setScore((prev) => ({ ...prev, ai: prev.ai + 1 }));
      return "AI Wins! 🤖";
    }
  };

  const playRound = (move) => {
    setPlayerMove(move);
    const aiChoice = getRandomMove();
    setAiMove(aiChoice);
    setResult(determineWinner(move, aiChoice));
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-yellow-200 p-8 rounded-3xl shadow-xl text-center w-[450px] border-8 border-yellow-400"
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
            >
              {icons[move]}
            </button>
          ))}
        </div>

        {playerMove && aiMove && (
          <div className="mb-6">
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

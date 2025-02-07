import { useState } from "react";
import { motion } from "framer-motion";

const CompeteBox = ({ onClose }) => {
  const [roomCode, setRoomCode] = useState("");
  const [inputCode, setInputCode] = useState("");
  const [copied, setCopied] = useState(false);

  // Generate a random room code
  const generateRoomCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomCode(code);
    setCopied(false);
  };

  // Copy room code to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
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

        {/* New Room Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            New Room
          </h3>
          <button
            onClick={generateRoomCode}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition"
          >
            Generate Room Code
          </button>

          {roomCode && (
            <div className="mt-4 p-3 bg-gray-700 rounded-md flex items-center justify-between">
              <span className="text-lg font-mono text-white">{roomCode}</span>
              <button
                onClick={copyToClipboard}
                className="text-sm text-gray-300 hover:text-white"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          )}
        </div>

        {/* Fight a Friend Section */}
        <div>
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            Fight a Friend
          </h3>
          <input
            type="text"
            placeholder="Enter Room Code"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            className="w-full p-2 rounded-md bg-gray-700 text-white placeholder-gray-400 outline-none"
          />
          <button
            className={`w-full mt-2 py-2 rounded-lg ${
              inputCode
                ? "bg-green-500 hover:bg-green-600 text-white"
                : "bg-gray-500 cursor-not-allowed"
            } transition`}
            disabled={!inputCode}
          >
            Join Room
          </button>
        </div>

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

import { useEffect, useState } from "react";
import { mint } from "@/lib/train_utils";
import { motion } from "framer-motion";
import Image from "next/image";
import { createAvatar } from "@dicebear/core";
import { croodles } from "@dicebear/collection";

const MintPopup = ({ onClose, signer, userAddress, ownsToken }) => {
  const [minting, setMinting] = useState(false);

  const getDiceBearAvatar = (seed) => {
    const avatar = createAvatar(croodles, `${seed}1`);
    return avatar.toDataUri();
  };
  useEffect(() => {
    console.log("User Address:", userAddress);
  }, [userAddress]);

  const avatarSrc = ownsToken
    ? getDiceBearAvatar(userAddress)
    : getDiceBearAvatar("John Doe");

  const handleMint = async () => {
    try {
      await mint(signer, userAddress, setMinting);
      alert("Minting successful! Check your wallet.");
      onClose(); // Close popup after minting
    } catch (error) {
      console.error("Minting Error:", error);
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
        {ownsToken ? (
          <>
            <h2 className="text-3xl font-bold mb-4 text-yellow-800">
              You Own a PoD NFT! 🎉
            </h2>
            <p className="text-lg text-black mb-4">
              Your unique, evolving Proof-of-Defeat NFT.
            </p>

            {/* NFT Image */}
            <div className="flex justify-center">
              <Image
                src={avatarSrc}
                alt="Your NFT"
                width={150}
                height={150}
                className="rounded-md border-4 border-yellow-800"
              />
            </div>

            {/* Call to action */}
            <p className="text-lg text-black mt-4">
              Take it to the arena and compete!
            </p>
            <button
              className="mt-4 bg-purple-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-purple-800 transition duration-300"
              onClick={onClose} // This should navigate to the compete page later
            >
              Go Compete! ⚔️
            </button>
          </>
        ) : (
          <>
            <h2 className="text-3xl font-bold mb-4 text-yellow-800">
              Mint Your NFT
            </h2>
            <p className="text-lg text-black mb-6">
              Claim your Proof-of-Defeat NFT now!
            </p>

            <button
              onClick={handleMint}
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-800 transition duration-300"
              disabled={minting}
            >
              {minting ? "Minting..." : "Mint Now"}
            </button>
          </>
        )}

        {/* Back Button */}
        <button
          onClick={onClose}
          className="mt-4 bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-800"
        >
          Back
        </button>
      </motion.div>
    </div>
  );
};

export default MintPopup;

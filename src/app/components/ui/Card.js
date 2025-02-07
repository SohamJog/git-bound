import Image from "next/image";
import { useState } from "react";

export const Card = ({
  title,
  imageUrl,
  description,
  activated,
  action,
  lockedMessage,
}) => {
  const [showMessage, setShowMessage] = useState(false);

  return (
    <div
      onClick={() => {
        if (activated) {
          action();
        } else {
          setShowMessage(true);
          setTimeout(() => setShowMessage(false), 2000); // Hide message after 2 sec
        }
      }}
      className={`relative rounded-lg shadow-lg p-6 text-center w-64 cursor-pointer transition ${
        activated
          ? "bg-yellow-200 hover:bg-yellow-300"
          : "bg-gray-400 opacity-70 cursor-not-allowed"
      }`}
    >
      <Image
        src={imageUrl}
        alt={title}
        width={150}
        height={150}
        className="rounded-md mx-auto"
      />
      <h3 className="font-bold text-2xl text-black mt-2">{title}</h3>
      <p className="text-gray-700 text-sm mt-1">{description}</p>

      {/* Show message when clicking on a disabled step */}
      {showMessage && !activated && (
        <div className="absolute bottom-1/2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-s px-3 py-2 rounded-lg shadow-md">
          {lockedMessage}
        </div>
      )}
    </div>
  );
};

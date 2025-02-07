import Image from "next/image";

export const Card = ({ title, imageUrl, description }) => {
  return (
    <div className="bg-primary rounded-lg shadow-lg p-4 text-center w-64">
      <Image
        src={imageUrl}
        alt={title}
        width={150}
        height={150}
        className="rounded-md mx-auto"
      />
      <h3 className="font-bold text-lg mt-2">{title}</h3>
      {description && (
        <p className="text-gray-600 text-sm mt-1">{description}</p>
      )}
    </div>
  );
};

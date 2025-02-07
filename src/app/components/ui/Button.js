import { motion } from "framer-motion";

export const Button = ({ children, className, ...props }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className={`bg-primary text-black font-bold py-3 px-6 rounded-full shadow-lg text-lg transition-all hover:bg-secondary ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};

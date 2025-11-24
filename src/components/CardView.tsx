import type { Card } from "../types";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  card: Card;
  hidden?: boolean;
  index?: number; // for stagger animations
};

export default function CardView({ card, hidden = false, index = 0 }: Props) {
  return (
    <AnimatePresence>
      <motion.div
        key={card.id}
        initial={{
          opacity: 0,
          y: -30,          // slide down into place (realistic)
          scale: 0.9,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            delay: index * 0.15, // cascade animation
            type: "spring",
            stiffness: 120,
            damping: 12,
          },
        }}
        exit={{ opacity: 0, scale: 0.5 }}
        style={{
          width: "60px",
          height: "90px",
          borderRadius: "6px",
          border: "2px solid #333",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontWeight: "bold",
          backgroundColor: "white",
          backfaceVisibility: "hidden",
          position: "relative",
          transformStyle: "preserve-3d",
        }}
      >

        {/* FLIP CARD REALISTIC ANIMATION */}
        <motion.div
          animate={{
            rotateY: hidden ? 180 : 0,
            transition: {
              duration: 0.45,
              ease: "easeInOut",
            },
          }}
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backfaceVisibility: "hidden",
          }}
        >
          {/* FRONT OF CARD */}
          {card.rank}{card.suit}
        </motion.div>

        {/* BACK OF CARD */}
        <motion.div
          animate={{
            rotateY: hidden ? 0 : 180,
            transition: {
              duration: 0.45,
              ease: "easeInOut",
            },
          }}
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            backgroundColor: "darkred",
            borderRadius: "6px",
            border: "2px solid #333",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "white",
            fontWeight: "bold",
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          ?
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

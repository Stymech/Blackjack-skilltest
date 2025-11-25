// src/components/CardView.tsx
import type { Card } from "../types";
import { motion, AnimatePresence } from "framer-motion";
import { getCardImagePath, getCardBackPath } from "../utils/cardUtils";

// --- DIMENSION CONSTANTS ---
const CARD_WIDTH = "90px";
const CARD_HEIGHT = "135px";
const SHADOW_OFFSET = "8px"; 

type Props = {
  card: Card;
  hidden?: boolean;
  index?: number; 
};

// Component for the Card Back (unchanged)
const CardBack: React.FC = () => (
  <img 
    src={getCardBackPath()} 
    alt="Card Back" 
    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
  />
);

// Component for the Card Face (unchanged)
const CardFace: React.FC<{ card: Card }> = ({ card }) => {
  const imagePath = getCardImagePath(card.rank, card.suit);
  const altText = `${card.rank} of ${card.suit}`;

  return (
    <img 
      src={imagePath} 
      alt={altText} 
      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
    />
  );
};


export default function CardView({ card, hidden = false, index = 0 }: Props) {
  const flipRotation = hidden ? 180 : 0; 
  
  const softShadowFilter = `
    drop-shadow(${SHADOW_OFFSET} ${SHADOW_OFFSET} 8px rgba(0, 0, 0, 0.25)) 
    drop-shadow(4px 4px 6px rgba(0, 0, 0, 0.4))
    drop-shadow(2px 2px 2px rgba(0, 0, 0, 0.6))
  `;
  
  const sideStyle: React.CSSProperties = {
    position: "absolute",
    width: "100%",
    height: "100%",
    backfaceVisibility: "hidden", 
    borderRadius: "6px",
    overflow: "hidden",
    filter: softShadowFilter,
  };

  // Calculate delays for entry animation and flip
  const entryDelay = index * 0.1;
  const flipDelay = entryDelay + 0.1; // Flip starts 0.4s after card appears

  return (
    <AnimatePresence>
      <motion.div
        key={card.id}
        layout 
        initial={{
          opacity: 0,
          y: -30, 
          scale: 0.9,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            delay: entryDelay, 
            type: "spring",
            stiffness: 120,
            damping: 12,
          },
        }}
        exit={{ opacity: 0, scale: 0.5 }}
        style={{
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
          borderRadius: "6px",
          backgroundColor: "transparent", 
          position: "relative",
          transformStyle: "preserve-3d", 
          zIndex: 2, 
          overflow: 'visible',
          cursor: 'default',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
        }}
      >
        <motion.div
          initial={{
            rotateY: hidden ? 180 : 180, // Always start face down (180°)
          }}
          animate={{
            rotateY: flipRotation, // Flip to final state
            transition: {
              delay: flipDelay, // Delay the flip
              duration: 0.7, 
              ease: "easeInOut",
            },
          }}
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            transformStyle: "preserve-3d",
          }}
        >
          <div style={sideStyle}>
            <CardFace card={card} />
          </div>

          <div 
            style={{ 
              ...sideStyle,
              transform: "rotateY(180deg)", 
            }}
          >
            <CardBack />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
import type { Card } from "../types";
import CardView from "./CardView";

type Props = {
  cards: Card[];
  hideFirst?: boolean;
};

export default function HandView({ cards, hideFirst = false }: Props) {
  return (
    <div style={{ display: "flex", gap: "10px" }}>
      {cards.map((card, i) => (
        <CardView
          key={card.id}
          card={card}
          hidden={hideFirst && i === 0}
          index={i} // pass index for stagger animation
        />
      ))}
    </div>
  );
}

// src/utils/deck.ts
import type { Card, Rank, Suit } from '../types';

const SUITS: Suit[] = ['♠', '♥', '♦', '♣'];
const RANKS: Rank[] = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];

export function createShoe(decks = 4): Card[] {
  const cards: Card[] = [];

  for (let d = 0; d < decks; d++) {
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        cards.push({
          id: `${d}-${suit}-${rank}-${Math.random().toString(36).slice(2, 7)}`,
          suit,
          rank,
        });
      }
    }
  }

  return shuffle(cards);
}

// Fisher-Yates shuffle (perfect shuffle)
export function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Remove N cards from top of shoe
export function draw(shoe: Card[], count = 1) {
  const drawn = shoe.slice(0, count);
  const rest = shoe.slice(count);
  return { drawn, shoe: rest };
}

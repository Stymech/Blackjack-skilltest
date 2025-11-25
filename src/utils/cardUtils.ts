// src/utils/cardUtils.ts (as previously defined)
import type { Rank, Suit } from '../types';

const SVG_RANK_MAP: Record<Rank, string> = {
  '10': 'T', 'A': 'A', '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7', '8': '8', '9': '9', 
  'J': 'J', 'Q': 'Q', 'K': 'K',
};

export function getCardImagePath(rank: Rank, suit: Suit): string {
  const svgRank = SVG_RANK_MAP[rank];
  return `/cards/${svgRank}${suit}.svg`; 
}

export function getCardBackPath(): string {
  return '/cards/1B.svg'; 
}
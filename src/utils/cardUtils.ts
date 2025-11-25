// src/utils/cardUtils.ts
import type { Rank, Suit } from '../types';

const SVG_RANK_MAP: Record<Rank, string> = {
  '10': 'T', 'A': 'A', '2': '2', '3': '3', '4': '4', '5': '5', 
  '6': '6', '7': '7', '8': '8', '9': '9', 'J': 'J', 'Q': 'Q', 'K': 'K',
};

// HELPER: grabs the base path automatically (e.g. "/Blackjack-skilltest/" or "/")
const BASE_URL = import.meta.env.BASE_URL;

export function getCardImagePath(rank: Rank, suit: Suit): string {
  const svgRank = SVG_RANK_MAP[rank];
  // Remove the leading slash and use BASE_URL instead
  return `${BASE_URL}cards/${svgRank}${suit}.svg`; 
}

export function getCardBackPath(): string {
  // Remove the leading slash and use BASE_URL instead
  return `${BASE_URL}cards/1B.svg`; 
}
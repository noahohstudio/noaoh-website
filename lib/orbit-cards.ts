export type OrbitCard = {
  id: number;
};

// Blank placeholders for now — will be swapped for poster designs,
// project assets, and other eye candy later.
export const orbitCards: OrbitCard[] = Array.from({ length: 32 }, (_, i) => ({
  id: i,
}));

// Index of the card that detaches from orbit and grows to cover the
// viewport as the user scrolls from the orbit hero into the next section.
export const TRANSITION_CARD_INDEX = 0;

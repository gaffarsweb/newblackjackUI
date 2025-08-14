export const calculateScore = (cards) => {
  let score = 0;
  let aces = 0;

  for (let card of cards) {
    if (card.value === 'A') {
      aces++;
      score += 11;
    } else if (['J', 'Q', 'K'].includes(card.value)) {
      score += 10;
    } else {
      score += parseInt(card.value, 10);
    }
  }

  while (score > 21 && aces > 0) {
    score -= 10;
    aces--;
  }

  return score;
};

// const suits = ['♠', '♥', '♦', '♣'];
// const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

// // export const createDeck = () => {
// //   const newDeck = [];
// //   for (let suit of suits) {
// //     for (let value of values) {
// //       newDeck.push({ suit, value, id: `${suit}-${value}-${Math.random()}` });
// //     }
// //   }
// //   return shuffleDeck(newDeck);
// // };

// const shuffleDeck = (deck) => {
//   const shuffled = [...deck];
//   for (let i = shuffled.length - 1; i > 0; i--) {
//     const j = Math.floor(Math.random() * (i + 1));
//     [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
//   }
//   return shuffled;
// };

import { useState, useEffect, useRef } from "react";
import { Button, Box, TextField, InputAdornment } from "@mui/material";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

import {
  playShuffleSound,
  playCardSlideSound,
  playCardPlacingSound,
  playCardFlipSound,
  buttonClickSoundFn,
  clearSoundQueue,
  cardSetRemovingFn
} from "../sound/soundManager";

import bitImg from "../assets/img/bit.svg";
import doubleImg from "../assets/img/double.svg";
import handImg from "../assets/img/hand.svg";
import hitImg from "../assets/img/hit.svg";
import x12Img from "../assets/img/1_2xImg.svg";
import splitImg from "../assets/img/split.svg";
import bg_Game_Logo from "../assets/img/bg_Game_Logo.png";
import centerLogo from "../assets/img/centerLogo.svg";
import Footer from "./Statistics";
import { Card, CardForMobail, DeckDisplay } from "./BlackjackGameAssets";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import io from "socket.io-client";
import chipReset from "../assets/img/chip-reset.svg";
import chip1 from "../assets/img/chip-1.svg";
import chip5 from "../assets/img/chip-5.svg";
import chip25 from "../assets/img/chip-25.svg";
import chip100 from "../assets/img/chip-100.svg";
import chip200 from "../assets/img/chip-200.svg";

import {
  TABLE_UPDATED,
  CARD_RECEIVED,
  GAME_START,
  END_HAND,
  STAY,
  FETCH_LOBBY_INFO,
  RECEIVE_LOBBY_INFO,
  DISCONNECT,
  PLAYERS_UPDATED,
  SIT_DOWN,
  DOUBLE,
  HIT,
  ASK_INSURANCE,
  ACCEPT_INSURANCE,
  REJECT_INSURANCE,
  SPLIT,
  ALERT,
} from "../socket/actions";
import { green, red } from "@mui/material/colors";
import Statistics from "./Statistics";
import BlackjackOriginal from "./BlackjackOriginal";

const BlackjackGame = () => {
  const [gameState, setGameState] = useState("betting");
  const [playerCards, setPlayerCards] = useState([]);
  const [playerCards2, setPlayerCards2] = useState([]);
  const [dealerCards, setDealerCards] = useState([]);

  const [betInput, setBetInput] = useState("");
  const [betAmount, setBetAmount] = useState(1);
  const [playerScore, setPlayerScore] = useState(0);
  const [playerScore2, setPlayerScore2] = useState(0);
  const [dealerScore, setDealerScore] = useState(0);
  const [isDealing, setIsDealing] = useState(false);
  const [gameMessage, setGameMessage] = useState("");
  const [soundEnabled] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [playerBorderColor, setPlayerBorderColor] = useState("black");
  const [playerBorderColor2, setPlayerBorderColor2] = useState("black");
  const [playerBorderWidth, setPlayerBorderWidth] = useState(0);
  const [playerBorderWidth2, setPlayerBorderWidth2] = useState(0);
  const [isBlackjack, setIsBlackjack] = useState(false);
  const [isBlackjack2, setIsBlackjack2] = useState(false);

  //socket things
  const [socket, setSocket] = useState(null);
  const [socketId, setSocketId] = useState(null);
  const [tableId, setTableId] = useState(0);
  const btnClickRef = useRef(false);

  const [gameObject, setGameObject] = useState(null);
  const timerRef = useRef(null);
  useEffect(() => {
    window.addEventListener("beforeunload", cleanUp);
    window.addEventListener("beforeclose", cleanUp);
    return () => cleanUp();
    // eslint-disable-next-line
  }, []);
  const fadeOut = () => {
    return new Promise((resolve) => {
      // alert('sound called')
      setIsFadingOut(true); // tells Card to start fade animation
      if (soundEnabled) cardSetRemovingFn();
      setTimeout(() => {
        setIsFadingOut(false); // reset after fade
        resolve();
      }, 500); // match CSS animation time
    });
  };
  const betAndStartGame = async () => {
    console.log("call to start game");

    if (!socket) return;
    if (btnClickRef.current) return;
    if (playerCards.length > 0) {
      await fadeOut()
    } else {
      if (soundEnabled) buttonClickSoundFn();
    }

    setPlayerBorderColor("black")
    setPlayerBorderColor2("black")
    setPlayerBorderWidth(0)
    setPlayerBorderWidth2(0)
    setPlayerScore(0)
    setPlayerScore2(0)
    setDealerScore(0)

    setPlayerCards([]);
    setPlayerCards2([]);
    setDealerCards([])

    btnClickRef.current = true;

    socket.emit(SIT_DOWN, { amount: 2 });
    setTimeout(() => {
      btnClickRef.current = false;
    }, 1100);
  };

  const stay = () => {
    if (!socket) return;

    if (btnClickRef.current) return;
    if (soundEnabled) buttonClickSoundFn();
    btnClickRef.current = true;

    socket.emit(STAY, tableId);
    setTimeout(() => {
      btnClickRef.current = false;
    }, 500);
  };

  const split = () => {
    if (!socket) return;

    if (btnClickRef.current) return;
    if (soundEnabled) buttonClickSoundFn();
    btnClickRef.current = true;

    socket.emit(SPLIT, tableId);
    setTimeout(() => {
      btnClickRef.current = false;
    }, 500);
  };
  const hit = () => {
    if (!socket) return;
    if (btnClickRef.current) return;
    if (soundEnabled) buttonClickSoundFn();
    btnClickRef.current = true;

    socket.emit(HIT, tableId);
    setTimeout(() => {
      btnClickRef.current = false;
    }, 500);
  };

  const double = () => {
    if (!socket) return;
    if (btnClickRef.current) return;
    if (soundEnabled) buttonClickSoundFn();
    btnClickRef.current = true;

    socket.emit(DOUBLE, tableId);
    setTimeout(() => {
      btnClickRef.current = false;
    }, 500);
  };
  const AcceptInsurance = () => {
    if (!socket) return;
    if (btnClickRef.current) return;
    if (soundEnabled) buttonClickSoundFn();
    btnClickRef.current = true;

    socket.emit(ACCEPT_INSURANCE, tableId);
    setTimeout(() => {
      btnClickRef.current = false;
    }, 500);
  };
  const RejectInsurance = () => {
    if (!socket) return;
    if (btnClickRef.current) return;
    if (soundEnabled) buttonClickSoundFn();
    btnClickRef.current = true;

    socket.emit(REJECT_INSURANCE, tableId);
    setTimeout(() => {
      btnClickRef.current = false;
    }, 500);
  };

  useEffect(() => {
    const webSocket = socket || connect();

    webSocket && webSocket.emit(FETCH_LOBBY_INFO, "testuser");

    return () => cleanUp();
    // eslint-disable-next-line
  }, []);

  function cleanUp() {
    window.socket && window.socket.emit(DISCONNECT);
    window.socket && window.socket.close();
    setSocket(null);
    setSocketId(null);
  }

  function connect() {
    try {
      const socket =
        //this is game port
        // io("http://192.168.1.7:4000", {
        io("http://moneytree-api.testsdlc.in/", {
          path: "/socket.io", // Ensure the correct path is used
          transports: ["websocket"], // WebSocket only
          upgrade: false, // If your server only supports WebSocket
          query: {
            playerId: `e39f65ee-5369-42e1-98af-6dda6202f13b` + new Date(),
          },
          reconnection: true, // Enable automatic reconnection
          reconnectionDelay: 5000, // Retry connection after 5 seconds
          reconnectionDelayMax: 5000, // Maximum delay between retries
          timeout: 20000, // Timeout for initial connection
        });

      console.log("socket-----", socket);
      registerCallbacks(socket);
      setSocket(socket);
      window.socket = socket;
      return socket;
    } catch (e) {
      console.log("while socket connection error--------", e);
    }
  }

  function registerCallbacks(socket) {
    socket.on("connect", () => {
      console.log("Successfully connected to the Socket.IO server");
    });

    // Handle connection errors
    socket.on("connect_error", (err) => {
      console.log("Connection Error:", err);
    });

    // Exam

    socket.on("connection", (players) => {
      socket.emit(FETCH_LOBBY_INFO, "TestSdlc");
    });

    socket.on(ALERT, (data) => {
      console.log(ALERT, data);
      toast.error(data?.message, {
        position: "top-right",
        autoClose: 2000,
      });
    });

    //enroll user

    socket.on(RECEIVE_LOBBY_INFO, ({ tables, players, socketId }) => {
      console.log(RECEIVE_LOBBY_INFO, tables, players, socketId);
      setSocketId(socketId);
    });

    socket.on(PLAYERS_UPDATED, (players) => {
      console.log(PLAYERS_UPDATED, players);
    });

    socket.on(TABLE_UPDATED, (data) => {
      console.log(TABLE_UPDATED, data);
      setGameObject(data?.table);
      setTableId(data?.table?.id);
    });

    socket.on(SPLIT, (data) => {
      console.log(SPLIT, data);
      setGameObject(data?.table);
      splitCards(data?.table);
    });

    socket.on(GAME_START, (data) => {
      console.log(GAME_START, data);
      setGameObject(data?.table);
      setTableId(data?.table?.id);

      dealInitialCards(data?.table);
    });

    socket.on(CARD_RECEIVED, (data) => {
      console.log(CARD_RECEIVED, data);
      setGameObject(data?.table);

      dealExtraCards(data?.table);

    });

    socket.on(STAY, (data) => {
      console.log(STAY, data);
      setGameObject(data?.table);
    });

    socket.on(ACCEPT_INSURANCE, (data) => {
      console.log(ACCEPT_INSURANCE, data);
      setGameObject(data?.table);
    });
    socket.on(ASK_INSURANCE, (data) => {
      console.log(ASK_INSURANCE, data);
      setGameObject(data?.table);
    });

    socket.on(REJECT_INSURANCE, (data) => {
      console.log(REJECT_INSURANCE, data);
      setGameObject(data?.table);
    });

    socket.on(END_HAND, (data) => {
      console.log(END_HAND, data);
      setGameObject(data?.table);
      dealExtraCards(data?.table);
    });
  }

  useEffect(() => {
    const initAudio = () => {
      playShuffleSound();
      document.removeEventListener("click", initAudio);
      document.removeEventListener("touchstart", initAudio);
    };

    document.addEventListener("click", initAudio);
    document.addEventListener("touchstart", initAudio);

    return () => {
      document.removeEventListener("click", initAudio);
      document.removeEventListener("touchstart", initAudio);
    };
  }, []);

  //set Split cards
  const splitCards = (data) => {
    // if (soundEnabled) playShuffleSound();

    // Clear previous player cards (keeping the first card visible)
    clearSoundQueue();

    if (soundEnabled) {
      playShuffleSound(true, 0);
      playCardPlacingSound(true, 100);
    }
    setPlayerCards([]);
    setPlayerCards2([]);

    // First set of cards (without animation)
    setPlayerCards([
      {
        ...data?.seats[2]?.hand[0],
        animate: false, // Disable animation for this card
        noAnimation: true, // Disable animation for this card
      },
    ]);

    setPlayerCards2([
      {
        ...data?.seats[2]?.hand2[0],
        animate: false, // Disable animation for this card
        noAnimation: true, // Disable animation for this card
      },
    ]);

    // Add a small delay before updating the second set of cards for staggered animation
    setTimeout(() => {
      // Second set of cards (with animation)
      if (soundEnabled) {
        playCardSlideSound(true, 0);
      }
      setPlayerCards((prevCards) => [
        ...prevCards, // Keep the first card from prevCards
        {
          ...data?.seats[2]?.hand[1],
          animate: true, // Enable animation for this card
          noAnimation: false, // Enable animation for this card
        },
      ]);

      setPlayerCards2((prevCards) => [
        ...prevCards, // Keep the first card from prevCards
        {
          ...data?.seats[2]?.hand2[1],
          animate: true, // Enable animation for this card
          noAnimation: false, // Enable animation for this card
        },
      ]);
    }, 200); // 200 ms delay for staggered animation

    // Finalize after animation (e.g., after cards are dealt)
    setTimeout(() => {
      // Update player scores after a slight delay
      setPlayerScore2(data?.seats[2]?.points2);
      setPlayerScore(data?.seats[2]?.points);
      setTimeout(() => {
        clearSoundQueue();
      }, 100);
    }, 500); // Adjust timing if more cards are dealt later
  };

  // DEALING INITIAL HANDS
  const dealInitialCards = (data) => {
    setIsDealing(true);
    setGameState("dealing");
    setGameMessage("");

    // if (soundEnabled) playShuffleSound();
    clearSoundQueue();
    if (soundEnabled) {
      playShuffleSound(true, 0);
      playCardSlideSound(true, 150);
      playCardSlideSound(true, 300);
    }

    setPlayerCards([]);
    setDealerCards([]);
    setPlayerCards2([]);


    setPlayerCards([{ ...data?.seats[2]?.hand[0], animate: true }]);
    // Staggered deal animation
    setTimeout(() => {
      setDealerCards([{ ...data?.seats[1]?.hand[0], animate: true }]);
    }, 400);
    // setDealerCards([{ ...data?.seats[1]?.hand[0], animate: true }]);



    // Finalize after animation (e.g., 600ms delay)
    setTimeout(() => {
      //setIsDealing(false);
      setDealerScore(data?.seats[1]?.points);
      setPlayerScore(data?.seats[2]?.points);
      setIsDealing(false);

      // Clear sounds after dealing completes
      setTimeout(() => {
        clearSoundQueue();
      }, 100);
    }, 500); // Adjust timing if more cards are dealt later
  };

  // DEALING INITIAL HANDS
  const dealExtraCards = (data) => {
    setIsDealing(true);
    setGameState("dealing");
    setGameMessage("");
    clearSoundQueue();

    if (soundEnabled) {
      const newDealerCards = data?.seats[1].hand.filter((card, index) =>
        !dealerCards[index] || dealerCards[index].rank !== card.rank || dealerCards[index].suit !== card.suit
      );

      const newPlayerCards = data?.seats[2].hand.filter((card, index) =>
        !playerCards[index] || playerCards[index].rank !== card.rank || playerCards[index].suit !== card.suit
      );

      const newPlayerCards2 = data?.seats[2]?.hand2?.filter((card, index) =>
        !playerCards2[index] || playerCards2[index].rank !== card.rank || playerCards2[index].suit !== card.suit
      ) || [];

      const totalNewCards = newDealerCards.length + newPlayerCards.length + newPlayerCards2.length;

      if (totalNewCards > 0) {
        const hasCardFlip = dealerCards.some(card => card.rank === "hidden") &&
          (data?.handOver || data?.seats[2]?.standUp);

        if (hasCardFlip) {
          playCardFlipSound(true, 0);
        }

        let soundDelay = hasCardFlip ? 200 : 0;
        for (let i = 0; i < Math.min(totalNewCards, 3); i++) { // Limit to 3 sounds max
          playCardSlideSound(true, soundDelay + (i * 150));
        }
      }
    }
    // if (soundEnabled) playShuffleSound();


    setPlayerCards((currPlayer) => {
      const existingKeys = new Set(
        currPlayer.map((card) => `${card.suit}-${card.rank}`)
      );

      const uniqueNewCards = data?.seats[2].hand.filter(
        (card) => !existingKeys.has(`${card.suit}-${card.rank}`)
      );

      const updatedDealer = [
        ...currPlayer,
        ...uniqueNewCards.map((card) => ({ ...card, animate: true })),
      ];

      return updatedDealer;
    });

    setPlayerCards2((currPlayer) => {
      const existingKeys = new Set(
        currPlayer.map((card) => `${card.suit}-${card.rank}`)
      );

      const uniqueNewCards = data?.seats[2]?.hand2?.filter(
        (card) => !existingKeys.has(`${card.suit}-${card.rank}`)
      );

      const updatedDealer = [
        ...currPlayer,
        ...uniqueNewCards.map((card) => ({ ...card, animate: true })),
      ];

      return updatedDealer;
    });

    if (data?.handOver || data?.seats[2]?.standUp) {
      setTimeout(() => {

        setDealerCards((currDealer) => {
          const newHand = data?.seats[1].hand;

          // Find hidden card index
          const hiddenIndex = currDealer.findIndex(
            (card) => card.suit === "hidden" && card.rank === "hidden"
          );

          // If hidden card exists and we have a replacement for it
          if (hiddenIndex !== -1 && newHand.length >= hiddenIndex + 1) {
            const replacementCard = newHand[hiddenIndex];

            // Replace in the same index → no flicker
            const updated = [...currDealer];
            updated[hiddenIndex] = {
              ...replacementCard,
              animate: true, // trigger flip
            };
            return updated;
          }

          // Otherwise, handle normal case without removing existing cards prematurely
          const existingKeys = new Set(
            currDealer.map((card) => `${card.suit}-${card.rank}`)
          );

          const uniqueNewCards = newHand.filter(
            (card) =>
              card.suit !== "hidden" &&
              card.rank !== "hidden" &&
              !existingKeys.has(`${card.suit}-${card.rank}`)
          );

          if (uniqueNewCards.length === 0) {
            return currDealer; // no change, avoid re-render
          }

          return [
            ...currDealer,
            ...uniqueNewCards.map((card) => ({ ...card, animate: true })),
          ];
        });
      }, data?.seats[2]?.standUp ? 200 : 800);

    } else {
      //set dealer cards



      setTimeout(() => {
        // if (soundEnabled) playCardSlideSound();
        setDealerCards((currDealer) => {
          const existingKeys = new Set(
            currDealer.map((card) => `${card.suit}-${card.rank}`)
          );

          const uniqueNewCards = data?.seats[1].hand.filter(
            (card) => !existingKeys.has(`${card.suit}-${card.rank}`)
          );

          const updatedDealer = [
            ...currDealer,
            ...uniqueNewCards.map((card) => ({
              ...card,

              animate: card?.rank === "hidden" ? false : true,
            })),
          ];

          return updatedDealer;
        });
      }, 200);



    }

    //set player cards




    // Finalize after animation (e.g., 600ms delay)
    setTimeout(() => {
      setIsDealing(false);
      setDealerScore(data?.seats[1]?.points);
      setPlayerScore(data?.seats[2]?.points);
      setPlayerScore2(data?.seats[2]?.points2);
      setTimeout(() => {
        clearSoundQueue();
      }, 200);
    }, 700); // Adjust timing if more cards are dealt later

    console.log(
      "checker----",
      data?.seats[2]?.hand?.length,
      new Set(data?.seats[2]?.hand?.map((card) => `${card.rank}`)).size
    );
  };

  useEffect(() => {
    setTimeout(() => {
      if (gameObject) {
        const playerSeat = gameObject?.seats?.[2];
        const dealerSeat = gameObject?.seats?.[1];

        const pPts = playerScore;
        const pPts2 = playerScore2;
        const dPts = dealerScore;
        const isBlackjack =
          (playerCards?.length >= 2 && pPts === 21) || pPts2 == 21;

        // Prefer explicit server flags
        if (pPts > 21) {
          setPlayerBorderColor("red");
          setPlayerBorderWidth(3);
          console.log("player 1 busted");
        }
        if (pPts2 > 21) {
          setPlayerBorderColor2("red");
          setPlayerBorderWidth2(3);
          console.log("player 1  hand 2 busted");
        }

        if (pPts < 21) {
          setPlayerBorderColor("black");
          setPlayerBorderWidth(0);
          console.log("player 1 not busted");
        }
        if (pPts2 < 21) {
          setPlayerBorderColor2("black");
          setPlayerBorderWidth2(0);
          console.log("player 1  hand 2 not busted");
        }
        if (pPts2 == 21) {
          setPlayerBorderColor2(isBlackjack2 ? "#00E900" : "#0BF191");
          setPlayerBorderWidth2(3);
          console.log("player 2 hand  won");
        }
        if (pPts == 21) {
          setPlayerBorderColor(isBlackjack ? "#00E900" : "#0BF191");
          setPlayerBorderWidth(3);
          console.log("player 2 hand 1  won");
        }

        if (playerSeat?.lastAction == "WINNER" && !playerSeat.isSplit && gameObject?.handOver) {
          setPlayerBorderColor("#00E900");
          setPlayerBorderWidth(3);
          console.log("player 2 hand 1  won");
        }
        if (dealerSeat?.lastAction == "WINNER" && !playerSeat.isSplit && gameObject?.handOver) {
          setPlayerBorderColor('red');
          setPlayerBorderWidth(3);
          console.log("player 2 hand 1  won");
        }
        if (pPts <= 21 && dPts == pPts && !playerSeat.isSplit && gameObject?.handOver) {
          setPlayerBorderColor("yellow");
          setPlayerBorderWidth(3);
          console.log("player tie");
        }

        if (pPts < 21 && playerSeat?.isSplit && playerSeat?.selectedHand == 1) {
          setPlayerBorderColor("blue");
          setPlayerBorderWidth(3);
          console.log("player 2 hand  1 current selection");
        }
        if (
          pPts2 < 21 &&
          playerSeat?.isSplit &&
          playerSeat?.selectedHand == 2
        ) {
          setPlayerBorderColor2("blue");
          setPlayerBorderWidth2(3);
          console.log("player 2 hand  1 current selection");
        }

        // else if (dealerSeat?.lastAction === "WINNER") {
        //   playerBorderColor = "red";
        //   playerBorderWidth = 3;
        // }
        // else if (
        //   playerSeat?.lastAction === "PUSH" ||
        //   dealerSeat?.lastAction === "PUSH" ||
        //   (playerSeat?.lastAction === "TIE") ||
        //   (pPts != null && dPts != null && pPts === dPts)
        // ) {
        //   playerBorderColor = "grey";
        //   playerBorderWidth = 3;
        // }

        // else if (
        //   playerSeat?.lastAction == null &&
        //   dealerSeat?.lastAction == null &&
        //   !playerSeat?.isBusted
        // ) {
        //   if (pPts != null && dPts != null) {
        //     const fallbackIsBusted = pPts > 21;

        //     if (fallbackIsBusted) {
        //       playerBorderColor = "red";
        //       playerBorderWidth = 3;
        //     } else if (isBlackjack && dPts !== 21) {
        //       playerBorderColor = "#00E900";
        //       playerBorderWidth = 3;
        //     } else if (dPts > 21) {
        //       playerBorderColor = "#0BF191";
        //       playerBorderWidth = 3;
        //     } else if (pPts > dPts) {
        //       playerBorderColor = "#0BF191";
        //       playerBorderWidth = 3;
        //     } else if (pPts < dPts) {
        //       playerBorderColor = "red";
        //       playerBorderWidth = 3;
        //     } else {
        //       playerBorderColor = "grey";
        //       playerBorderWidth = 3;
        //     }
        //   }
        //}
      }

      setIsBlackjack(playerScore === 21 && playerCards.length >= 2);
      setIsBlackjack2(playerScore2 === 21 && playerCards2.length >= 2);
    }, 200);
  }, [playerScore2, playerScore, dealerScore, gameObject]);
  // responsive css

  const [isMobile, setIsMobile] = useState(false);
  const [isSmallMobail, setisSmallMobail] = useState(false);
  const [isBigerMobail, setIsBigerMobail] = useState(false);
  const [IsTablet, setIsTablet] = useState(false);
  const [isBigTablet, setisBigTablet] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setisSmallMobail(window.innerWidth <= 380);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  useEffect(() => {
    const checkMobile = () => {
      setisBigTablet(window.innerWidth >= 661 && window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  useEffect(() => {
    const checkMobile = () => {
      setIsTablet(window.innerWidth >= 551 && window.innerWidth <= 660);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  useEffect(() => {
    const checkMobile = () => {
      setIsBigerMobail(window.innerWidth >= 440 && window.innerWidth <= 550);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // const bottomValues = {
  //   bigMobile: {
  //     1: '10vw',
  //     2: '10vw',
  //     3: '11vw',
  //     4: '12vw',
  //     5: '13vw',
  //     default: '13vw',
  //     handTwo: {
  //       1: '10vw',
  //       2: '10vw',
  //       3: '11vw',
  //       4: '12vw',
  //       5: '13vw',
  //       default: '13vw'
  //     }
  //   },
  //   mobile: {
  //     1: '2vw',
  //     2: '4vw',
  //     3: '6vw',
  //     4: '6vw',
  //     5: '6vw',
  //     default: '7vw'
  //   },
  //   smallMobail: {
  //     1: '7vw',
  //     2: '8vw',
  //     3: '9vw',
  //     4: '11vw',
  //     5: '12vw',
  //     default: '13vw'
  //   },
  //   tablet: {
  //     1: '6vw',
  //     2: '7vw',
  //     3: '8vw',
  //     4: '9vw',
  //     5: '10vw',
  //     default: '10vw'
  //   },
  //   bigTablet: {
  //     1: '8vw',
  //     2: '7vw',
  //     3: '8vw',
  //     4: '9vw',
  //     5: '10vw',
  //     default: '11vw'
  //   }
  // };
  // const bottomValues2 = {
  //   bigMobile: {
  //     1: '40vw',
  //     2: '40vw',
  //     3: '42vw',
  //     4: '43vw',
  //     5: '43vw',
  //     default: '44vw'
  //   },
  //   mobile: {
  //     1: '28vw',
  //     2: '28vw',
  //     3: '30vw',
  //     4: '31vw',
  //     5: '31vw',
  //     default: '32vw'
  //   },
  //   smallMobail: {
  //     1: '28vw',
  //     2: '28vw',
  //     3: '30vw',
  //     4: '31vw',
  //     5: '31vw',
  //     default: '32vw'
  //   },
  //   tablet: {
  //     1: '36vw',
  //     2: '36vw',
  //     3: '38vw',
  //     4: '40vw',
  //     5: '41vw',
  //     default: '42vw'
  //   },
  //   bigTablet: {
  //     1: '33vw',
  //     2: '33vw',
  //     3: '34vw',
  //     4: '35vw',
  //     5: '36vw',
  //     default: '37vw'
  //   },
  // };

  // const leftValues = {
  //   bigMobile: {
  //     1: '0vw',
  //     2: '0vw',
  //     3: '2vw',
  //     4: '3vw',
  //     5: '4vw',
  //     default: '5vw'
  //   },
  //   mobile: {
  //     1: '2vw',
  //     2: '2vw',
  //     3: '5vw',
  //     4: '6vw',
  //     5: '7vw',
  //     default: '8vw'
  //   },
  //   smallMobail: {
  //     1: '2vw',
  //     2: '2vw',
  //     3: '5vw',
  //     4: '6vw',
  //     5: '7vw',
  //     default: '8vw'
  //   },
  //   tablet: {
  //     1: '2vw',
  //     2: '2vw',
  //     3: '5vw',
  //     4: '6vw',
  //     5: '7vw',
  //     default: '8vw'
  //   },
  //   bigTablet: {
  //     1: '2vw',
  //     2: '2vw',
  //     3: '5vw',
  //     4: '6vw',
  //     5: '7vw',
  //     default: '8vw'
  //   },
  // };
  // const leftValues2 = {
  //   bigMobile: {
  //     1: '27vw',
  //     2: '29vw',
  //     3: '33vw',
  //     4: '35vw',
  //     5: '36vw',
  //     default: '37vw'
  //   },
  //   mobile: {
  //     1: '27vw',
  //     2: '29vw',
  //     3: '33vw',
  //     4: '35vw',
  //     5: '36vw',
  //     default: '37vw'
  //   },
  //   smallMobail: {
  //     1: '27vw',
  //     2: '29vw',
  //     3: '33vw',
  //     4: '35vw',
  //     5: '36vw',
  //     default: '37vw'
  //   },
  //   tablet: {
  //     1: '27vw',
  //     2: '29vw',
  //     3: '33vw',
  //     4: '35vw',
  //     5: '36vw',
  //     default: '37vw'
  //   },
  //   bigTablet: {
  //     1: '27vw',
  //     2: '29vw',
  //     3: '33vw',
  //     4: '35vw',
  //     5: '36vw',
  //     default: '37vw'
  //   },
  // };


  const bottomValues = {
    bigMobile: {
      1: '10vw',
      2: '10vw',
      3: '11vw',
      4: '12vw',
      5: '13vw',
      6: '14vw',  // Added
      7: '15vw',  // Added
      default: '14vw', // Updated default
      handTwo: {
        1: '10vw',
        2: '10vw',
        3: '11vw',
        4: '12vw',
        5: '13vw',
        6: '14vw',  // Added
        7: '15vw',  // Added
        default: '14vw' // Updated default
      }
    },
    mobile: {
      1: '2vw',
      2: '4vw',
      3: '6vw',
      4: '6vw',
      5: '6vw',
      6: '7vw',  // Added
      7: '8vw',  // Added
      default: '8vw', // Updated default
      handTwo: {
        1: '2vw',
        2: '4vw',
        3: '6vw',
        4: '6vw',
        5: '6vw',
        6: '7vw',  // Added
        7: '8vw',  // Added
        default: '8vw' // Updated default
      }
    },
    smallMobail: {
      1: '4vw',
      2: '6vw',
      3: '7vw',
      4: '8vw',
      5: '8vw',
      6: '9vw',  // Added
      7: '10vw',  // Added
      default: '11vw', // Updated default
      handTwo: {
        1: '6vw',
        2: '7vw',
        3: '8vw',
        4: '9vw',
        5: '11vw',
        6: '12vw',  // Added
        7: '13vw',  // Added
        default: '14vw' // Updated default
      }
    },
    tablet: {
      1: '6vw',
      2: '7vw',
      3: '8vw',
      4: '9vw',
      5: '10vw',
      6: '11vw',  // Added
      7: '12vw',  // Added
      default: '12vw', // Updated default
      handTwo: {
        1: '6vw',
        2: '7vw',
        3: '8vw',
        4: '9vw',
        5: '10vw',
        6: '11vw',  // Added
        7: '12vw',  // Added
        default: '12vw' // Updated default
      }
    },
    bigTablet: {
      1: '8vw',
      2: '7vw',
      3: '8vw',
      4: '9vw',
      5: '10vw',
      6: '11vw',  // Added
      7: '12vw',  // Added
      default: '12vw', // Updated default
      handTwo: {
        1: '8vw',
        2: '7vw',
        3: '8vw',
        4: '9vw',
        5: '10vw',
        6: '11vw',  // Added
        7: '12vw',  // Added
        default: '12vw' // Updated default
      }
    }
  };

  const bottomValues2 = {
    bigMobile: {
      1: '40vw',
      2: '40vw',
      3: '42vw',
      4: '43vw',
      5: '43vw',
      6: '44vw',  // Added
      7: '45vw',  // Added
      default: '45vw', // Updated default
      handTwo: {
        1: '40vw',
        2: '40vw',
        3: '42vw',
        4: '43vw',
        5: '43vw',
        6: '44vw',  // Added
        7: '45vw',  // Added
        default: '45vw' // Updated default
      }
    },
    mobile: {
      1: '28vw',
      2: '28vw',
      3: '30vw',
      4: '31vw',
      5: '31vw',
      6: '32vw',  // Added
      7: '33vw',  // Added
      default: '33vw', // Updated default
      handTwo: {
        1: '28vw',
        2: '28vw',
        3: '30vw',
        4: '31vw',
        5: '31vw',
        6: '32vw',  // Added
        7: '33vw',  // Added
        default: '33vw' // Updated default
      }
    },
    smallMobail: {
      1: '28vw',
      2: '28vw',
      3: '30vw',
      4: '31vw',
      5: '31vw',
      6: '32vw',  // Added
      7: '33vw',  // Added
      default: '33vw', // Updated default
      handTwo: {
        1: '28vw',
        2: '28vw',
        3: '30vw',
        4: '31vw',
        5: '31vw',
        6: '32vw',  // Added
        7: '33vw',  // Added
        default: '33vw' // Updated default
      }
    },
    tablet: {
      1: '36vw',
      2: '36vw',
      3: '38vw',
      4: '40vw',
      5: '41vw',
      6: '42vw',  // Added
      7: '43vw',  // Added
      default: '43vw', // Updated default
      handTwo: {
        1: '36vw',
        2: '36vw',
        3: '38vw',
        4: '40vw',
        5: '41vw',
        6: '42vw',  // Added
        7: '43vw',  // Added
        default: '43vw' // Updated default
      }
    },
    bigTablet: {
      1: '33vw',
      2: '33vw',
      3: '34vw',
      4: '35vw',
      5: '36vw',
      6: '37vw',  // Added
      7: '38vw',  // Added
      default: '38vw', // Updated default
      handTwo: {
        1: '33vw',
        2: '33vw',
        3: '34vw',
        4: '35vw',
        5: '36vw',
        6: '37vw',  // Added
        7: '38vw',  // Added
        default: '38vw' // Updated default
      }
    }
  };

  const leftValues = {
    bigMobile: {
      1: '0vw',
      2: '0vw',
      3: '2vw',
      4: '3vw',
      5: '4vw',
      6: '5vw',  // Added
      7: '6vw',  // Added
      default: '6vw', // Updated default
      handTwo: {
        1: '0vw',
        2: '0vw',
        3: '2vw',
        4: '3vw',
        5: '4vw',
        6: '5vw',  // Added
        7: '6vw',  // Added
        default: '6vw' // Updated default
      }
    },
    mobile: {
      1: '2vw',
      2: '2vw',
      3: '5vw',
      4: '6vw',
      5: '7vw',
      6: '8vw',  // Added
      7: '9vw',  // Added
      default: '9vw', // Updated default
      handTwo: {
        1: '2vw',
        2: '2vw',
        3: '5vw',
        4: '6vw',
        5: '7vw',
        6: '8vw',  // Added
        7: '9vw',  // Added
        default: '9vw' // Updated default
      }
    },
    smallMobail: {
      1: '2vw',
      2: '3vw',
      3: '5vw',
      4: '7vw',
      5: '8vw',
      6: '9vw',  // Added
      7: '10vw', // Added
      default: '10vw', // Updated default
      handTwo: {
        1: '2vw',
        2: '2vw',
        3: '5vw',
        4: '6vw',
        5: '7vw',
        6: '8vw',  // Added
        7: '9vw',  // Added
        default: '9vw' // Updated default
      }
    },
    tablet: {
      1: '2vw',
      2: '2vw',
      3: '5vw',
      4: '6vw',
      5: '7vw',
      6: '8vw',  // Added
      7: '9vw',  // Added
      default: '9vw', // Updated default
      handTwo: {
        1: '2vw',
        2: '2vw',
        3: '5vw',
        4: '6vw',
        5: '7vw',
        6: '8vw',  // Added
        7: '9vw',  // Added
        default: '9vw' // Updated default
      }
    },
    bigTablet: {
      1: '2vw',
      2: '2vw',
      3: '5vw',
      4: '6vw',
      5: '7vw',
      6: '8vw',  // Added
      7: '9vw',  // Added
      default: '9vw', // Updated default
      handTwo: {
        1: '2vw',
        2: '2vw',
        3: '5vw',
        4: '6vw',
        5: '7vw',
        6: '8vw',  // Added
        7: '9vw',  // Added
        default: '9vw' // Updated default
      }
    }
  };

  const leftValues2 = {
    bigMobile: {
      1: '27vw',
      2: '29vw',
      3: '33vw',
      4: '35vw',
      5: '36vw',
      6: '37vw',  // Added
      7: '38vw',  // Added
      default: '38vw', // Updated default
      handTwo: {
        1: '27vw',
        2: '29vw',
        3: '33vw',
        4: '35vw',
        5: '36vw',
        6: '37vw',  // Added
        7: '38vw',  // Added
        default: '38vw' // Updated default
      }
    },
    mobile: {
      1: '27vw',
      2: '29vw',
      3: '33vw',
      4: '35vw',
      5: '36vw',
      6: '37vw',  // Added
      7: '38vw',  // Added
      default: '38vw', // Updated default
      handTwo: {
        1: '27vw',
        2: '29vw',
        3: '33vw',
        4: '35vw',
        5: '36vw',
        6: '37vw',  // Added
        7: '38vw',  // Added
        default: '38vw' // Updated default
      }
    },
    smallMobail: {
      1: '27vw',
      2: '29vw',
      3: '33vw',
      4: '35vw',
      5: '36vw',
      6: '37vw',  // Added
      7: '38vw',  // Added
      default: '38vw', // Updated default
      handTwo: {
        1: '27vw',
        2: '29vw',
        3: '33vw',
        4: '35vw',
        5: '36vw',
        6: '37vw',  // Added
        7: '38vw',  // Added
        default: '38vw' // Updated default
      }
    },
    tablet: {
      1: '27vw',
      2: '29vw',
      3: '33vw',
      4: '35vw',
      5: '36vw',
      6: '37vw',  // Added
      7: '38vw',  // Added
      default: '38vw', // Updated default
      handTwo: {
        1: '27vw',
        2: '29vw',
        3: '33vw',
        4: '35vw',
        5: '36vw',
        6: '37vw',  // Added
        7: '38vw',  // Added
        default: '38vw' // Updated default
      }
    },
    bigTablet: {
      1: '27vw',
      2: '29vw',
      3: '33vw',
      4: '35vw',
      5: '36vw',
      6: '37vw',  // Added
      7: '38vw',  // Added
      default: '38vw', // Updated default
      handTwo: {
        1: '27vw',
        2: '29vw',
        3: '33vw',
        4: '35vw',
        5: '36vw',
        6: '37vw',  // Added
        7: '38vw',  // Added
        default: '38vw' // Updated default
      }
    }
  };

  const deviceType = isSmallMobail ? 'smallMobail' : isBigTablet ? 'bigTablet' : isBigerMobail ? 'bigMobile' : IsTablet ? 'tablet' : isMobile ? "mobile" : null;

  const positionStyles = deviceType && gameObject?.seats[2]?.hand2.length < 2
    ? {
      position: 'absolute',
      bottom: bottomValues[deviceType][playerCards.length] || bottomValues[deviceType].default,
      left: leftValues[deviceType][playerCards.length] || leftValues[deviceType].default,
      transform: 'translateX(-50%)',
      transition: 'opacity 0.3s ease, left 0.3s ease, bottom 0.3s ease, transform 0.3s ease',
      opacity: isFadingOut ? 0 : 1,

    }
    :
    gameObject?.seats[2]?.hand2.length > 1 ?
      {
        position: 'absolute',
        bottom: bottomValues[deviceType]["handTwo"][playerCards.length] || bottomValues[deviceType].default,
        left: leftValues[deviceType]["handTwo"][playerCards.length] || leftValues[deviceType].default,
        transform: 'translateX(-50%)',
        transition: 'opacity 0.3s ease, left 0.3s ease, bottom 0.3s ease, transform 0.3s ease',
        opacity: isFadingOut ? 0 : 1,

      }
      :
      {};
  const positionStyles2 = deviceType && gameObject?.seats[2]?.hand2.length < 2
    ? {
      position: 'absolute',
      bottom: bottomValues2[deviceType][playerCards2.length] || bottomValues2[deviceType].default,
      left: leftValues2[deviceType][playerCards2.length] || leftValues2[deviceType].default,
      transform: 'translateX(-50%)',
      opacity: isFadingOut ? 0 : 1,
      transition: 'opacity 0.3s ease, left 0.3s ease, bottom 0.3s ease, transform 0.3s ease',

    }
    :
    gameObject?.seats[2]?.hand2.length > 1 ?
      {
        position: 'absolute',
        bottom: bottomValues2[deviceType]["handTwo"][playerCards2.length] || bottomValues2[deviceType].default,
        left: leftValues2[deviceType]["handTwo"][playerCards2.length] || leftValues2[deviceType].default,
        transform: 'translateX(-50%)',
        opacity: isFadingOut ? 0 : 1,
        transition: 'opacity 0.3s ease, left 0.3s ease, bottom 0.3s ease, transform 0.3s ease',

      }
      : { position: 'relative' };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const wrapperStyle = {
    position: "absolute",
    top: isMobile ? "50px" : "130px",
    right: isMobile ? "20px" : "100px",
    borderRadius: "176px",
    padding: "6px",
    border: "1px solid #131416",
    boxSizing: "content-box",
    backgroundColor: "transparent",
  };

  const getCardPosition = (index) => {
    if (false) { // Mobile (310-438px)

    } else { // Desktop (769px and up)
      return {
        bottom: `${index * 28}px`,
        // top: `${index * 25}px`
      };
    }
  };

  // const position = getCardPosition();

  const imageStyle = {
    backgroundColor: "#131416",
    width: isMobile ? "auto" : "280px",
    height: isMobile ? "280px" : "auto",
    borderRadius: "170px",
    paddingTop: isMobile ? "200px" : "70px",
    paddingBottom: "200px",
    paddingLeft: isMobile ? "70px" : "200px",
    paddingRight: isMobile ? "70px" : "200px",
    border: "1px solid #131416",
    display: "block",
  };
  const chips = [
    { src: chipReset, alt: "Reset", value: '' },
    { src: chip1, alt: "Chip 1", value: 1 },
    { src: chip5, alt: "Chip 5", value: 5 },
    { src: chip25, alt: "Chip 25", value: 25 },
    { src: chip100, alt: "Chip 100", value: 100 },
    { src: chip200, alt: "Chip 200", value: 200 },
  ];
  return (
    <>
      {" "}
      <div
        style={{
          minHeight: "80vh",
          background: "#0C1110",
          padding: "10px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div className="responsive-container">
          {/* Left Panel - Controls */}
          <div
            style={{
              // width: '300px',
              // backgroundColor: '#213743',

              // padding: "20px",
              height: "fit-content",
              transition: "padding 0.3s ease",
              backgroundColor: "#0d1211",
            }}
            className="btn-container-padding"
          >
            {/* <div style={{ marginBottom: "20px" }}> */}
            {/* <div
                style={{
                  color: "white",
                  marginBottom: "10px",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>Bet Amount</span>
                <span>${Number(betAmount)?.toFixed(2)}</span>
              </div> */}

            {/* </div> */}
            {gameObject?.askingInsurance && (
              <p
                style={{
                  color: "white",
                  textAlign: "center",
                  fontSize: "18px",
                }}
              >
                INSURANCE
              </p>
            )}
            <div className="btnContainerPadding">
              <div
                // style={{
                //   display: "grid",
                //   gridTemplateColumns: "1fr 1fr",
                //   gap: "10px",
                //   marginBottom: "20px",
                //   padding:'10px'
                // }}
                className="btnContainerGrid"
              >
                {!gameObject?.askingInsurance ? (
                  <button
                    className="btnPadding"
                    onClick={() => {
                      hit();
                    }}
                    disabled={
                      isDealing ||
                      !gameObject ||
                      gameObject?.seats[2]?.standUp ||
                      gameObject?.handOver ||
                      gameObject?.seats[1]?.hand?.length < 2
                    }
                    style={{
                      backgroundColor:
                        (gameObject &&
                          (gameObject?.seats[2]?.standUp ||
                            gameObject?.handOver ||
                            gameObject?.seats[1]?.hand?.length < 2)) ||
                          !gameObject
                          ? "#3B413E"
                          : "#3B413E",
                      color:
                        (gameObject &&
                          (gameObject?.seats[2]?.standUp ||
                            gameObject?.handOver ||
                            gameObject?.seats[1]?.hand?.length < 2)) ||
                          isDealing ||
                          !gameObject
                          ? "grey"
                          : "white",
                      border: "none",
                      borderRadius: "8px",
                      cursor:
                        (gameObject &&
                          (gameObject?.seats[2]?.standUp ||
                            gameObject?.handOver ||
                            gameObject?.seats[1]?.hand?.length < 2)) ||
                          !gameObject
                          ? "not-allowed"
                          : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "5px",
                      fontWeight: "bold",
                      fontSize: "14px",
                      filter:
                        (gameObject &&
                          (gameObject?.seats[2]?.standUp ||
                            gameObject?.handOver ||
                            gameObject?.seats[1]?.hand?.length < 2)) ||
                          !gameObject ||
                          isDealing
                          ? "grayscale(100%) brightness(0.8)"
                          : "none",
                      opacity:
                        (gameObject &&
                          (gameObject?.seats[2]?.standUp ||
                            gameObject?.handOver ||
                            gameObject?.seats[1]?.hand?.length < 2)) ||
                          !gameObject ||
                          isDealing
                          ? 0.6
                          : 1,
                    }}
                  >
                    <span>Hit</span>
                    <img src={hitImg} alt="Hit icon" />
                  </button>
                ) : null}
                {!gameObject?.askingInsurance ? (
                  <button
                    className="btnPadding"
                    onClick={() => {
                      console.log("yes clicked onpres======");
                      stay();
                    }}
                    disabled={
                      !gameObject ||
                      gameObject?.seats[2]?.standUp ||
                      gameObject?.handOver ||
                      isDealing ||
                      gameObject?.seats[1]?.hand?.length < 2
                    }
                    style={{
                      backgroundColor:
                        (gameObject &&
                          (gameObject?.seats[2]?.standUp ||
                            gameObject?.handOver ||
                            gameObject?.seats[1]?.hand?.length < 2)) ||
                          !gameObject ||
                          isDealing
                          ? "#3B413E"
                          : "#3B413E",
                      color:
                        (gameObject &&
                          (gameObject?.seats[2]?.standUp ||
                            gameObject?.handOver ||
                            gameObject?.seats[1]?.hand?.length < 2)) ||
                          !gameObject ||
                          isDealing
                          ? "grey"
                          : "white",
                      border: "none",
                      borderRadius: "8px",
                      cursor:
                        (gameObject &&
                          (gameObject?.seats[2]?.standUp ||
                            gameObject?.handOver ||
                            gameObject?.seats[1]?.hand?.length < 2)) ||
                          !gameObject ||
                          isDealing
                          ? "not-allowed"
                          : "pointer",
                      fontWeight: "bold",
                      fontSize: "14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "5px",
                      filter:
                        (gameObject &&
                          (gameObject?.seats[2]?.standUp ||
                            gameObject?.handOver ||
                            gameObject?.seats[1]?.hand?.length < 2)) ||
                          !gameObject ||
                          isDealing
                          ? "grayscale(100%) brightness(0.8)"
                          : "none",
                      opacity:
                        (gameObject &&
                          (gameObject?.seats[2]?.standUp ||
                            gameObject?.handOver ||
                            gameObject?.seats[1]?.hand?.length < 2)) ||
                          !gameObject ||
                          isDealing
                          ? 0.6
                          : 1,
                    }}
                  >
                    <span>Stand</span>
                    <img src={handImg} alt="Stand icon" />
                  </button>
                ) : null}

                {!gameObject?.askingInsurance ? (
                  <button
                    className="btnPadding"
                    onClick={() => {
                      console.log(
                        "click on split------",
                        gameObject?.seats[2]?.hand,
                        gameObject?.seats[2]?.hand?.length,
                        gameObject?.seats[2]?.hand?.filter(
                          (card) =>
                            card?.rank.toString() ==
                            gameObject?.seats[2]?.hand[0]?.rank.toString()
                        ).length
                      );
                      split();
                    }}
                    disabled={
                      !gameObject ||
                      gameObject?.seats[2]?.isSplit ||
                      gameObject?.handOver ||
                      isDealing ||
                      gameObject?.seats[2]?.hand?.length !=
                      gameObject?.seats[2]?.hand?.filter(
                        (card) =>
                          card?.rank.toString() ==
                          gameObject?.seats[2]?.hand[0]?.rank.toString()
                      ).length
                    }
                    style={{
                      backgroundColor: "#3B413E",
                      color:
                        (gameObject &&
                          (gameObject?.seats[2]?.isSplit ||
                            gameObject?.handOver ||
                            gameObject?.seats[1]?.hand?.length < 2)) ||
                          !gameObject ||
                          isDealing ||
                          gameObject?.seats[2]?.hand?.length !==
                          gameObject?.seats[2]?.hand?.filter(
                            (card) =>
                              card?.rank.toString() ==
                              gameObject?.seats[2]?.hand[0]?.rank.toString()
                          ).length
                          ? "grey"
                          : "white",
                      cursor:
                        gameObject?.seats[2]?.isSplit ||
                          gameObject?.seats[1]?.hand?.length < 2 ||
                          (gameObject?.seats[2]?.hand?.length !==
                            gameObject?.seats[2]?.hand?.length) !==
                          gameObject?.seats[2]?.hand?.filter(
                            (card) =>
                              card?.rank.toString() ==
                              gameObject?.seats[2]?.hand[0]?.rank.toString()
                          ).length
                          ? "not-allowed"
                          : "pointer",
                      border: "none",
                      borderRadius: "8px",

                      fontWeight: "bold",
                      fontSize: "14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "5px",
                      filter:
                        (gameObject &&
                          (gameObject?.seats[2]?.isSplit ||
                            gameObject?.handOver ||
                            gameObject?.seats[1]?.hand?.length < 2)) ||
                          !gameObject ||
                          isDealing ||
                          gameObject?.seats[2]?.hand?.length !==
                          gameObject?.seats[2]?.hand?.filter(
                            (card) =>
                              card?.rank.toString() ==
                              gameObject?.seats[2]?.hand[0]?.rank.toString()
                          ).length
                          ? "grayscale(100%) brightness(0.8)"
                          : "none",
                      opacity:
                        (gameObject &&
                          (gameObject?.seats[2]?.isSplit ||
                            gameObject?.handOver ||
                            gameObject?.seats[1]?.hand?.length < 2)) ||
                          !gameObject ||
                          isDealing ||
                          gameObject?.seats[2]?.hand?.length !==
                          gameObject?.seats[2]?.hand?.filter(
                            (card) =>
                              card?.rank.toString() ==
                              gameObject?.seats[2]?.hand[0]?.rank.toString()
                          ).length
                          ? 0.6
                          : 1,
                    }}
                  >
                    <span>Split </span>
                    <img
                      src={splitImg}
                      style={{
                        filter: "grayscale(100%) brightness(0.3)",
                      }}
                      alt="Split icon"
                    />
                  </button>
                ) : null}
                {!gameObject?.askingInsurance ? (
                  <button
                    className="btnPadding"
                    onClick={() => {
                      double();
                    }}
                    disabled={
                      !gameObject ||
                      gameObject?.seats[2]?.standUp ||
                      gameObject?.handOver ||
                      isDealing ||
                      gameObject?.seats[2]?.hand?.length > 2
                    }
                    style={{
                      backgroundColor:
                        (gameObject &&
                          (gameObject?.seats[2]?.standUp ||
                            gameObject?.handOver)) ||
                          !gameObject ||
                          gameObject?.seats[2]?.hand?.length > 2
                          ? "#3B413E"
                          : "#3B413E",
                      border: "none",
                      borderRadius: "8px",
                      color:
                        (gameObject &&
                          (gameObject?.seats[2]?.standUp ||
                            gameObject?.handOver)) ||
                          !gameObject ||
                          isDealing ||
                          gameObject?.seats[2]?.hand?.length > 2
                          ? "grey"
                          : "white",
                      cursor:
                        (gameObject &&
                          (gameObject?.seats[2]?.standUp ||
                            gameObject?.handOver)) ||
                          !gameObject ||
                          gameObject?.seats[2]?.hand?.length > 2
                          ? "not-allowed"
                          : "pointer",
                      fontWeight: "bold",
                      fontSize: "14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "5px",
                      filter:
                        (gameObject &&
                          (gameObject?.seats[2]?.standUp ||
                            gameObject?.handOver)) ||
                          !gameObject ||
                          isDealing ||
                          gameObject?.seats[2]?.hand?.length > 2
                          ? "grayscale(100%) brightness(0.8)"
                          : "none",
                      opacity:
                        (gameObject &&
                          (gameObject?.seats[2]?.standUp ||
                            gameObject?.handOver)) ||
                          !gameObject ||
                          isDealing ||
                          gameObject?.seats[2]?.hand?.length > 2
                          ? 0.6
                          : 1,
                    }}
                  >
                    <span>Double</span>
                    <img src={doubleImg} alt="Hit icon" />
                  </button>
                ) : null}

                {gameObject?.askingInsurance ? (
                  <button
                    onClick={() => {
                      AcceptInsurance();
                    }}
                    disabled={false}
                    className="btnPadding"
                    style={{
                      backgroundColor: "#3B413E",
                      border: "none",
                      borderRadius: "8px",
                      color: "white",
                      cursor: "pointer",
                      fontWeight: "bold",
                      fontSize: "14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "5px",
                    }}
                  >
                    <span>Accept Insurance</span>
                  </button>
                ) : null}
                {gameObject?.askingInsurance ? (
                  <button
                    onClick={() => {
                      RejectInsurance();
                    }}
                    className="btnPadding"
                    disabled={false}
                    style={{
                      backgroundColor: "#3B413E",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: "bold",
                      fontSize: "14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "5px",
                    }}
                  >
                    <span>No Insurance</span>
                  </button>
                ) : null}

              </div>
              <button
                className="btnPadding"
                onClick={() => {
                  betAndStartGame();
                }}
                disabled={
                  Number(betAmount) <= 0 ||
                  (gameObject && !gameObject?.handOver) ||
                  (gameObject && btnClickRef.current)
                }
                style={{
                  width: "100%",
                  // padding: "15px",
                  backgroundColor:
                    Number(betAmount) <= 0 ||
                      (gameObject && !gameObject?.handOver) ||
                      (gameObject && btnClickRef.current)
                      ? "rgb(59 156 115)"
                      : "#0BF191",
                  color:
                    Number(betAmount) <= 0 ||
                      (gameObject && !gameObject?.handOver) ||
                      (gameObject && btnClickRef.current)
                      ? "black"
                      : "black",
                  border: "none",
                  borderRadius: "8px",
                  cursor:
                    Number(betAmount) <= 0 ||
                      (gameObject && !gameObject?.handOver) ||
                      (gameObject && btnClickRef.current)
                      ? "not-allowed"
                      : "pointer",
                  fontSize: "16px",
                  fontWeight: "bold",
                }}
              >
                {gameState === "betting" || gameState === "finished"
                  ? "Place Bet"
                  : "Place Bet"}
              </button>
              <div className="bet-container">
                <div className="bet-input-wrapper">
                  <span className="bet-dollar">$</span>
                  <input
                    type="number"
                    value={betAmount}
                    onChange={(e) => {
                      const raw = e.target.value;
                      if (/^\d*(\.\d{0,8})?$/.test(raw) || raw === "") {
                        setBetAmount(raw);

                        if (timerRef.current) clearTimeout(timerRef.current);

                        timerRef.current = setTimeout(() => {
                          if (raw !== "" && !isNaN(Number(raw))) {
                            setBetAmount(Number(raw).toFixed(2));
                          }
                        }, 500);
                      }
                    }}
                    onBlur={() => {
                      if (betAmount === "" || isNaN(Number(betAmount))) {
                        setBetAmount("0.00000000");
                      } else {
                        setBetAmount(Number(betAmount).toFixed(2));
                      }
                    }}
                    placeholder="0.00000000"
                    step="0.00000001"
                  />
                </div>

                <div className="bet-buttons">
                  <button onClick={() => setBetAmount((betAmount / 2).toFixed(2))}>
                    1/2
                  </button>
                  <button onClick={() => setBetAmount((betAmount * 2).toFixed(2))}>
                    2X
                  </button>
                  <button onClick={() => setBetAmount(Number(1).toFixed(2))}>
                    Max
                  </button>
                </div>
              </div>
              <div className="chips-container">
                {chips.map((chip, index) => (
                  <div onClick={() => {
                    const raw = chip.value;
                    if (/^\d*(\.\d{0,8})?$/.test(raw) || raw === "") {
                      setBetAmount(raw);

                      if (timerRef.current) clearTimeout(timerRef.current);

                      timerRef.current = setTimeout(() => {
                        if (raw !== "" && !isNaN(Number(raw))) {
                          setBetAmount(Number(raw).toFixed(2));
                        }
                      }, 500);
                    }
                  }} className={`chip ${index === 0 ? "extra-gap" : ""}`}
                    key={index}>
                    <img src={chip.src} alt={chip.alt} />
                  </div>
                ))}
              </div>

            </div>
          </div>

          {/* Right Panel - Game Table */}
          <div className="left-side-container">
            <div
              style={{ backgroundColor: "transparent", flex: 1, width: "100%" }}
            >
              {/* Deck Display */}
              <DeckDisplay style={{ zIndex: 100 }} />
              {/* Dealer Section */}
              <div
                style={{
                  display: "flex", // Enable flexbox
                  flexDirection: "column", // Stack items vertically
                  justifyContent: "flex-end", // Push items to bottom
                  alignItems: "center", // Center horizontally
                  width: "100%",
                  height: "100%",

                  textAlign: "center",
                  // marginTop:'10px'
                }}

              >
                <div
                  className="dealerCardScore"
                  style={{
                    color: "white",
                    fontSize: "18px",
                    // marginBottom: "16px",
                    //  marginTop: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    // gap: "20px",
                  }}
                >
                  {/* <span>Dealer</span> */}
                  {dealerCards.length > 0 && (
                    <div
                      style={{
                        backgroundColor: dealerScore
                          ? "#3B413E"
                          : "transparent",
                        padding: "4px 20px",
                        borderRadius: "8px",
                        fontSize: "14px",
                        fontWeight: "bold",
                        border: "1px solid #131416",
                        opacity: isFadingOut ? 0 : 1,
                        transition: "opacity 0.3s ease",
                      }}
                    >
                      {dealerScore || ""}
                    </div>
                  )}
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "flex-end",
                    marginBottom: "100px",
                    width: "100%",

                    alignSelf: "center",
                    backgroundColor: "green",
                    position: "relative"
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    position: isMobile ? 'absolute' : 'relative',
                    transition: 'left 0.3s ease, bottom 0.3s ease, transform 0.3s ease',
                    ...(isMobile && {
                      left: `${dealerCards.length === 1 ? '50vw' :
                        dealerCards.length === 2 ? '50vw' :
                          dealerCards.length === 3 ? '47vw' :
                            dealerCards.length === 4 ? '43vw' :
                              dealerCards.length === 5 ? '38vw' : '37vw'}`,
                      transform: 'translateX(-50%)',
                    }),
                    zIndex: 1000
                  }}>
                    <div
                      style={{
                        justifyContent: "center",
                        //alignItems: "flex-start",
                        //minHeight: "140px",

                        marginLeft: window.innerWidth < 899 ? "-60px" : "0",
                        position: "relative",
                      }}
                    >
                      {dealerCards?.map((card, index) => {
                        if (!isMobile) {
                          return (
                            <Card

                              key={`${card.suit}-${card.rank}-${index}`}
                              card={card}
                              allCards={dealerCards}
                              index={index}
                              borderColor={"black"}
                              borderWidth={0}
                              isDealer={true}
                              fadeOut={isFadingOut}
                              isJustFlip={
                                index === 1 &&
                                (gameObject?.handOver ||
                                  gameObject?.seats[2]?.standUp)
                              }
                              isHidden={index === 1 && card?.rank === "hidden"}
                              animate={card.animate && soundEnabled}
                            />
                          )
                        } else {
                          return (
                            <CardForMobail
                              key={`${card.suit}-${card.rank}-${index}`}
                              card={card}
                              index={index}
                              borderColor={"black"}
                              fadeOut={isFadingOut}
                              borderWidth={0}
                              allCards={dealerCards}
                              isDealer={true}
                              isJustFlip={
                                index === 1 &&

                                (gameObject?.handOver ||
                                  gameObject?.seats[2]?.standUp)
                              }
                              isHidden={index === 1 && card?.rank === "hidden"}
                              animate={card.animate && soundEnabled}
                            />
                          )
                        }
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ flex: 1, width: "100%" }}>
              <div className="blackjack-info-table">
                <img
                  src={centerLogo}
                  alt="logo"
                  className="table-inner-blackjack"
                />
                <div className="table-inner-box2">
                  <div className="table-inner-box">BLACKJACK PAYS 3 TO 2</div>

                  <div className="insurancetext">INSURANCE PAYS 2 TO 1</div>
                </div>
              </div>
            </div>

            <div
              style={{
                flex: 1,
                display: "flex",

                flexDirection: "column",
                justifyContent: "center",
                alignItems: "flex-start",
                alignContent: "center",
                width: "80%",
              }}
            >
              <div
                style={{
                  display: "flex",
                  marginTop: "-10px",

                  justifyContent: "center",
                  alignItems: "center",
                  gap: "100px",
                  width: "100%",
                  opacity: isFadingOut ? 0 : 1,
                  transition: "opacity 0.3s ease",
                }}
              >
                {gameObject?.seats[2]?.points2 > 0 ? (
                  <div
                    style={{
                      color: "white",
                      flex: 1,
                      fontSize: "18px",
                      marginBottom: "16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "20px",
                    }}
                  >
                    {/* <span>Player</span> */}
                    {gameObject?.seats[2]?.points2 > 0 && (
                      <div style={positionStyles2}>
                        <div
                          style={{
                            backgroundColor: gameObject?.handOver
                              ? playerScore2
                                ? playerBorderColor2
                                : "transparent" // round over
                              : playerScore2
                                ? "#3B413E"
                                : "transparent", // in-play state
                            padding: isBlackjack2 ? "10px 5px" : "4px 20px",
                            borderRadius: "8px",
                            height: isBlackjack2 ? "46px" : "",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            boxSizing: "border-box",
                            fontSize: isBlackjack2 ? "20px" : "16px",
                            fontWeight: "bold",
                            border: "1px solid #131416",
                            zIndex: 10,
                            fontSize: "14px",
                          }}
                        >
                          {!isBlackjack2 && (
                            <div
                              style={{
                                color:
                                  isBlackjack2 || playerBorderColor2 === "#0BF191"
                                    ? "black"
                                    : "white",
                              }}
                            >
                              {playerScore2 || ""}
                            </div>
                          )}
                          <div>
                            <div>
                              {isBlackjack2 && (
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                  <span
                                    style={{
                                      color: "black",
                                      // margin: "0px 8px 0px 17px",
                                    }}
                                  >
                                    {" "}
                                    {playerScore2 || ""}{" "}
                                  </span>
                                  <span
                                    style={{
                                      color: "#00E900",
                                      marginLeft: "8px",
                                      padding: "8px 18px",
                                      background: "#000000",
                                      borderRadius: "6px",
                                    }}
                                  >
                                    Blackjack
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}

                <div
                  style={{
                    color: "white",
                    fontSize: "18px",
                    flex: 1,
                    marginBottom: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {/* <span>Player</span> */}
                  {gameObject?.seats[2] != null && (
                    <div style={{
                      ...(isMobile && {
                        position: "relative",
                      }),
                      position: "relative"
                    }}>
                      <div style={positionStyles}>
                        <div
                          style={{
                            backgroundColor: gameObject?.handOver
                              ? playerScore
                                ? playerBorderColor
                                : "transparent" // round over
                              : playerScore
                                ? "#3B413E"
                                : "transparent", // in-play state
                            padding: isBlackjack ? "10px 5px" : "4px 20px",
                            borderRadius: "8px",
                            height: isBlackjack ? "46px" : "",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            boxSizing: "border-box",
                            fontSize: isBlackjack ? "20px" : "16px",
                            fontWeight: "bold",
                            border: "1px solid #131416",
                            zIndex: 10,
                            fontSize: "14px",
                          }}
                        >
                          {!isBlackjack && (
                            <div
                              style={{
                                color:
                                  isBlackjack || playerBorderColor === "#0BF191"
                                    ? "black"
                                    : "white",
                              }}
                            >
                              {playerScore || ""}
                            </div>
                          )}
                          <div>
                            <div>
                              {isBlackjack && (
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "start" }}>
                                  <span
                                    style={{
                                      color: "black",
                                      // margin: "0px 8px 0px 17px",
                                    }}
                                  >
                                    {" "}
                                    {playerScore || ""}{" "}
                                  </span>
                                  <span
                                    style={{
                                      color: "#00E900",
                                      marginLeft: "8px",
                                      padding: "8px 18px",
                                      background: "#000000",
                                      borderRadius: "6px",
                                    }}
                                  >
                                    Blackjack
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flex: 1,

                  //gap: "100px",
                  marginTop: "-15px",
                  // alignItems: "center",
                  width: "80%",
                  justifyContent: "center",
                  position: "relative"
                }}
              >
                <div style={{
                  // position: 'absolute',
                  marginLeft: !isMobile ? "20%" : "0%",
                  position: isMobile ? 'absolute' : 'relative',
                  transition: 'left 0.3s ease, bottom 0.3s ease, transform 0.3s ease',

                  // ...(isMobile && {
                  //   left: `${playerCards2.length === 1 ? '50vw' :
                  //     playerCards2.length === 2 ? '50vw' :
                  //       playerCards2.length === 3 ? '47vw' :
                  //         playerCards2.length === 4 ? '43vw' :
                  //           playerCards2.length === 5 ? '38vw' : '33vw'}`,
                  //   transform: 'translateX(-50%)',
                  // }),
                  ...(isMobile && !isBigerMobail && !IsTablet && !isBigTablet &&
                  {
                    left: `${playerCards2.length === 1 ? '9vw' :
                      playerCards2.length === 2 ? '8vw' :
                        playerCards2.length === 3 ? '7vw' :
                          playerCards2.length === 4 ? '7vw' :
                            playerCards2.length === 5 ? '6vw' : '5vw'}`,
                    bottom: `${playerCards2.length === 5 ? '28vw' :
                      playerCards2.length === 4 ? '25vw' :
                        playerCards2.length === 3 ? '23vw' :
                          playerCards2.length === 2 ? '20vw' :
                            playerCards2.length === 1 ? '20vw' : '29vw'}`,
                    transform: 'translateX(-50%)',
                  }),
                  ...(isBigerMobail &&
                  {
                    left: `${playerCards2.length === 1 ? '9vw' :
                      playerCards2.length === 2 ? '8vw' :
                        playerCards2.length === 3 ? '7vw' :
                          playerCards2.length === 4 ? '7vw' :
                            playerCards2.length === 5 ? '6vw' : '5vw'}`,
                    bottom: `${playerCards2.length === 5 ? '40vw' :
                      playerCards2.length === 4 ? '38vw' :
                        playerCards2.length === 3 ? '35vw' :
                          playerCards2.length === 2 ? '33vw' :
                            playerCards2.length === 1 ? '32vw' : '41vw'}`,
                    transform: 'translateX(-50%)',
                  }),
                  ...(IsTablet &&
                  {
                    left: `${playerCards2.length === 1 ? '9vw' :
                      playerCards2.length === 2 ? '8vw' :
                        playerCards2.length === 3 ? '7vw' :
                          playerCards2.length === 4 ? '7vw' :
                            playerCards2.length === 5 ? '6vw' : '5vw'}`,
                    bottom: `${playerCards2.length === 5 ? '37vw' :
                      playerCards2.length === 4 ? '36vw' :
                        playerCards2.length === 3 ? '35vw' :
                          playerCards2.length === 2 ? '33vw' :
                            playerCards2.length === 1 ? '31vw' : '38vw'}`,
                    transform: 'translateX(-50%)',
                  }),
                  ...(isBigTablet &&
                  {
                    left: `${playerCards2.length === 1 ? '9vw' :
                      playerCards2.length === 2 ? '8vw' :
                        playerCards2.length === 3 ? '7vw' :
                          playerCards2.length === 4 ? '7vw' :
                            playerCards2.length === 5 ? '6vw' : '5vw'}`,
                    bottom: `${playerCards2.length === 5 ? '29vw' :
                      playerCards2.length === 4 ? '28vw' :
                        playerCards2.length === 3 ? '27vw' :
                          playerCards2.length === 2 ? '26vw' :
                            playerCards2.length === 1 ? '25vw' : '30vw'}`,
                    transform: 'translateX(-50%)',
                  }
                    // {
                    //  left: `${playerCards2.length === 1 ? '50vw' :
                    //   playerCards2.length === 2 ? '50vw' :
                    //     playerCards2.length === 3 ? '47vw' :
                    //       playerCards2.length === 4 ? '43vw' :
                    //         playerCards2.length === 5 ? '38vw' : '33vw'}`,
                    //   bottom: `${playerCards.length === 5 ? '28vw' :
                    //     playerCards.length === 4 ? '25vw' :
                    //       playerCards.length === 3 ? '23vw' :
                    //         playerCards.length === 2 ? '20vw' :
                    //           playerCards.length === 2 ? '20vw' : '20vw'}`,
                    //   transform: 'translateX(-50%)',
                    // }
                  ),
                  zIndex: 1000
                }}>
                  {/* Player cards 2 Section */}
                  {playerCards2.length > 0 ? (
                    <div
                      style={{
                        width: "90%",
                        display: "flex", // make the card container flex
                        justifyContent: "center", // center the cards horizontally
                        alignItems: "center", // optional: center vertically
                        position: "relative",

                        gap: "10px",
                      }}
                    >
                      {gameObject?.seats[2]?.isSplit &&
                        gameObject?.seats[2].selectedHand == 2 &&
                        !gameObject.handOver ? (
                        <div
                          style={{
                            position: "absolute",
                            // top: "50%", // Center vertically
                            position: "absolute",
                            ...((!isMobile && !isBigerMobail) && {
                              marginTop: "-50%", // Center vertically
                            }),
                            ...(isMobile && {
                              top: "5vh", // Center vertically
                            }),
                            ...(isBigerMobail && {
                              top: "5vh", // Center vertically
                            }),
                            ...(IsTablet && {
                              top: "5vh", // Center vertically
                            }),
                            ...(isBigTablet && {
                              top: "5vh", // Center vertically
                            }),
                            left: "-30px", // Adjust for left side
                            transform: "translateY(-50%)",
                            fontSize: "30px", // Adjust size of arrows
                            color: "blue", // Blue color for the arrow
                          }}
                        >
                          <FaChevronRight /> {/* Right Chevron Icon */}
                        </div>
                      ) : null}
                      {playerCards2?.map((card, index) => {
                        if (!isMobile) {
                          return (
                            <Card
                              allCards={playerCards2}
                              key={`${card.suit}-${card.rank}-${index}`}
                              card={card}
                              index={index}
                              isDealer={false}
                              noAnimation={index == 0 ? true : false}
                              fadeOut={isFadingOut}
                              borderColor={playerBorderColor2}
                              borderWidth={playerBorderWidth2}
                              boxShadow={
                                playerBorderWidth2 > 0
                                  ? `0px 0px 20px 4px ${playerBorderColor2}`
                                  : "none"
                              }
                              animate={card.animate && soundEnabled}
                            />
                          )
                        } else {
                          return (
                            <CardForMobail
                              key={`${card.suit}-${card.rank}-${index}`}
                              card={card}
                              index={index}
                              isDealer={false}
                              noAnimation={index == 0 ? true : false}
                              fadeOut={isFadingOut}
                              borderColor={playerBorderColor2}
                              borderWidth={playerBorderWidth2}
                              boxShadow={
                                playerBorderWidth2 > 0
                                  ? `0px 0px 20px 4px ${playerBorderColor2}`
                                  : "none"
                              }
                              animate={card.animate && soundEnabled}
                            />
                          )
                        }
                      })}
                      {gameObject?.seats[2]?.isSplit &&
                        gameObject?.seats[2].selectedHand == 2 &&
                        !gameObject.handOver ? (
                        <div
                          style={{
                            position: "absolute",
                            transition: 'left 0.3s ease, top 0.3s ease, transform 0.3s ease',

                            // top: "50%", // Center vertically
                            // left: `${(playerCards2.length > 1
                            //   ? playerCards2.length * 15
                            //   : 0) + 70
                            //   }px`,
                            top: `${(isMobile) ? '5vh' : isBigerMobail ? "" : '50%'}`, // Center vertically
                            // left: (isMobile || isBigerMobail)
                            //   ? `${isMobile ? `${(playerCards.length > 1 ? playerCards.length * 10 : 0) + 50}px` : ''}` // or a mobile-specific value
                            //   : `${(playerCards.length > 1 ? playerCards.length * 15 : 0) + 70}px`,
                            // Adjust for left side
                            left: (() => {
                              if (isBigTablet) {
                                // Tablet spacing — adjust to taste
                                return `${(playerCards2.length > 1 ? playerCards2.length * 15 : 0) + 70}px`;
                              } else if (IsTablet) {
                                // Tablet spacing — adjust to taste
                                return `${(playerCards2.length > 1 ? playerCards2.length * 13 : 0) + 70}px`;
                              } else if (isMobile) {
                                // Mobile spacing
                                return `${(playerCards2.length > 1 ? playerCards2.length * 10 : 0) + 50}px`;
                              } else if (isBigerMobail) {
                                // "Bigger mobile" spacing
                                return `${(playerCards2.length > 1 ? playerCards2.length * 10 : 0) + 50}px`;
                              } else {
                                // Default desktop spacing
                                return `${(playerCards2.length > 1 ? playerCards2.length * 15 : 0) + 70}px`;
                              }
                            })(),
                            transform: "translateY(-50%)",
                            fontSize: "30px", // Adjust size of arrows
                            color: "blue", // Blue color for the arrow
                          }}
                        >
                          <FaChevronLeft /> {/* Right Chevron Icon */}
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
                {/* Player cards 1 Section */}
                <div
                  style={{
                    display: "flex",
                    //flex: 1,

                    //marginTop: "-150px",
                    //alignItems: "center",
                    width: "100%",
                    marginLeft: !isMobile && playerCards2.length > 0 ? "50%" : "0%",

                    justifyContent: "center",
                    position: "relative"
                  }}
                >
                  <div style={{
                    // position: 'absolute',
                    position: isMobile ? 'absolute' : 'relative',
                    transition: 'left 0.3s ease, bottom 0.3s ease, transform 0.3s ease',
                    ...(!isBigerMobail && !IsTablet && !isBigTablet && ((isMobile && playerCards2.length === 0) ? {
                      left: `${playerCards.length === 1 ? '26vw' :
                        playerCards.length === 2 ? '25vw' :
                          playerCards.length === 3 ? '22vw' :
                            playerCards.length === 4 ? '19vw' :
                              playerCards.length === 5 ? '17vw' : '16vw'}`,
                      bottom: `${playerCards.length === 5 ? '28vw' :
                        playerCards.length === 4 ? '25vw' :
                          playerCards.length === 3 ? '23vw' :
                            playerCards.length === 2 ? '20vw' :
                              playerCards.length === 1 ? '20vw' : '29vw'}`,
                      transform: 'translateX(-50%)',
                    } :
                      (playerCards2.length > 0 &&
                        gameObject?.seats[2]?.isSplit &&
                        gameObject?.seats[2].selectedHand == 1 &&
                        !gameObject.handOver && !isBigerMobail && !IsTablet && !isBigTablet & isMobile
                      ) ?
                        {
                          left: `${playerCards.length === 1 ? '50vw' :
                            playerCards.length === 2 ? '50vw' :
                              playerCards.length === 3 ? '48vw' :
                                playerCards.length === 4 ? '47vw' :
                                  playerCards.length === 5 ? '46vw' : '45vw'}`,
                          bottom: `${playerCards.length === 5 ? '20vw' :
                            playerCards.length === 4 ? '18vw' :
                              playerCards.length === 3 ? '14vw' :
                                playerCards.length === 2 ? '10vw' :
                                  playerCards.length === 1 ? '10vw' : '21vw'}`,
                          transform: 'translateX(-50%)',
                        } :
                        (playerCards2.length > 0 && !isBigerMobail && !IsTablet && !isBigTablet && isMobile) && {
                          left: `${playerCards.length === 1 ? '50vw' :
                            playerCards.length === 2 ? '50vw' :
                              playerCards.length === 3 ? '48vw' :
                                playerCards.length === 4 ? '47vw' :
                                  playerCards.length === 5 ? '46vw' : '45vw'}`,
                          bottom: `${playerCards.length === 5 ? '27vw' :
                            playerCards.length === 4 ? '26vw' :
                              playerCards.length === 3 ? '24vw' :
                                playerCards.length === 2 ? '20vw' :
                                  playerCards.length === 1 ? '18vw' : '28vw'}`,
                          transform: 'translateX(-50%)',
                        })
                    ),
                    ...((isBigerMobail && !IsTablet && !isBigTablet) && ((isMobile && playerCards2.length === 0) ? {
                      left: `${playerCards.length === 1 ? '26vw' :
                        playerCards.length === 2 ? '25vw' :
                          playerCards.length === 3 ? '22vw' :
                            playerCards.length === 4 ? '19vw' :
                              playerCards.length === 5 ? '17vw' : '16vw'}`,
                      bottom: `${playerCards.length === 5 ? '40vw' :
                        playerCards.length === 4 ? '39vw' :
                          playerCards.length === 3 ? '37vw' :
                            playerCards.length === 2 ? '35vw' :
                              playerCards.length === 1 ? '35vw' : '41vw'}`,
                      transform: 'translateX(-50%)',
                    } :
                      (playerCards2.length > 0 &&
                        gameObject?.seats[2]?.isSplit &&
                        gameObject?.seats[2].selectedHand == 1 &&
                        !gameObject.handOver && !IsTablet && !isBigTablet
                      ) ?
                        {
                          left: `${playerCards.length === 1 ? '50vw' :
                            playerCards.length === 2 ? '50vw' :
                              playerCards.length === 3 ? '48vw' :
                                playerCards.length === 4 ? '47vw' :
                                  playerCards.length === 5 ? '46vw' : '45vw'}`,
                          bottom: `${playerCards.length === 5 ? '32vw' :
                            playerCards.length === 4 ? '31vw' :
                              playerCards.length === 3 ? '30vw' :
                                playerCards.length === 2 ? '26vw' :
                                  playerCards.length === 1 ? '26vw' : '33vw'}`,
                          transform: 'translateX(-50%)',
                        } :
                        (playerCards2.length > 0 && !IsTablet && !isBigTablet) && {
                          left: `${playerCards.length === 1 ? '50vw' :
                            playerCards.length === 2 ? '50vw' :
                              playerCards.length === 3 ? '48vw' :
                                playerCards.length === 4 ? '47vw' :
                                  playerCards.length === 5 ? '46vw' : '45vw'}`,
                          bottom: `${playerCards.length === 5 ? '39vw' :
                            playerCards.length === 4 ? '38vw' :
                              playerCards.length === 3 ? '36vw' :
                                playerCards.length === 2 ? '33vw' :
                                  playerCards.length === 1 ? '33vw' : '40vw'}`,
                          transform: 'translateX(-50%)',
                        })
                    ),
                    ...(IsTablet && ((isMobile && playerCards2.length === 0) ? {
                      left: `${playerCards.length === 1 ? '26vw' :
                        playerCards.length === 2 ? '25vw' :
                          playerCards.length === 3 ? '24vw' :
                            playerCards.length === 4 ? '23vw' :
                              playerCards.length === 5 ? '22vw' : '20vw'}`,
                      bottom: `${playerCards.length === 5 ? '27vw' :
                        playerCards.length === 4 ? '26vw' :
                          playerCards.length === 3 ? '25vw' :
                            playerCards.length === 2 ? '24vw' :
                              playerCards.length === 1 ? '22vw' : '29vw'}`,
                      transform: 'translateX(-50%)',
                    } :
                      (playerCards2.length > 0 &&
                        gameObject?.seats[2]?.isSplit &&
                        gameObject?.seats[2].selectedHand == 1 &&
                        !gameObject.handOver && IsTablet
                      ) ?
                        {
                          left: `${playerCards.length === 1 ? '50vw' :
                            playerCards.length === 2 ? '50vw' :
                              playerCards.length === 3 ? '48vw' :
                                playerCards.length === 4 ? '47vw' :
                                  playerCards.length === 5 ? '46vw' : '45vw'}`,
                          bottom: `${playerCards.length === 5 ? '29vw' :
                            playerCards.length === 4 ? '28vw' :
                              playerCards.length === 3 ? '26vw' :
                                playerCards.length === 2 ? '24vw' :
                                  playerCards.length === 1 ? '24vw' : '30vw'}`,
                          transform: 'translateX(-50%)',
                        } :
                        (playerCards2.length > 0 && IsTablet) && {
                          left: `${playerCards.length === 1 ? '50vw' :
                            playerCards.length === 2 ? '50vw' :
                              playerCards.length === 3 ? '46vw' :
                                playerCards.length === 4 ? '45vw' :
                                  playerCards.length === 5 ? '44vw' : '45vw'}`,
                          bottom: `${playerCards.length === 5 ? '38vw' :
                            playerCards.length === 4 ? '37vw' :
                              playerCards.length === 3 ? '34vw' :
                                playerCards.length === 2 ? '33vw' :
                                  playerCards.length === 1 ? '33vw' : '39vw'}`,
                          transform: 'translateX(-50%)',
                        })),
                    ...(isBigTablet && ((isMobile && playerCards2.length === 0) ? {
                      left: `${playerCards.length === 1 ? '33vw' :
                        playerCards.length === 2 ? '32vw' :
                          playerCards.length === 3 ? '30vw' :
                            playerCards.length === 4 ? '28vw' :
                              playerCards.length === 5 ? '27vw' : '26vw'}`,
                      bottom: `${playerCards.length === 5 ? '29vw' :
                        playerCards.length === 4 ? '28vw' :
                          playerCards.length === 3 ? '27vw' :
                            playerCards.length === 2 ? '26vw' :
                              playerCards.length === 1 ? '24w' : '30vw'}`,
                      transform: 'translateX(-50%)',
                    } :
                      (playerCards2.length > 0 &&
                        gameObject?.seats[2]?.isSplit &&
                        gameObject?.seats[2].selectedHand == 1 &&
                        !gameObject.handOver && isBigTablet
                      ) ?
                        {
                          left: `${playerCards.length === 1 ? '50vw' :
                            playerCards.length === 2 ? '50vw' :
                              playerCards.length === 3 ? '48vw' :
                                playerCards.length === 4 ? '47vw' :
                                  playerCards.length === 5 ? '46vw' : '45vw'}`,
                          bottom: `${playerCards.length === 5 ? '25vw' :
                            playerCards.length === 4 ? '24vw' :
                              playerCards.length === 3 ? '23vw' :
                                playerCards.length === 2 ? '22vw' :
                                  playerCards.length === 1 ? '21vw' : '26vw'}`,
                          transform: 'translateX(-50%)',
                        } :
                        (playerCards2.length > 0 && isBigTablet) && {
                          left: `${playerCards.length === 1 ? '50vw' :
                            playerCards.length === 2 ? '50vw' :
                              playerCards.length === 3 ? '48vw' :
                                playerCards.length === 4 ? '47vw' :
                                  playerCards.length === 5 ? '46vw' : '45vw'}`,
                          bottom: `${playerCards.length === 5 ? '28vw' :
                            playerCards.length === 4 ? '27vw' :
                              playerCards.length === 3 ? '27w' :
                                playerCards.length === 2 ? '26vw' :
                                  playerCards.length === 1 ? '25vw' : '29vw'}`,
                          transform: 'translateX(-50%)',
                        })),

                    zIndex: 1000
                  }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        marginLeft:
                          window.innerWidth > 899
                            ? playerCards.length > 0
                              ? "60%"
                              : "25%"
                            : playerCards.length > 0
                              ? "0%"
                              : "4%",
                        position: "relative",
                        //marginRight:'80%',
                      }}
                    >
                      {gameObject?.seats[2]?.isSplit &&
                        gameObject?.seats[2].selectedHand == 1 &&
                        !gameObject.handOver ? (
                        <div
                          style={{
                            position: "absolute",
                            ...((!isMobile && !isBigerMobail) && {
                              marginTop: "-50%", // Center vertically
                            }),
                            ...(isMobile && {
                              top: "5vh", // Center vertically
                            }),
                            ...(isBigerMobail && {
                              top: "5vh", // Center vertically
                            }),

                            left: "-30px", // Adjust for left side
                            transform: "translateY(-50%)",
                            fontSize: "30px", // Adjust size of arrows
                            color: "blue", // Blue color for the arrow
                          }}
                        >
                          <FaChevronRight /> {/* Right Chevron Icon */}
                        </div>
                      ) : null}
                      {playerCards?.map((card, index) => {
                        if (!isMobile) {
                          return (
                            <Card
                              allCards={playerCards}
                              key={`${card.suit}-${card.rank}-${index}`}
                              card={card}
                              index={index}
                              isDealer={false}
                              borderColor={playerBorderColor}
                              fadeOut={isFadingOut}
                              borderWidth={playerBorderWidth}
                              boxShadow={
                                playerBorderWidth > 0
                                  ? `4px 4px 20px 4px ${playerBorderColor}`
                                  : "none"
                              }
                              animate={card.animate && soundEnabled}
                            />
                          )
                        } else {
                          return (
                            <CardForMobail
                              key={`${card.suit}-${card.rank}-${index}`}
                              card={card}
                              index={index}
                              isDealer={false}
                              borderColor={playerBorderColor}
                              fadeOut={isFadingOut}
                              borderWidth={playerBorderWidth}
                              boxShadow={
                                playerBorderWidth > 0
                                  ? `4px 4px 20px 4px ${playerBorderColor}`
                                  : "none"
                              }
                              animate={card.animate && soundEnabled}
                            />
                          )
                        }
                      })}
                      {gameObject?.seats[2]?.isSplit &&
                        gameObject?.seats[2].selectedHand == 1 &&
                        !gameObject.handOver ? (
                        <div
                          style={{
                            position: "relative",
                            top: `${(isMobile) ? '5vh' : isBigerMobail ? "" : '50%'}`, // Center vertically
                            // left: (isMobile || isBigerMobail)
                            //   ? `${isMobile ? `${(playerCards.length > 1 ? playerCards.length * 10 : 0) + 50}px` : ''}` // or a mobile-specific value
                            //   : `${(playerCards.length > 1 ? playerCards.length * 15 : 0) + 70}px`,
                            // Adjust for left side
                            left: (() => {
                              if (isBigTablet) {
                                // Tablet spacing — adjust to taste
                                return `${(playerCards.length > 1 ? playerCards.length * 13 : 0) + 70}px`;
                              } else if (IsTablet) {
                                // Tablet spacing — adjust to taste
                                return `${(playerCards.length > 1 ? playerCards.length * 13 : 0) + 70}px`;
                              } else if (isMobile) {
                                // Mobile spacing
                                return `${(playerCards.length > 1 ? playerCards.length * 10 : 0) + 50}px`;
                              } else if (isBigerMobail) {
                                // "Bigger mobile" spacing
                                return `${(playerCards.length > 1 ? playerCards.length * 10 : 0) + 50}px`;
                              } else {
                                // Default desktop spacing
                                return `${(playerCards.length > 1 ? playerCards.length * 15 : 0) + 70}px`;
                              }
                            })(),

                            transform: "translateY(-50%)",
                            transition: 'left 0.3s ease, top 0.3s ease, transform 0.3s ease',
                            fontSize: "30px", // Adjust size of arrows
                            color: "blue", // Blue color for the arrow
                          }}
                        >
                          <FaChevronLeft /> {/* Right Chevron Icon */}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <Statistics />
        </div>
        <BlackjackOriginal />
      </div>{" "}
    </>
  );
};

export default BlackjackGame;

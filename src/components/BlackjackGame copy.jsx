import { useState, useEffect, useRef } from "react";
import { Button, Box, TextField, InputAdornment } from "@mui/material";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

import { playShuffleSound } from "../sound/soundManager";

import bitImg from "../assets/img/bit.svg";
import doubleImg from "../assets/img/double.svg";
import handImg from "../assets/img/hand.svg";
import hitImg from "../assets/img/hit.svg";
import x12Img from "../assets/img/1_2xImg.svg";
import splitImg from "../assets/img/split.svg";
import bg_Game_Logo from "../assets/img/bg_Game_Logo.png";
import centerLogo from "../assets/img/centerLogo.svg";
import Footer from "./footer";
import { Card, DeckDisplay } from "./BlackjackGameAssets";

import io from "socket.io-client";
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
} from "../socket/actions";
import { green, red } from "@mui/material/colors";

const BlackjackGame = () => {
  const [gameState, setGameState] = useState("betting");
  const [playerCards, setPlayerCards] = useState([]);
  const [playerCards2, setPlayerCards2] = useState([]);
  const [dealerCards, setDealerCards] = useState([]);

  const [betInput, setBetInput] = useState("");
  const betAmount = parseFloat(betInput) || 0;
  const [playerScore, setPlayerScore] = useState(0);
  const [playerScore2, setPlayerScore2] = useState(0);
  const [dealerScore, setDealerScore] = useState(0);
  const [isDealing, setIsDealing] = useState(false);
  const [gameMessage, setGameMessage] = useState("");
  const [soundEnabled] = useState(true);

  const [playerBorderColor, setPlayerBorderColor] = useState("transparent");
  const [playerBorderColor2, setPlayerBorderColor2] = useState("transparent");
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
  useEffect(() => {
    window.addEventListener("beforeunload", cleanUp);
    window.addEventListener("beforeclose", cleanUp);
    return () => cleanUp();
    // eslint-disable-next-line
  }, []);

  const betAndStartGame = () => {
    console.log("call to start game");
    if (!socket) return;

    if (btnClickRef.current) return;

    btnClickRef.current = true;

    socket.emit(SIT_DOWN, { amount: 2 });
    setTimeout(() => {
      btnClickRef.current = false;
    }, 1100);
  };

  const stay = () => {
    if (!socket) return;

    if (btnClickRef.current) return;

    btnClickRef.current = true;

    socket.emit(STAY, tableId);
    setTimeout(() => {
      btnClickRef.current = false;
    }, 500);
  };

  const split = () => {
    if (!socket) return;

    if (btnClickRef.current) return;

    btnClickRef.current = true;

    socket.emit(SPLIT, tableId);
    setTimeout(() => {
      btnClickRef.current = false;
    }, 500);
  };
  const hit = () => {
    if (!socket) return;
    if (btnClickRef.current) return;

    btnClickRef.current = true;

    socket.emit(HIT, tableId);
    setTimeout(() => {
      btnClickRef.current = false;
    }, 500);
  };

  const double = () => {
    if (!socket) return;
    if (btnClickRef.current) return;

    btnClickRef.current = true;

    socket.emit(DOUBLE, tableId);
    setTimeout(() => {
      btnClickRef.current = false;
    }, 500);
  };
  const AcceptInsurance = () => {
    if (!socket) return;
    if (btnClickRef.current) return;

    btnClickRef.current = true;

    socket.emit(ACCEPT_INSURANCE, tableId);
    setTimeout(() => {
      btnClickRef.current = false;
    }, 500);
  };
  const RejectInsurance = () => {
    if (!socket) return;
    if (btnClickRef.current) return;

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
        // io("http://localhost:4000", {
        io("http://moneytree-api.testsdlc.in/", {
          path: "/socket.io", // Ensure the correct path is used
          transports: ["websocket"], // WebSocket only
          upgrade: false, // If your server only supports WebSocket
          query: {
            playerId: "e39f65ee-5369-42e1-98af-6dda6202f13b",
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
  if (soundEnabled) playShuffleSound();

  // Clear previous player cards (keeping the first card visible)
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
  }, 500); // Adjust timing if more cards are dealt later
};


  // DEALING INITIAL HANDS
  const dealInitialCards = (data) => {
    setIsDealing(true);
    setGameState("dealing");
    setGameMessage("");

    if (soundEnabled) playShuffleSound();

    setPlayerCards([]);
    setDealerCards([]);
    setPlayerCards2([]);

    // Staggered deal animation
    setTimeout(
      () => setDealerCards([{ ...data?.seats[1]?.hand[0], animate: true }]),
      200
    );
    setTimeout(
      () => setPlayerCards([{ ...data?.seats[2]?.hand[0], animate: true }]),
      200
    );

    // Finalize after animation (e.g., 600ms delay)
    setTimeout(() => {
      setIsDealing(false);
      setDealerScore(data?.seats[1]?.points);
      setPlayerScore(data?.seats[2]?.points);
    }, 700); // Adjust timing if more cards are dealt later
  };

  // DEALING INITIAL HANDS
  const dealExtraCards = (data) => {
    setIsDealing(true);
    setGameState("dealing");
    setGameMessage("");

    if (soundEnabled) playShuffleSound();

    if (data?.handOver || data?.seats[1]?.hand.length >= 3) {
      setDealerCards((currDealer) => {
        const newHand = data?.seats[1].hand;

        // Find current hidden card (if any)
        const hasHidden = currDealer.find(
          (card) => card.suit === "hidden" && card.rank === "hidden"
        );

        // If a hidden card exists, attempt to flip it in-place
        if (hasHidden && newHand.length >= 2) {
          const secondCard = newHand[1]; // second card in new data

          // Flip the hidden card by replacing the hidden one at same index
          const updated = [...currDealer];
          const hiddenIndex = currDealer.findIndex(
            (card) => card.suit === "hidden" && card.rank === "hidden"
          );

          if (hiddenIndex !== -1) {
            updated[hiddenIndex] = {
              ...secondCard,
              animate: true, // apply flip animation if needed
            };
          }

          return updated;
        }

        // Fallback: handle normally for handover or >=3 cards
        const filteredDealer = currDealer.filter(
          (card) => card.suit !== "hidden" && card.rank !== "hidden"
        );

        const existingKeys = new Set(
          filteredDealer.map((card) => `${card.suit}-${card.rank}`)
        );

        const uniqueNewCards = newHand.filter(
          (card) =>
            card.suit !== "hidden" &&
            card.rank !== "hidden" &&
            !existingKeys.has(`${card.suit}-${card.rank}`)
        );

        const updatedDealer = [
          ...filteredDealer,
          ...uniqueNewCards.map((card) => ({ ...card, animate: true })),
        ];

        return updatedDealer;
      });
    } else {
      //set dealer cards
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
    }

    //set player cards

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

    // Finalize after animation (e.g., 600ms delay)
    setTimeout(() => {
      setIsDealing(false);
      setDealerScore(data?.seats[1]?.points);
      setPlayerScore(data?.seats[2]?.points);
      setPlayerScore2(data?.seats[2]?.points2);
    }, 700); // Adjust timing if more cards are dealt later

    console.log(
      "checker----",
      data?.seats[2]?.hand?.length,
      new Set(data?.seats[2]?.hand?.map((card) => `${card.rank}`)).size
    );
  };

  useEffect(() => {
    if (gameObject) {
      const playerSeat = gameObject?.seats?.[2];
      const dealerSeat = gameObject?.seats?.[1];

      const pPts = playerSeat?.points;
      const pPts2 = playerSeat?.points2;
      const dPts = dealerSeat?.points ?? dealerScore;
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
        setPlayerBorderColor("transparent");
        setPlayerBorderWidth(0);
        console.log("player 1 not busted");
      }
      if (pPts2 < 21) {
        setPlayerBorderColor2("transparent");
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

      if (pPts < 21 && playerSeat?.isSplit && playerSeat?.selectedHand == 1) {
        setPlayerBorderColor("blue");
        setPlayerBorderWidth(3);
        console.log("player 2 hand  1 current selection");
      }
      if (pPts2 < 21 && playerSeat?.isSplit && playerSeat?.selectedHand == 2) {
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
  }, [playerScore2, playerScore, dealerScore, gameObject]);
  // responsive css

  const [isMobile, setIsMobile] = useState(false);

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

  return (
    <>
      {" "}
      <div
        style={{
          minHeight: "80vh",
          background: "#0C1110",
          padding: "20px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div className="responsive-container">
          {/* Left Panel - Controls */}
          <div
            style={{
              // width: '300px',
              // backgroundColor: '#213743',
              borderRadius: "12px",
              padding: "20px",
              height: "fit-content",
            }}
          >
            <div style={{ marginBottom: "20px" }}>
              <div
                style={{
                  color: "white",
                  marginBottom: "10px",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>Bet Amount</span>
                <span>${betAmount.toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", borderRadius: "8px" }}>
                <TextField
                  type="number"
                  placeholder="0.00000000"
                  value={betInput}
                  onChange={(e) => {
                    const raw = e.target.value;
                    if (/^\d*\.?\d{0,8}$/.test(raw) || raw === "") {
                      setBetInput(raw);
                    }
                  }}
                  onWheel={(e) => e.target.blur()}
                  inputProps={{
                    inputMode: "decimal",
                    style: {
                      MozAppearance: "textfield",
                    },
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Box>
                          <img
                            src={bitImg}
                            alt="bit icon"
                            style={{ height: "20px", width: "20px" }}
                          />
                        </Box>
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: 1,
                      backgroundColor: "#0C1110",
                      color: "#ccc",
                      height: 40,
                      "& input": {
                        padding: "8px 12px",
                      },
                      "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        border: "none",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        border: "none",
                      },
                    },
                  }}
                  sx={{
                    "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      border: "none",
                    },
                    "& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button":
                      {
                        WebkitAppearance: "none",
                        margin: 0,
                      },
                  }}
                />

                <Button
                  size="small"
                  sx={{
                    color: "white",
                    height: 40,
                    minWidth: 30,
                    marginLeft: 1,
                  }}
                >
                  <img src={x12Img} alt="1/2" />
                </Button>
                <Button
                  size="small"
                  sx={{
                    color: "white",
                    height: 40,
                    minWidth: 25,
                    marginLeft: 1,
                  }}
                >
                  <p style={{ fontSize: 12, color: "white" }}>2x</p>
                </Button>
              </div>
            </div>
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
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
                marginBottom: "20px",
              }}
            >
              {!gameObject?.askingInsurance ? (
                <button
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
                    padding: "12px",
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
                    padding: "12px",
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
                    padding: "12px",
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
                    padding: "12px",
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
                  style={{
                    padding: "12px",
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
                  disabled={false}
                  style={{
                    padding: "12px",
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
              onClick={() => {
                betAndStartGame();
              }}
              disabled={
                (gameObject && !gameObject?.handOver) ||
                (gameObject && btnClickRef.current)
              }
              style={{
                width: "100%",
                padding: "15px",
                backgroundColor:
                  (gameObject && !gameObject?.handOver) ||
                  (gameObject && btnClickRef.current)
                    ? "rgb(59 156 115)"
                    : "#0BF191",
                color:
                  (gameObject && !gameObject?.handOver) ||
                  (gameObject && btnClickRef.current)
                    ? "black"
                    : "black",
                border: "none",
                borderRadius: "8px",
                cursor:
                  (gameObject && !gameObject?.handOver) ||
                  (gameObject && btnClickRef.current)
                    ? "not-allowed"
                    : "pointer",
                fontSize: "16px",
                fontWeight: "bold",
              }}
            >
              {gameState === "betting" || gameState === "finished"
                ? "Bet"
                : "Bet"}
            </button>
          </div>

          {/* Right Panel - Game Table */}
          <div className="left-side-container">
            <div
              style={{ backgroundColor: "transparent", flex: 1, width: "100%" }}
            >
              {/* Deck Display */}
              <DeckDisplay  style={{zIndex:100}}/>
              {/* Dealer Section */}
              <div
                style={{
                    display: "flex",           // Enable flexbox
    flexDirection: "column",   // Stack items vertically
    justifyContent: "flex-end",// Push items to bottom
    alignItems: "center",      // Center horizontally
    width: "100%",
    height: "100%",
  
    textAlign: "center",
                }}
              >
                <div
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
                  }}
                >
                  <div
                    style={{
                      justifyContent: "center",
                      //alignItems: "flex-start",
                      //minHeight: "140px",

                      marginLeft: window.innerWidth < 899 ? '-60px' : '0',
                      position: "relative",
                    }}
                  >
                    {dealerCards?.map((card, index) => (
                      <Card
                        key={`${card.suit}-${card.rank}-${index}`}
                        card={card}
                        index={index}
                        borderColor={"transparent"}
                        borderWidth={0}
                        isDealer={true}
                        isJustFlip={
                          index === 1 &&
                          (gameObject?.handOver ||
                            gameObject?.seats[1]?.hand.length >= 3)
                        }
                        isHidden={index === 1 && card?.rank === "hidden"}
                        animate={card.animate && soundEnabled}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div style={{  flex: 1, width: "100%" }}>
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
                  marginTop:'-10px',
              
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "100px",
                  width: "100%",
                 
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
                              <div>
                                <span
                                  style={{
                                    color: "black",
                                    margin: "0px 8px 0px 17px",
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
                    <div
                      style={{
                        backgroundColor: gameObject?.handOver
                          ? playerScore
                            ? playerBorderColor
                            : "transparent" // round over
                          : playerScore
                          ? "#3B413E"
                          : "transparent", // in-play state
                        padding: isBlackjack2 ? "10px 5px" : "4px 20px",
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
                            <div>
                              <span
                                style={{
                                  color: "black",
                                  margin: "0px 8px 0px 17px",
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
                }}
              >
                
                
                {/* Player cards 2 Section */}
                {playerCards2.length > 0 ? (
                 
                    <div
                      style={{
                        width:"90%",
                         display: "flex",            // make the card container flex
        justifyContent: "center",   // center the cards horizontally
        alignItems: "center",       // optional: center vertically
        position: "relative",
        marginLeft:"20%"
        //gap: "10px", 
                      }}
                    >
                      {gameObject?.seats[2]?.isSplit &&
                      gameObject?.seats[2].selectedHand == 2 &&
                      !gameObject.handOver ? (
                        <div
                          style={{
                            position: "absolute",
                            top: "50%", // Center vertically
                            left: "-30px", // Adjust for left side
                            transform: "translateY(-50%)",
                            fontSize: "30px", // Adjust size of arrows
                            color: "blue", // Blue color for the arrow
                          }}
                        >
                          <FaChevronRight /> {/* Right Chevron Icon */}
                        </div>
                      ) : null}
                      {playerCards2?.map((card, index) => (
                        <Card
                          key={`${card.suit}-${card.rank}-${index}`}
                          card={card}
                          index={index}
                          isDealer={false}
                          noAnimation={index == 0 ? true : false}
                          borderColor={playerBorderColor2}
                          borderWidth={playerBorderWidth2}
                          boxShadow={
                            playerBorderWidth2 > 0
                              ? `0px 0px 20px 4px ${playerBorderColor2}`
                              : "none"
                          }
                          animate={card.animate && soundEnabled}
                        />
                      ))}
                      {gameObject?.seats[2]?.isSplit &&
                      gameObject?.seats[2].selectedHand == 2 &&
                      !gameObject.handOver ? (
                        <div
                          style={{
                            position: "absolute",
                            top: "50%", // Center vertically
                            left: `${
                              (playerCards2.length > 1
                                ? playerCards2.length * 15
                                : 0) + 70
                            }px`,
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
               
               

                {/* Player cards 1 Section */}
                <div
                  style={{
                  display: "flex",
                  //flex: 1,
             
                 
                  //marginTop: "-150px",
                 //alignItems: "center",
                  width: "100%",
                
                justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
      justifyContent: "center",
      alignItems: "center",
     marginLeft: window.innerWidth > 899
  ? (playerCards2.length > 0 ? '60%' : '25%')
  : (playerCards2.length > 0 ? '0%' : '4%'),
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
                          top: "50%", // Center vertically
                          left: "-30px", // Adjust for left side
                          transform: "translateY(-50%)",
                          fontSize: "30px", // Adjust size of arrows
                          color: "blue", // Blue color for the arrow
                        }}
                      >
                        <FaChevronRight /> {/* Right Chevron Icon */}
                      </div>
                    ) : null}
                    {playerCards?.map((card, index) => (
                      <Card
                        key={`${card.suit}-${card.rank}-${index}`}
                        card={card}
                        index={index}
                        isDealer={false}
                        borderColor={playerBorderColor}
                        borderWidth={playerBorderWidth}
                        boxShadow={
                          playerBorderWidth > 0
                            ? `4px 4px 20px 4px ${playerBorderColor}`
                            : "none"
                        }
                        animate={card.animate && soundEnabled}
                      />
                    ))}
                    {gameObject?.seats[2]?.isSplit &&
                    gameObject?.seats[2].selectedHand == 1 &&
                    !gameObject.handOver ? (
                      <div
                        style={{
                          position: "absolute",
                          top: "50%", // Center vertically
                          left: `${
                            (playerCards.length > 1
                              ? playerCards.length * 15
                              : 0) + 70
                          }px`, // Adjust for left side
                          transform: "translateY(-50%)",
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
      </div>{" "}
      <Footer />
    </>
  );
};

export default BlackjackGame;

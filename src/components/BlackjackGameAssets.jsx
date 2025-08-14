// BlackjackGameAssets.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  playCardSlideSound,
  playShuffleSound,
  playCardPlacingSound,
  playCardPlacedSound,
  playCardFlipSound,
} from "../sound/soundManager";

import bitImg from "../assets/img/bit.svg";
import doubleImg from "../assets/img/double.svg";
import handImg from "../assets/img/hand.svg";
import hitImg from "../assets/img/hit.svg";
import x12Img from "../assets/img/1_2xImg.svg";
import x2Img from "../assets/img/2xImg.png";
import Group_card from "../assets/img/Group_card.svg";
import Stack_Card from "../assets/img/Stack_Card2.png";
import splitImg from "../assets/img/split.svg";
import bg_Game_Logo from "../assets/img/bg_Game_Logo.png";
import { cardImageMap } from "../utils/cardImageMap";

export {
  bitImg,
  doubleImg,
  handImg,
  hitImg,
  x12Img,
  x2Img,
  splitImg,
  bg_Game_Logo,
  playCardSlideSound,
  playShuffleSound,
  playCardPlacingSound,
  playCardPlacedSound,
  playCardFlipSound,
};

export const DeckDisplay = () => (
  <div
    style={{
      position: "absolute",
      right: "40px",
      display: "flex",
      alignItems: "center",
      gap: "10px",
      zIndex: 1000
    }}
  >
    <div style={{ position: "relative" }}>
      {[0].map((i) => (
        <img
          key={i}
          src={Group_card}
          alt="Card"
          style={{
            top: `${-i * 2}px`,
            left: `${i * 2}px`,

            zIndex: 10 - i,
            zIndex: 1000,
            marginTop: "16px",
            marginRight: "-30px",
          }}
          className="deckDisplay"
        />
      ))}
    </div>
  </div>
);
export const Card = ({
  card,
  borderColor,
  borderWidth,
  isHidden = false,
  index = 0,
  fadeOut = false,
  isDealer = false,
  animate = false,
  isJustFlip = false,
  noAnimation = false,
  allCards
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [slideIn, setSlideIn] = useState(false);
  const prevHidden = useRef(isHidden);
  const lastCardRef = useRef(null);
  useEffect(() => {
    const cardKey = `${card?.suit}-${card?.rank}-${isHidden}`;

    if (lastCardRef.current === cardKey) {
      return; // skip duplicate renders
    }
    lastCardRef.current = cardKey;
    if (noAnimation) {
      setIsVisible(true);
      setFlipped(true);
      setSlideIn(true);
      return;
    }

    let placingTimer, slideTimer, appearTimer, flipTimer, placedSoundTimer;

    if (isJustFlip) {
      setSlideIn(true);
      setIsVisible(true);
      setFlipped(true);
      placedSoundTimer = setTimeout(() => playCardPlacedSound(), 150);
    } else {
      const baseDelay = 20;
      const delayMultiplier = baseDelay + index * 30;
      const soundOffset = 30;
      const flipeTimer = 800;

      if (animate) {
        placingTimer = setTimeout(
          () => playCardPlacingSound(),
          delayMultiplier + soundOffset
        );
      }

      slideTimer = setTimeout(() => setSlideIn(true), delayMultiplier);
      appearTimer = setTimeout(() => setIsVisible(true), delayMultiplier + 30);

      if (!isHidden && !flipped || (prevHidden.current && !isHidden)) {
        flipTimer = setTimeout(() => {
          setFlipped(true);
          placedSoundTimer = setTimeout(() => playCardPlacedSound(), 100);
        }, delayMultiplier + flipeTimer);
      }

    }

    prevHidden.current = isHidden;
    return () => {
      clearTimeout(placingTimer);
      clearTimeout(slideTimer);
      clearTimeout(appearTimer);
      clearTimeout(flipTimer);
      clearTimeout(placedSoundTimer);
    };
  }, [card, index, isHidden, animate, isJustFlip, noAnimation]);
  useEffect(() => {
    if (fadeOut) {
      setIsVisible(false); // triggers CSS opacity transition
    }
  }, [fadeOut]);
  const cardKey = `${card?.suit?.toUpperCase?.() || "HIDDEN"}${card?.rank || ""}`;
  const cardImage = cardImageMap[cardKey];
  const frontBoxShadow =
    borderWidth > 0 ? `0px 0px 10px 3px ${borderColor}` : "none";
  const frontBorder = `${borderWidth}px solid ${borderColor}`;

  return (
    <div
      style={{
        position: "absolute",
        left: `${allCards.length > 2 ? (index * 28 - 10) : index * 28}px`,
        top: `${allCards.length > 2 ? (index * 25 - 5) : index * 25}px`,
        width: "75px",
        height: "110px",
        perspective: "1000px",
        WebkitPerspective: "1000px",
        opacity: isVisible ? 1 : 0,
        zIndex: 10 + index,
        transition: "opacity 0.3s ease", // ✅ smooth fade
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          transform: `
        ${!slideIn && !isJustFlip && !noAnimation
              ? "translateX(400px) translateY(-200px) scale(0.8) rotate(15deg)"
              : "translateX(0) translateY(0) scale(1) rotate(0deg)"
            }
        ${flipped ? "rotateY(180deg)" : "rotateY(0deg)"}
      `,
          WebkitTransform: `
        ${!slideIn && !isJustFlip && !noAnimation
              ? "translateX(400px) translateY(-200px) scale(0.8) rotate(15deg)"
              : "translateX(0) translateY(0) scale(1) rotate(0deg)"
            }
        ${flipped ? "rotateY(180deg)" : "rotateY(0deg)"}
      `,
          transformStyle: "preserve-3d",
          WebkitTransformStyle: "preserve-3d",
          willChange: "transform",
          transition: isJustFlip
            ? "transform 0.4s ease-in-out"
            : "transform 0.8s cubic-bezier(0.4, 0.0, 0.2, 1)",
        }}
      >
        {/* Back */}
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            transform: "rotateY(0deg)",
            WebkitTransform: "rotateY(0deg)",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            // borderRadius: "4px",
            overflow: "hidden",
          }}
        >
          <img
            src={Stack_Card}
            alt="Card Back"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              // borderRadius: "4px",
              display: "block",
            }}
          />
        </div>

        {/* Front */}
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            transform: "rotateY(180deg)",
            WebkitTransform: "rotateY(180deg)",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            // borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: frontBoxShadow,
            boxSizing: "border-box",
            border: frontBorder,
          }}
        >
          <img
            src={cardImage}
            alt={cardKey}
            style={{
              width: "75px",
              height: "110px",
              objectFit: "contain",
              // borderRadius: "8px",
              display: "block",
            }}
          />
        </div>
      </div>
    </div>
  );
};




export const CardForMobail = ({
  card,
  borderColor,
  borderWidth,
  isHidden = false,
  index = 0,
  isDealer = false,
  animate = false,
  fadeOut = false,
  isJustFlip = false,
  noAnimation = false, // No animation flag
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [slideIn, setSlideIn] = useState(false);
  const timers = useRef([]);
  const prevHidden = useRef(isHidden);
  const lastCardRef = useRef(null);
  useEffect(() => {
    const cardKey = `${card?.suit}-${card?.rank}-${isHidden}`;

    if (lastCardRef.current === cardKey) {
      return; // skip duplicate renders
    }
    lastCardRef.current = cardKey;
    timers.current.forEach((t) => clearTimeout(t));
    timers.current = [];

    if (noAnimation) {
      setSlideIn(true);
      setIsVisible(true);
      setFlipped(true);
      setSlideIn(true);
      return;
    }

    if (isJustFlip) {
      setSlideIn(true);
      setIsVisible(true);
      setFlipped(true);
      timers.current.push(
        setTimeout(() => {
          playCardPlacedSound();
        }, 150)
      );
    } else {
      const baseDelay = 20;
      const delayMultiplier = baseDelay + index * 30;
      const soundOffset = 30;

      if (animate) {
        timers.current.push(
          setTimeout(() => {
            playCardPlacingSound();
          }, delayMultiplier + soundOffset)
        );
      }

      timers.current.push(
        setTimeout(() => {
          setSlideIn(true);
        }, delayMultiplier)
      );

      timers.current.push(
        setTimeout(() => {
          setIsVisible(true);
        }, delayMultiplier + 30)
      );

      if (!isHidden && !flipped || (prevHidden.current && !isHidden)) {
        const flipDuration = 800
        timers.current.push(
          setTimeout(() => {
            setFlipped(true);
            timers.current.push(
              setTimeout(() => {
                playCardPlacedSound();
              }, 100)
            );
          }, delayMultiplier + flipDuration)
        );
      }
    }

    prevHidden.current = isHidden;
    return () => {
      timers.current.forEach((t) => clearTimeout(t));
      timers.current = [];
    };
  }, [card, index, isHidden, animate, isJustFlip, noAnimation]);
  useEffect(() => {
    if (fadeOut) {
      setIsVisible(false); // triggers CSS opacity transition
    }
  }, [fadeOut]);

  const cardKey = `${card?.suit?.toUpperCase?.() || "HIDDEN"}${card?.rank || ""}`;
  const cardImage = cardImageMap[cardKey];

  const frontBoxShadow = borderWidth > 0 ? `0px 0px 10px 3px ${borderColor}` : "none";
  const frontBorder = `${0}px solid ${borderColor}`;

  const getCardPosition = () => {
    if (window.innerWidth <= 438) {
      return {
        left: `${index * 18}px`,
        top: `${index * 13}px`,
      };
    } else if (window.innerWidth <= 550) {
      return {
        left: `${index * 20}px`,
        top: `${index * 15}px`,
      };
    } else if (window.innerWidth <= 768) {
      return {
        left: `${index * 25}px`,
        top: `${index * 20}px`,
      };
    } else {
      return {
        left: `${index * 28}px`,
        top: `${index * 25}px`,
      };
    }
  };

  const position = getCardPosition();
  const slideTransform = slideIn || isJustFlip || noAnimation
    ? "translateX(0) translateY(0) scale(1) rotate(0deg)"
    : "translateX(400px) translateY(-200px) scale(0.8) rotate(15deg)";

  const flipTransform = flipped ? "rotateY(180deg)" : "rotateY(0deg)";
  return (
    <div
      className="cardImg"
      style={{
        position: "absolute",
        left: position.left,
        top: position.top,
        zIndex: 10 + index,
        width: "100%",
        height: "100%",
        perspective: "1000px",
        WebkitPerspective: "1000px",
        opacity: isVisible ? 1 : 0,
        transition: "opacity 0.3s ease", // ✅ smooth fade
      }}
    >
      <div
        // style={{
        //   width: "100%",
        //   height: "100%",
        //   transformStyle: "preserve-3d",
        //   WebkitTransformStyle: "preserve-3d",
        //   transition: isJustFlip
        //     ? "transform 0.4s ease-in-out"
        //     : "transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
        //   transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        //   // Slide in effect separate from rotateY:
        //   ...(slideIn
        //     ? { transform: 'transform 0.4s ease-in-out' }
        //     : {
        //       transform: "translateX(400px) translateY(-200px) scale(0.8) rotate(15deg)",
        //     }),
        //   position: "relative",
        //   borderWidth: 1,
        // }}
        style={{
          width: "100%",
          height: "100%",
          transformStyle: "preserve-3d",
          WebkitTransformStyle: "preserve-3d",
          transition: isJustFlip
            ? "transform 0.4s ease-in-out"
            : "transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
          transform: `${slideTransform} ${flipTransform}`,
          WebkitTransform: `${slideTransform} ${flipTransform}`,
          position: "relative",
          // borderWidth: 1,
        }}
      >
        {/* Back face */}
        <div
          // className="cardImg"
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            borderRadius: "4px",
            overflow: "hidden",
          }}
        >
          <img
            className="cardImg"
            src={Stack_Card}
            alt="Card Back"
            style={{
              // width: "100%",
              // height: "100%",
              objectFit: "contain",
              borderRadius: "4px",
              display: "block",
            }}
          />
        </div>

        {/* Front face */}
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            borderRadius: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: frontBoxShadow,
            boxSizing: "border-box",
            border: frontBorder,
            overflow: "hidden",
          }}
        >
          <img
            className="cardImg"
            src={cardImage}
            alt={cardKey}
            style={{
              // width: "100%",
              // height: "100%",
              objectFit: "cover",
              borderRadius: "4px",
              display: "block",
            }}
          />
        </div>
      </div>
    </div>
  );
};


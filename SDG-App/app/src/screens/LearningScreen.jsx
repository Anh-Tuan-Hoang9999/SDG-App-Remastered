import React, { useState } from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import CardData from "../data/CardData";

// Style module for cards
import styles from "./LearningScreen.module.css"

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-cards';
import { EffectCards } from 'swiper/modules';


// TODO: Should have a button in the card itself overlayed above the back-image or a button below to open content in a modal (for usability, content can be queried from db as html or rich text)
const Card = ({ frontImg, backImg }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className={`${styles.cardInner} ${isFlipped ? styles.flipped : ''}`}
      onClick={() => setIsFlipped(f => !f)}
    >
      <div className={`${styles.cardFace} ${styles.cardFront}`}>
        <img src={frontImg.path} alt={frontImg.alt} decoding="async" />
      </div>
      <div className={`${styles.cardFace} ${styles.cardBack}`}>
        <img src={backImg.path} alt={backImg.alt} decoding="async" />
      </div>
    </div>
  );
};

// Only render cards within this many positions of the active index.
// Cards outside the window are empty placeholders — no images to decode.
// 3 is enough for the stacked cards effect to look correct.
const RENDER_WINDOW = 3;

const LearningScreen = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <>
      <section className="flex items-center justify-center w-full h-full">
        <Swiper
          effect={'cards'}
          grabCursor={true}
          modules={[EffectCards]}
          className={`mySwiper ${styles.cardsStyle}`}
          speed={150}
          onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
          cardsEffect={{
            perSlideOffset: 8,
            perSlideRotate: 2,
            slideShadows: true,
          }}
        >
          {CardData.map((card, index) => (
            <SwiperSlide key={index} className="shadow-md">
              {Math.abs(index - activeIndex) <= RENDER_WINDOW
                ? <Card frontImg={card.frontImage} backImg={card.backImage} />
                : <div className={styles.cardPlaceholder} />
              }
            </SwiperSlide>
          ))}
        </Swiper>
      </section>
    </>
  );
};

export default LearningScreen;
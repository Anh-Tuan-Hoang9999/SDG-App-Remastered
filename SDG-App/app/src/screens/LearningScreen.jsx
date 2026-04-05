import React, { useState } from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import CardData from "../data/CardData";
import styles from "./LearningScreen.module.css";
import 'swiper/css';
import 'swiper/css/effect-cards';
import { EffectCards } from 'swiper/modules';

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

const RENDER_WINDOW = 3;

const LearningScreen = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const currentCard = CardData[activeIndex];

  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-3">

      {/* ── Header ── */}
      <div className="text-center px-6 pt-2">
        <h2 className="text-base font-bold leading-tight" style={{ color: '#1A2E1A' }}>
          {currentCard?.title ?? 'SDG Cards'}
        </h2>
        <p className="text-xs mt-1" style={{ color: '#9BAA9B' }}>
          Tap to flip · Swipe to browse
        </p>
      </div>

      {/* ── Swiper ── */}
      <section className="flex items-center justify-center flex-1 w-full min-h-0">
        <Swiper
          effect="cards"
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

      {/* ── Counter ── */}
      <div className="flex items-center gap-2 pb-3">
        <span className="text-xs font-semibold" style={{ color: '#36656B' }}>
          {activeIndex + 1}
        </span>
        <span className="text-xs" style={{ color: '#DDE6DD' }}>/</span>
        <span className="text-xs" style={{ color: '#9BAA9B' }}>
          {CardData.length}
        </span>
      </div>

    </div>
  );
};

export default LearningScreen;

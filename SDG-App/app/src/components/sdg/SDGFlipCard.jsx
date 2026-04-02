import React, { useState } from 'react';

export default function SDGFlipCard({ sdg }) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    /* Bỏ aspect-[3/5], thêm perspective để hiệu ứng 3D hoạt động */
    <div
      className="w-full cursor-pointer group"
      style={{ perspective: '1000px' }}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      {/* Container chính: Không fix cứng chiều cao để ảnh tự đẩy khung */}
      <div
        className={`relative w-full transition-all duration-700 shadow-lg rounded-lg`}
        style={{ 
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        
        {/* Mặt trước (Front) */}
        <div 
          className="w-full h-full backface-hidden rounded-lg overflow-hidden"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <img
            src={sdg.frontImage}
            alt={`${sdg.title} front`}
            className="w-full h-auto block object-cover" 
          />
        </div>

        {/* Mặt sau (Back) */}
        <div 
          className="absolute inset-0 w-full h-full backface-hidden rounded-lg overflow-hidden bg-white"
          style={{ 
            backfaceVisibility: 'hidden', 
            transform: 'rotateY(180deg)' 
          }}
        >
          <img
            src={sdg.backImage}
            alt={`${sdg.title} back`}
            className="w-full h-full block object-cover"
          />
        </div>
        
      </div>
    </div>
  );
}
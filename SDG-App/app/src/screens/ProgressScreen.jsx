import React from 'react'
import { LuConstruction } from "react-icons/lu";

const ProgressScreen = () => {
  return (
    <div
      className='flex flex-col items-center justify-center h-full gap-4 px-8 text-center'
      style={{ color: '#637063' }}
    >
      <div
        className='w-16 h-16 rounded-2xl flex items-center justify-center'
        style={{ background: '#EEF2EE', border: '1px solid #DDE6DD' }}
      >
        <LuConstruction style={{ fontSize: '2rem', color: '#36656B' }} />
      </div>
      <div>
        <h2 className='text-base font-bold mb-1' style={{ color: '#1A2E1A' }}>Under Development</h2>
        <p className='text-sm' style={{ color: '#637063' }}>
          Progress tracking is coming soon. Check back after completing some activities.
        </p>
      </div>
    </div>
  );
};

export default ProgressScreen;

import React from 'react'
import { LuConstruction } from "react-icons/lu";

const ProgressScreen = () => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            gap: '12px',
            color: '#888',
        }}>
            {/* <span style={{ fontSize: '2rem' }}></span> */}
            <LuConstruction className='text-[4em]' />
            <h2 style={{ margin: 0, fontWeight: 600 }}>Under Development</h2>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>This screen is a work in progress.</p>
        </div>
    )
}

export default ProgressScreen
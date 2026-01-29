import React from 'react'
import { useNavigate } from 'react-router-dom'
import logoSrc from '../images/home2.png'

export default function Start() {
    const navigate = useNavigate()
  return (
    <main
      aria-label="Start page"
      style={{
        height: '100svh',
        display: 'flex',
        background: '#18375d',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        boxSizing: 'border-box'
      }}
    >
      <style>{`
        .start-wrap { text-align: center; color: #fff; }
        .start-logo {
          width: 72vmin;
          max-width: 760px;
          height: auto;
          display: block;
          margin: 0 auto 28px;
          border-radius: 8px;
          box-shadow: 0 12px 40px rgba(0,0,0,0.45);
          animation: float 6s ease-in-out infinite, fadeIn .6s ease both;
        }
        @keyframes float {
          0% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(.98); }
          to { opacity: 1; transform: scale(1); }
        }
        .start-actions { 
            display: flex; 
            gap: 12px; 
            justify-content: center; 
            }
            
        .btn {
          padding: 16px 28px;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          background: rgba(255,255,255,0.92);
          color: #0b2540;
        }
      `}</style>

      <div className="start-wrap">
        <img src={logoSrc} alt="Analysis Tool" className="start-logo" />
        <div className="start-actions">
          <button className="btn" onClick={() => navigate('/app')}>Begin</button>
        </div>
      </div>
    </main>
  )
}
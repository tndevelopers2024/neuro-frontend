import React from 'react';

const Maintenance = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#0f172a', /* Dark slate */
      color: '#f8fafc',
      fontFamily: '"Inter", "Outfit", sans-serif',
      textAlign: 'center',
      padding: '20px',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Background glowing effects */}
      <div style={{
        position: 'absolute',
        top: '-20%',
        left: '-10%',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, rgba(0,0,0,0) 70%)',
        zIndex: 0
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '-20%',
        right: '-10%',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(56,189,248,0.15) 0%, rgba(0,0,0,0) 70%)',
        zIndex: 0
      }}></div>

      <div style={{
        backgroundColor: 'rgba(30, 41, 59, 0.7)',
        padding: '50px',
        borderRadius: '24px',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.05)',
        maxWidth: '650px',
        zIndex: 1,
        animation: 'fadeInUp 0.8s ease-out'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #8b5cf6 0%, #38bdf8 100%)',
          marginBottom: '30px',
          boxShadow: '0 10px 25px rgba(139, 92, 246, 0.4)'
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'white' }}>
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
        </div>
        
        <h1 style={{
          fontSize: '3.5rem',
          fontWeight: '800',
          margin: '0 0 20px 0',
          background: 'linear-gradient(135deg, #f8fafc 0%, #94a3b8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-1px'
        }}>
          We'll be back soon
        </h1>
        
        <p style={{
          fontSize: '1.25rem',
          lineHeight: '1.7',
          color: '#cbd5e1',
          marginBottom: '40px',
          fontWeight: '400'
        }}>
          Neuro Mind Scholars is currently undergoing scheduled maintenance to bring you a faster and more stable learning experience. Thank you for your patience!
        </p>
        
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '10px'
        }}>
          <div className="dot" style={{ animationDelay: '0s' }}></div>
          <div className="dot" style={{ animationDelay: '0.2s' }}></div>
          <div className="dot" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>

      <style>
        {`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes pulse-dot {
            0%, 100% { transform: scale(1); opacity: 0.5; }
            50% { transform: scale(1.5); opacity: 1; background-color: #38bdf8; }
          }
          .dot {
            width: 12px;
            height: 12px;
            background-color: #8b5cf6;
            border-radius: 50%;
            animation: pulse-dot 1.4s infinite ease-in-out both;
          }
        `}
      </style>
    </div>
  );
};

export default Maintenance;

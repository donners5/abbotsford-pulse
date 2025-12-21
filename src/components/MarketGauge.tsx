export const MarketGauge = ({ value, label }: { value: number, label: string }) => {
  // Logic: 0% = -90deg, 100% = 90deg
  const rotation = (value * 1.8) - 90; 
  const circumference = 283; 
  const progress = circumference - (value / 100) * circumference;

  return (
    <div style={{ 
      backgroundColor: '#1f333c', border: '1px solid #d6b27d', borderRadius: '8px', 
      padding: '20px 20px', textAlign: 'center', height: '100%', 
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      boxSizing: 'border-box'
    }}>
      <div>
        <h3 style={{ color: '#d6b27d', textTransform: 'uppercase', fontSize: '1rem', letterSpacing: '3px', fontWeight: 'bold', marginBottom: '15px' }}>
          Market Pressure
        </h3>
        
        <div style={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <svg width="220" height="120" viewBox="0 0 120 70">
            {/* Background Track */}
            <path
              d="M 10 60 A 50 50 0 0 1 110 60"
              fill="none"
              stroke="#041c24"
              strokeWidth="10"
              strokeLinecap="round"
            />
            {/* Progress Curve */}
            <path
              d="M 10 60 A 50 50 0 0 1 110 60"
              fill="none"
              stroke="#d6b27d"
              strokeWidth="10"
              strokeLinecap="round"
              strokeOpacity="0.3"
              strokeDasharray={circumference}
              strokeDashoffset={progress}
              style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
            />
            
            {/* THE NEEDLE: A gold line pointing from the center base */}
            <line 
              x1="60" y1="60" 
              x2="60" y2="15" 
              stroke="#d6b27d" 
              strokeWidth="3" 
              strokeLinecap="round"
              style={{ 
                transformOrigin: '60px 60px',
                transform: `rotate(${rotation}deg)`,
                transition: 'transform 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
              }}
            />
            
            {/* Center Cap Pin */}
            <circle cx="60" cy="60" r="4" fill="#d6b27d" />
          </svg>

          {/* MOVED: Percentage is now below the gauge for better visibility */}
          <div style={{ marginTop: '5px', textAlign: 'center' }}>
            <span style={{ fontSize: '3rem', fontWeight: 'bold', color: '#fff', display: 'block', lineHeight: '1' }}>
              {value}%
            </span>
            <p style={{ color: '#7c8c89', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', margin: '5px 0 0 0' }}>
              Ratio
            </p>
          </div>
        </div>
      </div>
      
      <p style={{ color: '#7c8c89', fontSize: '0.9rem', fontStyle: 'italic', marginTop: '10px' }}>
        {label} Sector
      </p>
    </div>
  );
};
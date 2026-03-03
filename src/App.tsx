import { useState, useEffect } from 'react';
import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import { MarketGauge } from './components/MarketGauge';
import { NegotiationInsight } from './components/NegotiationInsight';
import { ChatAssistant } from './ChatAssistant';
import { uploadMonthlyData } from './adminUploader'; // Ensure this file exists

export default function App() {
  // 1. AUTOMATED DATE LOGIC
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthIdx = now.getMonth();
  const monthNames = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

  const years = Array.from({ length: currentYear - 2014 }, (_, i) => currentYear - i);
  const monthsList = years.flatMap(y => 
    [...monthNames].reverse().map(m => ({ id: `${m}_${y}`, label: `${m.toUpperCase()} ${y}` }))
  ).filter(m => {
    const [mName, mYear] = m.id.split('_');
    const mIdx = monthNames.indexOf(mName);
    return parseInt(mYear) < currentYear || (parseInt(mYear) === currentYear && mIdx < currentMonthIdx);
  });

  // 2. STATE
  const [category, setCategory] = useState('detached');
  const [selectedMonth, setSelectedMonth] = useState(monthsList[0]?.id || 'dec_2025'); 
  const [marketStats, setMarketStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 850);

  // 3. WINDOW RESIZE
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 850);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 4. DATA FETCHING
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const docSnap = await getDoc(doc(db, "abbotsford_stats", selectedMonth));
        if (docSnap.exists()) {
          setMarketStats(docSnap.data());
        } else {
          setMarketStats(null);
        }
      } catch (error) {
        console.error("Firebase Fetch Error:", error);
      }
      setLoading(false);
    };
    fetchStats();
  }, [selectedMonth]);

  if (loading) return (
    <div style={{ background: '#041c24', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#d6b27d', fontFamily: 'sans-serif' }}>
      VERIFYING MARKET DATA...
    </div>
  );

  const current = marketStats ? marketStats[category] : null;
  const formatCurrency = (val: number) => new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(val);

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: isMobile ? '15px' : '30px', backgroundColor: '#041c24', color: 'white', minHeight: '100vh', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' }}>
      
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid rgba(214,178,125,0.3)', paddingBottom: '15px' }}>
        <h2 style={{ fontSize: '1.2rem', letterSpacing: '3px', margin: 0, fontWeight: 'bold', color: '#d6b27d' }}>DON GOERTZ</h2>
        <a href="https://go.dongoertz.com/bookacallwithdon-1462" target="_blank" rel="noopener noreferrer" style={{ padding: '10px 20px', backgroundColor: '#d6b27d', color: '#041c24', borderRadius: '4px', fontWeight: 'bold', textDecoration: 'none', fontSize: '0.75rem' }}>BOOK CALL</a>
      </header>

      <section style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: isMobile ? '2rem' : '3rem', fontWeight: 'bold', marginBottom: '20px' }}>Abbotsford Market Pulse</h1>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {['detached', 'townhouse', 'apartment'].map(type => (
            <button key={type} onClick={() => setCategory(type)} style={{ padding: '10px 20px', backgroundColor: category === type ? '#d6b27d' : 'transparent', color: category === type ? '#041c24' : '#d6b27d', border: '1px solid #d6b27d', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
              {type}
            </button>
          ))}
          <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} style={{ padding: '8px', backgroundColor: '#1f333c', color: 'white', border: '1px solid #d6b27d', borderRadius: '4px', fontSize: '0.85rem' }}>
            {monthsList.map(m => (<option key={m.id} value={m.id}>{m.label}</option>))}
          </select>
        </div>
      </section>

      <main style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '25px', alignItems: 'stretch' }}>
        <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '25px' }}>
          <section style={{ backgroundColor: '#1f333c', border: '1px solid rgba(214,178,125,0.4)', padding: '25px', borderRadius: '8px' }}>
            <h3 style={{ color: '#d6b27d', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '3px', marginBottom: '15px', fontWeight: 'bold' }}>Benchmark Pricing Analysis</h3>
            <p style={{ fontSize: isMobile ? '2.8rem' : '3.6rem', fontWeight: 'bold', color: '#d6b27d', margin: '5px 0' }}>{formatCurrency(current?.benchmark || 0)}</p>
            <div style={{ display: 'flex', gap: '30px', marginTop: '15px' }}>
              <div><p style={{ color: '#7c8c89', fontSize: '0.7rem', margin: 0 }}>MONTHLY</p><p style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: 0 }}>{current?.oneMonthChange || 0}%</p></div>
              <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '30px' }}><p style={{ color: '#7c8c89', fontSize: '0.7rem', margin: 0 }}>YEARLY</p><p style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: 0 }}>{current?.oneYearChange || 0}%</p></div>
            </div>
          </section>

          <section style={{ backgroundColor: '#1f333c', border: '1px solid rgba(214,178,125,0.4)', padding: '25px', borderRadius: '8px', flex: 1 }}>
            <h3 style={{ color: '#d6b27d', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '3px', marginBottom: '15px', fontWeight: 'bold' }}>Market Intelligence</h3>
            <NegotiationInsight ratio={current?.salesToActiveRatio || 0} type={category} />
          </section>
        </div>

        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', backgroundColor: '#1f333c', borderRadius: '8px', padding: '20px', border: '1px solid rgba(214,178,125,0.4)' }}>
          <MarketGauge key={`${category}-${selectedMonth}`} value={current?.salesToActiveRatio || 0} label={category} />
        </div>
      </main>

      <footer style={{ marginTop: '60px', borderTop: '1px solid #846434', paddingTop: '30px', textAlign: 'center', fontSize: '0.7rem', color: '#7c8c89', lineHeight: '2' }}>
        <p style={{ color: '#d6b27d', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '10px' }}>DON GOERTZ | ROYAL LEPAGE LITTLE OAK REALTY</p>
        <p>REALTOR®, REALTORS®, and the REALTOR® logo are certification marks owned by REALTOR® Canada Inc. and licensed exclusively to CREA. MLS® trademarks are owned by CREA.</p>
        <p style={{ fontStyle: 'italic', marginTop: '10px' }}>Disclaimer: Market data is calculated using restated HPI benchmarks. Reliable but not guaranteed.</p>
      </footer>

      <ChatAssistant category={category} monthId={selectedMonth} />

      {/* ADMIN PANEL - LOCALHOST ONLY */}
      {window.location.hostname === 'localhost' && (
        <div style={{ marginTop: '50px', padding: '20px', border: '2px dashed #d6b27d', borderRadius: '8px' }}>
          <h3 style={{ color: '#d6b27d' }}>ADMIN: DATA UPLOADER</h3>
          <textarea id="csvInput" style={{ width: '100%', height: '100px', background: '#1f333c', color: 'white' }} placeholder="Paste CSV lines here..." />
          <button 
            onClick={async () => {
              const input = (document.getElementById('csvInput') as HTMLTextAreaElement).value;
              const monthId = prompt("Enter ID (e.g. jan_2026)");
              if (!monthId) return;
              try {
                await uploadMonthlyData(monthId, input);
                alert('Success! Refresh to see changes.');
              } catch (err) { alert('Error: ' + err); }
            }}
            style={{ marginTop: '10px', padding: '10px 20px', backgroundColor: '#d6b27d', fontWeight: 'bold' }}
          >
            UPLOAD TO FIREBASE
          </button>
        </div>
      )}
    </div>
  );
}
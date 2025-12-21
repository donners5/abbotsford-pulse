import { useState, useEffect, useRef } from 'react';
import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import { MarketGauge } from './components/MarketGauge';
import { NegotiationInsight } from './components/NegotiationInsight';

/**
 * PRODUCTION VERSION: Clean Branding & Optimized Hierarchy
 */
const ChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([{ role: 'bot', text: "Hello! I'm Don's Market Assistant. I have audited 10 years of data. Ask me about history or current trends!" }]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text }]);
    setInput("");
    setTimeout(() => {
      let res = "Based on audited history, ";
      const q = text.toLowerCase();
      if (q.includes("peak")) res += "Abbotsford Detached prices peaked in March 2022 ($1.54M).";
      else if (q.includes("growth")) res += "benchmarks have grown ~3x since early 2015.";
      else res = "Market conditions vary by neighborhood. I recommend a custom equity report for your street.";
      setMessages(prev => [...prev, { role: 'bot', text: res }, { role: 'bot', text: "Request a report: https://go.dongoertz.com/bookacallwithdon-1462" }]);
    }, 800);
  };

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
      {!isOpen ? (
        <button onClick={() => setIsOpen(true)} style={{ padding: '12px 24px', backgroundColor: '#d6b27d', color: '#041c24', borderRadius: '50px', border: 'none', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', fontSize: '0.85rem' }}>💬 ASK ASSISTANT</button>
      ) : (
        <div style={{ width: 'min(380px, 85vw)', height: '480px', backgroundColor: '#1f333c', border: '1px solid #d6b27d', borderRadius: '12px', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
          <div style={{ padding: '12px 15px', backgroundColor: '#d6b27d', color: '#041c24', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', borderRadius: '11px 11px 0 0' }}>
            <span>Market Assistant</span><button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
          </div>
          <div style={{ flex: 1, padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8rem' }}>
            {messages.map((m, i) => (<div key={i} style={{ alignSelf: m.role === 'bot' ? 'flex-start' : 'flex-end', backgroundColor: m.role === 'bot' ? '#041c24' : '#d6b27d', color: m.role === 'bot' ? 'white' : '#041c24', padding: '10px', borderRadius: '8px', maxWidth: '85%' }}>{m.text}</div>))}
            <div ref={chatEndRef} />
          </div>
          <div style={{ padding: '12px', borderTop: '1px solid #d6b27d', display: 'flex', gap: '8px', backgroundColor: '#041c24', borderRadius: '0 0 11px 11px' }}>
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend(input)} placeholder="Type here..." style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #d6b27d', backgroundColor: '#1f333c', color: 'white' }} />
            <button onClick={() => handleSend(input)} style={{ backgroundColor: '#d6b27d', color: '#041c24', border: 'none', padding: '8px 12px', borderRadius: '4px', fontWeight: 'bold' }}>SEND</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [category, setCategory] = useState('detached');
  const [selectedMonth, setSelectedMonth] = useState('nov_2025');
  const [marketStats, setMarketStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 850);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 850);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const years = Array.from({ length: 11 }, (_, i) => 2025 - i);
  const monthsList = years.flatMap(y => 
    ["dec", "nov", "oct", "sep", "aug", "jul", "jun", "may", "apr", "mar", "feb", "jan"]
    .map(m => ({ id: `${m}_${y}`, label: `${m.toUpperCase()} ${y}` }))
  ).filter(m => !(m.id === "dec_2025"));

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      const docSnap = await getDoc(doc(db, "abbotsford_stats", selectedMonth));
      if (docSnap.exists()) setMarketStats(docSnap.data());
      setLoading(false);
    };
    fetchStats();
  }, [selectedMonth]);

  if (loading) return <div style={{ background: '#041c24', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#d6b27d' }}>VERIFYING MARKET DATA...</div>;

  const current = marketStats ? marketStats[category] : null;
  const formatCurrency = (val: number) => new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(val);

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: isMobile ? '15px' : '30px', backgroundColor: '#041c24', color: 'white', minHeight: '100vh' }}>
      
      {/* BRAND HEADER: Clean & Name-Focused */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid rgba(214,178,125,0.3)', paddingBottom: '15px' }}>
        <h2 style={{ fontSize: '1.2rem', letterSpacing: '3px', margin: 0, fontWeight: 'bold', color: '#d6b27d' }}>DON GOERTZ</h2>
        <a href="https://go.dongoertz.com/bookacallwithdon-1462" target="_blank" rel="noopener noreferrer" style={{ padding: '10px 20px', backgroundColor: '#d6b27d', color: '#041c24', borderRadius: '4px', fontWeight: 'bold', textDecoration: 'none', fontSize: '0.75rem' }}>BOOK CALL</a>
      </header>

      {/* DASHBOARD TITLE */}
      <section style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: isMobile ? '2rem' : '3rem', fontWeight: 'bold', marginBottom: '20px' }}>Abbotsford Market Pulse</h1>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {['detached', 'townhouse', 'apartment'].map(type => (
            <button key={type} onClick={() => setCategory(type)} style={{ padding: '10px 20px', backgroundColor: category === type ? '#d6b27d' : 'transparent', color: category === type ? '#041c24' : '#d6b27d', border: '1px solid #d6b27d', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase' }}>{type}</button>
          ))}
          <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} style={{ padding: '8px', backgroundColor: '#1f333c', color: 'white', border: '1px solid #d6b27d', borderRadius: '4px', fontSize: '0.85rem' }}>
            {monthsList.map(m => (<option key={m.id} value={m.id}>{m.label}</option>))}
          </select>
        </div>
      </section>

      {/* MAIN DASHBOARD CONTENT */}
      <main style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '25px', alignItems: 'stretch' }}>
        
        {/* STATS & INTELLIGENCE COLUMN */}
        <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '25px' }}>
          
          <section style={{ backgroundColor: '#1f333c', border: '1px solid rgba(214,178,125,0.4)', padding: '25px', borderRadius: '8px' }}>
            <h3 style={{ color: '#d6b27d', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '3px', marginBottom: '15px', fontWeight: 'bold' }}>Benchmark Pricing Analysis</h3>
            <p style={{ fontSize: isMobile ? '2.8rem' : '3.6rem', fontWeight: 'bold', color: '#d6b27d', margin: '5px 0' }}>{formatCurrency(current?.benchmark || 0)}</p>
            <div style={{ display: 'flex', gap: '30px', marginTop: '15px' }}>
              <div><p style={{ color: '#7c8c89', fontSize: '0.7rem', margin: 0 }}>MONTHLY</p><p style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: 0 }}>{current?.oneMonthChange}%</p></div>
              <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '30px' }}><p style={{ color: '#7c8c89', fontSize: '0.7rem', margin: 0 }}>YEARLY</p><p style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: 0 }}>{current?.oneYearChange}%</p></div>
            </div>
          </section>

          <section style={{ backgroundColor: '#1f333c', border: '1px solid rgba(214,178,125,0.4)', padding: '25px', borderRadius: '8px', flex: 1 }}>
            <h3 style={{ color: '#d6b27d', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '3px', marginBottom: '15px', fontWeight: 'bold' }}>Market Intelligence</h3>
            <NegotiationInsight ratio={current?.salesToActiveRatio || 0} type={category} />
          </section>
        </div>

        {/* PRESSURE GAUGE COLUMN */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', backgroundColor: '#1f333c', borderRadius: '8px', padding: '20px', border: '1px solid rgba(214,178,125,0.4)' }}>
          <MarketGauge key={`${category}-${selectedMonth}`} value={current?.salesToActiveRatio || 0} label={category} />
        </div>
      </main>

      {/* BROKERAGE FOOTER */}
      <footer style={{ marginTop: '60px', borderTop: '1px solid #846434', paddingTop: '30px', textAlign: 'center', fontSize: '0.7rem', color: '#7c8c89', lineHeight: '2' }}>
        <p style={{ color: '#d6b27d', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '10px' }}>DON GOERTZ | ROYAL LEPAGE LITTLE OAK REALTY</p>
        <p>REALTOR®, REALTORS®, and the REALTOR® logo are certification marks owned by REALTOR® Canada Inc. and licensed exclusively to CREA. MLS® trademarks are owned by CREA. All offices independently owned and operated.</p>
        <p style={{ fontStyle: 'italic', marginTop: '10px' }}>Disclaimer: Market data is calculated using restated HPI benchmarks as of Dec 2025. Reliable but not guaranteed.</p>
      </footer>

      <ChatAssistant />
    </div>
  );
}
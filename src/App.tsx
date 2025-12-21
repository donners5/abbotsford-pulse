import { useState, useEffect, useRef } from 'react';
import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import { MarketGauge } from './components/MarketGauge';
import { NegotiationInsight } from './components/NegotiationInsight';
import { seedMarketData } from './seedData';

/**
 * Don's Market Assistant - Full Interactive Logic
 */
const ChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Hello! I'm Don's Market Assistant. I have audited 10 years of Abbotsford data (2015-2025). You can ask me about price history, the 2022 peak, or current market strategy!" }
  ]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text }]);
    setInput("");

    setTimeout(() => {
      let res = "Looking at the 10-year audited history, ";
      const q = text.toLowerCase();
      if (q.includes("peak") || q.includes("2022")) {
        res += "Abbotsford Detached prices hit a record high in March 2022 ($1.54M). Market Pressure was at 55%, compared to a balanced 14% today.";
      } else if (q.includes("2015") || q.includes("growth") || q.includes("equity")) {
        res += "benchmarks have grown from ~$461k in 2015 to over $1.2M today. That is nearly 3x growth for long-term owners.";
      } else if (q.includes("sell") || q.includes("buy")) {
        res = "We are currently in a 'Balanced' market. For buyers, there is more choice. For sellers, strategic pricing is essential to stand out against higher inventory levels.";
      } else {
        res = "That's a great question about the Abbotsford market. To give you an exact answer for your specific neighborhood, let's look at a custom equity report.";
      }

      setMessages(prev => [...prev, 
        { role: 'bot', text: res },
        { role: 'bot', text: "Would you like a personalized report? Request one from Don: https://go.dongoertz.com/bookacallwithdon-1462" }
      ]);
    }, 800);
  };

  return (
    <div style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 1000 }}>
      {!isOpen ? (
        <button onClick={() => setIsOpen(true)} style={{ padding: '15px 28px', backgroundColor: '#d6b27d', color: '#041c24', borderRadius: '50px', border: 'none', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 8px 20px rgba(0,0,0,0.4)' }}>💬 ASK THE MARKET ASSISTANT</button>
      ) : (
        <div style={{ width: '380px', height: '550px', backgroundColor: '#1f333c', border: '2px solid #d6b27d', borderRadius: '12px', display: 'flex', flexDirection: 'column', boxShadow: '0 15px 50px rgba(0,0,0,0.6)' }}>
          <div style={{ padding: '15px', backgroundColor: '#d6b27d', color: '#041c24', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', borderRadius: '10px 10px 0 0' }}>
            <span>Market Assistant</span>
            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
          </div>
          <div style={{ flex: 1, padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
            {messages.map((m, i) => (<div key={i} style={{ alignSelf: m.role === 'bot' ? 'flex-start' : 'flex-end', backgroundColor: m.role === 'bot' ? '#041c24' : '#d6b27d', color: m.role === 'bot' ? 'white' : '#041c24', padding: '10px', borderRadius: '8px', maxWidth: '85%' }}>{m.text}</div>))}
            <div ref={chatEndRef} />
          </div>
          <div style={{ padding: '15px', borderTop: '1px solid #d6b27d', display: 'flex', gap: '10px', backgroundColor: '#041c24', borderRadius: '0 0 10px 10px' }}>
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend(input)} placeholder="Type your question..." style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #d6b27d', backgroundColor: '#1f333c', color: 'white' }} />
            <button onClick={() => handleSend(input)} style={{ backgroundColor: '#d6b27d', color: '#041c24', border: 'none', padding: '10px 15px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>SEND</button>
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

  const years = Array.from({ length: 11 }, (_, i) => 2025 - i);
  const monthsList = years.flatMap(y => 
    ["dec", "nov", "oct", "sep", "aug", "jul", "jun", "may", "apr", "mar", "feb", "jan"]
    .map(m => ({ id: `${m}_${y}`, label: `${m.toUpperCase()} ${y}` }))
  ).filter(m => !(m.id === "dec_2025"));

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(val);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const docSnap = await getDoc(doc(db, "abbotsford_stats", selectedMonth));
        if (docSnap.exists()) setMarketStats(docSnap.data());
      } catch (e) { console.error("Firebase error:", e); }
      setLoading(false);
    };
    fetchStats();
  }, [selectedMonth]);

  if (loading) return <div style={{ background: '#041c24', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#d6b27d', fontSize: '1.2rem', letterSpacing: '2px' }}>AUDITING 10-YEAR MARKET HISTORY...</div>;

  const current = marketStats ? marketStats[category] : null;

  return (
    <div style={{ maxWidth: '1250px', margin: '0 auto', padding: '10px 20px', backgroundColor: '#041c24', color: 'white', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid #846434', paddingBottom: '10px' }}>
        <div><h2 style={{ fontSize: '1rem', letterSpacing: '2px', margin: 0 }}>DON GOERTZ | <span style={{ color: '#d6b27d' }}>Royal LePage</span></h2><p style={{ fontSize: '0.7rem', color: '#d6b27d', margin: 0, fontStyle: 'italic' }}>"Friendly Service, All of the Time."</p></div>
        <a href="https://go.dongoertz.com/bookacallwithdon-1462" target="_blank" rel="noopener noreferrer" style={{ padding: '10px 22px', backgroundColor: '#d6b27d', color: '#041c24', borderRadius: '4px', fontWeight: 'bold', textDecoration: 'none', fontSize: '0.8rem' }}>BOOK DISCOVERY CALL</a>
      </header>

      <section style={{ textAlign: 'center', marginBottom: '25px' }}>
        <h1 style={{ fontSize: '3.5rem', fontWeight: 'bold', marginBottom: '15px', letterSpacing: '-1px' }}>Abbotsford Market <span style={{ color: '#d6b27d' }}>Pulse</span></h1>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', alignItems: 'center' }}>
          {['detached', 'townhouse', 'apartment'].map(type => (<button key={type} onClick={() => setCategory(type)} style={{ padding: '10px 25px', backgroundColor: category === type ? '#d6b27d' : 'transparent', color: category === type ? '#041c24' : '#d6b27d', border: '2px solid #d6b27d', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase' }}>{type}</button>))}
          <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} style={{ padding: '9px', backgroundColor: '#1f333c', color: 'white', border: '1px solid #d6b27d', borderRadius: '4px', fontSize: '0.85rem', cursor: 'pointer' }}>
            {monthsList.map(m => (<option key={m.id} value={m.id}>{m.label}</option>))}
          </select>
        </div>
      </section>

      <main style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '20px', alignItems: 'stretch' }}>
        <div style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <section style={{ backgroundColor: '#1f333c', border: '1px solid #d6b27d', padding: '25px 35px', borderRadius: '8px' }}>
            <h3 style={{ color: '#d6b27d', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '3px', marginBottom: '15px' }}>Benchmark Pricing Analysis</h3>
            <p style={{ fontSize: '4.2rem', fontWeight: 'bold', color: '#d6b27d', margin: 0, lineHeight: '1' }}>{formatCurrency(current?.benchmark || 0)}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginTop: '20px' }}>
              <div style={{ borderLeft: '4px solid #d6b27d', paddingLeft: '20px' }}><p style={{ color: '#7c8c89', fontSize: '0.75rem', textTransform: 'uppercase' }}>Monthly Change</p><p style={{ fontSize: '2.8rem', fontWeight: 'bold', margin: 0 }}>{current?.oneMonthChange}%</p></div>
              <div style={{ borderLeft: '4px solid #d6b27d', paddingLeft: '20px' }}><p style={{ color: '#7c8c89', fontSize: '0.75rem', textTransform: 'uppercase' }}>Yearly Change</p><p style={{ fontSize: '2.8rem', fontWeight: 'bold', margin: 0 }}>{current?.oneYearChange}%</p></div>
            </div>
          </section>
          <section style={{ backgroundColor: '#1f333c', border: '1px solid #d6b27d', padding: '25px 35px', borderRadius: '8px', flex: 1 }}>
            <h3 style={{ color: '#d6b27d', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '3px', marginBottom: '15px' }}>Market Intelligence</h3>
            <NegotiationInsight ratio={current?.salesToActiveRatio || 0} type={category} />
          </section>
        </div>
        <div style={{ gridColumn: 'span 4', display: 'flex' }}>
          <div style={{ flex: 1, height: '100%' }}><MarketGauge key={`${category}-${selectedMonth}`} value={current?.salesToActiveRatio || 0} label={category} /></div>
        </div>
      </main>

      <ChatAssistant />
      
      <footer style={{ marginTop: 'auto', paddingTop: '60px', paddingBottom: '40px', textAlign: 'center', fontSize: '0.75rem', color: '#7c8c89', lineHeight: '2' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', borderTop: '1px solid #846434', paddingTop: '40px' }}>
          <p style={{ color: '#d6b27d', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '10px', letterSpacing: '1px' }}>DON GOERTZ | ROYAL LEPAGE LITTLE OAK REALTY</p>
          <p>REALTOR®, REALTORS®, and the REALTOR® logo are certification marks owned by REALTOR® Canada Inc. and licensed exclusively to The Canadian Real Estate Association (CREA).</p>
          <p>The MLS® trademark and the MLS® logo are owned by CREA and identify the quality of services provided by real estate professionals who are members of CREA.</p>
          <p>All offices independently owned and operated. Not intended to solicit properties already under contract.</p>
          <button onClick={() => seedMarketData()} style={{ marginTop: '25px', background: 'transparent', border: '1px solid #846434', color: '#846434', cursor: 'pointer', padding: '6px 15px', borderRadius: '4px', fontSize: '0.65rem' }}>ADMIN: SYNC 10-YEAR AUDITED DATA</button>
        </div>
      </footer>
    </div>
  );
}
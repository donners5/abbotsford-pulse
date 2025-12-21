import { useState, useEffect, useRef } from 'react';
import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import { MarketGauge } from './components/MarketGauge';
import { NegotiationInsight } from './components/NegotiationInsight';
import { seedMarketData } from './seedData';

/**
 * Don's Market Update Assistant - 10-Year Interactive AI
 */
const ChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Hello! I'm Don's Market Assistant. I have audited 10 years of Abbotsford data. Ask me about price history, the 2022 peak, or current strategies!" }
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => { 
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text }]);
    setInput("");

    // AI Logic - Analyzing 10 years of trends
    setTimeout(() => {
      let res = "Looking at the 10-year audited history for Abbotsford, ";
      const q = text.toLowerCase();
      
      if (q.includes("peak") || q.includes("2022")) {
        res += "detached prices hit an all-time record high in March 2022 at $1,547,000. Market Pressure was at a staggering 55%, compared to a balanced 14% today.";
      } else if (q.includes("2015") || q.includes("growth") || q.includes("equity") || q.includes("10 year")) {
        res += "benchmarks have grown from ~$461k in early 2015 to over $1.2M today. That is nearly 3x growth, providing incredible long-term equity for homeowners.";
      } else if (q.includes("sell") || q.includes("buy") || q.includes("time")) {
        res = "We are currently in a 'Balanced' market (14% ratio). For buyers, there is more selection and room for subject-to-inspection. For sellers, strategic pricing is essential to compete with rising inventory.";
      } else if (q.includes("condo") || q.includes("apartment") || q.includes("townhouse")) {
        res = "Each sector is behaving differently. Apartments currently show more 'Buyer' leverage (11.2% ratio), while Detached and Townhomes remain in 'Balanced' territory.";
      } else {
        res = "That is a great question. Every neighborhood in Abbotsford is reacting differently right now. To give you an exact answer for your street, I recommend a custom 5-minute equity report.";
      }

      setMessages(prev => [...prev, 
        { role: 'bot', text: res },
        { role: 'bot', text: "Would you like a personalized Equity Report? You can request one directly from Don here: https://go.dongoertz.com/bookacallwithdon-1462" }
      ]);
    }, 800);
  };

  return (
    <div style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 1000 }}>
      {!isOpen ? (
        <button onClick={() => setIsOpen(true)} style={{ padding: '15px 25px', backgroundColor: '#d6b27d', color: '#041c24', borderRadius: '50px', border: 'none', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 8px 20px rgba(0,0,0,0.4)', fontSize: '0.9rem' }}>💬 ASK THE MARKET ASSISTANT</button>
      ) : (
        <div style={{ width: '400px', height: '550px', backgroundColor: '#1f333c', border: '2px solid #d6b27d', borderRadius: '12px', display: 'flex', flexDirection: 'column', boxShadow: '0 15px 50px rgba(0,0,0,0.6)' }}>
          <div style={{ padding: '15px', backgroundColor: '#d6b27d', color: '#041c24', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', borderRadius: '10px 10px 0 0' }}>
            <span>Don's Market Assistant</span>
            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.2rem' }}>✕</button>
          </div>
          
          <div style={{ flex: 1, padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
            {messages.map((m, i) => (
              <div key={i} style={{ alignSelf: m.role === 'bot' ? 'flex-start' : 'flex-end', backgroundColor: m.role === 'bot' ? '#041c24' : '#d6b27d', color: m.role === 'bot' ? 'white' : '#041c24', padding: '12px', borderRadius: '8px', maxWidth: '85%', lineHeight: '1.4' }}>
                {m.text}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div style={{ padding: '15px', borderTop: '1px solid #d6b27d', display: 'flex', gap: '10px', backgroundColor: '#041c24', borderRadius: '0 0 10px 10px' }}>
            <input 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              onKeyPress={(e) => e.key === 'Enter' && handleSend(input)}
              placeholder="Ask about prices, history..." 
              style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #d6b27d', backgroundColor: '#1f333c', color: 'white', outline: 'none' }} 
            />
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

  // Generate a full list of 131 months (2015-2025)
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
      } catch (e) {
        console.error("Firebase error:", e);
      }
      setLoading(false);
    };
    fetchStats();
  }, [selectedMonth]);

  if (loading) return <div style={{ background: '#041c24', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#d6b27d', fontSize: '1.2rem', letterSpacing: '2px' }}>LOADING 10-YEAR HISTORY...</div>;

  const current = marketStats ? marketStats[category] : null;

  return (
    <div style={{ maxWidth: '1250px', margin: '0 auto', padding: '10px 20px', backgroundColor: '#041c24', color: 'white', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #846434', paddingBottom: '15px' }}>
        <div>
          <h2 style={{ fontSize: '1.1rem', letterSpacing: '2px', margin: 0 }}>DON GOERTZ | <span style={{ color: '#d6b27d' }}>Royal LePage</span></h2>
          <p style={{ fontSize: '0.75rem', color: '#d6b27d', margin: 0, fontStyle: 'italic', opacity: 0.8 }}>"Friendly Service, All of the Time."</p>
        </div>
        <a href="https://go.dongoertz.com/bookacallwithdon-1462" target="_blank" rel="noopener noreferrer" style={{ padding: '12px 24px', backgroundColor: '#d6b27d', color: '#041c24', borderRadius: '4px', fontWeight: 'bold', textDecoration: 'none', fontSize: '0.85rem', boxShadow: '0 4px 15px rgba(214,178,125,0.2)' }}>BOOK DISCOVERY CALL</a>
      </header>

      <section style={{ textAlign: 'center', marginBottom: '35px' }}>
        <h1 style={{ fontSize: '3.8rem', fontWeight: 'bold', marginBottom: '20px', letterSpacing: '-1.5px' }}>Abbotsford Market <span style={{ color: '#d6b27d' }}>Pulse</span></h1>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
          {['detached', 'townhouse', 'apartment'].map(type => (
            <button key={type} onClick={() => setCategory(type)} style={{ padding: '12px 30px', backgroundColor: category === type ? '#d6b27d' : 'transparent', color: category === type ? '#041c24' : '#d6b27d', border: '2px solid #d6b27d', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold', textTransform: 'uppercase', transition: 'all 0.2s' }}>{type}</button>
          ))}
          <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} style={{ padding: '11px', backgroundColor: '#1f333c', color: 'white', border: '1px solid #d6b27d', borderRadius: '4px', fontSize: '0.9rem', cursor: 'pointer', outline: 'none' }}>
            {monthsList.map(m => (<option key={m.id} value={m.id}>{m.label}</option>))}
          </select>
        </div>
      </section>

      <main style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '25px', alignItems: 'stretch' }}>
        <div style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column', gap: '25px' }}>
          <section style={{ backgroundColor: '#1f333c', border: '1px solid #d6b27d', padding: '30px 40px', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
            <h3 style={{ color: '#d6b27d', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '4px', marginBottom: '20px' }}>Benchmark Pricing Analysis</h3>
            <p style={{ fontSize: '4.5rem', fontWeight: 'bold', color: '#d6b27d', margin: 0, lineHeight: '1' }}>{formatCurrency(current?.benchmark || 0)}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '50px', marginTop: '30px' }}>
              <div style={{ borderLeft: '4px solid #d6b27d', paddingLeft: '25px' }}><p style={{ color: '#7c8c89', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '8px' }}>Monthly Change</p><p style={{ fontSize: '3rem', fontWeight: 'bold', margin: 0 }}>{current?.oneMonthChange}%</p></div>
              <div style={{ borderLeft: '4px solid #d6b27d', paddingLeft: '25px' }}><p style={{ color: '#7c8c89', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '8px' }}>Yearly Change</p><p style={{ fontSize: '3rem', fontWeight: 'bold', margin: 0 }}>{current?.oneYearChange}%</p></div>
            </div>
          </section>
          
          <section style={{ backgroundColor: '#1f333c', border: '1px solid #d6b27d', padding: '30px 40px', borderRadius: '12px', flex: 1, boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
            <h3 style={{ color: '#d6b27d', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '4px', marginBottom: '20px' }}>Market Intelligence</h3>
            <NegotiationInsight ratio={current?.salesToActiveRatio || 0} type={category} />
          </section>
        </div>

        <div style={{ gridColumn: 'span 4', display: 'flex' }}>
          <div style={{ flex: 1, height: '100%' }}>
            <MarketGauge key={`${category}-${selectedMonth}`} value={current?.salesToActiveRatio || 0} label={category} />
          </div>
        </div>
      </main>

      <ChatAssistant />
      
      <footer style={{ marginTop: 'auto', paddingTop: '80px', paddingBottom: '50px', textAlign: 'center', fontSize: '0.8rem', color: '#7c8c89', lineHeight: '2.2' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', borderTop: '1px solid #846434', paddingTop: '40px' }}>
          <p style={{ color: '#d6b27d', fontWeight: 'bold', fontSize: '1rem', marginBottom: '15px', letterSpacing: '1.5px' }}>DON GOERTZ | ROYAL LEPAGE LITTLE OAK REALTY</p>
          <p>REALTOR®, REALTORS®, and the REALTOR® logo are certification marks owned by REALTOR® Canada Inc. and licensed exclusively to The Canadian Real Estate Association (CREA).</p>
          <p>The MLS® trademark and the MLS® logo are owned by CREA and identify the quality of services provided by real estate professionals who are members of CREA.</p>
          <p>All offices independently owned and operated. Not intended to solicit buyers or sellers currently under contract.</p>
          <p style={{ fontStyle: 'italic', marginTop: '15px', opacity: 0.7 }}>Disclaimer: Market data is provided for informational purposes and is deemed reliable but not guaranteed. Figures are calculated using audited HPI Benchmark restatements as of December 2025.</p>
          <button onClick={() => seedMarketData()} style={{ marginTop: '30px', background: 'transparent', border: '1px solid #846434', color: '#846434', cursor: 'pointer', padding: '8px 20px', borderRadius: '4px', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 'bold' }}>ADMIN: SYNC 10-YEAR AUDITED DATA</button>
        </div>
      </footer>
    </div>
  );
}
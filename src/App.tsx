import { useState, useEffect, useRef } from 'react';
import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import { MarketGauge } from './components/MarketGauge';
import { NegotiationInsight } from './components/NegotiationInsight';

/**
 * Don's Market Assistant - Full Intelligence & Mobile Responsive Build
 * Designed for Abbotsford 10-Year Historical Analysis (2015-2025)
 */
const ChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Hello! I'm Don's Market Assistant. I have audited 10 years of Abbotsford data. Ask me about price history, the 2022 peak, or current strategies!" }
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Smooth scroll to the latest message in the thread
  useEffect(() => { 
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" }); 
    }
  }, [messages]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text }]);
    setInput("");

    // Simulate AI analysis of the 10-year audited dataset
    setTimeout(() => {
      let res = "Looking at the 10-year audited history for Abbotsford, ";
      const q = text.toLowerCase();
      
      if (q.includes("peak") || q.includes("2022") || q.includes("high")) {
        res += "detached prices hit a record high in March 2022 ($1.54M). Market Pressure was at a staggering 55%, compared to a much more balanced 14% today.";
      } else if (q.includes("2015") || q.includes("growth") || q.includes("equity") || q.includes("10 year")) {
        res += "benchmarks have grown from ~$461k in 2015 to over $1.2M today. That is nearly 3x growth for long-term owners, providing incredible equity.";
      } else if (q.includes("sell") || q.includes("buy") || q.includes("move")) {
        res = "We are currently in a 'Balanced' market. For buyers, there is more selection and room for subject-to-inspection. For sellers, sharp pricing is essential to compete with current inventory.";
      } else if (q.includes("condo") || q.includes("apartment") || q.includes("townhouse")) {
        res = "Each sector is behaving differently. Apartments currently show more 'Buyer' leverage (11.2% ratio), while Detached and Townhomes remain in 'Balanced' territory.";
      } else {
        res = "That is a great question. Every neighborhood in Abbotsford is reacting differently right now. To give you an exact answer for your street, let's look at a custom report.";
      }

      setMessages(prev => [...prev, 
        { role: 'bot', text: res },
        { role: 'bot', text: "Would you like a personalized Equity Report? You can request one directly from Don here: https://go.dongoertz.com/bookacallwithdon-1462" }
      ]);
    }, 800);
  };

  return (
    <div style={{ position: 'fixed', bottom: '25px', right: '25px', zIndex: 1000 }}>
      {!isOpen ? (
        <button onClick={() => setIsOpen(true)} style={{ padding: '16px 30px', backgroundColor: '#d6b27d', color: '#041c24', borderRadius: '50px', border: 'none', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 8px 25px rgba(0,0,0,0.5)', fontSize: '0.9rem', letterSpacing: '1px' }}>💬 ASK THE MARKET ASSISTANT</button>
      ) : (
        <div style={{ width: 'min(400px, 85vw)', height: '550px', backgroundColor: '#1f333c', border: '2px solid #d6b27d', borderRadius: '12px', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.7)' }}>
          <div style={{ padding: '18px', backgroundColor: '#d6b27d', color: '#041c24', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', borderRadius: '10px 10px 0 0' }}>
            <span style={{ fontSize: '1rem' }}>Market Insights Assistant</span>
            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.2rem' }}>✕</button>
          </div>
          
          <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px', fontSize: '0.85rem' }}>
            {messages.map((m, i) => (
              <div key={i} style={{ alignSelf: m.role === 'bot' ? 'flex-start' : 'flex-end', backgroundColor: m.role === 'bot' ? '#041c24' : '#d6b27d', color: m.role === 'bot' ? 'white' : '#041c24', padding: '12px 16px', borderRadius: '8px', maxWidth: '85%', lineHeight: '1.5', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
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
              placeholder="Ask about price growth, 2022 peak..." 
              style={{ flex: 1, padding: '12px', borderRadius: '4px', border: '1px solid #d6b27d', backgroundColor: '#1f333c', color: 'white', outline: 'none' }} 
            />
            <button onClick={() => handleSend(input)} style={{ backgroundColor: '#d6b27d', color: '#041c24', border: 'none', padding: '10px 20px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>SEND</button>
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
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Track window size for custom responsive layout logic
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 800;

  // Generate the full list of 131 months (2015-2025)
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
        if (docSnap.exists()) {
          setMarketStats(docSnap.data());
        }
      } catch (e) {
        console.error("Firebase fetch error:", e);
      }
      setLoading(false);
    };
    fetchStats();
  }, [selectedMonth]);

  if (loading) {
    return (
      <div style={{ background: '#041c24', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#d6b27d', fontSize: '1.2rem', letterSpacing: '3px' }}>
        ANALYZING 10 YEARS OF MARKET DATA...
      </div>
    );
  }

  const current = marketStats ? marketStats[category] : null;

  return (
    <div style={{ maxWidth: '1250px', margin: '0 auto', padding: '20px', backgroundColor: '#041c24', color: 'white', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #846434', paddingBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', letterSpacing: '3px', margin: 0, fontWeight: 'bold' }}>DON GOERTZ | <span style={{ color: '#d6b27d' }}>Royal LePage</span></h2>
          <p style={{ fontSize: '0.8rem', color: '#d6b27d', margin: '5px 0 0 0', fontStyle: 'italic', opacity: 0.9 }}>"Friendly Service, All of the Time."</p>
        </div>
        <a href="https://go.dongoertz.com/bookacallwithdon-1462" target="_blank" rel="noopener noreferrer" style={{ padding: '14px 28px', backgroundColor: '#d6b27d', color: '#041c24', borderRadius: '4px', fontWeight: 'bold', textDecoration: 'none', fontSize: '0.9rem', boxShadow: '0 4px 15px rgba(214,178,125,0.3)' }}>BOOK DISCOVERY CALL</a>
      </header>

      <section style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: isMobile ? '2.5rem' : '4rem', fontWeight: 'bold', marginBottom: '20px', letterSpacing: '-2px' }}>Abbotsford Market <span style={{ color: '#d6b27d' }}>Pulse</span></h1>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
          {['detached', 'townhouse', 'apartment'].map(type => (
            <button key={type} onClick={() => setCategory(type)} style={{ padding: '12px 35px', backgroundColor: category === type ? '#d6b27d' : 'transparent', color: category === type ? '#041c24' : '#d6b27d', border: '2px solid #d6b27d', borderRadius: '4px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 'bold', textTransform: 'uppercase', transition: 'all 0.3s ease' }}>{type}</button>
          ))}
          <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} style={{ padding: '12px', backgroundColor: '#1f333c', color: 'white', border: '2px solid #d6b27d', borderRadius: '4px', fontSize: '0.95rem', cursor: 'pointer', outline: 'none' }}>
            {monthsList.map(m => (<option key={m.id} value={m.id}>{m.label}</option>))}
          </select>
        </div>
      </section>

      <main style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(12, 1fr)', gap: '30px', alignItems: 'stretch' }}>
        <div style={{ gridColumn: isMobile ? 'span 1' : 'span 8', display: 'flex', flexDirection: 'column', gap: '30px' }}>
          <section style={{ backgroundColor: '#1f333c', border: '1px solid #d6b27d', padding: isMobile ? '25px' : '40px', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.3)' }}>
            <h3 style={{ color: '#d6b27d', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '5px', marginBottom: '25px' }}>Benchmark Pricing Analysis</h3>
            <p style={{ fontSize: isMobile ? '3rem' : '4.8rem', fontWeight: 'bold', color: '#d6b27d', margin: 0, lineHeight: '1' }}>{formatCurrency(current?.benchmark || 0)}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', marginTop: '40px' }}>
              <div style={{ borderLeft: '5px solid #d6b27d', paddingLeft: '30px' }}><p style={{ color: '#7c8c89', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '10px' }}>Monthly Change</p><p style={{ fontSize: '3.2rem', fontWeight: 'bold', margin: 0 }}>{current?.oneMonthChange}%</p></div>
              <div style={{ borderLeft: '5px solid #d6b27d', paddingLeft: '30px' }}><p style={{ color: '#7c8c89', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '10px' }}>Yearly Change</p><p style={{ fontSize: '3.2rem', fontWeight: 'bold', margin: 0 }}>{current?.oneYearChange}%</p></div>
            </div>
          </section>
          
          <section style={{ backgroundColor: '#1f333c', border: '1px solid #d6b27d', padding: isMobile ? '25px' : '40px', borderRadius: '12px', flex: 1, boxShadow: '0 10px 40px rgba(0,0,0,0.3)' }}>
            <h3 style={{ color: '#d6b27d', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '5px', marginBottom: '25px' }}>Market Intelligence</h3>
            <NegotiationInsight ratio={current?.salesToActiveRatio || 0} type={category} />
          </section>
        </div>

        <div style={{ gridColumn: isMobile ? 'span 1' : 'span 4', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ width: '100%', maxWidth: '400px', height: '100%' }}>
            <MarketGauge key={`${category}-${selectedMonth}`} value={current?.salesToActiveRatio || 0} label={category} />
          </div>
        </div>
      </main>

      <ChatAssistant />
      
      <footer style={{ marginTop: 'auto', paddingTop: '100px', paddingBottom: '60px', textAlign: 'center', fontSize: '0.85rem', color: '#7c8c89', lineHeight: '2.5' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', borderTop: '1px solid #846434', paddingTop: '50px' }}>
          <p style={{ color: '#d6b27d', fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '20px', letterSpacing: '2px' }}>DON GOERTZ | ROYAL LEPAGE LITTLE OAK REALTY</p>
          <p>REALTOR®, REALTORS®, and the REALTOR® logo are certification marks owned by REALTOR® Canada Inc. and licensed exclusively to The Canadian Real Estate Association (CREA).</p>
          <p>The MLS® trademark and the MLS® logo are owned by CREA and identify the quality of services provided by real estate professionals who are members of CREA.</p>
          <p>All offices independently owned and operated. Not intended to solicit buyers or sellers currently under contract.</p>
          <p style={{ fontStyle: 'italic', marginTop: '20px', opacity: 0.8 }}>Disclaimer: Market data is provided for informational purposes and is deemed reliable but not guaranteed. Figures are calculated using audited HPI Benchmark restatements as of December 2025.</p>
        </div>
      </footer>
    </div>
  );
}
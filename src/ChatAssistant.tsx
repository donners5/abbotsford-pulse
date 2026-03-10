import { useState, useEffect, useRef } from 'react';
import { auditedStats } from './data/marketData';
import { hiddenStats } from './data/hiddenStats';
import { db } from './firebase'; 
import { doc, getDoc } from 'firebase/firestore';

interface ChatAssistantProps {
  category: string;
  monthId: string;
}

/**
 * Senior Technical Implementation: ChatAssistant
 * Collection: abbotsford_stats
 * Principle: Aesthetic Integrity & Strategic CTA Logic
 */
export const ChatAssistant = ({ category: propCategory, monthId }: ChatAssistantProps) => {
  // --- 1. STATE & UI MANAGEMENT ---
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [queryCount, setQueryCount] = useState(0); 
  const [activeData, setActiveData] = useState<any>(null);
  const [messages, setMessages] = useState([
    { 
      role: 'bot', 
      text: "Hello! I'm the Market Pulse AI. I have audited 10 years of localized Abbotsford data. How can I help you interpret today's trends?" 
    }
  ]);
  const [isListening, setIsListening] = useState(false);
  const [hasSpeechSupport, setHasSpeechSupport] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // --- 2. BRANDED UI LOGIC: RESET ---
  const handleClearChat = () => {
    setMessages([{ 
      role: 'bot', 
      text: "Market Pulse system reset. I am ready to analyze fresh pricing points or historical volume for you." 
    }]);
    setQueryCount(0);
  };

  // --- 3. ROBUST HYBRID DATA SYNCHRONIZATION ---
  useEffect(() => {
    console.log("%c --- CHAT ASSISTANT DEBUG START ---", "background: #041c24; color: #d6b27d; padding: 5px;");
    
    const syncMarketData = async () => {
      try {
        // UPDATED COLLECTION NAME: abbotsford_stats
        const docRef = doc(db, "abbotsford_stats", monthId); 
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          console.log("✅ FIRESTORE SYNC SUCCESS:", docSnap.data());
          setActiveData({ id: monthId, ...docSnap.data() });
        } else {
          console.warn(`⚠️ FIRESTORE DOC MISSING: abbotsford_stats/${monthId}. Forcing local fallback.`);
          triggerEmergencyFallback();
        }
      } catch (error: any) {
        console.error("❌ FIREBASE PERMISSION ERROR - Forcing local fallback sequence.");
        triggerEmergencyFallback();
      }
    };

    const triggerEmergencyFallback = () => {
      const localRecord = auditedStats.find(s => s.id.toLowerCase() === monthId.toLowerCase()) || auditedStats[0];
      const localVolume = (hiddenStats as any)[monthId] || {};
      
      const merged = {
        id: monthId,
        detached: { ...localRecord.detached, ...localVolume.detached },
        townhouse: { ...localRecord.townhouse, ...localVolume.townhouse },
        apartment: { ...localRecord.apartment, ...localVolume.apartment }
      };
      
      console.log("📍 LOCAL DATA MERGED:", merged);
      setActiveData(merged);
    };

    if (monthId) syncMarketData();
  }, [monthId, propCategory]);

  useEffect(() => { 
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); 
  }, [messages]);

  // --- 3b. VOICE INPUT (OPTION A) ---
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setHasSpeechSupport(false);
      return;
    }

    const recognition = new SpeechRecognitionClass();
    recognition.lang = 'en-CA';
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setInput(transcript);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    setHasSpeechSupport(true);

    return () => {
      recognition.onresult = null;
      recognition.onend = null;
      recognition.onerror = null;
      recognitionRef.current = null;
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch {
        setIsListening(false);
      }
    }
  };

  // --- 4. CORE RESPONSE ENGINE ---
  const handleSend = (text: string) => {
    if (!text.trim() || !activeData) return;
    const userMsg = text.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput("");

    const nextCount = queryCount + 1;
    setQueryCount(nextCount);

    setTimeout(() => {
      const q = userMsg.toLowerCase();

      // --- 4a. INTENT: SHOULD I BUY/SELL GUARDRAIL ---
      const sellBuyPhrases = [
        'good time to sell',
        'good time to buy',
        'should i sell',
        'should i buy',
        'is now a good time to sell',
        'is now a good time to buy',
        'time to sell',
        'time to buy'
      ];
      const isSellBuyIntent = sellBuyPhrases.some(p => q.includes(p)) || (
        (q.includes('sell') || q.includes('buy')) &&
        (q.includes('now') || q.includes('time') || q.includes('today'))
      );

      // Category Resolution
      let cat: 'detached' | 'townhouse' | 'apartment' = propCategory.toLowerCase() as any;
      if (q.includes("apartment")) cat = "apartment";
      else if (q.includes("townhouse")) cat = "townhouse";
      else if (q.includes("detached") || q.includes("house")) cat = "detached";

      // DATE PARSER: Strict Regex boundaries to fix June/March collision
      const monthsMap: { [key: string]: string } = {
        january: "jan", jan: "jan", february: "feb", feb: "feb",
        march: "mar", mar: "mar", april: "apr", apr: "apr",
        may: "may", june: "jun", jun: "jun", july: "jul", jul: "jul",
        august: "aug", aug: "aug", september: "sep", sep: "sep",
        october: "oct", oct: "oct", november: "nov", nov: "nov",
        december: "dec", dec: "dec"
      };

      let targetId = monthId;
      let displayDate = monthId.replace('_', ' ').toUpperCase();

      const foundMonthKey = Object.keys(monthsMap).find(m => {
        const regex = new RegExp(`\\b${m}\\b`, 'i');
        return regex.test(q);
      });

      if (foundMonthKey) {
        const monthKey = monthsMap[foundMonthKey];
        const yearMatch = q.match(/20\d{2}/);
        const year = yearMatch ? yearMatch[0] : (q.includes("last year") ? "2025" : "2026");
        targetId = `${monthKey}_${year}`;
        displayDate = `${monthKey} ${year}`.toUpperCase();
      }

      // Target Data Retrieval
      const historicalMonth = auditedStats.find(s => s.id.toLowerCase() === targetId.toLowerCase());
      const stats = historicalMonth ? (historicalMonth as any)[cat] : (targetId === monthId ? activeData[cat] : null);

      let res = "";

      // Follow-up "yes" after sales volume prompt → treat as sales question
      const lastMessage = messages[messages.length - 1];
      const isSalesFollowupYes =
        ['yes', 'yeah', 'yep', 'sure'].includes(q.trim()) &&
        lastMessage?.role === 'bot' &&
        lastMessage.text.toLowerCase().includes('would you like to see the sales volume');

      // --- 4b. GUARDRAIL RESPONSE FOR BUY/SELL TIMING ---
      if (isSellBuyIntent) {
        const ratio = stats?.salesToActiveRatio ?? activeData[cat]?.salesToActiveRatio ?? 0;
        res = `I'm a market data assistant, not a licensed advisor, so I can't tell you whether now is the right time for you personally to buy or sell. What I can say is that the current ${cat} benchmark for ${displayDate} is $${(stats?.benchmark ?? activeData[cat]?.benchmark ?? 0).toLocaleString()} with a sales-to-active ratio of ${ratio}%. To map this data to your specific home and goals, it's best to speak directly with Don — use the 'Book Call' button at the top of the app to schedule a strategy call.`;
      }
      // Intent Mapping
      else if (q.includes("price") || q.includes("benchmark") || q.includes("worth")) {
        if (stats && stats.benchmark) {
          const change = stats.oneYearChange || 0;
          res = `The ${cat} benchmark for ${displayDate} was $${stats.benchmark.toLocaleString()}. This represents a ${Math.abs(change)}% ${change > 0 ? 'increase' : 'decrease'} compared to the previous year.`;
        } else {
          res = `I'm locating the ${cat} price data for ${displayDate}. While the specific benchmark is being indexed, the segment remains active. Would you like to see sales volume?`;
        }
      } 
      else if (q.includes("sales") || q.includes("sold") || q.includes("how many") || isSalesFollowupYes) {
        const sales = stats?.sales || (hiddenStats as any)[targetId]?.[cat]?.sales;
        if (sales !== undefined) {
          res = `In ${displayDate}, there were ${sales} ${cat} sales recorded in the dataset.`;
        } else {
          res = `I have pricing data for ${displayDate}, but raw sales counts for ${cat}s are currently being verified.`;
        }
      }
      else {
        const benchmark = stats?.benchmark || activeData[cat]?.benchmark;
        res = `For ${displayDate}, the ${cat} benchmark is $${benchmark?.toLocaleString() ?? 'N/A'}. Would you like to see the sales volume?`;
      }

      setMessages(prev => [...prev, { role: 'bot', text: res }]);

      // --- 5. STRATEGIC CTA: DON DIRECTIVE (3RD QUERY) ---
      if (nextCount === 3) {
        setTimeout(() => {
          setMessages(prev => [...prev, { 
            role: 'bot', 
            text: "Data shows market momentum, but your specific equity depends on your street. Book a strategy call with Don using the 'Book Call' button at the top of the app to map this data to your home." 
          }]);
        }, 1200);
      }
    }, 600);
  };

  // --- 6. UI RENDERING: BRAND STANDARDS ---
  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
      {!isOpen ? (
        <button 
          onClick={() => setIsOpen(true)} 
          style={{ 
            backgroundColor: '#d6b27d', color: '#041c24', borderRadius: '50px', border: 'none', 
            padding: '12px 28px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', fontSize: '0.85rem'
          }}
        >
          💬 ASK PULSE AI
        </button>
      ) : (
        <div 
          className="card" 
          style={{ 
            width: 'min(420px, 90vw)', height: '620px', display: 'flex', flexDirection: 'column', padding: 0, 
            overflow: 'hidden', boxShadow: '0 12px 48px rgba(0,0,0,0.5)', backgroundColor: '#041c24', border: '1px solid #846434' 
          }}
        >
          {/* Header */}
          <div style={{ padding: '15px 20px', backgroundColor: '#d6b27d', color: '#041c24', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 'bold', fontSize: '0.9rem', letterSpacing: '1px' }}>MARKET PULSE AI</span>
              <span style={{ fontSize: '0.55rem', opacity: 0.8, fontWeight: 'bold' }}>SELF | AWARE | EMPOWERED</span>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button 
                onClick={handleClearChat} 
                style={{ background: 'rgba(0,0,0,0.1)', border: '1px solid #041c24', borderRadius: '4px', padding: '3px 8px', fontSize: '0.6rem', cursor: 'pointer', fontWeight: 'bold', color: '#041c24' }}
              >
                CLEAR
              </button>
              <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.4rem', color: '#041c24', lineHeight: 1 }}>✕</button>
            </div>
          </div>
          
          {/* Chat Messaging */}
          <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px', backgroundColor: '#1f333c' }}>
            {messages.map((m, i) => (
              <div 
                key={i} 
                style={{ 
                  alignSelf: m.role === 'bot' ? 'flex-start' : 'flex-end', 
                  backgroundColor: m.role === 'bot' ? '#041c24' : '#d6b27d', 
                  color: m.role === 'bot' ? 'white' : '#041c24', 
                  padding: '12px 16px', borderRadius: m.role === 'bot' ? '2px 15px 15px 15px' : '15px 15px 2px 15px', 
                  maxWidth: '85%', fontSize: '0.85rem', lineHeight: '1.5', border: m.role === 'bot' ? '1px solid #846434' : 'none'
                }}
              >
                {m.text}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Compliance Disclaimer */}
          <div style={{ padding: '8px 20px', fontSize: '0.6rem', color: '#7c8c89', backgroundColor: 'rgba(0,0,0,0.2)', textAlign: 'center', borderTop: '1px solid rgba(132,100,52,0.1)', fontStyle: 'italic' }}>
            AI-generated data reliable but not guaranteed. Always consult with a licensed professional.
          </div>

          {/* Input Interface */}
          <div style={{ padding: '20px', backgroundColor: '#041c24', borderTop: '1px solid #846434', display: 'flex', gap: '10px' }}>
            <input 
              value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend(input)} 
              placeholder="Ask about prices or sales volume..." 
              style={{ flex: 1, padding: '12px', borderRadius: '6px', border: '1px solid #846434', backgroundColor: '#1f333c', color: 'white', fontSize: '0.9rem', outline: 'none' }} 
            />
            {hasSpeechSupport && (
              <button
                onClick={toggleListening}
                style={{ 
                  backgroundColor: isListening ? '#ff6666' : '#1f333c',
                  color: '#d6b27d',
                  border: '1px solid #846434',
                  padding: '0 14px',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
                title="Hold a question by voice"
              >
                {isListening ? '●' : '🎤'}
              </button>
            )}
            <button onClick={() => handleSend(input)} style={{ backgroundColor: '#d6b27d', color: '#041c24', border: 'none', padding: '0 25px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>SEND</button>
          </div>
        </div>
      )}
    </div>
  );
};
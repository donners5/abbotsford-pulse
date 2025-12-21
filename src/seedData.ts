import { db } from "./firebase";
import { doc, writeBatch } from "firebase/firestore";
import { auditedStats } from "./data/marketData";

export const seedMarketData = async () => {
  const collectionName = "abbotsford_stats";
  const batchLimit = 50; 
  
  try {
    for (let i = 0; i < auditedStats.length; i += batchLimit) {
      const batch = writeBatch(db);
      const chunk = auditedStats.slice(i, i + batchLimit);

      chunk.forEach((data) => {
        const docRef = doc(db, collectionName, data.id);
        batch.set(docRef, data);
      });

      await batch.commit();
      console.log(`Synced batch ${Math.floor(i / batchLimit) + 1}`);
    }
    alert("Full 10-Year Audited Database Synced Successfully.");
  } catch (error) {
    console.error("Batch sync failed:", error);
    alert("Sync failed. Check console for details.");
  }
};
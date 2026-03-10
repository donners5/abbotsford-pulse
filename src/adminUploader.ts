import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const uploadMonthlyData = async (targetMonthId: string, csvInput: string) => {
  const monthNames = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
  const [m, y] = targetMonthId.split('_');
  const year = parseInt(y);
  const monthIdx = monthNames.indexOf(m);

  // 1. Identify Comparison Months
  const prevMonthId = monthIdx === 0 ? `dec_${year - 1}` : `${monthNames[monthIdx - 1]}_${year}`;
  const lastYearId = `${m}_${year - 1}`;

  console.log(`Fetching comparison data for ${prevMonthId} and ${lastYearId}...`);

  // 2. Fetch Previous Data for Math
  const prevMonthSnap = await getDoc(doc(db, "abbotsford_stats", prevMonthId));
  const lastYearSnap = await getDoc(doc(db, "abbotsford_stats", lastYearId));

  if (!prevMonthSnap.exists() || !lastYearSnap.exists()) {
    throw new Error("Missing historical data in Firebase to calculate percentages.");
  }

  const prevData = prevMonthSnap.data();
  const lastYearData = lastYearSnap.data();

  // 3. Parse CSV Input
  // Format: Property Type, Benchmark Price, Sales, New Listings, Active Listings
  const rows = csvInput.trim().split('\n').slice(1); // Skip header
  const results: any = {};

  rows.forEach(row => {
    const [type, benchmark, sales, newListings, activeListings] = row.split(',');
    const cat = type.toLowerCase().trim(); // 'detached', 'townhouse', or 'apartment'
    const price = parseFloat(benchmark);
    const s = parseFloat(sales);
    const a = parseFloat(activeListings);

    results[cat] = {
      benchmark: price,
      sales: s,
      activeListings: a,
      newListings: parseFloat(newListings),
      salesToActiveRatio: parseFloat(((s / a) * 100).toFixed(1)),
      oneMonthChange: parseFloat((((price / prevData[cat].benchmark) - 1) * 100).toFixed(2)),
      oneYearChange: parseFloat((((price / lastYearData[cat].benchmark) - 1) * 100).toFixed(2))
    };
  });

  // 4. Upload to Firebase
  try {
    await setDoc(doc(db, "abbotsford_stats", targetMonthId), results);
    console.log(`Successfully uploaded ${targetMonthId} to Firebase!`);
  } catch (error) {
    console.error("Error uploading monthly data", error);
    throw error;
  }
};
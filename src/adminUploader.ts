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

  // #region agent log
  fetch('http://127.0.0.1:7605/ingest/4b41fc8c-7b58-4b49-9ac1-5b0181f74fcb', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Debug-Session-Id': 'f0d06d'
    },
    body: JSON.stringify({
      sessionId: 'f0d06d',
      runId: 'initial',
      hypothesisId: 'H1',
      location: 'src/adminUploader.ts:21',
      message: 'uploadMonthlyData comparison ids',
      data: { targetMonthId, prevMonthId, lastYearId },
      timestamp: Date.now()
    })
  }).catch(() => {});
  // #endregion

  // 2. Fetch Previous Data for Math
  const prevMonthSnap = await getDoc(doc(db, "abbotsford_stats", prevMonthId));
  const lastYearSnap = await getDoc(doc(db, "abbotsford_stats", lastYearId));

  if (!prevMonthSnap.exists() || !lastYearSnap.exists()) {
    // #region agent log
    fetch('http://127.0.0.1:7605/ingest/4b41fc8c-7b58-4b49-9ac1-5b0181f74fcb', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Debug-Session-Id': 'f0d06d'
      },
      body: JSON.stringify({
        sessionId: 'f0d06d',
        runId: 'initial',
        hypothesisId: 'H2',
        location: 'src/adminUploader.ts:37',
        message: 'Missing historical data snapshots',
        data: {
          targetMonthId,
          prevMonthIdExists: prevMonthSnap.exists(),
          lastYearIdExists: lastYearSnap.exists()
        },
        timestamp: Date.now()
      })
    }).catch(() => {});
    // #endregion

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

    // #region agent log
    fetch('http://127.0.0.1:7605/ingest/4b41fc8c-7b58-4b49-9ac1-5b0181f74fcb', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Debug-Session-Id': 'f0d06d'
      },
      body: JSON.stringify({
        sessionId: 'f0d06d',
        runId: 'initial',
        hypothesisId: 'H3',
        location: 'src/adminUploader.ts:71',
        message: 'setDoc success',
        data: { targetMonthId },
        timestamp: Date.now()
      })
    }).catch(() => {});
    // #endregion
  } catch (error: any) {
    // #region agent log
    fetch('http://127.0.0.1:7605/ingest/4b41fc8c-7b58-4b49-9ac1-5b0181f74fcb', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Debug-Session-Id': 'f0d06d'
      },
      body: JSON.stringify({
        sessionId: 'f0d06d',
        runId: 'initial',
        hypothesisId: 'H3',
        location: 'src/adminUploader.ts:80',
        message: 'setDoc error',
        data: {
          targetMonthId,
          code: error?.code,
          message: error?.message
        },
        timestamp: Date.now()
      })
    }).catch(() => {});
    // #endregion

    throw error;
  }
};
import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const correctedRows: {
  id: string;
  detached: number;
  townhouse: number;
  apartment: number;
}[] = [
  { id: 'jan_2015', detached: 461800, townhouse: 240900, apartment: 132200 },
  { id: 'feb_2015', detached: 468200, townhouse: 240900, apartment: 134700 },
  { id: 'mar_2015', detached: 475400, townhouse: 244100, apartment: 133500 },
  { id: 'apr_2015', detached: 480300, townhouse: 247300, apartment: 135000 },
  { id: 'may_2015', detached: 484000, townhouse: 248400, apartment: 137000 },
  { id: 'jun_2015', detached: 486300, townhouse: 248200, apartment: 131500 },
  { id: 'jul_2015', detached: 488900, townhouse: 251800, apartment: 130900 },
  { id: 'aug_2015', detached: 491000, townhouse: 252600, apartment: 132200 },
  { id: 'sep_2015', detached: 499500, townhouse: 252200, apartment: 130400 },
  { id: 'oct_2015', detached: 495200, townhouse: 251300, apartment: 129200 },
  { id: 'nov_2015', detached: 504500, townhouse: 253100, apartment: 130200 },
  { id: 'dec_2015', detached: 512900, townhouse: 254900, apartment: 130900 },
  { id: 'jan_2016', detached: 532900, townhouse: 259200, apartment: 131700 },
  { id: 'feb_2016', detached: 556400, townhouse: 261300, apartment: 141400 },
  { id: 'mar_2016', detached: 579100, townhouse: 267200, apartment: 144100 },
  { id: 'apr_2016', detached: 605600, townhouse: 273900, apartment: 151100 },
  { id: 'may_2016', detached: 637200, townhouse: 284300, apartment: 155400 },
  { id: 'jun_2016', detached: 659600, townhouse: 297000, apartment: 161300 },
  { id: 'jul_2016', detached: 659200, townhouse: 307900, apartment: 172000 },
  { id: 'aug_2016', detached: 665500, townhouse: 323300, apartment: 179900 },
  { id: 'sep_2016', detached: 666000, townhouse: 330100, apartment: 185700 },
  { id: 'oct_2016', detached: 667100, townhouse: 338000, apartment: 186500 },
  { id: 'nov_2016', detached: 662200, townhouse: 342000, apartment: 186300 },
  { id: 'dec_2016', detached: 671800, townhouse: 338600, apartment: 187600 },
  { id: 'jan_2017', detached: 671700, townhouse: 340400, apartment: 191200 },
  { id: 'feb_2017', detached: 687100, townhouse: 345400, apartment: 197900 },
  { id: 'mar_2017', detached: 703800, townhouse: 350100, apartment: 201600 },
  { id: 'apr_2017', detached: 721900, townhouse: 360200, apartment: 207200 },
  { id: 'may_2017', detached: 743900, townhouse: 370200, apartment: 215500 },
  { id: 'jun_2017', detached: 769900, townhouse: 378600, apartment: 220500 },
  { id: 'jul_2017', detached: 782200, townhouse: 385600, apartment: 222800 },
  { id: 'aug_2017', detached: 788900, townhouse: 391200, apartment: 226800 },
  { id: 'sep_2017', detached: 802500, townhouse: 400500, apartment: 232900 },
  { id: 'oct_2017', detached: 787900, townhouse: 404900, apartment: 241800 },
  { id: 'nov_2017', detached: 792400, townhouse: 412500, apartment: 246700 },
  { id: 'dec_2017', detached: 806200, townhouse: 416900, apartment: 255100 },
  { id: 'jan_2018', detached: 817600, townhouse: 417200, apartment: 267200 },
  { id: 'feb_2018', detached: 823100, townhouse: 431000, apartment: 289700 },
  { id: 'mar_2018', detached: 834500, townhouse: 446700, apartment: 301800 },
  { id: 'apr_2018', detached: 856600, townhouse: 458200, apartment: 310700 },
  { id: 'may_2018', detached: 867400, townhouse: 468800, apartment: 317300 },
  { id: 'jun_2018', detached: 872800, townhouse: 472100, apartment: 316200 },
  { id: 'jul_2018', detached: 860600, townhouse: 472000, apartment: 305900 },
  { id: 'aug_2018', detached: 866900, townhouse: 473800, apartment: 299300 },
  { id: 'sep_2018', detached: 844100, townhouse: 475500, apartment: 297500 },
  { id: 'oct_2018', detached: 833100, townhouse: 470300, apartment: 291300 },
  { id: 'nov_2018', detached: 811400, townhouse: 460500, apartment: 284600 },
  { id: 'dec_2018', detached: 800500, townhouse: 456800, apartment: 276500 },
  { id: 'jan_2019', detached: 798100, townhouse: 450200, apartment: 273100 },
  { id: 'feb_2019', detached: 813200, townhouse: 447100, apartment: 277200 },
  { id: 'mar_2019', detached: 818600, townhouse: 449300, apartment: 283600 },
  { id: 'apr_2019', detached: 827500, townhouse: 445500, apartment: 285900 },
  { id: 'may_2019', detached: 829000, townhouse: 442800, apartment: 293000 },
  { id: 'jun_2019', detached: 834600, townhouse: 448300, apartment: 290700 },
  { id: 'jul_2019', detached: 828600, townhouse: 444300, apartment: 291500 },
  { id: 'aug_2019', detached: 820600, townhouse: 448500, apartment: 283400 },
  { id: 'sep_2019', detached: 812200, townhouse: 447300, apartment: 280800 },
  { id: 'oct_2019', detached: 813100, townhouse: 447000, apartment: 279700 },
  { id: 'nov_2019', detached: 813100, townhouse: 443900, apartment: 282000 },
  { id: 'dec_2019', detached: 820600, townhouse: 441400, apartment: 282300 },
  { id: 'jan_2020', detached: 816500, townhouse: 445300, apartment: 283100 },
  { id: 'feb_2020', detached: 840200, townhouse: 448500, apartment: 289200 },
  { id: 'mar_2020', detached: 849200, townhouse: 448900, apartment: 293800 },
  { id: 'apr_2020', detached: 854500, townhouse: 445700, apartment: 291000 },
  { id: 'may_2020', detached: 850700, townhouse: 447100, apartment: 292600 },
  { id: 'jun_2020', detached: 853400, townhouse: 447500, apartment: 293900 },
  { id: 'jul_2020', detached: 866700, townhouse: 452600, apartment: 296800 },
  { id: 'aug_2020', detached: 888900, townhouse: 453900, apartment: 294700 },
];

export async function runBulkFixBenchmarks() {
  for (const row of correctedRows) {
    const ref = doc(db, 'abbotsford_stats', row.id);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      console.warn(`Skipping ${row.id}: document does not exist in Firestore.`);
      continue;
    }

    const existing = snap.data() as any;

    const updated = {
      ...existing,
      detached: { ...existing.detached, benchmark: row.detached },
      townhouse: { ...existing.townhouse, benchmark: row.townhouse },
      apartment: { ...existing.apartment, benchmark: row.apartment },
    };

    await setDoc(ref, updated);
    console.log(`Updated benchmarks for ${row.id}`);
  }
}


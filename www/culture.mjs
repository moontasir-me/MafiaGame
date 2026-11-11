// Short, credited film excerpts; the surrounding court verse is original.
export const QUOTES={
 bn:[
  {text:'মহারাজা তোমারে সেলাম',credit:'সত্যজিৎ রায় · গুপী গাইন বাঘা বাইন',url:'https://satyajitray.org/goopy-gyne-bagha-byne-the-adventures-of-goopy-and-bagha/'},
  {text:'দড়ি ধরে মারো টান',credit:'সত্যজিৎ রায় · হীরক রাজার দেশে',url:'https://www.nationalbookagency.com/books/dori-dhore-maro-taan/4241'},
  {text:'মোরা আসি ধেয়ে',credit:'সত্যজিৎ রায় · গুপী বাঘা ফিরে এলো',url:'https://sahityika.in/2026/07/30/সত্যজিতের-সঙ্গীত-চতুর্থ/'},
 ],
 en:[
  {text:'A man’s first duty is to keep himself alive.',credit:'Mario Puzo · The Sicilian',url:'https://www.goodreads.com/work/quotes/812174-the-sicilian?page=1'},
  {text:'At this table, a promise can cost more than a betrayal.',credit:'An original Sicilian affair',url:null},
  {text:'Every family has a secret. Tonight, yours has a vote.',credit:'An original Sicilian affair',url:null},
 ]
};
export function nextQuote(locale,storage=localStorage){
 const deck=QUOTES[locale],key='mafia.quote.'+locale;
 const previous=Number(storage.getItem(key)??-1),index=(previous+1)%deck.length;
 storage.setItem(key,String(index));return deck[index];
}
const nam='https://collection.nam.ac.uk/detail.php?acc=1968-06-269-1';
const umichand='https://en.banglapedia.org/index.php/Umichand';
export const HISTORICAL_ROLES={
 MAFIA:{name:'রবার্ট ক্লাইভ',note:'পলাশীতে কোম্পানির বাহিনীর নেতৃত্বে ছিলেন ক্লাইভ। ঘাতক তাঁর অনুপ্রেরণায় গড়া খেলার চরিত্র।',url:nam},
 BETRAYER:{name:'মীর জাফর আলী খান',note:'সিরাজের সেনাপ্রধান মীর জাফর পলাশীতে যুদ্ধে অংশ নেননি; কোম্পানির সমর্থনে নবাব হন।',url:nam},
 POLICE:{name:'মীর মদন',note:'পলাশীতে সিরাজের পক্ষে লড়া সেনানায়ক। খেলার তদন্তের ক্ষমতা কল্পিত।',url:'https://archive.roar.media/bangla/main/history/mir-madan-the-commandar-who-fought-till-death'},
 DOCTOR:{name:'হাকিম আলী গিলানি',note:'আকবর ও জাহাঙ্গীরের আমলের চিকিৎসক; সিরাজের রাজবৈদ্য নন। এখানে আগের মুঘল যুগের অনুপ্রেরণা।',url:'https://pubmed.ncbi.nlm.nih.gov/12575701/'},
 VILLAGER:{name:'বাংলার সাধারণ মানুষ',note:'কল্পিত যৌথ চরিত্র। নির্দিষ্ট ঐতিহাসিক ব্যক্তির নাম নয়।',url:null},
 ASTROLOGER:{name:'দরবারের কল্পিত গণক',note:'খেলার জন্য গড়া চরিত্র। সিরাজের দরবারের কোনো প্রমাণিত ব্যক্তির পরিচয় নয়।',url:null},
 BODYGUARD:{name:'দরবারের কল্পিত প্রহরী',note:'খেলার জন্য গড়া চরিত্র। নির্দিষ্ট কোনো ঐতিহাসিক পেয়াদার পরিচয় নয়।',url:null}
};
export const HISTORY_CARDS=[
 ...Object.values(HISTORICAL_ROLES).filter(x=>x.url),
 {name:'উমিচাঁদ',note:'উমিচাঁদ ছিলেন বণিক ও দরবারের আলোচনার মধ্যস্থতাকারী; সেনাপতি নন। পলাশীর ষড়যন্ত্রে তাঁর যোগ ছিল।',url:umichand},
 {name:'সিরাজউদ্দৌলা',note:'পলাশীর যুদ্ধ হয় ১৭৫৭ সালের ২৩ জুন। সিরাজের প্রতিপক্ষ কোম্পানির বাহিনীর নেতৃত্বে ছিলেন ক্লাইভ।',url:nam}
];
export function shuffledHistory(random=Math.random){const cards=[...HISTORY_CARDS];for(let i=cards.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[cards[i],cards[j]]=[cards[j],cards[i]];}return cards;}

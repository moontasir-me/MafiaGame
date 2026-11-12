import {BENGALI_CLASSICS} from './bengali-quotes.mjs';
import {characterFor} from './characters.mjs';
export const QUOTES={
 bn:[...BENGALI_CLASSICS],
 en:[{text:'A man’s first duty is to keep himself alive.',credit:'Mario Puzo · The Sicilian',url:'https://www.goodreads.com/work/quotes/812174-the-sicilian?page=1'}]
};
QUOTES.classic=[{text:'The truth will out.',credit:'William Shakespeare · The Merchant of Venice',url:'https://en.wikisource.org/wiki/The_Merchant_of_Venice_(1919)_Yale/Act_2'},{text:'False face must hide what the false heart doth know.',credit:'William Shakespeare · Macbeth',url:'https://en.wikisource.org/wiki/Macbeth_(1918)_Yale/Act_1'}];
export function nextQuote(locale,storage=localStorage){
 const deck=QUOTES[locale],key='mafia.quote.'+locale;
 const previous=Number(storage.getItem(key)??-1),index=(previous+1+Math.floor(Math.random()*(deck.length-1)))%deck.length;
 storage.setItem(key,String(index));return deck[index];
}
const nam='https://collection.nam.ac.uk/detail.php?acc=1968-06-269-1';
const umichand='https://en.banglapedia.org/index.php/Umichand';
export const HISTORICAL_ROLES=Object.fromEntries(['MAFIA','BETRAYER','POLICE','DOCTOR','VILLAGER','ASTROLOGER','BODYGUARD'].map(role=>{const c=characterFor(role,'bn');return [role,{name:c.name,note:c.history,url:c.source}];}));
export const HISTORY_CARDS=[
 ...Object.values(HISTORICAL_ROLES).filter(x=>x.url),
 {name:'উমিচাঁদ',note:'উমিচাঁদ ছিলেন বণিক ও দরবারের আলোচনার মধ্যস্থতাকারী; সেনাপতি নন। পলাশীর ষড়যন্ত্রে তাঁর যোগ ছিল।',url:umichand},
 {name:'সিরাজউদ্দৌলা',note:'পলাশীর যুদ্ধ হয় ১৭৫৭ সালের ২৩ জুন। সিরাজের প্রতিপক্ষ কোম্পানির বাহিনীর নেতৃত্বে ছিলেন ক্লাইভ।',url:nam}
];
export function shuffledHistory(random=Math.random){const cards=[...HISTORY_CARDS];for(let i=cards.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[cards[i],cards[j]]=[cards[j],cards[i]];}return cards;}

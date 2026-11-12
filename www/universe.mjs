// Display names change by universe; stable role IDs keep all game rules consistent.
export const UNIVERSES={
 bn:{title:'Mafia',universeName:'পলাশী',subtitle:'পলাশীর দরবার',era:'মুর্শিদাবাদ · ১৭৫৭',
 headline:'দরবারে ছলের খেলা।<br><em>কার হাতে বাংলা?</em>',
 story:'সিরাজ বসেন বিচার নিয়ে,\nদরবার জমে ছল সাজিয়ে।\nকোম্পানির ঘাতক গোপন ঘরে,\nঘসেটিও ফন্দি ধরে।\nপ্রজার মনে প্রশ্ন রয়—\nকার জয়েতে দেশের জয়?',
 castTitle:'দশটি মুখ, কত যে ছল—কার হাতে যাবে শাসনবল?',quote:"আমি কাকে বিশ্বাস ক’র্‌বো, আমার আপনার কে আছে?",quoteCredit:'গিরিশচন্দ্র ঘোষ · সিরাজদ্দৌলা',quoteUrl:"https://bn.wikisource.org/wiki/%E0%A6%B8%E0%A6%BF%E0%A6%B0%E0%A6%BE%E0%A6%9C%E0%A6%A6%E0%A7%8D%E0%A6%A6%E0%A7%8C%E0%A6%B2%E0%A6%BE_(%E0%A6%97%E0%A6%BF%E0%A6%B0%E0%A6%BF%E0%A6%B6%E0%A6%9A%E0%A6%A8%E0%A7%8D%E0%A6%A6%E0%A7%8D%E0%A6%B0_%E0%A6%98%E0%A7%8B%E0%A6%B7,_%E0%A7%A7%E0%A7%AF%E0%A7%A6%E0%A7%AB)/%E0%A6%9A%E0%A6%A4%E0%A7%81%E0%A6%B0%E0%A7%8D%E0%A6%A5_%E0%A6%85%E0%A6%99%E0%A7%8D%E0%A6%95/%E0%A6%A6%E0%A7%8D%E0%A6%AC%E0%A6%BF%E0%A6%A4%E0%A7%80%E0%A6%AF%E0%A6%BC_%E0%A6%97%E0%A6%B0%E0%A7%8D%E0%A6%AD%E0%A6%BE%E0%A6%99%E0%A7%8D%E0%A6%95",
 roles:{
 MAFIA:{name:'ঘাতক',tag:'কোম্পানির ছল, গোপনে বল',description:'রাতের ছায়ায় আঘাত হানো,\nপ্রজার চোখে ছদ্মবেশ টানো।\nহারলে শেষে নামটি বলো—\nসেনাপতি ধরলে জয়টা তোলো।'},
 DOCTOR:{name:'রাজবৈদ্য',tag:'ওষুধ হাতে, রক্ষার রাতে',description:'প্রতি রাতে একজন বাঁচাও,\nহোস্টের কাছে নামটি জানাও।\nপ্রজার জয় দুয়ারে এলে,\nদুইটি পয়েন্ট তোমার মেলে।'},
 POLICE:{name:'সেনাপতি',tag:'তদন্ত চলে, চক্রান্ত টলে',description:'রাতে একটি পরিচয় জানো,\nনিজের মুখে পর্দা টানো।\nপ্রজার জয়ে দুইটি পাবে,\nশেষ আন্দাজে ধরা না খাবে।'},
 VILLAGER:{name:'প্রজা',tag:'সম্বল কম, বুদ্ধি নয় কম',description:'অস্ত্র নাই, বিচার আছে,\nকানটি রাখো কথার কাছে।\nঘাতক চেনো ভোটের রায়,\nপ্রজার জয়ে একটি পায়।'},
 BETRAYER:{name:'বিশ্বাসঘাতক',tag:'মুখে যে মিত্র, মনে ভিন্ন চিত্র',description:'সত্য ঢাকো ভোটের ছলে,\nপাশে থাকো ঘাতক দলে।\nঘাতক গেলে আক্রমণ নাই,\nদল জিতলেই দুইটি পাই।'},
 ASTROLOGER:{name:'গণক',tag:'রাতে বাঁচে, ভোটের আঁচে',description:'ঘাতক রাতে আঘাত হানে,\nতুমি থাকো অক্ষত প্রাণে।\nভোটের রায়ে বাদটি হবে,\nপ্রজা জিতলে একটি রবে।'},
 BODYGUARD:{name:'রক্ষক',tag:'পাহারা দাও, বিপদ ঠেকাও',description:'প্রতি রাতে পাহারা দাও,\nহোস্টের কাছে নামটি জানাও।\nপ্রজার জয় এলে শেষে,\nএকটি পয়েন্ট নাও হেসে।'}
 }},
 en:{title:'Mafia',universeName:'Sicily',subtitle:'A Sicilian Affair',era:'SICILY · THE FAMILY’S TABLE',
 headline:'Loyalty has a price.<br><em>Who will pay?</em>',
 story:'In this Sicilian village, a favor buys silence and a familiar face promises nothing. The Mafia have made their arrangements. Before the table names a traitor, decide whose loyalty you can afford to trust.',
 castTitle:'Ten faces. Uncertain loyalties.',quote:'A man’s first duty is to keep himself alive.',quoteCredit:'Mario Puzo · The Sicilian',quoteUrl:'https://www.goodreads.com/work/quotes/812174-the-sicilian?page=1',
 roles:{
 MAFIA:{name:'Mafia',tag:'A familiar smile. A hidden order.',description:'Choose a target at night and keep your identity secret. If the village defeats you, one correct final Police guess can still steal the win.'},
 DOCTOR:{name:'Doctor',tag:'A steady hand in an unsteady village.',description:'Try to save one player each night through the host. A village victory earns you 2 points.'},
 POLICE:{name:'Police',tag:'Follow the evidence. Trust carefully.',description:'Ask the host about a suspect each night. Stay hidden: the Mafia’s final Police guess can overturn a village victory. Village win: 2 points.'},
 VILLAGER:{name:'Villager',tag:'Modest means. A perceptive mind.',description:'Listen closely and use the vote to find the Mafia. You have no night ability, but your judgment matters. Village win: 1 point.'},
 BETRAYER:{name:'Betrayer',tag:'Loyalty is only an appearance.',description:'Secretly help the Mafia in discussions and votes. You count toward Mafia parity, but cannot attack after all actual Mafia leave. Mafia team win: 2 points.'},
 ASTROLOGER:{name:'Consigliere',tag:'Untouched by night. Exposed at the vote.',description:'You survive the Mafia’s night attack. The village can still vote you out. Village win: 1 point.'},
 BODYGUARD:{name:'Spy',tag:'Watch from the shadows. Protect an ally.',description:'Secretly protect one player each night through the host. The host resolves protection in person. Village win: 1 point.'}
 }}
};

Object.assign(UNIVERSES.bn,{headline:'পলাশীর দরবার',story:'পলাশীর পটভূমিতে গোপন পরিচয়ের খেলা। আলোচনা ও ভোটে ঘাতকদের খুঁজুন। হোস্ট খেলা পরিচালনা করেন।',castTitle:'চরিত্র ও পরিচয়'});
const plainRoles={MAFIA:['গোপনে আক্রমণ','রাতে একজনকে বেছে নিন। ঘাতকের জয়ে ৩ পয়েন্ট। হেরে গেলে শেষবার সেনাপতির নাম অনুমান করার সুযোগ থাকবে।'],DOCTOR:['একজনকে রক্ষা','প্রতি রাতে একজনকে রক্ষা করার চেষ্টা করুন। প্রজাদের জয়ে ২ পয়েন্ট।'],POLICE:['গোপন তদন্ত','হোস্টের কাছে একজনের পরিচয় জানতে চান। প্রজাদের জয়ে ২ পয়েন্ট। নিজের পরিচয় গোপন রাখুন।'],VILLAGER:['আলোচনা ও ভোট','আলোচনা করে সন্দেহভাজনকে ভোট দিন। প্রজাদের জয়ে ১ পয়েন্ট।'],BETRAYER:['ঘাতকের সহযোগী','আলোচনা ও ভোটে ঘাতকদের সাহায্য করুন। ঘাতকদের জয়ে ২ পয়েন্ট। আপনি রাতে আক্রমণ করতে পারবেন না।'],ASTROLOGER:['রাতে সুরক্ষিত','রাতের আক্রমণে আপনি বাদ পড়বেন না। ভোটে বাদ পড়তে পারেন। প্রজাদের জয়ে ১ পয়েন্ট।'],BODYGUARD:['গোপন পাহারা','প্রতি রাতে একজনকে পাহারা দিন। হোস্টকে নাম জানান। প্রজাদের জয়ে ১ পয়েন্ট।']};
for(const [r,[tag,description]]of Object.entries(plainRoles))Object.assign(UNIVERSES.bn.roles[r],{tag,description});
UNIVERSES.classic={...UNIVERSES.en,universeName:'Classic',subtitle:'The neighborhood has secrets',era:'BANGLADESH · THE NEIGHBORHOOD TABLE',headline:'Same friends.<br><em>New suspicions.</em>',story:'Tea is poured. The usual faces gather. Someone is hiding a dangerous secret, someone is keeping you alive, and someone knows more than they say. Trust your friends—carefully.',castTitle:'Five roles. A whole neighborhood of suspects.',quote:'The truth will out.',quoteCredit:'William Shakespeare · The Merchant of Venice',quoteUrl:'https://en.wikisource.org/wiki/The_Merchant_of_Venice_(1919)_Yale/Act_2',roles:Object.fromEntries(['MAFIA','DOCTOR','VILLAGER','POLICE','BETRAYER'].map(r=>[r,{...UNIVERSES.en.roles[r]}]))};
export const rolesFor=locale=>Object.keys(UNIVERSES[locale].roles);
// Add future worlds here; only implemented worlds are offered in the picker.
export const WORLD_OPTIONS=[
 {id:'polashi',locale:'bn',name:{bn:'পলাশী',en:'Polashi'}},
 {id:'sicily',locale:'en',name:{bn:'সিসিলি',en:'Sicily'}},
 {id:'classic',locale:'classic',name:{bn:'ক্লাসিক',en:'Classic'}}
];

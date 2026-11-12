const bp=name=>'https://en.banglapedia.org/index.php/'+name;
export const CHARACTERS={
 bn:{
  HOST:{name:'সিরাজউদ্দৌলা',era:'বাংলা · ১৭৫৬–১৭৫৭',history:'বাংলার নবাব সিরাজ পলাশীতে পরাজিত হন ১৭৫৭ সালের ২৩ জুন। পরে বন্দি অবস্থায় তাঁকে হত্যা করা হয়। এই আসরে তিনি হোস্ট—পরিচয় বণ্টন ও বিচার তাঁর হাতে।',source:bp('Sirajuddaula'),asset:'host'},
  MAFIA:[
   {name:'রবার্ট ক্লাইভ',era:'কোম্পানির সেনানায়ক',history:'পলাশীতে ইস্ট ইন্ডিয়া কোম্পানির বাহিনীর নেতৃত্বে ছিলেন ক্লাইভ। বিজয়ের পর বাংলায় কোম্পানির প্রভাব বাড়ে।',source:'https://collection.nam.ac.uk/detail.php?acc=1968-06-269-1',asset:'mafia'},
   {name:'মীর জাফর',era:'নবাব · ১৭৫৭–১৭৬০ ও ১৭৬৩–১৭৬৫',history:'সিরাজের পর কোম্পানির সমর্থনে নবাব হন মীর জাফর। মীর কাসিমের পর দ্বিতীয়বার ক্ষমতায় ফেরেন। দীর্ঘ অসুস্থতার পর ১৭৬৫ সালের ৫ ফেব্রুয়ারি মুর্শিদাবাদে মারা যান; কুষ্ঠরোগে ভোগার উল্লেখ পাওয়া যায়।',source:'https://en.wikipedia.org/wiki/Mir_Jafar',asset:'mafia-2'},
   {name:'মীর কাসিম',era:'নবাব · ১৭৬০–১৭৬৩',history:'মীর জাফরের জামাতা মীর কাসিম ১৭৬০ সালে নবাব হন। পরে কোম্পানির সঙ্গে সংঘাতে জড়ান; বক্সারে তাঁর জোট পরাজিত হয়। ১৭৭৭ সালে দিল্লির কাছে নিঃস্ব অবস্থায় মারা যান।',source:bp('Mir_Qasim'),asset:'mafia-3'}
  ],
  BETRAYER:{name:'ঘসেটি বেগম',era:'মেহেরুন্নিসা · নবাবি বাংলা',history:'আলীবর্দী খানের জ্যেষ্ঠ কন্যা ঘসেটি সিরাজবিরোধী দরবারি জোটে যুক্ত ছিলেন। পরে তাঁকে ঢাকার জিঞ্জিরায় বন্দি রাখা হয়। মীরনের নির্দেশে স্থানান্তরের পথে বুড়িগঙ্গায় ডুবিয়ে মারার বর্ণনা প্রচলিত।',source:bp('Ghaseti_Begum'),asset:'betrayer'},
  POLICE:{name:'মীর মদন',era:'সিরাজের বখশি',history:'সিরাজ মীর মদনকে বখশি পদে বসান। পলাশীতে সিরাজের পক্ষে লড়াই করেন এবং যুদ্ধে নিহত হন।',source:bp('Sirajuddaula'),asset:'police'},
  BODYGUARD:{name:'মোহনলাল',era:'সিরাজের বিশ্বস্ত সহচর',history:'সিরাজ মোহনলালকে দেওয়ানখানার পেশকার পদে উন্নীত করেন। দরবারে তাঁর প্রভাব ছিল এবং তিনি সিরাজের বিশ্বস্ত সহযোগী ছিলেন।',source:bp('Sirajuddaula'),asset:'bodyguard'},
  DOCTOR:{name:'হাকিম আলী গিলানি',era:'আকবর ও জাহাঙ্গীরের যুগ',history:'চিকিৎসক ও চিকিৎসাবিষয়ক লেখক আলী গিলানি আকবর ও জাহাঙ্গীরের দরবারে কাজ করেন। তাঁর সময় সিরাজের আগের মুঘল যুগ।',source:'https://pubmed.ncbi.nlm.nih.gov/12575701/',asset:'doctor'},
  ASTROLOGER:{name:'বরাহমিহির',era:'উজ্জয়িনী · ষষ্ঠ শতক',history:'বরাহমিহির ছিলেন জ্যোতির্বিদ ও গণক। বৃহৎসংহিতা ও বৃহজ্জাতক তাঁর গুরুত্বপূর্ণ রচনা। তাঁর সময় পলাশীর বহু শতাব্দী আগে।',source:'https://mathshistory.st-andrews.ac.uk/DSB/Varahamihira.pdf',asset:'astrologer'},
  VILLAGER:{name:'লালন শাহ',era:'বাংলা · ঊনবিংশ শতক',history:'বাউল সাধক ও গীতিকার লালন শাহ মানুষের পরিচয় ও সাম্যের কথা বলেছেন। তাঁর জীবনকাল সিরাজের পরের যুগে।',source:bp('Lalon_Shah'),asset:'villager'}
 },
 en:{
  HOST:{name:'Vito Corleone',era:'The Godfather · Mario Puzo',history:'The patriarch of the Corleone family. At this table he directs the game, holds no player role, and earns one point for a completed game.',source:'https://www.encyclopedia.com/arts/educational-magazines/godfather',asset:'host'},
  MAFIA:[
   {name:'Michael Corleone',era:'The Godfather · Mario Puzo',history:'Vito’s youngest son becomes the leader of the Corleone family, choosing its survival over his earlier distance from its affairs.',asset:'mafia'},
   {name:'Sonny Corleone',era:'The Godfather · Mario Puzo',history:'Vito’s eldest son leads the family during his father’s recovery. Carlo’s betrayal draws him into a fatal ambush.',asset:'mafia-2'},
   {name:'Emilio Barzini',era:'The Godfather · Mario Puzo',history:'A powerful rival don whose influence lies behind the conflict with the Corleone family.',asset:'mafia-3'}
  ],
  DOCTOR:{name:'Dr. Jules Segal',era:'The Godfather · Mario Puzo',history:'The surgeon working in Las Vegas treats Lucy Mancini and helps Johnny Fontane with his voice.',asset:'doctor'},
  POLICE:{name:'Al Neri',era:'The Godfather · Mario Puzo',history:'A former New York police officer recruited into Michael’s service. His police background supplies this role’s identity.',asset:'police'},
  BODYGUARD:{name:'Luca Brasi',era:'The Godfather · Mario Puzo',history:'Vito’s formidable enforcer is sent to appear disloyal and gather information among the family’s rivals.',asset:'bodyguard'},
  BETRAYER:{name:'Carlo Rizzi',era:'The Godfather · Mario Puzo',history:'Connie’s husband betrays Sonny by helping lure him into an ambush. The family eventually takes its revenge.',asset:'betrayer'},
  ASTROLOGER:{name:'Tom Hagen',era:'The Godfather · Mario Puzo',history:'The family’s lawyer and consigliere, an adviser who weighs alliances, obligations, and the cost of each decision.',asset:'astrologer'},
  VILLAGER:{name:'Amerigo Bonasera',era:'The Godfather · Mario Puzo',history:'The undertaker appeals to Don Corleone for justice. His request opens the novel’s world of favors and obligations.',asset:'villager'}
 }
};
CHARACTERS.classic=Object.fromEntries([
 ['MAFIA','Rana Bhai','mafia','The neighborhood charmer who always has a plan—and an alibi.'],
 ['DOCTOR','Dr. Babul','doctor','The friendly local doctor with a steady hand and a suspiciously busy night.'],
 ['VILLAGER','Jamal','villager','A hardworking villager with modest means and excellent instincts.'],
 ['POLICE','Constable Karim','police','The neighborhood constable who asks one question too many.'],
 ['BETRAYER','Mintu','betrayer','A tea-stall regular whose loyalties change faster than the gossip.'],
 ['HOST','Tea Master Kuddus','host','The host pours the tea, deals the roles, and keeps the table in order.']
].map(([role,name,asset,history])=>[role,{name,asset,history,era:'Classic · Bangladesh'}]));
export function characterFor(role,locale='bn',index=0){if(['SPY','WORD'].includes(role))return {name:locale==='bn'?(role==='SPY'?'গুপ্তচর':'শব্দজানা খেলোয়াড়'):(role==='SPY'?'Spy':'Word player'),asset:role==='SPY'?'mafia':'villager',history:'Spy',era:'Spy'};const entry=CHARACTERS[locale][role]||CHARACTERS[locale].VILLAGER;return Array.isArray(entry)?entry[Math.abs(index)%entry.length]:entry;}
export const characterImage=(role,locale='bn',index=0)=>['SPY','WORD'].includes(role)?`assets/spy/${role==='SPY'?'spy':'word'}.svg`:locale==='classic'?`assets/classic/characters.svg#${characterFor(role,locale,index).asset}`:`assets/${locale}/${characterFor(role,locale,index).asset}.png`;
export function assignCharacterIndexes(players,order=players.map((_,i)=>i)){players.forEach(p=>p.characterIndex=0);let mafia=0;for(const i of order)if(players[i]?.role==='MAFIA')players[i].characterIndex=mafia++;return players;}
const HISTORICAL_EN={host:'Siraj ud-Daulah',mafia:'Robert Clive','mafia-2':'Mir Jafar','mafia-3':'Mir Qasim',doctor:'Hakim Ali Gilani',police:'Mir Madan',bodyguard:'Mohanlal',villager:'Lalon Shah',betrayer:'Ghaseti Begum',astrologer:'Varahamihira'};
const SICILIAN_BN={host:'ভিটো করলিওনে',mafia:'মাইকেল করলিওনে','mafia-2':'সনি করলিওনে','mafia-3':'এমিলিও বারজিনি',doctor:'ডক্টর জুলস সেগাল',police:'আল নেরি',bodyguard:'লুকা ব্রাসি',villager:'আমেরিগো বোনাসেরা',betrayer:'কার্লো রিজি',astrologer:'টম হেগেন'};
export function characterName(role,sourceLocale,index,displayLocale=sourceLocale){const c=characterFor(role,sourceLocale,index);if(['SPY','WORD'].includes(role))return characterFor(role,displayLocale,index).name;if(sourceLocale===displayLocale)return c.name;if(displayLocale!=='bn')return sourceLocale==='bn'?HISTORICAL_EN[c.asset]:c.name;if(sourceLocale==='classic')return ({host:'চায়ের ওস্তাদ কুদ্দুস',mafia:'রানা ভাই',doctor:'ডাক্তার বাবুল',police:'কনস্টেবল করিম',villager:'জামাল',betrayer:'মিন্টু'})[c.asset];return SICILIAN_BN[c.asset];}

// Display names change by universe; stable role IDs keep all game rules consistent.
export const UNIVERSES={
 bn:{title:'Mafia',universeName:'পলাশী',subtitle:'পলাশীর দরবার',era:'মুর্শিদাবাদ · ১৭৫৭',
 headline:'দরবারে ছলের খেলা।<br><em>কার হাতে বাংলা?</em>',
 story:'সিরাজ বসেন বিচার নিয়ে,\nদরবার জমে ছল সাজিয়ে।\nকোম্পানির ঘাতক গোপন ঘরে,\nঘসেটিও ফন্দি ধরে।\nপ্রজার মনে প্রশ্ন রয়—\nকার জয়েতে দেশের জয়?',
 castTitle:'দশটি মুখ, কত যে ছল—কার হাতে যাবে শাসনবল?',quote:'দড়ি ধরে মারো টান',quoteCredit:'সত্যজিৎ রায় · হীরক রাজার দেশে',quoteUrl:'https://www.milansagar.com/wall/wall_protibad/wall_protibad10.html',
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

// Add future worlds here; only implemented worlds are offered in the picker.
export const WORLD_OPTIONS=[
 {id:'polashi',locale:'bn',name:{bn:'পলাশী',en:'Polashi'}},
 {id:'sicily',locale:'en',name:{bn:'সিসিলি',en:'Sicily'}}
];

import {CHARACTERS} from './characters.mjs';
import {UNIVERSES} from './universe.mjs';
import {FREEDOM_QUOTES} from './freedom-quotes.mjs';
export const WORLD_PAIRS=[];
const historical={
 host:['Siraj ud-Daulah','Bengal · 1756–1757','Nawab Siraj ud-Daulah was defeated at Plassey on 23 June 1757 and later murdered in captivity. At this table he hosts the game, deals identities and oversees decisions.'],
 mafia:['Robert Clive','East India Company commander','Clive commanded the East India Company forces at Plassey. The victory expanded Company influence in Bengal.'],
 'mafia-2':['Mir Jafar','Nawab · 1757–1760 and 1763–1765','Mir Jafar became nawab with Company support after Siraj. He returned to power after Mir Qasim. After a long illness, he died in Murshidabad on 5 February 1765; accounts mention leprosy.'],
 'mafia-3':['Mir Qasim','Nawab · 1760–1763','Mir Qasim, Mir Jafar’s son-in-law, became nawab in 1760. He later fought the Company, and his alliance was defeated at Buxar. He died in poverty near Delhi in 1777.'],
 betrayer:['Ghaseti Begum','Meherunnessa · Nawabi Bengal','Ghaseti, Alivardi Khan’s eldest daughter, was part of the court alliance against Siraj. She was later confined at Jinjira in Dhaka. Accounts describe her drowning in the Buriganga during a transfer ordered by Miran.'],
 police:['Mir Madan','Siraj’s bakhshi','Siraj appointed Mir Madan as bakhshi. He fought for Siraj at Plassey and was killed in the battle.'],
 bodyguard:['Mohanlal','Siraj’s trusted ally','Siraj promoted Mohanlal to peshkar of the diwan’s office. He was influential at court and a trusted ally of Siraj.'],
 doctor:['Hakim Ali Gilani','The age of Akbar and Jahangir','Physician and medical author Ali Gilani served at the courts of Akbar and Jahangir. His Mughal era preceded Siraj’s lifetime.'],
 astrologer:['Varahamihira','Ujjain · sixth century','Varahamihira was an astronomer and mathematician. His important works include Brihat Samhita and Brihat Jataka. He lived many centuries before Plassey.'],
 villager:['An unnamed villager','Rural Bengal · eighteenth century','His name is absent from the records: one of Bengal’s millions of peasants. Maratha raids devastated western Bengal in the 1740s, recorded in Gangaram’s Maharashtra Purana (1751). After Plassey, the Company gained revenue rights in 1765 and taxation intensified. In 1772 Warren Hastings reported that the famine of 1769–70 had killed about a third of Bengal’s population; revenue collected in 1771 nevertheless exceeded earlier years.']
};
for(const entry of Object.values(CHARACTERS.bn))for(const c of(Array.isArray(entry)?entry:[entry])){const english=historical[c.asset];['name','era','history'].forEach((field,i)=>WORLD_PAIRS.push([c[field],english[i]]));}
const sicilian=[
 ['ভিটো করলিওনে','করলিওনে পরিবারের কর্তা। এখানে তিনি হোস্ট; খেলোয়াড়ের রোল নেন না এবং প্রতিটি সম্পূর্ণ খেলা পরিচালনায় এক পয়েন্ট পান।'],
 ['মাইকেল করলিওনে','ভিটোর ছোট ছেলে পরিবারের নেতা হন। আগে পারিবারিক কাজ থেকে দূরে থাকলেও পরে পরিবারের টিকে থাকাকেই অগ্রাধিকার দেন।'],
 ['সনি করলিওনে','বাবা সুস্থ হয়ে ওঠার সময় ভিটোর বড় ছেলে পরিবারের নেতৃত্ব দেন। কার্লোর বিশ্বাসঘাতকতায় প্রাণঘাতী ফাঁদে পড়েন।'],
 ['এমিলিও বারজিনি','শক্তিশালী প্রতিদ্বন্দ্বী ডন; করলিওনে পরিবারের সঙ্গে সংঘাতের পেছনে তাঁর প্রভাব রয়েছে।'],
 ['ডক্টর জুলস সেগাল','লাস ভেগাসের শল্যচিকিৎসক লুসি মানচিনির চিকিৎসা করেন এবং জনি ফন্টেনের কণ্ঠের সমস্যায় সাহায্য করেন।'],
 ['আল নেরি','নিউইয়র্কের প্রাক্তন পুলিশ কর্মকর্তা মাইকেলের দলে যোগ দেন। তাঁর পুলিশ জীবনের অভিজ্ঞতা এই রোলের পরিচয়।'],
 ['লুকা ব্রাসি','ভিটোর দুর্ধর্ষ সহচর। অবিশ্বস্ত হওয়ার ভান করে প্রতিদ্বন্দ্বীদের কাছ থেকে খবর সংগ্রহ করতে যান।'],
 ['কার্লো রিজি','কনির স্বামী সনিকে ফাঁদে ফেলতে সাহায্য করে বিশ্বাসঘাতকতা করেন। পরে পরিবার প্রতিশোধ নেয়।'],
 ['টম হেগেন','পরিবারের আইনজীবী ও উপদেষ্টা। জোট, দায়িত্ব এবং প্রতিটি সিদ্ধান্তের মূল্য বিচার করেন।'],
 ['আমেরিগো বোনাসেরা','ন্যায়বিচারের জন্য ডন করলিওনের কাছে আসা অন্ত্যেষ্টিক্রিয়ার ব্যবসায়ী। তাঁর আবেদন থেকেই উপন্যাসের অনুগ্রহ ও দায়বদ্ধতার জগৎ শুরু।']
];
Object.values(CHARACTERS.en).flat().forEach((c,i)=>{WORLD_PAIRS.push([sicilian[i][0],c.name],[sicilian[i][1],c.history],['দ্য গডফাদার · মারিও পুজো',c.era]);});
const classic=[
 ['রানা ভাই','পাড়ার সবার প্রিয় মুখ; সবসময় একটি পরিকল্পনা আর অজুহাত তৈরি।'],
 ['ডাক্তার বাবুল','পাড়ার হাসিখুশি ডাক্তার। দক্ষ হাত, আর সন্দেহজনক ব্যস্ত রাত।'],
 ['জামাল','পরিশ্রমী সাধারণ গ্রামবাসী। সামর্থ্য অল্প, বিচারবুদ্ধি তীক্ষ্ণ।'],
 ['কনস্টেবল করিম','পাড়ার পুলিশ কর্মকর্তা; প্রশ্ন করেন একটু বেশিই।'],
 ['মিন্টু','চায়ের দোকানের নিয়মিত মুখ; আড্ডার খবরের চেয়েও দ্রুত তাঁর পক্ষ বদলায়।'],
 ['চায়ের ওস্তাদ কুদ্দুস','হোস্ট চা ঢালেন, রোল বণ্টন করেন আর আসর সামলান।']
];
Object.values(CHARACTERS.classic).forEach((c,i)=>WORLD_PAIRS.push([classic[i][0],c.name],[classic[i][1],c.history],['ক্লাসিক · বাংলাদেশ',c.era]));
for(const r of Object.keys(UNIVERSES.bn.roles))for(const field of ['tag','description'])WORLD_PAIRS.push([UNIVERSES.bn.roles[r][field],UNIVERSES.en.roles[r][field]]);
WORLD_PAIRS.push(
 ['পলাশীর দরবার','The court of Plassey'],['মুর্শিদাবাদ · ১৭৫৭','Murshidabad · 1757'],
 ['পলাশীর পটভূমিতে গোপন পরিচয়ের খেলা। আলোচনা ও ভোটে ঘাতকদের খুঁজুন। হোস্ট খেলা পরিচালনা করেন।','A game of secret identities set against Plassey. Find the assassins through discussion and votes. The host guides the game.'],
 ['চরিত্র ও পরিচয়','Characters and identities'],
 ['উমিচাঁদ','Umichand'],['উমিচাঁদ ছিলেন বণিক ও দরবারের আলোচনার মধ্যস্থতাকারী; সেনাপতি নন। পলাশীর ষড়যন্ত্রে তাঁর যোগ ছিল।','Umichand was a merchant and an intermediary in court negotiations, rather than a military commander. He was involved in the Plassey conspiracy.'],
 ['পলাশীর যুদ্ধ হয় ১৭৫৭ সালের ২৩ জুন। সিরাজের প্রতিপক্ষ কোম্পানির বাহিনীর নেতৃত্বে ছিলেন ক্লাইভ।','The Battle of Plassey took place on 23 June 1757. Clive commanded the Company forces opposing Siraj.'],
 ['সিসিলির আসর','A Sicilian Affair'],['সিসিলি · পরিবারের আসর','SICILY · THE FAMILY’S TABLE'],
 ['বিশ্বস্ততার মূল্য আছে।','Loyalty has a price.'],['কে সেই মূল্য দেবে?','Who will pay?'],
 ['দশটি মুখ। অনিশ্চিত বিশ্বস্ততা।','Ten faces. Uncertain loyalties.'],
 ['সিসিলির এই গ্রামে অনুগ্রহ নীরবতা কেনে, চেনা মুখও ভরসা দেয় না। মাফিয়া তাদের পরিকল্পনা করেছে। কাউকে বিশ্বাসঘাতক বলার আগে ভাবুন, কার বিশ্বস্ততার মূল্য আপনি দিতে পারবেন।',UNIVERSES.en.story],
 ['পাড়ার গোপন কথা','The neighborhood has secrets'],['বাংলাদেশ · পাড়ার আসর','BANGLADESH · THE NEIGHBORHOOD TABLE'],['চেনা বন্ধুরা।','Same friends.'],['নতুন সন্দেহ।','New suspicions.'],['পাঁচ রোল। সন্দেহভাজনে ভরা এক পাড়া।','Five roles. A whole neighborhood of suspects.'],
 ['চা এসেছে। চেনা মুখেরা জমেছে। কেউ বিপজ্জনক গোপন কথা লুকোয়, কেউ আপনাকে বাঁচায়, কেউ প্রকাশের চেয়েও বেশি জানে। বন্ধুদের বিশ্বাস করুন, ভেবেচিন্তে।',UNIVERSES.classic.story],
 ['মানুষের প্রথম কর্তব্য নিজেকে বাঁচিয়ে রাখা।','A man’s first duty is to keep himself alive.'],['সত্য একদিন প্রকাশ পাবেই।','The truth will out.'],['মুখে রাখো মিথ্যে হাসি, মনের গোপন কথা ঢেকে।','False face must hide what the false heart doth know.'],
 ['মারিও পুজো · দ্য সিসিলিয়ান','Mario Puzo · The Sicilian'],['উইলিয়াম শেক্‌সপিয়র · দ্য মার্চেন্ট অব ভেনিস','William Shakespeare · The Merchant of Venice'],['উইলিয়াম শেক্‌সপিয়র · ম্যাকবেথ','William Shakespeare · Macbeth']
);
const quoteTranslations=[
 'How long will you stay hidden behind an idol of clay?',
 'These chains we wear are a pretence. Wearing them, we shall break your chains.',
 'Break down the iron gates of prison; sweep away the stone altar of chains.',
 'Steep mountains, harsh deserts and boundless seas must be crossed in the dead of night. Travellers, beware!',
 'The helpless nation is drowning, unable to swim. Helmsman, today we shall test your vow to free the motherland!',
 'Speak, brave one—say: my head is held high!',
 'I shall find peace only when the cries of the oppressed no longer echo through the sky.',
 'Who wishes to live without freedom? Who will wear the chains of slavery?',
 'Why fear death to protect your children? The mother is alive with the spirit of battle.',
 'The tighter their bonds become, the more surely those bonds will break.',
 'The soil of Bengal, its water, air and fruit—may they be blessed.',
 'If nobody answers your call, then walk alone.',
 'Where the mind is without fear and the head is held high; where knowledge is free.',
 'A new child has arrived; we must make room.',
 'Bid me farewell once, mother. I shall meet the gallows smiling, and the people will see.',
 'Whom can I trust? Who is truly my own?',
 'My Bengal! My mother! My nurturer! My country!',
 'Give me blood, and I shall give you freedom.'
];
const credits={'কাজী নজরুল ইসলাম':'Kazi Nazrul Islam','রঙ্গলাল বন্দ্যোপাধ্যায়':'Rangalal Bandyopadhyay','মুকুন্দ দাস':'Mukunda Das','রবীন্দ্রনাথ ঠাকুর':'Rabindranath Tagore','সুকান্ত ভট্টাচার্য':'Sukanta Bhattacharya','পীতাম্বর দাস':'Pitambar Das','গিরিশচন্দ্র ঘোষ':'Girish Chandra Ghosh','দ্বিজেন্দ্রলাল রায়':'Dwijendralal Ray','নেতাজি সুভাষচন্দ্র বসু':'Subhas Chandra Bose'};
const works=['Anandamoyeer Agamane','Shikol Porar Gaan','Bhangar Gaan','Kandari Hushiar','Kandari Hushiar','Bidrohi','Bidrohi','Padmini Upakhyan','Swadeshi songs','Bidhir Bandhon Katbe Tumi','Rakhibandhan song','Ekla Cholo Re','Naibedya','Chharpatra','Khudiram song','Sirajuddaula','Banga Amar','Indian National Army call, 1944'];
FREEDOM_QUOTES.forEach((q,i)=>{WORLD_PAIRS.push([q.text,quoteTranslations[i]],[q.poet,credits[q.poet]],[q.work,works[i]],[q.credit,`${credits[q.poet]} · ${works[i]} · English translation`]);});
WORLD_PAIRS.push(['এই কবিতার জন্য ব্রিটিশ সরকার নজরুলকে কারাদণ্ড দেয়।','The British government imprisoned Nazrul over this poem.'],['বরিশালের চারণকবি; গানের জন্য কারাবরণ করেন।','The bard of Barishal was imprisoned for his songs.'],['বঙ্গভঙ্গবিরোধী স্বদেশী গান, ১৯০৫।','A Swadeshi song against the partition of Bengal, 1905.'],['বঙ্গভঙ্গের প্রতিবাদে রাখীবন্ধনের দিন গাওয়া হয়, ১৯০৫।','Sung at Rakhibandhan in protest against the partition of Bengal, 1905.'],['স্বদেশী আন্দোলনের গান।','A song of the Swadeshi movement.'],['ক্ষুদিরাম বসুর স্মরণে গাওয়া লোকগান।','A folk song in memory of Khudiram Bose.'],['ব্রিটিশ সরকার ১৯১১ সালে নাটকটি নিষিদ্ধ করে।','The British government banned this play in 1911.'],['স্বদেশী যুগের গান।','A song from the Swadeshi era.'],['বাংলা অনুবাদে বহুল প্রচলিত উক্তি।','A widely circulated Bengali translation.']);
// Quotes are rendered with <br> separators, so each line also has a translation.
const multiline={
 1:['These chains we wear are a pretence.','Wearing them, we shall break your chains.'],
 2:['The iron gates of prison—','break them down, sweep them away,','and the stone altar of blood-stained chains.'],
 3:['Steep mountains, harsh deserts and boundless seas','must be crossed in the dead of night. Travellers, beware!'],
 4:['The helpless nation is drowning, unable to swim.','Helmsman, today we shall test your vow to free the motherland!'],
 5:['Speak, brave one—','say: my head is held high!'],
 6:['I shall find peace only','when the cries of the oppressed no longer echo through the sky.'],
 7:['Who wishes to live without freedom?','Who wishes to live so?','Who will wear the chains of slavery?','Who will put them on?'],
 8:['Why fear death to protect your children?','The mother is alive with the spirit of battle.'],
 10:['The soil of Bengal, its water, air and fruit—','may they be blessed, O Lord.'],
 12:['Where the mind is without fear and the head is held high,','where knowledge is free.'],
 14:['Bid me farewell once, mother.','I shall meet the gallows smiling, and the people will see.']
};
for(const [index,lines]of Object.entries(multiline))FREEDOM_QUOTES[index].text.split('\n').forEach((line,i)=>WORLD_PAIRS.push([line,lines[i]]));

/* Original Bangladesh property board. Amounts are game taka. */
export const GROUPS = ['#975b39','#42aeb7','#b85b90','#e59236','#cd5550','#d0b137','#3d9470','#5278ba'];
const property = (bn,en,price,group) => ({bn,en,kind:'property',price,group,rent:Math.floor(price/10),build:50*(1+Math.floor(group/2))});
const space = (bn,en,kind,extra={}) => ({bn,en,kind,...extra});
export const BOARD = [
 space('যাত্রা','Start','start'),property('পুরান ঢাকা','Old Dhaka',60,0),space('ভাগ্য','Chance','chance'),property('নারায়ণগঞ্জ','Narayanganj',70,0),space('কর','Tax','tax',{amount:100}),space('কমলাপুর','Kamalapur','station',{price:200}),property('বরিশাল','Barishal',100,1),property('খুলনা','Khulna',120,1),space('থানা','Jail','jail'),property('রাজশাহী','Rajshahi',140,2),space('বিদ্যুৎ','Electricity','utility',{price:150}),property('রংপুর','Rangpur',160,2),space('ভাগ্য','Chance','chance'),property('ময়মনসিংহ','Mymensingh',180,3),property('বগুড়া','Bogura',200,3),space('দৌলতদিয়া','Daulatdia','station',{price:200}),space('চায়ের আড্ডা','Tea break','rest'),property('কুমিল্লা','Cumilla',220,4),space('ভাগ্য','Chance','chance'),property('চট্টগ্রাম','Chattogram',240,4),space('কর','Tax','tax',{amount:150}),property('সিলেট','Sylhet',260,5),space('পানি','Water','utility',{price:150}),property('শ্রীমঙ্গল','Sreemangal',280,5),space('থানায় যান','Go to jail','gotojail'),property('কক্সবাজার',"Cox’s Bazar",300,6),property('টেকনাফ','Teknaf',320,6),space('বিমানবন্দর','Airport','station',{price:200}),space('ভাগ্য','Chance','chance'),property('বনানী','Banani',350,7),property('গুলশান','Gulshan',400,7),space('বোনাস','Bonus','bonus',{amount:50})
].map((s,id)=>Object.freeze({...s,id}));
export const SETS = GROUPS.map((_,g)=>BOARD.filter(s=>s.group===g).map(s=>s.id));
export const COLOURS = ['#dd7255','#3c9b8a','#6989db','#d3a239','#ae77bd','#69a3b7'];
export const CARDS = [
 {bn:'ঈদের বোনাস পেলেন',en:'Eid bonus',cash:150},
 {bn:'রিকশা ভাড়া দিন',en:'Pay your rickshaw fare',cash:-30},
 {bn:'ব্যবসায় লাভ হলো',en:'Your business made a profit',cash:100},
 {bn:'দোকানের মেরামত',en:'Shop repairs',cash:-80},
 {bn:'যাত্রায় ফিরে যান',en:'Return to Start',start:true},
 {bn:'থানায় যেতে হবে',en:'Go directly to jail',jail:true},
 {bn:'তিন ঘর পিছিয়ে যান',en:'Move back three spaces',back:3},
 {bn:'বাড়ি মেরামতের খরচ',en:'Building maintenance',repairs:true},
 {bn:'মেলার বিক্রির লাভ',en:'Village fair profits',cash:75},
 {bn:'চিকিৎসার খরচ দিন',en:'Pay medical expenses',cash:-50},
 {bn:'সঞ্চয়ের মুনাফা',en:'Savings return',cash:50},
 {bn:'সবাইকে চা খাওয়ালেন',en:'Tea for the neighbourhood',cash:-20}
];

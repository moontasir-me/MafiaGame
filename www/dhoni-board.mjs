/* Original Bangladesh property board. Amounts are game taka. */
export const GROUPS = ['#975b39','#42aeb7','#b85b90','#e59236','#cd5550','#d0b137','#3d9470','#5278ba'];
const property = (bn,en,price,group) => ({bn,en,kind:'property',price,group,rent:Math.floor(price/10),build:50*(1+Math.floor(group/2))});
const space = (bn,en,kind,extra={}) => ({bn,en,kind,...extra});
export const BOARD = [
 space('যাত্রা','Start','start'),property('যাত্রাবাড়ী','Jatrabari',60,0),space('ভাগ্য','Chance','chance'),property('সদরঘাট','Sadarghat',70,0),space('কর','Tax','tax',{amount:100}),space('কমলাপুর','Kamalapur','station',{price:200}),property('নারিন্দা','Narinda',100,1),property('ওয়ারী','Wari',120,1),space('থানা','Jail','jail'),property('নবাবপুর','Nawabpur',140,2),space('বিদ্যুৎ','Electricity','utility',{price:150}),property('মতিঝিল','Motijheel',160,2),space('ভাগ্য','Chance','chance'),property('পল্টন','Paltan',180,3),property('শাহবাগ','Shahbag',200,3),space('গাবতলী','Gabtoli','station',{price:200}),space('চায়ের আড্ডা','Tea break','rest'),property('আজিমপুর','Azimpur',220,4),space('ভাগ্য','Chance','chance'),property('মোহাম্মদপুর','Mohammadpur',240,4),space('কর','Tax','tax',{amount:150}),property('মিরপুর','Mirpur',260,5),space('পানি','Water','utility',{price:150}),property('উত্তরা','Uttara',280,5),space('থানায় যান','Go to jail','gotojail'),property('ধানমন্ডি',"Dhanmondi",300,6),property('বনানী','Banani',320,6),space('মহাখালী','Mohakhali','station',{price:200}),space('ভাগ্য','Chance','chance'),property('বারিধারা','Baridhara',350,7),property('গুলশান','Gulshan',400,7),space('বোনাস','Bonus','bonus',{amount:50})
].map((s,id)=>Object.freeze({...s,id}));
export const SETS = GROUPS.map((_,g)=>BOARD.filter(s=>s.group===g).map(s=>s.id));
export const COLOURS = ['#dd7255','#3c9b8a','#6989db','#d3a239','#ae77bd','#69a3b7'];
export const CARDS = [
 {bn:'ব্যাংক থেকে লভ্যাংশ পেলেন',en:'Bank dividend',cash:150},
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
 {bn:'সবাইকে চা খাওয়ালেন',en:'Tea for the neighbourhood',cash:-20},
 {bn:'ব্যাংকের হিসাবে ভুল, আপনি টাকা পেলেন',en:'Bank error in your favour',cash:200},
 {bn:'উত্তরাধিকারের টাকা পেলেন',en:'Receive an inheritance',cash:100},
 {bn:'বিদ্যালয়ের বেতন দিন',en:'Pay school fees',cash:-50},
 {bn:'বিমার মেয়াদ পূর্ণ হয়েছে',en:'Insurance matures',cash:100},
 {bn:'আয়কর দিন',en:'Pay income tax',cash:-150},
 {bn:'চিকিৎসার বিল দিন',en:'Pay a hospital bill',cash:-100},
 {bn:'পুরস্কারের টাকা পেলেন',en:'Receive a prize',cash:50},
 {bn:'সাধারণ মেরামতের খরচ দিন',en:'Pay general repairs',repairs:true}

];

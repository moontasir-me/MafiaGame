// Generated maths prompts: translate the sentence around its unchanged operands.
const rules = [
 [/^(.+)-এর 1\/(.+) অংশ কত\?$/,(_,n,d)=>`What is 1/${d} of ${n}?`],
 [/^পরের সংখ্যা কোনটি\? (.+)$/,(_,xs)=>`What is the next number? ${xs}`],
 [/^একটা কলমের দাম (.+) টাকা। (.+)টা কলমের দাম কত টাকা\?$/,(_,p,n)=>`One pen costs Tk ${p}. How much do ${n} pens cost?`],
 [/^(.+) ঘণ্টায় কত মিনিট\?$/,(_,h)=>`How many minutes are in ${h} hours?`],
 [/^ফিবোনাচি সারি: (.+) পরেরটা কত\?$/,(_,xs)=>`Fibonacci sequence: ${xs} What comes next?`],
 [/^একটা আয়তের দৈর্ঘ্য (.+) সেমি, প্রস্থ (.+) সেমি। পরিসীমা কত সেমি\?$/,(_,l,w)=>`A rectangle is ${l} cm long and ${w} cm wide. What is its perimeter in cm?`],
 [/^(.+)-এর (.+)% কত\?$/,(_,n,p)=>`What is ${p}% of ${n}?`],
 [/^(.+) ও (.+)-এর গ\.সা\.গু কত\?$/,(_,a,b)=>`What is the GCD of ${a} and ${b}?`],
 [/^(.+) ও (.+)-এর ল\.সা\.গু কত\?$/,(_,a,b)=>`What is the LCM of ${a} and ${b}?`],
 [/^(.+) হলে x = \?$/,(_,eq)=>`If ${eq}, x = ?`],
 [/^(.+) = 2 এর কোন ঘাত\?$/,(_,eq)=>`${eq} = 2 raised to which power?`],
 [/^সমকোণী ত্রিভুজের দুই বাহু (.+) ও (.+)। অতিভুজ কত\?$/,(_,a,b)=>`A right triangle has legs ${a} and ${b}. Find the hypotenuse.`],
 [/^(.+)-এর গড় কত\?$/,(_,xs)=>`What is the mean of ${xs}?`],
 [/^ত্রিভুজের ভূমি (.+), উচ্চতা (.+)। ক্ষেত্রফল কত\?$/,(_,b,h)=>`A triangle has base ${b} and height ${h}. What is its area?`],
 [/^একটা ছক্কা একবার ছুড়লে (.+) ওঠার সম্ভাবনা কত\?$/,(_,event)=>`Roll a die once. What is the probability of ${event.replace('জোড় সংখ্যা','an even number').replace('4-এর চেয়ে বড়','a number greater than 4')}?`],
 [/^(.+) টাকায় বার্ষিক (.+)% সরল মুনাফায় (.+) বছরে মুনাফা কত টাকা\?$/,(_,p,r,y)=>`Find the simple interest on Tk ${p} at ${r}% per year for ${y} years.`],
 [/^(.+) সমীকরণের মূল দুটির যোগফল কত\?$/,(_,eq)=>`Find the sum of the roots of ${eq}.`],
 [/^(.+) \((.+)টা থেকে (.+)টা বাছাই\) = \?$/,(_,eq,n,k)=>`${eq} (choose ${k} from ${n}) = ?`],
 [/^(.+) ধারার প্রথম (.+)টি পদের যোগফল কত\?$/,(_,xs,n)=>`Find the sum of the first ${n} terms: ${xs}`],
 [/^(.+) গুণোত্তর ধারার (.+)তম পদ কত\?$/,(_,xs,n)=>`Find term ${n} of the geometric sequence: ${xs}`],
 [/^(.+) হলে (.+)$/,(_,eq,q)=>`If ${eq}, ${q}`],
 [/^ম্যাট্রিক্স (.+)-এর নির্ণায়ক কত\?$/,(_,m)=>`Find the determinant of ${m}.`],
 [/^(.+)টা আলাদা বই একটা তাকে কত রকমভাবে সাজানো যায়\?$/,(_,n)=>`In how many ways can ${n} different books be arranged on a shelf?`],
 [/^(.+) বিন্দুতে মান কত\?$/,(_,eq)=>`Evaluate ${eq}.`],
 [/^ম্যাট্রিক্স (.+)-এর আইগেনমানগুলোর যোগফল কত\?$/,(_,m)=>`Find the sum of the eigenvalues of ${m}.`],
 [/^বাইনারি (.+) দশমিকে কত\?$/,(_,n)=>`Convert binary ${n} to decimal.`],
 [/^দশমিক (.+) হেক্সাডেসিমালে কত\?$/,(_,n)=>`Convert decimal ${n} to hexadecimal.`],
 [/^(.+)টা শীর্ষের সম্পূর্ণ গ্রাফ (.+)-এ কয়টা প্রান্ত \(edge\)\?$/,(_,n,g)=>`How many edges does the complete graph ${g} with ${n} vertices have?`],
 [/^(.+)-এর ম্যাকলরিন ধারায় (.+)-এর সহগ কত\?$/,(_,f,x)=>`Find the coefficient of ${x} in the Maclaurin series of ${f}.`],
 [/^(.+) আর (.+) যোগ করলে (.+)।$/,(_,a,b,c)=>`${a} + ${b} = ${c}.`],
 [/^(.+) থেকে (.+) বাদ দিলে (.+)।$/,(_,a,b,c)=>`${a} − ${b} = ${c}.`],
 [/^(.+)-এর নামতায় (.+) ঘর: (.+)।$/,(_,a,b,c)=>`${a} × ${b} = ${c}.`],
 [/^প্রতিবার (.+) করে বাড়ছে।$/,(_,d)=>`Add ${d} each time.`],
 [/^দুটোকেই নিঃশেষে ভাগ করে এমন সবচেয়ে বড় সংখ্যা (.+)।$/,(_,g)=>`The greatest number dividing both exactly is ${g}.`],
 [/^যোগফল (.+), 4 দিয়ে ভাগ = (.+)।$/,(_,s,m)=>`Sum ${s}; divide by 4 to get ${m}.`],
 [/^বারবার গুণ করে (.+) দিয়ে ভাগশেষ নিলে (.+)।$/,(_,m,v)=>`Multiply repeatedly, taking the remainder modulo ${m}, to get ${v}.`],
 [/^একটা নিরপেক্ষ ছক্কার প্রত্যাশিত মান E\[X\] কত\?$/,'What is the expected value E[X] of a fair die?'],
 [/^দুটো নিরপেক্ষ মুদ্রা ছুড়লে অন্তত একটা হেড আসার সম্ভাবনা কত\?$/,'Two fair coins are tossed. What is the probability of at least one head?'],
 [/^একটা নিরপেক্ষ মুদ্রা 3 বার ছুড়লে ঠিক 2টা হেড আসার সম্ভাবনা কত\?$/,'A fair coin is tossed 3 times. What is the probability of exactly 2 heads?'],
 [/^n আকারের সাজানো তালিকায় বাইনারি সার্চের সময় জটিলতা কত\?$/,'What is the time complexity of binary search on a sorted list of size n?']
];
const fragments = [
 ['তাই ভাগফল','so the quotient is'],['টাকা','taka'],['1 ঘণ্টা = 60 মিনিট, তাই','1 hour = 60 minutes, so'],['আগের দুটো যোগ:','Add the previous two:'],['আগে গুণ:','Multiply first:'],['তারপর','then'],['যোগ।','is added.'],['পরিসীমা','Perimeter'],['গ.সা.গু','GCD'],['ল.সা.গু','LCM'],['তাই x','so x'],['একই ভিত্তির গুণে ঘাত যোগ হয়:','Add exponents with the same base:'],['6টা সমান সম্ভাব্য ফলের মধ্যে অনুকূল ফল ভাগ 6।','Favourable outcomes divided by 6 equally likely outcomes.'],['মূলের যোগফল','Sum of roots'],['প্রমিত কোণের মান:','Standard angle:'],['বসালে','gives'],['চেইন রুল:','Chain rule:'],[' তে ',' at '],['যখন x ছোট।','for small x.'],['প্রমিত সীমা:','Standard limit:'],['সর্বোচ্চ ঘাতের সহগের অনুপাত','Ratio of the leading coefficients:'],['আইগেনমানের যোগফল = ট্রেস','Sum of eigenvalues = trace'],['দুটোই টেল','both tails'],['অসীম গুণোত্তর ধারা:','Infinite geometric series:'],['প্রতি জোড়া শীর্ষে একটা প্রান্ত:','One edge for each pair of vertices:'],['সহগ','coefficient'],['প্রতি ধাপে খোঁজার জায়গা অর্ধেক হয়।','The search space halves at every step.'],['তাই','so']
];
export function mathEnglish(text) {
 let value=String(text).replace(/[০-৯]/g,c=>String('০১২৩৪৫৬৭৮৯'.indexOf(c)));
 for(const [pattern,replacement]of rules)if(pattern.test(value))return value.replace(pattern,replacement);
 if(!/[\u0980-\u09ff]/.test(value))return value;
 if(!/[=+×÷√∫≈]|মূলের|প্রমিত|সহগ|অনুকূল|ঘাত|প্রতি ধাপে/.test(value))return String(text);
 for(const [a,b]of fragments)value=value.split(a).join(b);
 return value.replace(/।/g,'.');
}

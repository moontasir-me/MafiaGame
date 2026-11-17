import { getLanguage, pageLanguage, LANGUAGE_KEY } from './locale.mjs';
import { mathEnglish } from './math-english.mjs';
import { UI_PAIRS } from './translations.mjs';
import { WORLD_PAIRS } from './world-translations.mjs';
const pairs=[...WORLD_PAIRS,...UI_PAIRS];
const escapeRE = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const en = new Map(pairs), bn = new Map(pairs.map(([a,b])=>[b,a]));
const keys = [...en.keys()].sort((a,b)=>b.length-a.length);
const phrases = new RegExp(`(?<![\\p{L}\\p{M}])(?:${keys.map(escapeRE).join('|')})(?![\\p{L}\\p{M}])`, 'gu');
export function translateText(text, language=getLanguage()) {
  if (text == null) return text;
  text=String(text);
  const raw=text.trim();
  if(language==='bn') {const value=bn.get(raw);return value ? text.replace(raw,value) : text;}
  const direct=en.get(raw);
  if(direct!==undefined)return text.replace(raw,direct);
  text=text.replace(/([০-৯0-9]+)(?:ম|য়)/g,(_,digits)=>{
    const n=Number(digits.replace(/[০-৯]/g,c=>'০১২৩৪৫৬৭৮৯'.indexOf(c)));
    return n+((n%100>=11&&n%100<=13)?'th':({1:'st',2:'nd',3:'rd'}[n%10]||'th'));
  });
  return mathEnglish(text).replace(phrases,value=>en.get(value)).replace(/[০-৯]/g,c=>String('০১২৩৪৫৬৭৮৯'.indexOf(c)));
}
// Protect user-entered names, input values, private words and author-supplied content.
const PROTECTED='script,style,textarea,input,[contenteditable],[data-no-translate],.player-name,[data-player-name],.player-info>strong,.profile-face,.profile-big,#profile-label,.pc-name,.ol-face,.acc-mini button,.acc-chip,.kd-acc,.fib-acc,.seat-initial,.generic-person,.lp>b,.seat4-name>b,.dt-p>b,.tg-seat b,.cr-seat b,.kd-scores>span,.spy-start-note strong,.rank-name,.player-dot,.score-person,.ol-me b,.roster-initial';
const sourceText=new WeakMap();
export function localizeTree(root, language=pageLanguage()) {
  if(!root || typeof document==='undefined')return;
  const protectedRoot=root.nodeType===1&&root.closest(PROTECTED);
  if(protectedRoot && !root.matches('input,textarea'))return;
  const walk=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  const nodes=[];if(root.nodeType===3)nodes.push(root);else while(walk.nextNode())nodes.push(walk.currentNode);
  for(const node of nodes){if(node.parentElement?.closest(PROTECTED))continue;let rec=sourceText.get(node);if(!rec||node.nodeValue!==rec.last)rec={source:node.nodeValue,last:node.nodeValue};const translated=translateText(rec.source,language);if(translated!==node.nodeValue)node.nodeValue=translated;rec.last=translated;sourceText.set(node,rec);}
  const elements=[...(root.nodeType===1?[root]:[]),...(root.querySelectorAll?.('[placeholder],[aria-label],[title],[alt]')||[])];
  for(const el of elements){if(el.closest('[data-no-translate]'))continue;for(const key of ['placeholder','aria-label','title','alt']){const value=el.getAttribute(key);if(value){const translated=translateText(value,language);if(value!==translated)el.setAttribute(key,translated);}}}
}
let started=false;
export function startLocalization() {
  if(started || typeof document==='undefined')return;started=true;
  // Colour Rush deliberately uses English regardless of the device preference.
  let language=pageLanguage();document.documentElement.lang=language;
  const manifest=document.querySelector('link[rel=manifest]');if(manifest)manifest.href=language==='en'?'manifest-en.webmanifest':'manifest.webmanifest';
  const installTitle=document.querySelector('meta[name=apple-mobile-web-app-title]');if(installTitle)installTitle.content=translateText(installTitle.content,language);
  const title=translateText(document.title,language);if(title!==document.title)document.title=title;
  localizeTree(document.body,language);
  const options={subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['placeholder','aria-label','title','alt']};
  const observer=new MutationObserver(records=>{
    observer.disconnect();
    const roots=new Set();
    for(const record of records){if(record.type==='childList')for(const node of record.addedNodes)roots.add(node);else roots.add(record.target);}
    for(const root of roots)if(root.isConnected)localizeTree(root,language);
    observer.observe(document.body,options);
  });
  observer.observe(document.body,options);
  addEventListener('app-language-change',()=>{language=pageLanguage();document.documentElement.lang=language;document.title=document.title.split(' · ').map(p=>translateText(p,language)).join(' · ');observer.disconnect();localizeTree(document.body,language);observer.observe(document.body,options);});
  addEventListener('storage',event=>{if(event.key===LANGUAGE_KEY)dispatchEvent(new Event('app-language-change'));});
  addEventListener('pageshow',event=>{if(event.persisted && pageLanguage()!==language)dispatchEvent(new Event('app-language-change'));});
}

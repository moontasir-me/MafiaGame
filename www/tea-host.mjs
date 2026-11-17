import {t} from './locale.mjs';

// A small home-screen interaction, independent of player accounts and game state.
export function bindTeaHost(root,{sound=()=>{},schedule=setTimeout,cancel=clearTimeout,now=()=>new Date(),reducedMotion=()=>globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches??false}={}) {
  const button=root?.querySelector('#tea-mama');
  if(!button)return ()=>{};
  const question=root.querySelector('.tea-question'),hint=root.querySelector('.tea-hint');
  let phase='idle',timer=null,disposed=false,cups=0;
  const local=()=>{const h=now().getHours();return h<5?t('রাত জাগেন মামা? কড়া লিকার দিছি, আস্তে আস্তে খান।','Up late, mama? Strong tea—take it slow.'):h<11?t('সকালের চা মামা, লগে দুইডা বিস্কুট লন।','Morning tea, mama. Have a couple of biscuits.'):h<16?t('এই রোদ্দুরে কই যান মামা? ছায়ায় বইসা চা খান।','Out in this heat? Sit in the shade with your tea.'):h<19?t('বিকালের আড্ডা জমুক মামা, চা-টা ধইরা বসেন।','Evening adda time, mama. Settle in with your tea.'):t('সারাদিন তো দৌড়াইলেন মামা, এইবার চা নিয়া জিরান।','Long day, mama? Rest a bit with your tea.');};
  const copy={
    idle:()=>[t('চা খাইবেন নি মামা?','Fancy a cup of tea, mama?'),local()],
    pouring:()=>[t('চা ঢালতাছি, মামা…','Pouring your tea…'),t('একটু দাঁড়ান, গরম গরম দিতাছি।','Just a moment. A fresh cup is on its way.')],
    served:()=>[t('এই নেন মামা, গরম চা!','Here you go, mama—fresh tea!'),local()]
  };
  function paint(next){
    phase=next;root.dataset.tea=next;
    const [title,note]=copy[next]();question.textContent=next==='served'&&cups>1?[t('মামা, আরেক কাপ হইয়া যাক!','Another cup, mama!'),t('এই নেন মামা, গরম চা! ফুঁ দিয়া খান।','Fresh tea, mama! Blow on it first.'),t('চায়ের কাপ খালি রাইখেন না মামা!','Keep that cup filled, mama!')][(cups-2)%3]:title;hint.textContent=note;
    button.disabled=next==='pouring';button.setAttribute('aria-busy',String(next==='pouring'));
    button.setAttribute('aria-label',next==='served'?t('মামার কাছ থেকে আরেক কাপ চা নিন','Get another cup of tea from mama'):t('মামার কাছ থেকে চা নিন','Get tea from Tong mama'));
  }
  button.onclick=()=>{
    if(disposed||phase==='pouring')return;cups++;
    if(reducedMotion()){paint('served');sound('tea');return;}
    paint('pouring');sound('tea-pour');
    timer=schedule(()=>{timer=null;if(disposed)return;paint('served');sound('tea');},2100);
  };
  const languageChanged=()=>paint(phase);globalThis.addEventListener?.('app-language-change',languageChanged);
  paint('idle');
  return ()=>{globalThis.removeEventListener?.('app-language-change',languageChanged);disposed=true;if(timer!==null)cancel(timer);button.onclick=null;};
}

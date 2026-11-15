import {t} from './locale.mjs';

// A small home-screen interaction, independent of player accounts and game state.
export function bindTeaHost(root,{sound=()=>{},schedule=setTimeout,cancel=clearTimeout,reducedMotion=()=>globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches??false}={}) {
  const button=root?.querySelector('#tea-mama');
  if(!button)return ()=>{};
  const question=root.querySelector('.tea-question'),hint=root.querySelector('.tea-hint');
  let phase='idle',timer=null,disposed=false;
  const copy={
    idle:()=>[t('চা খাইবেন নি মামা?','Fancy a cup of tea, mama?'),t('মামাকে ছুঁয়ে এক কাপ চা নিন।','Tap mama for a cup of tea.')],
    pouring:()=>[t('চা ঢালতাছি, মামা…','Pouring your tea…'),t('একটু দাঁড়ান, গরম গরম দিতাছি।','Just a moment. A fresh cup is on its way.')],
    served:()=>[t('এই নেন মামা, গরম চা!','Here you go, mama—fresh tea!'),t('আরেক কাপ চাইলে আবার ছুঁয়ে দিন।','Tap mama again for another cup.')]
  };
  function paint(next){
    phase=next;root.dataset.tea=next;
    const [title,note]=copy[next]();question.textContent=title;hint.textContent=note;
    button.disabled=next==='pouring';button.setAttribute('aria-busy',String(next==='pouring'));
    button.setAttribute('aria-label',next==='served'?t('মামার কাছ থেকে আরেক কাপ চা নিন','Get another cup of tea from mama'):t('মামার কাছ থেকে চা নিন','Get tea from Tong mama'));
  }
  button.onclick=()=>{
    if(disposed||phase==='pouring')return;
    if(reducedMotion()){paint('served');sound('tea');return;}
    paint('pouring');sound('tea-pour');
    timer=schedule(()=>{timer=null;if(disposed)return;paint('served');sound('tea');},2100);
  };
  paint('idle');
  return ()=>{disposed=true;if(timer!==null)cancel(timer);button.onclick=null;};
}

/** Touch/pointer and keyboard insertion sorting, without changing player identities. */
export function mountSeatSort(list,{onCommit,announce,labels}) {
 let active=null,frame=0;
 const handles=[...list.querySelectorAll('[data-drag-handle]')];
 function tell(key,name,index){announce(labels(key,name,index+1));}
 function begin(handle,keyboard,event){
  if(active||list.children.length<2)return;
  const row=handle.closest('[data-sort-name]'),rect=row.getBoundingClientRect();
  active={row,handle,name:row.dataset.sortName,original:[...list.children],keyboard,clientY:event?.clientY??0,offset:(event?.clientY??rect.top)-rect.top};
  row.classList.add(keyboard?'keyboard-lifted':'sort-placeholder');handle.setAttribute('aria-pressed','true');
  if(!keyboard){const ghost=row.cloneNode(true);ghost.className='name-row seat-row sort-ghost';ghost.setAttribute('aria-hidden','true');ghost.inert=true;ghost.style.width=rect.width+'px';ghost.style.left=rect.left+'px';ghost.style.top=rect.top+'px';document.body.append(ghost);active.ghost=ghost;document.body.classList.add('is-sorting');frame=requestAnimationFrame(scrollTick);}
  tell('lift',active.name,[...list.children].indexOf(row));
 }
 function position(){
  if(!active||active.keyboard)return;
  const {row,clientY,ghost,offset}=active;
  ghost.style.top=(clientY-offset)+'px';
  const before=[...list.children].filter(el=>el!==row).find(el=>clientY<el.getBoundingClientRect().top+el.getBoundingClientRect().height/2);
  if(before!==row.nextElementSibling){list.insertBefore(row,before??null);updateNumbers();}
 }
 function updateNumbers(){[...list.children].forEach((row,i)=>{const number=row.querySelector('.seat-number');if(number)number.textContent=labels('number','',i+1);});}
 function scrollTick(){if(!active||active.keyboard)return;const y=active.clientY;if(y<85)window.scrollBy(0,-Math.ceil((85-y)/8));else if(y>innerHeight-85)window.scrollBy(0,Math.ceil((y-(innerHeight-85))/8));position();frame=requestAnimationFrame(scrollTick);}
 function finish(commit){
  if(!active)return;
  const state=active;active=null;cancelAnimationFrame(frame);state.ghost?.remove();document.body.classList.remove('is-sorting');state.row.classList.remove('keyboard-lifted','sort-placeholder');state.handle.setAttribute('aria-pressed','false');
  if(!commit)state.original.forEach(row=>list.append(row));
  updateNumbers();const names=[...list.children].map(row=>row.dataset.sortName),index=names.indexOf(state.name);
  tell(commit?'drop':'cancel',state.name,index);
  if(commit&&state.original.some((row,i)=>row!==list.children[i]))onCommit(names,state.name);
  else state.handle.focus({preventScroll:true});
 }
 function pointerMove(e){if(!active||active.keyboard)return;e.preventDefault();active.clientY=e.clientY;position();}
 function pointerUp(){if(active&&!active.keyboard)finish(true);}
 function pointerCancel(){if(active&&!active.keyboard)finish(false);}
 function keydown(e){
  const handle=e.target.closest('[data-drag-handle]');
  if(e.key==='Escape'&&active){e.preventDefault();finish(false);return;}
  if(!handle)return;
  if((e.key===' '||e.key==='Enter')&&(!active||active.keyboard)){e.preventDefault();if(active)finish(true);else begin(handle,true);return;}
  if(!active?.keyboard||active.handle!==handle)return;
  if(e.key==='ArrowUp'||e.key==='ArrowDown'){e.preventDefault();const row=active.row,sibling=e.key==='ArrowUp'?row.previousElementSibling:row.nextElementSibling;if(sibling){if(e.key==='ArrowUp')list.insertBefore(row,sibling);else list.insertBefore(sibling,row);updateNumbers();handle.focus({preventScroll:true});row.scrollIntoView({block:'nearest'});tell('move',active.name,[...list.children].indexOf(row));}}
 }
 const cancelAll=()=>finish(false);window.addEventListener('blur',cancelAll);
 const listeners=handles.map(handle=>{const down=e=>{if(e.button!==0||e.isPrimary===false)return;e.preventDefault();begin(handle,false,e);};handle.addEventListener('pointerdown',down);return [handle,down];});
 window.addEventListener('pointermove',pointerMove,{passive:false});window.addEventListener('pointerup',pointerUp);window.addEventListener('pointercancel',pointerCancel);list.addEventListener('keydown',keydown);
 return ()=>{window.removeEventListener('blur',cancelAll);if(active)finish(false);listeners.forEach(([h,f])=>h.removeEventListener('pointerdown',f));window.removeEventListener('pointermove',pointerMove);window.removeEventListener('pointerup',pointerUp);window.removeEventListener('pointercancel',pointerCancel);list.removeEventListener('keydown',keydown);};
}

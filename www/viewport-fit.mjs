/* Fit spatial playing surfaces to the available viewport without scaling tap coordinates. */
export function fitBoard(width,height,reserved=0,ratio=1){const available=Math.max(60,height-reserved);return Math.max(60,Math.min(width,available*ratio));}
let frame=0,observed=null,observer=null;
const bounds=el=>{const s=getComputedStyle(el);return el.getBoundingClientRect().height+(parseFloat(s.marginTop)||0)+(parseFloat(s.marginBottom)||0);};
export function scheduleViewportFit(){cancelAnimationFrame(frame);frame=requestAnimationFrame(fit);}
function fit(){const configs=[['.ludo-content .table4','.board-wrap'],['.chess','.board-wrap'],['.cr-table','.cr-board-wrap'],['.tg-table','.tg-ground'],['.dt-paper',null]];let root,board;for(const [a,b]of configs){root=document.querySelector(a);if(root){board=b?root.querySelector(b):root;if(board)break;}}
 const screen=root?.closest('#screen'),finished=screen?.querySelector('.ludo-over,.cr-over,.dt-over,.tg-over,.lamp-status.end,[data-action="again"],.rank-table-wrap');document.body.classList.toggle('viewport-game',!!board&&!finished);if(!board||!screen||finished)return;
 if(observed!==root){observer?.disconnect();observed=root;observer=new ResizeObserver(scheduleViewportFit);observer.observe(root);observer.observe(screen);}
 const cs=getComputedStyle(screen),width=screen.clientWidth-(parseFloat(cs.paddingLeft)||0)-(parseFloat(cs.paddingRight)||0),height=screen.clientHeight-(parseFloat(cs.paddingTop)||0)-(parseFloat(cs.paddingBottom)||0),siblings=[...screen.children].filter(e=>e!==root&&getComputedStyle(e).display!=='none'),extra=siblings.reduce((sum,e)=>sum+bounds(e),0)+Math.max(0,screen.children.length-1)*8,seatHeight=Math.max(0,root.getBoundingClientRect().height-board.getBoundingClientRect().height),svg=board.matches('.dt-paper')?board.querySelector('svg'):null,vb=svg?.viewBox?.baseVal,ratio=vb?vb.width/vb.height:1;
 const edge=Math.floor(fitBoard(width,height,extra+seatHeight+12,ratio));if(Math.abs(parseFloat(board.style.width||'0')-edge)>1){board.style.width=edge+'px';board.style.maxWidth='100%';board.style.marginInline='auto';if(board.querySelector('canvas'))requestAnimationFrame(()=>dispatchEvent(new Event('resize')));}
}
if(typeof document!=='undefined'){addEventListener('resize',scheduleViewportFit);addEventListener('orientationchange',scheduleViewportFit);}

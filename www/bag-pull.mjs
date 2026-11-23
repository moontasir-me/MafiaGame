/* Convert a letterboxed canvas position to board coordinates. */
export function boardPoint(x,y,rect,width=480,height=760){const scale=Math.min(rect.width/width,rect.height/height);return {x:(x-rect.left-(rect.width-width*scale)/2)/scale,y:(y-rect.top-(rect.height-height*scale)/2)/scale,scale};}
export function pullPower(startY,endY){const pull=Math.max(0,endY-startY);return pull<12?0:Math.max(.12,Math.min(1,pull/110));}

export function flightFrame(elapsed,count){return Math.max(0,Math.min(count-1,Math.floor(elapsed/16)));}
/* A release gesture is measured by distance, not a required swipe direction. */
export function swipePower(start,end){return pullPower(0,Math.hypot(end.x-start.x,end.y-start.y));}
export const flightDuration=count=>Math.max(350,Math.min(1600,count*16));
export function flightProgress(elapsed,count){return flightFrame(Math.max(0,elapsed)/flightDuration(count)*Math.max(0,count-1)*16,count);}

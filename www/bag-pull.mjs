/* Convert a letterboxed canvas position to board coordinates. */
export function boardPoint(x,y,rect,width=480,height=760){const scale=Math.min(rect.width/width,rect.height/height);return {x:(x-rect.left-(rect.width-width*scale)/2)/scale,y:(y-rect.top-(rect.height-height*scale)/2)/scale,scale};}
export function pullPower(startY,endY){const pull=Math.max(0,endY-startY);return pull<12?0:Math.min(1,pull/110);}

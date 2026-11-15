import {clone,names} from './model.mjs';
export function schedule(project){
 const p=clone(project),entrants=names(p.entrantText,24,'entrant').map((name,i)=>({id:'e'+(i+1),name})),courts=names(p.courtText,12,'court').map((name,i)=>({id:'c'+(i+1),name})),ring=entrants.map(e=>e.id);
 if(ring.length%2)ring.push(null);
 const baseRounds=ring.length-1,base=[];
 for(let r=0;r<baseRounds;r++){const pairs=[];let bye=null;for(let i=0;i<ring.length/2;i++){const a=ring[i],b=ring[ring.length-1-i];if(a===null||b===null)bye=a??b;else pairs.push([a,b]);}base.push({pairs,bye});ring.splice(1,0,ring.pop());}
 const wavesPerRound=Math.ceil(Math.floor(entrants.length/2)/courts.length),matches=[],byes=[];
 for(let leg=1;leg<=p.legs;leg++)for(let r=0;r<baseRounds;r++){const round=(leg-1)*baseRounds+r+1;for(let i=0;i<base[r].pairs.length;i++){const pair=base[r].pairs[i],wave=Math.floor(i/courts.length)+1,court=courts[(i%courts.length+round-1)%courts.length];matches.push({id:'m'+(matches.length+1),leg,roundInLeg:r+1,round,wave,slot:(round-1)*wavesPerRound+wave,courtId:court.id,a:pair[leg===1?0:1],b:pair[leg===1?1:0]});}if(base[r].bye)byes.push({leg,roundInLeg:r+1,round,entrantId:base[r].bye});}
 return {schema:'fixturelane-schedule-v1',entrants,courts,rounds:baseRounds*p.legs,wavesPerRound,totalSlots:baseRounds*p.legs*wavesPerRound,matches,byes};
}

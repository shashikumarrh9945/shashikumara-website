'use strict';
(() => {
 const root=document.documentElement,gate=document.getElementById('entrance');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 if(!root.classList.contains('motion-enabled')&&!root.classList.contains('motion-paused'))root.classList.add(reduced.matches?'motion-paused':'motion-enabled');
 const records=new Map();
 const stopped=()=>document.hidden||root.classList.contains('motion-paused');
 function add(el,frames,duration,isEntry=false){
  if(!el||typeof el.animate!=='function')return;
  el.style.setProperty('animation','none','important');
  const animation=el.animate(frames,{duration,iterations:Infinity,direction:'alternate',easing:'ease-in-out',fill:'both'});animation.pause();
  records.set(el,{animation,visible:false,isEntry});
 }
 document.querySelectorAll('.background-layer').forEach((el,i)=>{
  if(el.classList.contains('hero-sun')){el.style.setProperty('animation','none','important');}
  else if(el.classList.contains('hero-wave'))add(el,[{transform:'translate3d(-18px,5px,0) scale(1.06)'},{transform:'translate3d(18px,-6px,0) scale(1.085)'}],6500);
  else add(el,[{transform:'translate3d(-9px,5px,0) scale(1.045)'},{transform:'translate3d(11px,-8px,0) scale(1.085)'}],6500+(i%3)*1300);
 });
 add(document.querySelector('.entry-art'),[{transform:'translate3d(-4px,3px,0) scale(1.025)'},{transform:'translate3d(6px,-5px,0) scale(1.065)'}],6500,true);
 document.querySelectorAll('.entry-mist').forEach((el,i)=>add(el,[{transform:`translate3d(${i?6:-6}%,0,0)`,opacity:.2},{transform:`translate3d(${i?-6:6}%,-2%,0)`,opacity:.65}],4000+i*1200,true));
 document.querySelectorAll('.portrait-gloss').forEach(el=>add(el,[{opacity:.2},{opacity:.75}],3500));
 document.querySelectorAll('.scene-motes i').forEach((el,i)=>add(el,[{transform:'translate3d(-10px,8px,0) rotate(-6deg)',opacity:.25},{transform:'translate3d(14px,-12px,0) rotate(12deg)',opacity:.55}],5500+(i%3)*1600));
 document.querySelectorAll('.portal-glyph').forEach((el,i)=>add(el,[{transform:'translate3d(0,3px,0) rotate(-2deg)'},{transform:'translate3d(0,-4px,0) rotate(2deg)'}],3800+i*500));
 function sync(){for(const [el,r]of records){const entryInactive=r.isEntry&&(!gate||gate.hidden||gate.classList.contains('travelling'));if(stopped()||!r.visible||entryInactive)r.animation.pause();else if(r.animation.playState!=='running')r.animation.play();}}
 if('IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>{for(const entry of entries){const record=records.get(entry.target);if(record)record.visible=entry.isIntersecting;}sync();},{rootMargin:'80px'});for(const el of records.keys())observer.observe(el);}else{for(const r of records.values())r.visible=true;}
 new MutationObserver(sync).observe(root,{attributes:true,attributeFilter:['class']});
 if(gate)new MutationObserver(sync).observe(gate,{attributes:true,attributeFilter:['hidden','class']});
 document.addEventListener('visibilitychange',sync);addEventListener('pageshow',sync);sync();
})();

// Trace the real wave crest so its paper background cannot hide the disk.
(() => {
 const profile=[0.70776, 0.70776, 0.71732, 0.72264, 0.72051, 0.73007, 0.75664, 0.76514, 0.76408, 0.77577, 0.78427, 0.78108, 0.77152, 0.76089, 0.75664, 0.75027, 0.7407, 0.72476, 0.71201, 0.70563, 0.7067, 0.70988, 0.71201, 0.70776, 0.70032, 0.69394, 0.69501, 0.69819, 0.71095, 0.71307, 0.70882, 0.69501, 0.67056, 0.661, 0.66206, 0.66419, 0.65781, 0.644, 0.63231, 0.61424, 0.58767, 0.57173, 0.56748, 0.56961, 0.56854, 0.5526, 0.53135, 0.51116, 0.46015, 0.42508, 0.4017, 0.38789, 0.37938, 0.37194, 0.36132, 0.35494, 0.33794, 0.31137, 0.27736, 0.24548, 0.23167, 0.22742, 0.21148, 0.19554, 0.18491];
 function crest(sourceX){const pos=Math.max(0,Math.min(1,sourceX))*64,lo=Math.floor(pos),hi=Math.min(64,lo+1);return profile[lo]+(profile[hi]-profile[lo])*(pos-lo);}
 const hero=document.querySelector('.personal-hero');if(!hero)return;
 const wave=hero.querySelector('.hero-wave'),circle=hero.querySelector('.hero-sun');if(!wave||!circle)return;
 function layout(){
  const w=wave.clientWidth,h=wave.clientHeight;if(!w||!h)return;
  const style=getComputedStyle(wave),position=style.backgroundPosition.split(' ');
  const ratio=token=>token==='bottom'||token==='right'?1:token==='top'||token==='left'?0:token==='center'?.5:parseFloat(token)/100;
  const scale=Math.max(w/1672,h/941),ox=(w-1672*scale)*(ratio(position[0])||.5),oy=(h-941*scale)*(Number.isFinite(ratio(position[1]))?ratio(position[1]):1);
  const yAt=x=>oy+crest((x-ox)/(1672*scale))*941*scale;
  const points=Array.from({length:65},(_,i)=>{const x=i*w/64;return `${(x/w*100).toFixed(3)}% ${Math.max(0,Math.min(100,yAt(x)/h*100)).toFixed(3)}%`;});
  wave.style.clipPath='polygon('+points.join(',')+',100% 100%,0% 100%)';
  const diameter=circle.clientWidth,centre=circle.offsetLeft+diameter*.5-wave.offsetLeft;
  const overlap=Math.min(24,diameter*.07),top=wave.offsetTop+yAt(centre)-diameter+overlap;
  circle.style.top=Math.max(40,top)+'px';circle.style.bottom='auto';
 }
 let frame=0;const schedule=()=>{if(!frame)frame=requestAnimationFrame(()=>{frame=0;layout();});};
 if('ResizeObserver'in window)new ResizeObserver(schedule).observe(hero);
 addEventListener('resize',schedule);addEventListener('pageshow',schedule);
 layout();
})();

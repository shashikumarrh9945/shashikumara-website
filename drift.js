'use strict';
(() => {
 const gate=document.getElementById('entrance');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const paused=()=>document.documentElement.classList.contains('motion-paused');
 if(gate){
  const hud=gate.querySelector('.entry-hud');
  let animations=[],primary=null,safety=0,started=0,active=false;
  const stop=()=>{active=false;clearTimeout(safety);animations.forEach(a=>a.cancel());animations=[];};
  const finish=()=>{if(!active)return;active=false;gate.dispatchEvent(new Event('journeyfinish'));};
  const sync=()=>{if(!active)return;if(paused()){finish();return;}if(!document.hidden&&performance.now()-started>=1100){finish();return;}animations.forEach(a=>document.hidden?a.pause():a.play());};
  document.addEventListener('visibilitychange',sync);
  new MutationObserver(sync).observe(document.documentElement,{attributes:true,attributeFilter:['class']});
  addEventListener('orientationchange',()=>{if(active)finish();});
  gate.addEventListener('journeybegin',()=>{
   hud.hidden=false;document.getElementById('flight-skip').focus({preventScroll:true});active=true;started=performance.now();
   const title=document.getElementById('entrance-title');
   safety=setTimeout(finish,1600);
   try{
    if(!title.animate){finish();return;}
    const small=matchMedia('(max-width: 1024px)').matches;
    const animate=(el,frames,options={})=>{if(!el)return null;const a=el.animate(frames,{duration:1000,fill:'both',easing:'cubic-bezier(.2,.35,.4,1)',...options});animations.push(a);return a;};
    primary=animate(title,[{transform:'scaleX(1) scale(1)',opacity:1,offset:0},{transform:`scaleX(1) scale(${small?2:3})`,opacity:1,offset:.45},{transform:`scaleX(1) scale(${small?5:8})`,opacity:0,offset:1}]);
    gate.flightProgress=()=>Math.min(1,Number(primary?.currentTime||0)/1000);
    animate(gate.querySelector('.entry-art'),[{transform:'scale(1)'},{transform:'scale(1.12)'}]);
    animate(gate.querySelector('.mist-left'),[{transform:'translate3d(0,0,0)',opacity:.4},{transform:'translate3d(-30%,8%,0)',opacity:0}]);
    animate(gate.querySelector('.mist-right'),[{transform:'translate3d(0,0,0)',opacity:.4},{transform:'translate3d(30%,8%,0)',opacity:0}]);
    animate(gate,[{opacity:1,offset:0},{opacity:1,offset:.72},{opacity:0,offset:1}]);
    primary.onfinish=finish;sync();
   }catch(error){finish();}
  });
  gate.addEventListener('journeyend',stop);
  document.getElementById('flight-skip')?.addEventListener('click',()=>gate.dispatchEvent(new Event('journeyfinish')));
  gate.addEventListener('keydown',e=>{if(e.key==='Escape')gate.dispatchEvent(new Event('journeyfinish'));if(e.key==='Tab'&&!gate.hidden){const items=[...gate.querySelectorAll('button')].filter(b=>b.offsetParent!==null&&!b.closest('.entry-copy')?.matches('.travelling .entry-copy'));const first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}});
 }
 // Small, bounded attraction follows the pointer without moving the click target away.
 document.querySelectorAll('.button,.nav-contact,#enter-site').forEach(button=>{
  button.addEventListener('pointermove',e=>{if(paused()||e.pointerType==='touch'||document.body.classList.contains('editing'))return;const r=button.getBoundingClientRect();button.style.translate=`${(e.clientX-r.left-r.width/2)*.06}px ${(e.clientY-r.top-r.height/2)*.1}px`;},{passive:true});
  button.addEventListener('pointerleave',()=>button.style.translate='0 0');
 });
})();
// One bounded render loop drives three sand depths and the layered artwork.
(() => {
 const gate=document.getElementById('entrance'),canvas=document.getElementById('sand-drift');
 if(!gate||!canvas)return;
 const art=gate.querySelector('.entry-art');
 if(art&&!art.querySelector('.spiral-artwork')){for(const name of ['spiral-artwork','spiral-focus']){const layer=document.createElement('div');layer.className=name;layer.setAttribute('aria-hidden','true');art.append(layer);}}
 const ctx=canvas.getContext('2d');if(!ctx)return;
 let w=1,h=1,frame=0,last=0,clock=0,px=0,py=0,tx=0,ty=0;
 const compact=()=>innerWidth<=1024;
 const grains=Array.from({length:compact()?210:390},(_,i)=>({depth:i%3,x:Math.random(),y:Math.random(),phase:Math.random()*Math.PI*2,speed:.65+Math.random()*.65,size:.4+Math.random()*1.15}));
 const frozen=()=>document.hidden||document.documentElement.classList.contains('motion-paused');
 function size(){const rect=gate.getBoundingClientRect();w=Math.max(1,rect.width||innerWidth);h=Math.max(1,rect.height||innerHeight);const d=Math.min(devicePixelRatio||1,compact()?1.25:1.5);canvas.width=Math.round(w*d);canvas.height=Math.round(h*d);ctx.setTransform(d,0,0,d,0,0);}
 gate.addEventListener('pointermove',e=>{if(frozen()||gate.classList.contains('travelling'))return;tx=Math.max(-1,Math.min(1,(e.clientX/w-.5)*2));ty=Math.max(-1,Math.min(1,(e.clientY/h-.5)*2));},{passive:true});
 const release=()=>{tx=0;ty=0;};gate.addEventListener('pointerleave',release);gate.addEventListener('pointerup',release);gate.addEventListener('pointercancel',release);
 function draw(now){frame=0;if(gate.hidden)return;if(last&&now-last<30&&!frozen()){frame=requestAnimationFrame(draw);return;}
  const dt=Math.min(50,now-last||16);last=now;if(!frozen())clock+=dt;
  const sec=clock/1000,travel=gate.flightProgress?gate.flightProgress():0;
  const blend=1-Math.exp(-dt/110);px+=(tx-px)*blend;py+=(ty-py)*blend;
  if(!frozen()){const span=compact()?2:4;gate.style.setProperty('--spiral-x',(px*span+Math.sin(sec*.32)*2).toFixed(2)+'px');gate.style.setProperty('--spiral-y',(py*span+Math.cos(sec*.28)*2).toFixed(2)+'px');gate.style.setProperty('--spiral-turn',(Math.sin(sec*.22)*.35).toFixed(3)+'deg');}
  ctx.clearRect(0,0,w,h);
  for(const g of grains){const depth=g.depth,wind=sec*(.035+depth*.022)*g.speed;
   let x=((g.x+wind)%1)*(w+60)-30,y=((g.y+Math.sin(sec*.48+g.phase)*.012+sec*.003*(depth+1))%1)*h;
   y+=Math.sin(x/w*8+sec*.8+g.phase)*(7+depth*5);
   x+=(g.x-.5)*travel*w*.22;y+=(g.y-.5)*travel*h*.12;
   ctx.fillStyle=['#b69c69','#dfbd77','#ffe2a5'][depth];ctx.globalAlpha=[.22,.38,.58][depth]*(.8+.2*Math.sin(g.phase+sec));
   ctx.fillRect(x,y,g.size*(1+depth*.28),g.size);
   if(depth===2){ctx.globalAlpha=.14;ctx.fillRect(x-g.size*4,y,g.size*3,.6);}
  }
  ctx.globalAlpha=1;if(!frozen())frame=requestAnimationFrame(draw);
 }
 function sync(){cancelAnimationFrame(frame);frame=0;last=0;if(!gate.hidden)draw(performance.now());}
 function resize(){size();sync();}
 if('ResizeObserver'in window)new ResizeObserver(resize).observe(gate);
 if(window.visualViewport)window.visualViewport.addEventListener('resize',resize);
 addEventListener('resize',resize);addEventListener('orientationchange',resize);addEventListener('pageshow',resize);document.addEventListener('visibilitychange',sync);
 new MutationObserver(sync).observe(document.documentElement,{attributes:true,attributeFilter:['class']});
 new MutationObserver(sync).observe(gate,{attributes:true,attributeFilter:['hidden']});
 gate.addEventListener('journeyend',()=>{cancelAnimationFrame(frame);frame=0;ctx.clearRect(0,0,w,h);});size();sync();
})();
// Each realm carries its own slowly shifting light above the supplied background art.
for(const scene of document.querySelectorAll('.personal-hero,.section,.work-field')){
 if(scene.classList.contains('origin'))continue;
 const layer=document.createElement('div');layer.className='realm-atmosphere';layer.setAttribute('aria-hidden','true');scene.prepend(layer);
}
// Touch movement adds depth without blocking taps or scrolling.
(() => {
 const gate=document.getElementById('entrance');if(!gate)return;let frame=0;
 gate.addEventListener('pointermove',event=>{if(event.pointerType!=='touch'||gate.classList.contains('travelling')||document.documentElement.classList.contains('motion-paused')||frame)return;const x=event.clientX/innerWidth-.5,y=event.clientY/innerHeight-.5;frame=requestAnimationFrame(()=>{gate.style.setProperty('--touch-x',String(x));gate.style.setProperty('--touch-y',String(y));frame=0;});},{passive:true});
 gate.addEventListener('pointerup',()=>{gate.style.setProperty('--touch-x','0');gate.style.setProperty('--touch-y','0');},{passive:true});
})();

// Render the background image itself each frame; independent of CSS keyframes.
(() => {
 const gate=document.getElementById('entrance');if(!gate)return;
 const canvas=document.createElement('canvas');canvas.className='entrance-image-motion';canvas.setAttribute('aria-hidden','true');gate.insertBefore(canvas,gate.querySelector('.entry-shade'));
 const ctx=canvas.getContext('2d',{alpha:false});if(!ctx){canvas.remove();return;}
 const glow=document.createElement('canvas'),gx=glow.getContext('2d');
 let image=null,imagePath='',w=1,h=1,dpr=1,frame=0,last=0,elapsed=0,targetX=0,targetY=0,px=0,py=0,mask=null;
 const stopped=()=>gate.hidden||document.hidden||document.documentElement.classList.contains('motion-paused');
 function selectImage(){const value=getComputedStyle(gate).getPropertyValue('--spiral-scene').trim();const path=value.replace(/^url\(["']?|["']?\)$/g,'');if(!path||path===imagePath)return;imagePath=path;const next=new Image();next.onload=()=>{if(path!==imagePath)return;image=next;gate.classList.add('canvas-background-ready');sync();};next.onerror=()=>{if(path===imagePath)imagePath='';};next.src=path;}
 function resize(){const r=gate.getBoundingClientRect();w=Math.max(1,r.width||innerWidth);h=Math.max(1,r.height||innerHeight);dpr=Math.min(devicePixelRatio||1,w<1025?1.25:1.5);canvas.width=glow.width=Math.round(w*dpr);canvas.height=glow.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);if(gx){gx.setTransform(dpr,0,0,dpr,0,0);mask=gx.createRadialGradient(w*.5,h*.5,0,w*.5,h*.5,Math.min(w,h)*.62);mask.addColorStop(0,'rgba(255,255,255,.8)');mask.addColorStop(.4,'rgba(255,255,255,.48)');mask.addColorStop(1,'rgba(255,255,255,0)');}selectImage();sync();}
 function paint(target,scale,angle,x,y){const cover=Math.max(w/image.naturalWidth,h/image.naturalHeight)*scale;target.save();target.translate(w/2+x,h/2+y);target.rotate(angle);target.drawImage(image,-image.naturalWidth*cover/2,-image.naturalHeight*cover/2,image.naturalWidth*cover,image.naturalHeight*cover);target.restore();}
 function render(now){frame=0;if(!image||gate.hidden)return;if(last&&now-last<30&&!stopped()){frame=requestAnimationFrame(render);return;}const dt=Math.min(50,now-last||16);last=now;if(!stopped())elapsed+=dt;const t=elapsed/1000;const smooth=1-Math.exp(-dt/130);px+=(targetX-px)*smooth;py+=(targetY-py)*smooth;
  ctx.fillStyle='#05282d';ctx.fillRect(0,0,w,h);
  const pan=Math.min(w,h)*.018;paint(ctx,1.12+Math.sin(t*.55)*.045,Math.sin(t*.24)*.008,Math.sin(t*.42)*pan+px*pan,Math.cos(t*.34)*pan+py*pan);
  if(gx){gx.globalCompositeOperation='source-over';gx.clearRect(0,0,w,h);paint(gx,1.14+Math.sin(t*.55)*.045,Math.sin(t*.38)*.055,Math.sin(t*.42)*pan,Math.cos(t*.34)*pan);gx.globalCompositeOperation='destination-in';gx.fillStyle=mask;gx.fillRect(0,0,w,h);ctx.save();ctx.globalCompositeOperation='screen';ctx.globalAlpha=.24;ctx.drawImage(glow,0,0,w,h);ctx.restore();}
  if(!stopped())frame=requestAnimationFrame(render);
 }
 function sync(){cancelAnimationFrame(frame);frame=0;last=0;if(image&&!gate.hidden)render(performance.now());}
 gate.addEventListener('pointermove',e=>{if(stopped())return;targetX=Math.max(-.5,Math.min(.5,e.clientX/w-.5));targetY=Math.max(-.5,Math.min(.5,e.clientY/h-.5));},{passive:true});
 const reset=()=>{targetX=0;targetY=0;};gate.addEventListener('pointerleave',reset);gate.addEventListener('pointerup',reset);
 addEventListener('resize',resize);addEventListener('orientationchange',resize);addEventListener('pageshow',resize);document.addEventListener('visibilitychange',sync);if(window.visualViewport)window.visualViewport.addEventListener('resize',resize);
 new MutationObserver(sync).observe(document.documentElement,{attributes:true,attributeFilter:['class']});new MutationObserver(sync).observe(gate,{attributes:true,attributeFilter:['hidden']});gate.addEventListener('journeyend',sync);resize();
})();

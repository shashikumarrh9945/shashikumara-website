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
// A continuous wind field carries sand across the entire entrance, before and during entry.
(() => {
 const gate=document.getElementById('entrance'),canvas=document.getElementById('sand-drift');
 if(!gate||!canvas)return;const ctx=canvas.getContext('2d');if(!ctx)return;
 let w=1,h=1,frame=0,last=0,clock=0;
 const groups=Array.from({length:3},(_,depth)=>Array.from({length:innerWidth<1025?120:250},()=>({x:Math.random(),y:Math.random(),phase:Math.random()*6.283,speed:.6+Math.random()*.8,size:.5+Math.random()*(depth+1)*.5})));
 const frozen=()=>document.hidden||document.documentElement.classList.contains('motion-paused');
 function size(){w=innerWidth;h=innerHeight;const d=Math.min(devicePixelRatio||1,innerWidth<1025?1:1.5);canvas.width=Math.round(w*d);canvas.height=Math.round(h*d);ctx.setTransform(d,0,0,d,0,0);}
 function draw(now){frame=0;if(gate.hidden)return;if(last&&now-last<32&&!frozen()){frame=requestAnimationFrame(draw);return;}const dt=Math.min(64,now-last||32);last=now;if(!frozen())clock+=dt;
  const seconds=clock/1000,t=gate.flightProgress?gate.flightProgress():0;ctx.clearRect(0,0,w,h);
  groups.forEach((grains,depth)=>{ctx.fillStyle=['#c4a575','#dfc18d','#f4deb0'][depth];ctx.globalAlpha=[.25,.4,.55][depth];
   for(const g of grains){const flow=seconds*(.045+depth*.025)*g.speed;let x=((g.x+flow)%1)*(w+80)-40;let y=g.y*h+Math.sin(seconds*.8+g.phase+g.x*5)*(12+depth*7);x+=(g.x-.5)*t*95;y+=Math.sin(g.phase)*t*24;const radius=g.size;ctx.fillRect(x,y,radius*(1+depth*.25),radius);if(depth===2)ctx.fillRect(x-radius*3,y+1,radius*2,.5);}
  });ctx.globalAlpha=1;if(!frozen())frame=requestAnimationFrame(draw);
 }
 function sync(){cancelAnimationFrame(frame);last=0;draw(performance.now());}
 addEventListener('resize',()=>{size();sync();});document.addEventListener('visibilitychange',sync);
 new MutationObserver(sync).observe(document.documentElement,{attributes:true,attributeFilter:['class']});
 gate.addEventListener('journeyend',()=>{cancelAnimationFrame(frame);ctx.clearRect(0,0,w,h);});size();sync();
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

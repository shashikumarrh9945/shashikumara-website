'use strict';
(() => {
 const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
 let paused=document.documentElement.classList.contains('motion-paused');
 let reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const entrance=$('#entrance'),motion=$('#entrance-motion');
 const sync=()=>{paused=document.documentElement.classList.contains('motion-paused');reduced=paused;if(motion){motion.setAttribute('aria-pressed',String(paused));motion.textContent=paused?'Resume motion ▷':'Pause motion Ⅱ';}if(paused){document.documentElement.style.setProperty('--track-x','0');document.documentElement.style.setProperty('--track-y','0');}updateLoop();};
 motion?.addEventListener('click',()=>$('#motion').click());
 new MutationObserver(sync).observe(document.documentElement,{attributes:true,attributeFilter:['class']});

 let trackFrame=0;
 document.addEventListener('pointermove',e=>{if(paused||reduced||e.pointerType==='touch'||trackFrame)return;trackFrame=requestAnimationFrame(()=>{const x=e.clientX/innerWidth-.5,y=e.clientY/innerHeight-.5;document.documentElement.style.setProperty('--track-x',String(x));document.documentElement.style.setProperty('--track-y',String(y));targetX=x;targetY=y;trackFrame=0;});},{passive:true});
 const portrait=$('.portrait-composition');
 portrait?.addEventListener('pointermove',e=>{if(paused||reduced||e.pointerType==='touch')return;const r=portrait.getBoundingClientRect();portrait.style.setProperty('--portrait-x',String((e.clientX-r.left)/r.width-.5));portrait.style.setProperty('--portrait-y',String((e.clientY-r.top)/r.height-.5));},{passive:true});
 portrait?.addEventListener('pointerleave',()=>{portrait.style.setProperty('--portrait-x','0');portrait.style.setProperty('--portrait-y','0');});
 let scrollFrame=0;
 function progress(){scrollFrame=0;const max=document.documentElement.scrollHeight-innerHeight;document.documentElement.style.setProperty('--journey',String(max>0?scrollY/max:0));}
 addEventListener('scroll',()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(progress);},{passive:true});addEventListener('resize',progress);progress();
 if('IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>entries.forEach(e=>e.target.classList.toggle('scene-sleep',!e.isIntersecting)),{rootMargin:'100px'});$$('.section,.personal-hero').forEach(s=>observer.observe(s));}
 const canvas=$('#space-track');let frame=0,last=0,width=1,height=1,targetX=0,targetY=0,smoothedX=0,smoothedY=0,stars=[],ctx=null;
 if(canvas){ctx=canvas.getContext('2d',{alpha:true});if(ctx){const resize=()=>{const r=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,1.5);width=r.width;height=r.height;canvas.width=Math.max(1,Math.round(width*dpr));canvas.height=Math.max(1,Math.round(height*dpr));ctx.setTransform(dpr,0,0,dpr,0,0);stars=Array.from({length:innerWidth<740?90:190},()=>({x:(Math.random()-.5)*2.5,y:(Math.random()-.5)*2.5,z:Math.random()*1.3+.15,size:Math.random()*1.3+.3,phase:Math.random()*Math.PI*2}));draw(0,0);};if('ResizeObserver'in window)new ResizeObserver(resize).observe(canvas);else addEventListener('resize',resize);resize();}}
 function draw(delta,time){if(!ctx)return;ctx.clearRect(0,0,width,height);smoothedX+=(targetX-smoothedX)*.035;smoothedY+=(targetY-smoothedY)*.035;const warp=entrance?.classList.contains('warp');const scale=Math.min(width,height)*.48,cx=width*.5+smoothedX*45,cy=height*.47+smoothedY*35;
  for(const s of stars){if(delta&&!paused&&!reduced){s.z-=delta*(warp?.8:.025);if(s.z<.12){s.z=1.4;s.x=(Math.random()-.5)*2.5;s.y=(Math.random()-.5)*2.5;}}const x=cx+s.x/s.z*scale,y=cy+s.y/s.z*scale;if(x<-10||x>width+10||y<-10||y>height+10)continue;const opacity=Math.min(.82,.2+.4/s.z)*(.83+.17*Math.sin(time*.00035+s.phase)),radius=Math.min(2,s.size/s.z*.48);ctx.fillStyle=`rgba(235,223,190,${opacity})`;ctx.beginPath();ctx.arc(x,y,radius,0,Math.PI*2);ctx.fill();if(s.size>1.15){ctx.strokeStyle=`rgba(193,140,64,${opacity*.4})`;ctx.lineWidth=.5;ctx.beginPath();ctx.moveTo(x-4,y);ctx.lineTo(x+4,y);ctx.moveTo(x,y-4);ctx.lineTo(x,y+4);ctx.stroke();}}
 }
 function animate(now){frame=0;if(paused||reduced||document.hidden||!entrance||entrance.hidden)return;if(last&&now-last<32){frame=requestAnimationFrame(animate);return;}const delta=last?Math.min(.05,(now-last)/1000):0;last=now;draw(delta,now);frame=requestAnimationFrame(animate);}
 function updateLoop(){if(!canvas||!ctx)return;const active=!paused&&!reduced&&!document.hidden&&entrance&&!entrance.hidden;if(active&&!frame){last=0;frame=requestAnimationFrame(animate);}else if(!active){cancelAnimationFrame(frame);frame=0;draw(0,0);}}
 if(entrance)new MutationObserver(updateLoop).observe(entrance,{attributes:true,attributeFilter:['hidden']});
 document.addEventListener('visibilitychange',updateLoop);
 matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',e=>{reduced=e.matches;updateLoop();});
 sync();
})();

'use strict';
(() => {
 const gate=document.querySelector('#entrance'),canvas=document.querySelector('#orbital-depth');
 const portrait=document.querySelector('.portrait-composition'),about=document.querySelector('#origin');
 let targetX=0,targetY=0,x=0,y=0,frame=0,last=0,t=0,width=1,height=1,ctx=null;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const paused=()=>document.documentElement.classList.contains('motion-paused');
 function setTarget(a,b){targetX=Math.max(-.5,Math.min(.5,a));targetY=Math.max(-.5,Math.min(.5,b));document.documentElement.style.setProperty('--tracking-x',String(targetX));document.documentElement.style.setProperty('--tracking-y',String(targetY));}
 document.addEventListener('pointermove',e=>{if(paused()||e.pointerType==='touch')return;setTarget(e.clientX/innerWidth-.5,e.clientY/innerHeight-.5);},{passive:true});
 if(about&&portrait){about.addEventListener('pointermove',e=>{if(paused()||e.pointerType==='touch')return;const r=about.getBoundingClientRect();portrait.style.setProperty('--portrait-x',String((e.clientX-r.left)/r.width-.5));portrait.style.setProperty('--portrait-y',String((e.clientY-r.top)/r.height-.5));},{passive:true});about.addEventListener('pointerleave',()=>{portrait.style.setProperty('--portrait-x','0');portrait.style.setProperty('--portrait-y','0');});}
 document.addEventListener('keydown',e=>{if(!gate||gate.hidden||paused())return;const moves={ArrowLeft:[-.1,0],ArrowRight:[.1,0],ArrowUp:[0,-.1],ArrowDown:[0,.1]};if(moves[e.key]){e.preventDefault();setTarget(targetX+moves[e.key][0],targetY+moves[e.key][1]);}});
 if(!canvas||!gate)return;
 ctx=canvas.getContext('2d',{alpha:true});if(!ctx)return;
 const orbitals=Array.from({length:3},(_,i)=>({tilt:[.98,1.23,.58][i],spin:[-.35,.7,-.9][i],radius:[.55,.72,.9][i],speed:[.045,-.025,.018][i],colour:i===1?'115,173,135':'193,163,105'}));
 function resize(){const r=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,1.5);width=Math.max(1,r.width);height=Math.max(1,r.height);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);draw();}
 function project(a,orb){const radius=Math.min(width,height)*orb.radius;let px=Math.cos(a)*radius,py=Math.sin(a)*radius,pz=0;const tilt=orb.tilt+y*.16,spin=orb.spin+t*orb.speed+x*.2;const qy=py*Math.cos(tilt),qz=py*Math.sin(tilt);const qx=px*Math.cos(spin)-qy*Math.sin(spin),yy=px*Math.sin(spin)+qy*Math.cos(spin);pz=qz;const focal=800/(800+pz);return{x:width*.5+qx*focal+x*38,y:height*.48+yy*focal+y*28,z:pz,scale:focal};}
 function draw(){ctx.clearRect(0,0,width,height);for(const orb of orbitals){const segments=130;for(let n=0;n<segments;n++){const a=n/segments*Math.PI*2,p=project(a,orb),q=project(a+Math.PI*2/segments,orb);const depth=(p.z/(Math.min(width,height)*orb.radius)+1)/2;const opacity=.055+(1-depth)*.16;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.strokeStyle=`rgba(${orb.colour},${opacity})`;ctx.lineWidth=depth<.3?1:.55;ctx.stroke();if(n%13===0){ctx.beginPath();ctx.arc(p.x,p.y,1.1*p.scale,0,Math.PI*2);ctx.fillStyle=`rgba(${orb.colour},${opacity*2})`;ctx.fill();}}for(let n=0;n<3;n++){const a=t*(orb.speed>0?.3:-.25)+n*Math.PI*2/3,p=project(a,orb);const glow=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,13*p.scale);glow.addColorStop(0,`rgba(${orb.colour},.65)`);glow.addColorStop(.15,`rgba(${orb.colour},.35)`);glow.addColorStop(1,`rgba(${orb.colour},0)`);ctx.fillStyle=glow;ctx.beginPath();ctx.arc(p.x,p.y,13*p.scale,0,Math.PI*2);ctx.fill();}}
 }
 function tick(now){frame=0;if(paused()||document.hidden||gate.hidden||gate.classList.contains('travelling'))return;if(last&&now-last<32){frame=requestAnimationFrame(tick);return;}const dt=last?Math.min((now-last)/1000,.05):0;last=now;t+=dt;x+=(targetX-x)*.035;y+=(targetY-y)*.035;draw();frame=requestAnimationFrame(tick);}
 function sync(){const active=!paused()&&!document.hidden&&!gate.hidden;if(active&&!frame){last=0;frame=requestAnimationFrame(tick);}else if(!active){cancelAnimationFrame(frame);frame=0;draw();}}
 if('ResizeObserver'in window)new ResizeObserver(resize).observe(canvas);else addEventListener('resize',resize);
 new MutationObserver(sync).observe(document.documentElement,{attributes:true,attributeFilter:['class']});new MutationObserver(sync).observe(gate,{attributes:true,attributeFilter:['hidden']});document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);resize();sync();
})();

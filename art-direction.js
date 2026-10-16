'use strict';
(() => {
 const scenes=[...document.querySelectorAll('.section,.personal-hero,.work-field')];
 const active=new Set();let scrollFrame=0;
 if('IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)active.add(e.target);else active.delete(e.target);}),{rootMargin:'100px'});scenes.forEach(s=>observer.observe(s));}else scenes.forEach(s=>active.add(s));
 function update(){scrollFrame=0;if(document.documentElement.classList.contains('motion-paused'))return;for(const scene of active){const r=scene.getBoundingClientRect();const progress=Math.max(-1,Math.min(1,(innerHeight*.5-(r.top+r.height*.5))/innerHeight));scene.style.setProperty('--scene-scroll',String(progress));}}
 addEventListener('scroll',()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(update);},{passive:true});addEventListener('resize',update);
 for(const id of['portals','featured','gallery']){const scene=document.getElementById(id);if(!scene)continue;for(let i=1;i<=2;i++){const span=document.createElement('span');span.className='ambient-symbol s'+i;span.setAttribute('aria-hidden','true');span.textContent=i===1?'✳':'✦';scene.append(span);}}
 update();
})();

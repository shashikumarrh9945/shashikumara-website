"use strict";
(() => {
 const root=document.documentElement;
 root.classList.toggle('owner-edit-session',new URLSearchParams(location.search).get('edit')==='1');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const targets=[...document.querySelectorAll('.portrait-composition, #hero-title, .origin-copy h2, .featured-title h2, .work-intro h1, .work-outro h2, .contact h2')];
 if(reduced.matches||!('IntersectionObserver'in window))return;
 const observer=new IntersectionObserver(entries=>{for(const e of entries){if(!e.isIntersecting)continue;observer.unobserve(e.target);if(root.classList.contains('motion-paused'))continue;const portrait=e.target.classList.contains('portrait-composition');e.target.animate(portrait?[{opacity:.35},{opacity:1}]:[{opacity:.35,translate:'0 9px'},{opacity:1,translate:'0 0'}],{duration:portrait?850:650,easing:'cubic-bezier(.2,.65,.3,1)',iterations:1});}},{threshold:.15});
 targets.forEach(el=>observer.observe(el));
})();

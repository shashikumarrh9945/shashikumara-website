'use strict';
(() => {
 const DEFAULT=structuredClone(window.MAHA_DATA);
 const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
 const clone=x=>structuredClone(x);
 const state=clone(DEFAULT), editing=false;
 function element(tag,className,text){const e=document.createElement(tag);if(className)e.className=className;if(text!==undefined)e.textContent=text;return e;}
 function apply(){if(['assets/portrait-composition.webp','assets/portrait.webp','assets/portrait-mobile.webp','assets/portrait-tablet.webp'].includes(state.images.portrait))state.images.portrait='assets/about-preview.webp';if(['assets/blue-sun.webp','assets/blue-circle-supplied.webp'].includes(state.images.sun))state.images.sun='assets/blue-circle-transparent.webp';if(['assets/cosmic-threshold.webp','assets/celestial-dunes.webp','assets/entrance-gold.webp','assets/entrance-gold-v2.webp'].includes(state.images.entranceScene))state.images.entranceScene='assets/entrance-supplied-laptop.webp';
  for(const [key,value]of Object.entries(state.text))$$(`[data-text="${key}"]`).forEach(el=>el.textContent=value);
  for(const [key,value]of Object.entries(state.images))$$(`[data-image="${key}"]`).forEach(el=>{if(el.tagName==='IMG')el.src=value;else el.style.backgroundImage='url("'+value+'")';});
  if($('#entrance')){const gate=$('#entrance');gate.style.setProperty('--entrance-laptop','url("'+state.images.entranceScene+'")');gate.style.setProperty('--entrance-mobile','url("'+state.images.entranceMobile+'")');gate.style.setProperty('--entrance-tablet','url("'+state.images.entranceTablet+'")');}
  if(state.theme.cream==='#f5f0df')state.theme.cream='#f4efdf';
  for(const key of ['ink','cream','accent','moss'])document.documentElement.style.setProperty('--'+key,state.theme[key]);
  document.body.dataset.font=state.theme.font;
  for(const id of state.sections){const el=document.getElementById(id);$('#sections').append(el);el.hidden=state.hidden.includes(id);}
  $$('a[href*="#"]').forEach(a=>{const id=a.getAttribute('href').split('#')[1];if(DEFAULT.sections.includes(id))a.hidden=state.hidden.includes(id);});
  renderProjects();renderAtlas();

 }
 function card(project){
  const article=element('article','work-card reveal visible');article.dataset.project=project.id;
  const external=project.externalUrl;const button=element(external?'a':'button','card-visual');if(external){button.href=external;}else button.type='button';button.setAttribute('aria-label','Open '+project.title+' project');
  const img=element('img');img.src=project.image;img.alt=project.title+' visual concept';img.loading='lazy';img.width=1200;img.height=800;img.dataset.projectImage=project.id;
  button.append(img,element('span','card-arrow','↗'));button.lastChild.setAttribute('aria-hidden','true');button.addEventListener('click',event=>{if(editing){event.preventDefault();return;}if(!external)openProject(project.id);});
  const info=element('div','card-info'),copy=element('div');copy.append(element('p','card-label',project.label));
  const title=element('button','card-title',project.title);title.type='button';title.addEventListener('click',()=>{if(!editing)openProject(project.id);});
  copy.append(title,element('p','card-tagline',project.tagline));info.append(copy,element('span','card-status',project.status));article.append(button,info);return article;
 }
 const pageRealm=document.body.dataset.defaultRealm;
 const belongsToPage=p=>!pageRealm||(pageRealm==='content-analysis'?['content','data','product','visual'].includes(p.realm):p.realm===pageRealm);
 let activeFilter='all';
 function renderProjects(){
  const blogs=state.projects.filter(x=>x.realm==='blogs'&&(!/^Blog draft [0-9]+$/.test(x.title)||x.externalUrl));
  $('#featured-grid').replaceChildren(...blogs.slice(0,2).map(card));
  if(!blogs.length){const note=element('div','featured-blog-note');note.append(element('p','eyebrow','BLOGS & ESSAYS'),element('h3','','The next story is taking shape.'));const link=element('a','button','Visit the blog realm ↗');link.href='blogs.html';note.append(link);$('#featured-grid').append(note);}
  const list=document.body.dataset.categoryHub?[]:state.projects.filter(x=>belongsToPage(x)&&(activeFilter==='all'||activeFilter==='content-analysis'||x.realm===activeFilter)&&(x.realm!=='blogs'||!/^Blog draft [0-9]+$/.test(x.title)||x.externalUrl));
  if($('#blogs-empty'))$('#blogs-empty').hidden=list.length>0;
  $('#all-projects').replaceChildren(...list.map(card));
  if($('#work-count'))$('#work-count').textContent=String(state.projects.length).padStart(2,'0');
  $('#work-status').textContent=document.body.dataset.categoryHub?'Choose a category to explore its projects.':`${list.length} ${list.length===1?'world':'worlds'} to explore. Project stages are shown on each entry.`;
 }
 function renderAtlas(){}
 function openProject(id){
  const p=state.projects.find(p=>p.id===id);if(!p)return;
  const img=element('img');img.src=p.image;img.alt=p.title+' concept artwork';
  const copy=element('div','project-modal-copy');const title=element('h2','',p.title);title.id='project-dialog-title';
  copy.append(element('p','eyebrow',p.label),title,element('p','',p.tagline),element('p','modal-status',p.status),element('p','',p.description),element('h3','','The thinking behind it'),element('p','',p.decision),element('h3','','Where it stands'),element('p','',p.next));
  if(p.pdf){const a=element('a','button','Read the full project ↓');a.href=p.pdf;a.download='';copy.append(a);}
  $('#project-dialog-body').replaceChildren(img,copy);$('#project-dialog').showModal();
 }
 $$('.dialog-close').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));
 $$('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target!==d)return;const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}));
 $$('.filters button').forEach(b=>b.addEventListener('click',()=>{activeFilter=b.dataset.filter;$$('.filters button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));renderProjects();}));
 const legacyRealm=new URLSearchParams(location.search).get('realm');
 if(location.pathname.endsWith('/work.html')&&legacyRealm){const target={accounting:'accounting.html',product:'content-analysis.html',writing:'books.html',data:'content-analysis.html',blogs:'blogs.html'}[legacyRealm];if(target){const q=new URLSearchParams(location.search);q.delete('realm');if(legacyRealm==='data')q.set('realm','data');location.replace(target+(q.size?'?'+q.toString():''));}}
 $$('.category-navigation a').forEach(a=>{if(a.getAttribute('href').split('?')[0]===location.pathname.split('/').pop())a.setAttribute('aria-current','page');});
 const view=document.body.dataset.view;
 if(view==='work'){
  $('#home-view').hidden=true;$('#work-view').hidden=false;
  const requested=new URLSearchParams(location.search).get('realm')||pageRealm;if(['product','writing','content','data','visual','accounting','content-analysis','blogs'].includes(requested))activeFilter=requested;
  $$('.filters button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===activeFilter)));
 }
 $('#year').textContent=String(new Date().getFullYear());
 const menu=$('.menu-toggle'),nav=$('.navigation nav');
 menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));});
 nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menu.setAttribute('aria-expanded','false');}));
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');}});
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');let paused=reduced.matches;
 function setMotion(){document.documentElement.classList.toggle('motion-paused',paused);document.documentElement.classList.toggle('motion-enabled',!paused);$('#motion').setAttribute('aria-pressed',String(paused));$('#motion').textContent=paused?'Resume motion ▷':'Pause motion Ⅱ';if(paused)$$('.depth').forEach(el=>el.style.transform='none');}
 $('#motion').addEventListener('click',()=>{paused=!paused;setMotion();});reduced.addEventListener('change',e=>{paused=e.matches;setMotion();});setMotion();
 if(!paused)document.documentElement.classList.add('enhanced');
 const observe=()=>{if(!('IntersectionObserver'in window)){document.documentElement.classList.remove('enhanced');return;}const ob=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');ob.unobserve(e.target);} }),{threshold:.07});$$('.reveal').forEach(e=>ob.observe(e));};
 const entrance=$('#entrance');
 if(entrance){
  let entering=false,flightTimer;
  const finish=()=>{clearTimeout(flightTimer);entrance.hidden=true;entrance.dispatchEvent(new Event('journeyend'));$('main').inert=false;$('.navigation').inert=false;$('footer').inert=false;document.body.classList.remove('entrance-active');$('#hero-title').tabIndex=-1;$('#hero-title').focus({preventScroll:true});};
  const enter=()=>{if(entering)return;entering=true;if(paused){finish();return;}entrance.classList.add('travelling');entrance.dispatchEvent(new Event('journeybegin'));};
  entrance.addEventListener('journeyfinish',finish);
  $('#enter-site').addEventListener('click',enter);
  if(location.hash)entrance.hidden=true;
  else{document.body.classList.add('entrance-active');$('main').inert=true;$('.navigation').inert=true;$('footer').inert=true;$('#enter-site').focus({preventScroll:true});}
 }
 let pointerFrame=0;
 document.addEventListener('pointermove',e=>{if(paused||editing||e.pointerType==='touch'||pointerFrame)return;pointerFrame=requestAnimationFrame(()=>{const x=e.clientX/innerWidth-.5,y=e.clientY/innerHeight-.5;document.documentElement.style.setProperty('--pointer-x',x*16+'px');document.documentElement.style.setProperty('--pointer-y',y*12+'px');pointerFrame=0;});});


 apply();observe();
})();

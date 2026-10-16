'use strict';
(() => {
 const DEFAULT=structuredClone(window.MAHA_DATA), KEY='shashikumara-studio-v5';
 const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
 const clone=x=>structuredClone(x);
 let state=clone(DEFAULT), editing=false, dragged=null, toastTimer, storageWarning=false;
 const imageLabels={categoryCanopy:"Category canopy background",entranceScene:'Entrance — laptop',entranceMobile:'Entrance — mobile',entranceTablet:'Entrance — tablet',portrait:"About Me portrait",canopy:"Forest entrance background",waves:"Blue waves background",sun:"Blue sun background",green:"Green contour background",yellow:"Yellow line background",purple:"Purple contour background"};
 const sectionLabels={origin:'The origin',portals:'Choose a realm',featured:'Featured work',writing:'The unwritten',gallery:'My approach',contact:'Contact'};
 const assetFiles=["assets/canopy-final.webp","assets/blog-cover-1.svg","assets/blog-cover-2.svg","assets/blog-cover-3.svg","assets/BodoniModa-700.ttf", "assets/BodoniModa-900.ttf", "assets/BodoniModa.ttf", "assets/BricolageGrotesque.ttf", "assets/DMSerifDisplay.ttf", "assets/ECHOBOUND_Product_Project.pdf", "assets/FLAVOUR_QUEST_Product_Project.pdf", "assets/Knewave-OFL.txt", "assets/Knewave-Regular.ttf", "assets/PermanentMarker-400-license.txt", "assets/PermanentMarker-400.ttf", "assets/Roboto-700.ttf", "assets/Roboto-OFL.txt", "assets/RobotoSlab-700.ttf", "assets/RobotoSlab-900-license.txt", "assets/RobotoSlab-900.ttf", "assets/about-preview.webp", "assets/accounting-close.svg", "assets/accounting-reconcile.svg", "assets/accounting-statements.svg", "assets/blue-circle-supplied.webp", "assets/blue-circle-transparent.webp", "assets/blue-sun.webp", "assets/blue-waves.webp", "assets/bodonimoda-OFL.txt", "assets/bricolagegrotesque-OFL.txt", "assets/canopy.webp", "assets/celestial-dunes.webp", "assets/contoso-cover.svg", "assets/cosmic-threshold.webp", "assets/dmserifdisplay-OFL.txt", "assets/echo-characters.webp", "assets/echobound.webp", "assets/entrance-gold-v2.webp", "assets/entrance-gold.webp", "assets/entrance-mobile.webp", "assets/entrance-supplied-laptop.webp", "assets/entrance-supplied-mobile.webp", "assets/entrance-supplied-tablet.webp", "assets/entrance-tablet.webp", "assets/flavour-interface.webp", "assets/flavour-quest.webp", "assets/green-contours.webp", "assets/losers-cover.svg", "assets/mark.svg", "assets/portrait-composition.webp", "assets/portrait-mobile.webp", "assets/portrait-tablet.webp", "assets/portrait.webp", "assets/purple-contours.webp", "assets/ranarangam-cover.svg", "assets/shreera-cover.svg", "assets/yellow-lines.webp"];
 const safeImage=v=>typeof v==='string'&&((/^assets\/[a-zA-Z0-9_.-]+$/.test(v))||/^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(v));
 function safeProjectUrl(value){if(typeof value!=='string'||value.length>2048)return false;if(value.trim()==='')return true;try{const u=new URL(value);return ['https:','http:'].includes(u.protocol)&&!u.username&&!u.password;}catch{return false;}}
 function validate(input){
  if(!input||input.version!==5||!input.text||!input.theme||!input.images||!Array.isArray(input.projects))throw Error('This is not a supported website settings file.');
  const next=clone(DEFAULT);
  for(const k of Object.keys(next.text))if(typeof input.text[k]==='string'&&input.text[k].length<=8000)next.text[k]=input.text[k];
  for(const k of ['ink','cream','accent','moss'])if(/^#[a-fA-F0-9]{6}$/.test(input.theme[k]))next.theme[k]=input.theme[k];
  if(['editorial','modern','literary'].includes(input.theme.font))next.theme.font=input.theme.font;
  for(const k of Object.keys(next.images))if(safeImage(input.images[k]))next.images[k]=input.images[k];
  if(Array.isArray(input.sections)&&input.sections.length===DEFAULT.sections.length&&new Set(input.sections).size===DEFAULT.sections.length&&input.sections.every(x=>DEFAULT.sections.includes(x)))next.sections=[...input.sections];
  if(Array.isArray(input.hidden))next.hidden=input.hidden.filter(x=>DEFAULT.sections.includes(x));
  const ordered=[];
  for(const item of input.projects.slice(0,500)){if(!item||typeof item!=='object')continue;let old=DEFAULT.projects.find(x=>x.id===item.id);if(!old&&typeof item.id==='string'&&/^custom-[a-z0-9-]{8,100}$/.test(item.id)&&['writing','accounting','content','data','product','visual','blogs'].includes(item.realm))old={id:item.id,realm:item.realm,title:'Untitled card',tagline:'',description:'',decision:'',next:'',label:'',status:'Draft',image:'assets/blog-cover-1.svg',externalUrl:''};if(!old||ordered.some(x=>x.id===item.id))continue;const n=clone(old);for(const k of ['title','tagline','description','decision','next','label','status'])if(typeof item[k]==='string'&&item[k].length<=8000)n[k]=item[k];if(safeImage(item.image))n.image=item.image;if(typeof item.externalUrl==='string'&&safeProjectUrl(item.externalUrl))n.externalUrl=item.externalUrl.trim();ordered.push(n);}
  next.projects=[...ordered,...DEFAULT.projects.filter(x=>!ordered.some(i=>i.id===x.id)).map(clone)];
  return next;
 }
 try{const stored=localStorage.getItem(KEY);if(stored)state=validate(JSON.parse(stored));}catch{state=clone(DEFAULT);}
 function notify(message){const t=$('#toast');t.textContent=message;t.classList.add('on');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('on'),4200);}
 function status(message){$('#studio-status').textContent=message;}
 function save(){try{localStorage.setItem(KEY,JSON.stringify(state));storageWarning=false;status('Saved in this browser. Export to publish your changes.');}catch{storageWarning=true;status('Browser storage is full or unavailable. Changes are in memory only—export settings now.');notify('Please export your settings to keep these changes.');}}
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
  renderProjects();renderAtlas();if(editing)enableEditing();
  refreshThemeInputs();
 }
 function card(project){
  const article=element('article','work-card reveal visible');article.dataset.project=project.id;
  const external=project.externalUrl;const button=element(external?'a':'button','card-visual');if(external){button.href=external;}else button.type='button';button.setAttribute('aria-label','Open '+project.title+' project');
  const img=element('img');img.src=project.image;img.alt=project.title+' visual concept';img.loading='lazy';img.width=1200;img.height=800;img.dataset.projectImage=project.id;
  button.append(img,element('span','card-arrow','↗'));button.lastChild.setAttribute('aria-hidden','true');button.addEventListener('click',event=>{if(editing){event.preventDefault();return;}if(!external)openProject(project.id);});
  const info=element('div','card-info'),copy=element('div');copy.append(element('p','card-label',project.label));
  const title=element('button','card-title',project.title);title.type='button';title.addEventListener('click',()=>{if(!editing)openProject(project.id);});
  copy.append(title,element('p','card-tagline',project.tagline));info.append(copy,element('span','card-status',project.status));const edit=element('button','edit-card-button','Edit this card');edit.type='button';edit.setAttribute('aria-label','Edit '+project.title);edit.addEventListener('click',()=>editProject(project.id));article.append(button,info,edit);return article;
 }
 const pageRealm=document.body.dataset.defaultRealm;
 const belongsToPage=p=>!pageRealm||(pageRealm==='content-analysis'?['content','data','product','visual'].includes(p.realm):p.realm===pageRealm);
 let activeFilter='all';
 function renderProjects(){
  const blogs=state.projects.filter(x=>x.realm==='blogs'&&(editing||x.externalUrl||x.title!==DEFAULT.projects.find(p=>p.id===x.id)?.title));
  $('#featured-grid').replaceChildren(...blogs.slice(0,2).map(card));
  if(!blogs.length){const note=element('div','featured-blog-note');note.append(element('p','eyebrow','BLOGS & ESSAYS'),element('h3','','The next story is taking shape.'));const link=element('a','button','Visit the blog realm ↗');link.href='blogs.html';note.append(link);$('#featured-grid').append(note);}
  const list=document.body.dataset.categoryHub?[]:state.projects.filter(x=>belongsToPage(x)&&(activeFilter==='all'||activeFilter==='content-analysis'||x.realm===activeFilter)&&(editing||x.realm!=='blogs'||x.externalUrl||x.title!==DEFAULT.projects.find(p=>p.id===x.id)?.title));
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
 $$('.filters button').forEach(b=>b.addEventListener('click',()=>{activeFilter=b.dataset.filter;$$('.filters button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));renderProjects();if(editing)enableEditing();}));
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
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');if(editing&&!$('dialog[open]'))closeStudio();}});
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');let paused=reduced.matches;
 function setMotion(){document.documentElement.classList.toggle('motion-paused',paused);document.documentElement.classList.toggle('motion-enabled',!paused);$('#motion').setAttribute('aria-pressed',String(paused));$('#motion').textContent=paused?'Resume motion ▷':'Pause motion Ⅱ';if(paused)$$('.depth').forEach(el=>el.style.transform='none');}
 $('#motion').addEventListener('click',()=>{paused=!paused;setMotion();});reduced.addEventListener('change',e=>{paused=e.matches;setMotion();});setMotion();
 if(!paused)document.documentElement.classList.add('enhanced');
 const observe=()=>{if(!('IntersectionObserver'in window)){document.documentElement.classList.remove('enhanced');return;}const ob=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');ob.unobserve(e.target);} }),{threshold:.07});$$('.reveal').forEach(e=>ob.observe(e));};
 const entrance=$('#entrance');
 if(entrance){
  let entering=false,flightTimer;
  const finish=()=>{clearTimeout(flightTimer);entrance.hidden=true;entrance.dispatchEvent(new Event('journeyend'));$('main').inert=false;$('.navigation').inert=false;$('footer').inert=false;$('.studio-launch').inert=false;document.body.classList.remove('entrance-active');$('#hero-title').tabIndex=-1;$('#hero-title').focus({preventScroll:true});};
  const enter=()=>{if(entering)return;entering=true;if(paused){finish();return;}entrance.classList.add('travelling');entrance.dispatchEvent(new Event('journeybegin'));};
  entrance.addEventListener('journeyfinish',finish);
  $('#enter-site').addEventListener('click',enter);
  if(location.hash||new URLSearchParams(location.search).has('edit'))entrance.hidden=true;
  else{document.body.classList.add('entrance-active');$('main').inert=true;$('.navigation').inert=true;$('footer').inert=true;$('.studio-launch').inert=true;$('#enter-site').focus({preventScroll:true});}
 }
 let pointerFrame=0;
 document.addEventListener('pointermove',e=>{if(paused||editing||e.pointerType==='touch'||pointerFrame)return;pointerFrame=requestAnimationFrame(()=>{const x=e.clientX/innerWidth-.5,y=e.clientY/innerHeight-.5;document.documentElement.style.setProperty('--pointer-x',x*16+'px');document.documentElement.style.setProperty('--pointer-y',y*12+'px');pointerFrame=0;});});

 // Editing is intentionally browser-local. No public mutation endpoint exists.
 function openStudio(){editing=true;document.body.classList.add('editing');$('#studio').hidden=false;enableEditing();buildEditorLists();buildAccountingEditors();renderProjects();showStudioPanel('accounting');if(document.body.dataset.defaultRealm==='accounting'&&!state.projects.find(p=>p.id===$('#project-target').value&&p.realm==='accounting')){$('#project-target').value=state.projects.find(p=>p.realm==='accounting').id;populateProject();}$('#studio-close').focus();notify('Studio open. Edit text, drop images, or rearrange the journey.');}
 function showStudioPanel(name){$$('.studio-tabs button').forEach(b=>b.classList.toggle('selected',b.dataset.panel===name));$$('[data-panel-body]').forEach(panel=>panel.hidden=panel.dataset.panelBody!==name);}
 function editProject(id){if(!editing)openStudio();showStudioPanel('accounting');const panel=document.querySelector('[data-accounting-editor="'+id+'"]');panel?.scrollIntoView({block:'start',behavior:'smooth'});panel?.querySelector('input[type="text"]')?.focus({preventScroll:true});}

 function closeStudio(){editing=false;document.body.classList.remove('editing');$('#studio').hidden=true;renderProjects();$$('[data-text]').forEach(el=>{el.removeAttribute('contenteditable');el.removeAttribute('spellcheck');});$('#edit-launch').focus();}
 $('#category-edit-open')?.addEventListener('click',openStudio);
 $('#accounting-edit-open')?.addEventListener('click',()=>{openStudio();showStudioPanel('accounting');});
 $('#edit-launch').addEventListener('click',openStudio);$('#studio-open').addEventListener('click',openStudio);$('#studio-close').addEventListener('click',closeStudio);
 function enableEditing(){
  $$('[data-text]').forEach(el=>{el.setAttribute('contenteditable','plaintext-only');el.spellcheck=true;if(el.dataset.bound)return;el.dataset.bound='true';el.addEventListener('blur',()=>{if(!editing)return;state.text[el.dataset.text]=el.innerText.slice(0,8000);save();});el.addEventListener('paste',e=>{e.preventDefault();const text=e.clipboardData.getData('text/plain');const selection=getSelection();if(selection&&selection.rangeCount){const range=selection.getRangeAt(0);range.deleteContents();const node=document.createTextNode(text);range.insertNode(node);range.setStartAfter(node);range.collapse(true);selection.removeAllRanges();selection.addRange(range);}});});
 }
 $$('.studio-tabs button').forEach(b=>b.addEventListener('click',()=>{$$('.studio-tabs button').forEach(x=>x.classList.toggle('selected',x===b));$$('[data-panel-body]').forEach(x=>x.hidden=x.dataset.panelBody!==b.dataset.panel);}));
 function option(value,text){const o=element('option','',text);o.value=value;return o;}
 function buildAccountingEditors(){
  const host=$('#accounting-card-editors');host.replaceChildren();
  const names={writing:'Books',accounting:'Accounting projects','content-analysis':'Content Analysis & UX/UI',blogs:'Blogs'};$('#cards-panel-title').textContent=(names[pageRealm]||'All pages')+' · cards';
  const realmSelect=$('#new-card-realm');[...realmSelect.options].forEach(o=>o.hidden=!belongsToPage({realm:o.value}));if(![...realmSelect.options].some(o=>!o.hidden&&o.value===realmSelect.value))realmSelect.value=[...realmSelect.options].find(o=>!o.hidden)?.value||'writing';
  host.replaceChildren(...state.projects.filter(belongsToPage).map(createCardEditor));
 }
 function createCardEditor(project){
   const panel=element('section','accounting-card-editor');panel.dataset.accountingEditor=project.id;
   const heading=element('h4','',project.title),preview=element('img','accounting-editor-preview');preview.src=project.image;preview.alt=project.title+' cover';preview.dataset.accountingPreview=project.id;panel.append(heading,preview);
   function field(label,type,value){const wrap=element('label','',label),input=element(type==='textarea'?'textarea':'input');if(type==='textarea'){input.rows=5;input.maxLength=8000;}else input.type=type;input.value=value||'';wrap.append(input);panel.append(wrap);return input;}
   const title=field('Card title','text',project.title);title.maxLength=100;
   const link=field('Project link','url',project.externalUrl);link.placeholder='https://your-project.netlify.app';link.inputMode='url';link.maxLength=2048;
   const upload=element('label','file-label accounting-cover-upload','Upload cover image'),file=element('input');file.type='file';file.accept='image/jpeg,image/png,image/webp,image/gif';upload.append(file);panel.append(upload);
   file.addEventListener('change',()=>{replaceImage(file.files[0],'project:'+project.id);file.value='';});
   const drop=element('div','studio-drop','Drop a cover image here');drop.tabIndex=0;drop.setAttribute('role','button');drop.setAttribute('aria-label','Upload cover for '+project.title);
   drop.addEventListener('dragover',event=>{event.preventDefault();drop.classList.add('drop-active');});drop.addEventListener('dragleave',()=>drop.classList.remove('drop-active'));
   drop.addEventListener('drop',event=>{event.preventDefault();event.stopPropagation();drop.classList.remove('drop-active');replaceImage(event.dataTransfer.files[0],'project:'+project.id);});
   drop.addEventListener('click',()=>file.click());drop.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();file.click();}});panel.append(drop);
   const summary=field('Short description','textarea',project.tagline);summary.rows=2;summary.maxLength=300;
   const description=field('Full description','textarea',project.description);
   const cardLabel=field('Card label','text',project.label);cardLabel.maxLength=150;
   const thinking=field('The thinking behind it','textarea',project.decision);
   const nextSteps=field('Where it stands','textarea',project.next);
   const cardStatus=field('Project status','text',project.status);cardStatus.maxLength=150;
   const saveButton=element('button','studio-button strong','Save this card');saveButton.type='button';
   saveButton.addEventListener('click',()=>{const url=link.value.trim();if(!title.value.trim()){notify('Enter a card title.');title.focus();return;}if(!safeProjectUrl(url)){notify('Use a valid http:// or https:// project link.');link.focus();return;}const current=state.projects.find(p=>p.id===project.id);current.title=title.value.trim();current.externalUrl=url;current.tagline=summary.value.trim();current.description=description.value.trim();current.status=cardStatus.value.trim();current.label=cardLabel.value.trim();current.decision=thinking.value.trim();current.next=nextSteps.value.trim();save();apply();buildEditorLists();heading.textContent=current.title;notify('Card saved in this browser. Export the website ZIP to publish it.');});panel.append(saveButton);return panel;
 }

 function addProjectCard(){
  const button=$('#add-project-card');
  const selected=$('#new-card-realm').value;
  const realm=pageRealm&&pageRealm!=='content-analysis'?pageRealm:selected;
  if(!['writing','accounting','content','data','product','blogs'].includes(realm)||!belongsToPage({realm})){notify('Choose a category on this page.');return;}
  if(state.projects.length>=500){notify('The website supports up to 500 cards.');return;}
  const id='custom-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,12);
  const names={writing:'New book',accounting:'New accounting project',content:'New content analysis project',data:'New data analysis project',product:'New UX/UI project',blogs:'New blog'};
  const project={id,realm,title:names[realm],tagline:'',description:'',decision:'',next:'',label:realm==='writing'?'BOOK':realm.toUpperCase(),status:'Draft',image:'assets/blog-cover-1.svg',externalUrl:''};
  // Insert directly so creating a card never discards other unsaved form fields.
  const panel=createCardEditor(project);
  state.projects.unshift(project);
  activeFilter=pageRealm||'all';
  $('#accounting-card-editors').prepend(panel);
  save();renderProjects();buildEditorLists();
  $('#project-target').value=id;populateProject();
  showStudioPanel('accounting');
  panel.scrollIntoView({block:'start',behavior:'auto'});
  const title=panel.querySelector('input[type="text"]');title?.focus({preventScroll:true});title?.select();
  status('New card added. Complete the fields below and click Save this card.');
  notify('New card added at the top of your cards.');
 }
 $('#add-project-card').addEventListener('click',addProjectCard);
 function buildEditorLists(){
  const selected=$('#image-target').value;
  $('#image-target').replaceChildren(...Object.entries(imageLabels).map(([key,label])=>option(key,label)),...state.projects.map(p=>option('project:'+p.id,'Project: '+p.title)));
  if([...$('#image-target').options].some(o=>o.value===selected))$('#image-target').value=selected;
  const project=$('#project-target').value;const pageProjects=state.projects.filter(belongsToPage);$('#project-target').replaceChildren(...pageProjects.map(p=>option(p.id,p.title)));if(pageProjects.some(p=>p.id===project))$('#project-target').value=project;
  populateProject();renderSorts();refreshThemeInputs();
 }
 function populateProject(){const p=state.projects.find(p=>p.id===$('#project-target').value);if(!p)return;$('#project-title').value=p.title;$('#project-url').value=p.externalUrl||'';$('#project-label').value=p.label;$('#project-status').value=p.status;refreshProjectCover();$('#project-tagline').value=p.tagline;$('#project-description').value=p.description;$('#project-decision').value=p.decision;$('#project-next').value=p.next;}
 function refreshProjectCover(){$$('[data-accounting-preview]').forEach(img=>{const item=state.projects.find(p=>p.id===img.dataset.accountingPreview);if(item){img.src=item.image;img.alt=item.title+' cover';}});const p=state.projects.find(p=>p.id===$('#project-target').value);if(p){$('#project-cover-preview').src=p.image;$('#project-cover-preview').alt=p.title+' cover preview';$('#image-target').value='project:'+p.id;}}
 $('#project-target').addEventListener('change',populateProject);
 $('#save-project').addEventListener('click',()=>{const p=state.projects.find(p=>p.id===$('#project-target').value);const title=$('#project-title').value.trim();if(!p||!title){notify('Give the project a title first.');return;}const url=$('#project-url').value.trim();if(!safeProjectUrl(url)){notify('Enter a valid http:// or https:// project link.');$('#project-url').focus();return;}p.externalUrl=url;p.label=$('#project-label').value.trim();p.status=$('#project-status').value.trim();p.title=title;p.tagline=$('#project-tagline').value.trim();p.description=$('#project-description').value.trim();p.decision=$('#project-decision').value.trim();p.next=$('#project-next').value.trim();save();apply();buildEditorLists();notify('Card changes saved in this browser. Export the website ZIP to publish them.');});
 function move(kind,id,direction){const list=kind==='section'?state.sections:state.projects.map(p=>p.id);const index=list.indexOf(id),other=index+direction;if(other<0||other>=list.length)return;[list[index],list[other]]=[list[other],list[index]];if(kind==='section')state.sections=list;else state.projects=list.map(id=>state.projects.find(p=>p.id===id));save();apply();renderSorts();}
 function row(kind,id,label){
  const r=element('div','sort-row');r.draggable=true;r.dataset.kind=kind;r.dataset.id=id;const handle=element('span','handle','⠿');handle.setAttribute('aria-hidden','true');r.append(handle,element('span','sort-name',label));
  for(const [direction,symbol,name]of [[-1,'↑','up'],[1,'↓','down']]){const b=element('button','',symbol);b.type='button';b.setAttribute('aria-label','Move '+label+' '+name);b.addEventListener('click',()=>move(kind,id,direction));r.append(b);}
  if(kind==='section'){const c=element('input');c.type='checkbox';c.checked=!state.hidden.includes(id);c.setAttribute('aria-label','Show '+label);c.addEventListener('change',()=>{state.hidden=state.hidden.filter(x=>x!==id);if(!c.checked)state.hidden.push(id);save();apply();});r.append(c);}
  r.addEventListener('dragstart',e=>{dragged={kind,id};e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',id);});r.addEventListener('dragover',e=>{if(dragged?.kind===kind){e.preventDefault();r.classList.add('drag-over');}});r.addEventListener('dragleave',()=>r.classList.remove('drag-over'));r.addEventListener('dragend',()=>{dragged=null;$$('.drag-over').forEach(x=>x.classList.remove('drag-over'));});r.addEventListener('drop',e=>{e.preventDefault();r.classList.remove('drag-over');if(!dragged||dragged.kind!==kind||dragged.id===id)return;const list=kind==='section'?[...state.sections]:state.projects.map(p=>p.id);const from=list.indexOf(dragged.id);list.splice(from,1);list.splice(list.indexOf(id),0,dragged.id);if(kind==='section')state.sections=list;else state.projects=list.map(i=>state.projects.find(p=>p.id===i));dragged=null;save();apply();renderSorts();});return r;
 }
 function renderSorts(){$('#section-sort').replaceChildren(...state.sections.map(id=>row('section',id,sectionLabels[id])));$('#project-sort').replaceChildren(...state.projects.map(p=>row('project',p.id,p.title)));}
 function refreshThemeInputs(){$$('[data-colour]').forEach(i=>i.value=state.theme[i.dataset.colour]);$('#font-select').value=state.theme.font;}
 $$('[data-colour]').forEach(input=>input.addEventListener('input',()=>{state.theme[input.dataset.colour]=input.value;document.documentElement.style.setProperty('--'+input.dataset.colour,input.value);save();}));
 $('#font-select').addEventListener('change',()=>{state.theme.font=$('#font-select').value;document.body.dataset.font=state.theme.font;save();});
 $('#reset-theme').addEventListener('click',()=>{state.theme=clone(DEFAULT.theme);save();apply();notify('Original palette restored.');});
 async function replaceImage(file,target){
  if(!file||!target)return;
  if(!['image/jpeg','image/png','image/webp','image/gif'].includes(file.type)){notify('Choose a JPG, PNG, WebP or GIF image.');return;}
  if(file.size>8*1024*1024){notify('Choose an image smaller than 8 MB.');return;}
  let url;
  try{status('Preparing image…');url=URL.createObjectURL(file);const image=await new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=reject;im.src=url;});const scale=Math.min(1,1800/Math.max(image.width,image.height));const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.width*scale));canvas.height=Math.max(1,Math.round(image.height*scale));canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);const data=canvas.toDataURL('image/webp',.85);if(target.startsWith('project:')){const p=state.projects.find(p=>p.id===target.slice(8));if(!p)throw Error('Unknown project');p.image=data;}else state.images[target]=data;save();apply();refreshProjectCover();notify(storageWarning?'Image updated. Export settings to keep it.':'Image updated and saved in this browser.');}catch{status('Could not read that image. Please choose another file.');notify('That image could not be opened.');}finally{if(url)URL.revokeObjectURL(url);}
 }
 $('#project-cover-upload').addEventListener('change',event=>{const id=$('#project-target').value;replaceImage(event.target.files[0],'project:'+id);event.target.value='';});
 $('#project-cover-drop').addEventListener('dragover',event=>{event.preventDefault();event.currentTarget.classList.add('drop-active');});
 $('#project-cover-drop').addEventListener('dragleave',event=>event.currentTarget.classList.remove('drop-active'));
 $('#project-cover-drop').addEventListener('drop',event=>{event.preventDefault();event.stopPropagation();event.currentTarget.classList.remove('drop-active');replaceImage(event.dataTransfer.files[0],'project:'+$('#project-target').value);});
 $('#project-cover-drop').addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();$('#project-cover-upload').click();}});
 $('#image-upload').addEventListener('change',e=>{replaceImage(e.target.files[0],$('#image-target').value);e.target.value='';});
 $('#studio-drop').addEventListener('dragover',e=>{e.preventDefault();$('#studio-drop').classList.add('drop-active');});
 $('#studio-drop').addEventListener('dragleave',()=>$('#studio-drop').classList.remove('drop-active'));
 $('#studio-drop').addEventListener('drop',e=>{e.preventDefault();e.stopPropagation();$('#studio-drop').classList.remove('drop-active');replaceImage(e.dataTransfer.files[0],$('#image-target').value);});
 document.addEventListener('dragover',e=>{if(!editing||!e.dataTransfer.types.includes('Files'))return;const im=e.target.closest('[data-image],[data-project-image]');if(im){e.preventDefault();im.classList.add('drop-active');}});
 document.addEventListener('dragleave',e=>e.target.closest?.('.drop-active')?.classList.remove('drop-active'));
 document.addEventListener('drop',e=>{if(!editing||!e.dataTransfer.files.length)return;const im=e.target.closest('[data-image],[data-project-image]');if(im){e.preventDefault();im.classList.remove('drop-active');replaceImage(e.dataTransfer.files[0],im.dataset.image||'project:'+im.dataset.projectImage);}});
 function download(bytes,name,type){const a=element('a');const url=URL.createObjectURL(new Blob([bytes],{type}));a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),20000);}
 $('#export-json').addEventListener('click',()=>download(JSON.stringify(state,null,2),'Shashikumara_Studio_Settings.json','application/json'));
 $('#import-json').addEventListener('change',async e=>{const f=e.target.files[0];if(!f)return;try{if(f.size>30*1024*1024)throw Error('Settings file is too large.');const parsed=validate(JSON.parse(await f.text()));state=parsed;save();apply();buildEditorLists();buildAccountingEditors();notify('Settings imported.');}catch(err){notify(err.message||'That settings file could not be read.');}e.target.value='';});
 $('#reset-site').addEventListener('click',()=>{if(!confirm('Reset changes in this browser? Export settings first if you want to keep them. Your published site is not changed.'))return;state=clone(DEFAULT);save();apply();buildEditorLists();buildAccountingEditors();notify('This browser now uses the original site.');});

 // A small uncompressed ZIP writer keeps export dependency-free.
 const encoder=new TextEncoder();
 function zip(files){
  const table=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=(c&1)?0xedb88320^(c>>>1):c>>>1;table[n]=c>>>0;}
  const crc=data=>{let c=0xffffffff;for(const byte of data)c=table[(c^byte)&255]^(c>>>8);return(c^0xffffffff)>>>0;};
  const chunks=[],directory=[];let offset=0,centralSize=0;
  for(const file of files){const name=encoder.encode(file.name),data=file.data,checksum=crc(data),local=new Uint8Array(30+name.length),lv=new DataView(local.buffer);lv.setUint32(0,0x04034b50,true);lv.setUint16(4,20,true);lv.setUint16(6,0x800,true);lv.setUint32(14,checksum,true);lv.setUint32(18,data.length,true);lv.setUint32(22,data.length,true);lv.setUint16(26,name.length,true);local.set(name,30);chunks.push(local,data);const central=new Uint8Array(46+name.length),cv=new DataView(central.buffer);cv.setUint32(0,0x02014b50,true);cv.setUint16(4,20,true);cv.setUint16(6,20,true);cv.setUint16(8,0x800,true);cv.setUint32(16,checksum,true);cv.setUint32(20,data.length,true);cv.setUint32(24,data.length,true);cv.setUint16(28,name.length,true);cv.setUint32(42,offset,true);central.set(name,46);directory.push(central);centralSize+=central.length;offset+=local.length+data.length;}
  const end=new Uint8Array(22),ev=new DataView(end.buffer);ev.setUint32(0,0x06054b50,true);ev.setUint16(8,files.length,true);ev.setUint16(10,files.length,true);ev.setUint32(12,centralSize,true);ev.setUint32(16,offset,true);return new Blob([...chunks,...directory,end],{type:'application/zip'});
 }
 $('#export-site').addEventListener('click',async()=>{
  const button=$('#export-site');button.disabled=true;status('Packaging your edited website. Keep this tab open…');
  try{
   const files=await Promise.all(['index.html','work.html','books.html','content-analysis.html','ux-ui.html','blogs.html','accounting.html','accounting.css','final-polish.css','style.css','revision.css','immersive.css','cinematic.css','art-direction.css','drift.css','requested-type.css','responsive.css','entry.css','page-motion.js','drift.js','app.js','immersive.js','cinematic.js','art-direction.js',...assetFiles].map(async name=>{const response=await fetch(name,{credentials:'same-origin'});if(!response.ok)throw Error('Could not package '+name);return{name,data:new Uint8Array(await response.arrayBuffer())};}));
   files.push({name:'data.js',data:encoder.encode('window.MAHA_DATA='+JSON.stringify(state)+';\n')},{name:'.nojekyll',data:encoder.encode('')},{name:'README.txt',data:encoder.encode('SHASHIKUMARA RENUKAPRASADA HUGARA\n\nThis export includes your current studio settings. Changes become public only after you upload these files to your hosting. For free GitHub Pages hosting, place index.html and all other files at the root of a public repository, then choose Settings > Pages > Deploy from a branch > main > /(root). No build step is required. Open creative studio to edit. Browser-local changes are not shared with other visitors. Resetting your browser changes restores this exported version. Email and phone are supplied by the site owner. Review all content before publishing.\n')});
   download(zip(files),'Shashikumara_Edited_Website.zip','application/zip');status('Website ZIP created. Upload its extracted contents to publish.');notify('Your edited website is ready to download.');
  }catch(err){status('Export could not finish. Open the hosted site and try again, or export settings to keep changes.');notify(err.message||'Could not export website.');}finally{button.disabled=false;}
 });
 apply();observe();if(new URLSearchParams(location.search).has('edit'))openStudio();
 // Exposed only for deterministic local validation of the export writer.
 window.SHASHIKUMARA_STUDIO={exportSettings:()=>clone(state)};
})();

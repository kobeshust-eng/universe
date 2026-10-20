'use strict';
const data=window.WORLD;
const objects=new Map(data.objects.map(o=>[o.id,o]));
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const mediaPath=p=>'media/'+p.split('/').pop();
const mediaById=new Map(data.media.map(m=>[m.id,m]));
const coverFor=o=>o?.cover_media_id?mediaById.get(o.cover_media_id):null;
const cropFor=(m,o)=>o?.cover_crop||m?.display_crop||null;
const validCrop=c=>c&&Number.isInteger(c.cols)&&Number.isInteger(c.rows)&&c.cols>0&&c.rows>0&&Number.isInteger(c.col)&&Number.isInteger(c.row)&&c.col>=0&&c.col<c.cols&&c.row>=0&&c.row<c.rows;
function paintCrop(el,m,c){
 if(!validCrop(c))return;
 el.style.backgroundImage=`url("${encodeURI(mediaPath(m.path)).replace(/"/g,'%22')}")`;
 el.style.backgroundSize=`${c.cols*100}% ${c.rows*100}%`;
 el.style.backgroundPosition=`${c.cols>1?c.col/(c.cols-1)*100:0}% ${c.rows>1?c.row/(c.rows-1)*100:0}%`;
 el.style.setProperty('--crop-aspect',String(c.aspect_ratio||1));
}
function artHTML(m,crop=null,extra=''){
 if(!m)return '';
 if(validCrop(crop)&&crop.portrait){
  const height=1/Number(crop.aspect_ratio||1);
  const href=esc(mediaPath(m.path));
  return `<svg class="portrait-art ${extra}" viewBox="${crop.col} 0 1 ${height}" role="img" aria-label="${esc(m.title)}" preserveAspectRatio="xMidYMid meet"><defs><clipPath id="portrait-${m.id}"><rect x="${crop.col}" y="0" width="1" height="${height}"/></clipPath></defs><image href="${href}" x="0" y="0" width="${crop.cols}" height="${height}" preserveAspectRatio="none" clip-path="url(#portrait-${m.id})"/></svg>`;
 }
 if(validCrop(crop))return `<span class="crop-art ${extra}" data-art-id="${esc(m.id)}" data-crop="${esc(JSON.stringify(crop))}" role="img" aria-label="${esc(m.title)}"></span>`;
 return `<img class="${extra}" loading="lazy" src="${esc(mediaPath(m.path))}" alt="${esc(m.title)}">`;
}
function paintArts(container){container.querySelectorAll('[data-art-id]').forEach(el=>{const m=mediaById.get(el.dataset.artId);if(m)paintCrop(el,m,JSON.parse(el.dataset.crop));});}
const objectMedia=o=>{
 const cover=coverFor(o),items=[];
 if(cover)items.push({m:cover,crop:cropFor(cover,o)});
 for(const path of o.media||[]){if(path===cover?.path)continue;const m=data.media.find(item=>item.path===path);if(m)items.push({m,crop:m.display_crop});}
 return items;
};
let activeObject='earth', activeFilter='all';
function panel(name){
  document.querySelectorAll('.panel').forEach(p=>p.hidden=p.id!=='panel-'+name);
  document.querySelectorAll('.tab').forEach(b=>{const yes=b.dataset.panel===name;b.classList.toggle('active',yes);yes?b.setAttribute('aria-current','page'):b.removeAttribute('aria-current');});
}
document.querySelectorAll('.tab').forEach(b=>b.addEventListener('click',()=>panel(b.dataset.panel)));
function lightbox(path,caption,crop=null,m=null){
 const cropped=validCrop(crop)&&m;
 $('#lightbox-image').hidden=!!cropped;$('#lightbox-crop').hidden=!cropped;
 if(cropped){$('#lightbox-crop').innerHTML=artHTML(m,crop);paintArts($('#lightbox-crop'));}
 else{$('#lightbox-image').src=path;$('#lightbox-image').alt=caption;}
 $('#lightbox-caption').textContent=caption;$('#lightbox-source').hidden=!cropped;$('#lightbox-source').href=path;
 $('#lightbox').showModal();
}
$('#close-lightbox').addEventListener('click',()=>$('#lightbox').close());
$('#lightbox').addEventListener('click',e=>{if(e.target===$('#lightbox'))$('#lightbox').close();});
$('#explore-atlas').addEventListener('click',()=>{panel('map');$('#panel-map').scrollIntoView({behavior:'smooth',block:'start'});});
const heroObject=objects.get('art-planet')||objects.get('alpha')||objects.get('earth');
const heroCover=coverFor(heroObject);
if(heroCover){
 const crop=cropFor(heroCover,heroObject);const el=$('#hero-art');
 if(validCrop(crop))paintCrop(el,heroCover,crop);else el.style.backgroundImage=`url("${encodeURI(mediaPath(heroCover.path))}")`;
 $('#hero-caption').textContent=heroObject.name+' · открыть планету';
 $('#open-map').setAttribute('aria-label','Открыть планету '+heroObject.name);
 $('#open-map').addEventListener('click',()=>{panel('map');showObject(heroObject.id,true);});
}else{$('#hero-art').style.backgroundImage='radial-gradient(circle at 50% 48%,#c5eee3 0 28%,#eefaff 29% 36%,#a7e3ef 37% 38%,transparent 39%)';$('#open-map').addEventListener('click',()=>{panel('map');$('#panel-map').scrollIntoView({behavior:'smooth'});});}
const plural=(n,one,few,many)=>n%100>=11&&n%100<=14?many:n%10===1?one:n%10>=2&&n%10<=4?few:many;
$('#object-count').textContent=data.objects.length+' '+plural(data.objects.length,'объект','объекта','объектов')+' мира';
$('#gap-count').textContent=data.gaps.length+' идей для следующих открытий.';

function showObject(id,scroll=false){
 const o=objects.get(id);if(!o)return;activeObject=id;
 const images=objectMedia(o);
 $('#detail').innerHTML=`<p class="eyebrow">${esc(o.kind)}</p><h3>${esc(o.name)}</h3><p class="author">${o.author?'Автор: '+esc(o.author)+' · ':''}Записано ${esc((o.recorded||'').split('-').reverse().join('.'))}</p><ul>${(o.facts||[]).map(f=>`<li>${esc(f)}</li>`).join('')}</ul>${images.length?images.map(({m,crop},i)=>`${m.kind==='illustration'?'<p class="artifact-note">Художественная версия</p>':''}<button class="detail-media" data-detail-index="${i}" aria-label="Увеличить: ${esc(m.title||o.name)}">${artHTML(m,crop)}</button>${validCrop(crop)?`<a class="full-sheet-link" href="${esc(mediaPath(m.path))}" target="_blank" rel="noopener">Открыть полный лист ↗</a>`:''}`).join(''):`<div class="placeholder"><strong>＋</strong>${o.artwork_status==='awaiting_user'?'Ждём ваш рисунок.<br>Семья пришлёт его позже.':`Здесь будет ваш рисунок${o.kind==='способ управления'?' или жест':''}.<br>Пока у объекта есть история.`}</div>`}${o.open_questions?.length?`<h4>Ещё придумаем</h4><ul>${o.open_questions.map(q=>`<li>${esc(q)}</li>`).join('')}</ul>`:''}${o.related?.length?`<h4>Связано с</h4><div class="related">${o.related.filter(r=>objects.has(r)).map(r=>`<button data-object="${esc(r)}">${esc(objects.get(r).name)}</button>`).join('')}</div>`:''}`;
 paintArts($('#detail'));
 $('#detail').querySelectorAll('[data-detail-index]').forEach(b=>b.addEventListener('click',()=>{const {m,crop}=images[Number(b.dataset.detailIndex)];lightbox(mediaPath(m.path),m.title||o.name,crop,m);}));
 $('#detail').querySelectorAll('[data-object]').forEach(b=>b.addEventListener('click',()=>showObject(b.dataset.object)));
 document.querySelectorAll('.node').forEach(n=>n.classList.toggle('selected',n.dataset.id===id));
 if(scroll)$('#detail').scrollIntoView({behavior:'smooth',block:'nearest'});
}
const positions={
 'earth':[200,125,'planet','Земля',54], 'jupiter':[455,70,'planet','Юпитер',39], 'mars':[455,225,'planet','Марс',33],
 'judish':[75,70,'planet','Джудиш',24], 'ruined-planet':[800,65,'planet','Разрушенная планета',32], 'levka':[940,100,'planet','Левка',32], 'mercury':[650,70,'planet','Меркурий',25], 'foggy-albion':[800,220,'planet','Туманный Альбион',40],
 'art-planet':[465,325,'planet','Art Planet',39], 'alpha':[650,300,'planet','Альфа',43], 'family-flag':[330,1180,'culture','Наш флаг'], 'currency':[680,1180,'culture','ВОРА'],
 'dromalogy':[330,1340,'culture','Дромалогия'], 'universal-bank':[680,1340,'culture','Всевселенный банк'], 'xbox-series-x8':[330,1500,'culture','Xbox Series X8'],
 'kot':[160,320,'planet','КОТ',34], 'dad-base':[800,355,'place','Папина база'],
 'vasya-plane':[130,490,'ship','Снежинка'], 'bmw-ultra-77':[365,510,'ship','BMW Ultra 77'],
 'mini-bmw':[150,650,'ship','Мини-BMW'], 'bmw-controller':[390,690,'ship','Мысль и мановение'],
 'flying-house':[800,500,'ship','Летающий дом'], 'house-mini-ships':[800,650,'ship','20 мини-кораблей'],
 'bmw-black-hole':[600,600,'energy','Энергия BMW'], 'black-holes':[610,870,'energy','Чёрные дыры',43],
 'vasya-black-hole':[365,995,'energy','Чёрная дыра Васи'], 'dad-black-hole':[825,995,'energy','Папина чёрная дыра']
};
const ghosts=[
 {id:'gap-01',parent:'kot',x:325,y:355,name:'Как выглядит КОТ?'},
 {id:'gap-08',parent:'bmw-controller',x:395,y:820,name:'Как мысль становится командой?'},
 {id:'gap-18',parent:'flying-house',x:850,y:785,name:'Комнаты дома'},
 {id:'gap-14',parent:'vasya-plane',x:140,y:810,name:'Эмблема Снежинки'}
];
const svg=$('#graph');svg.setAttribute('viewBox','0 0 1000 1580');
const ns='http://www.w3.org/2000/svg';
function svgEl(tag,attrs,parent=svg){const el=document.createElementNS(ns,tag);for(const[k,v]of Object.entries(attrs))el.setAttribute(k,v);parent.appendChild(el);return el;}
function svgText(txt,x,y,cls,parent=svg){const t=svgEl('text',{x,y,'text-anchor':'middle',class:cls},parent);t.textContent=txt;return t;}
const defs=svgEl('defs',{});
const colors={judish:['#c1d8e0','#698b9e'],levka:['#b5c9e2','#647dab'],earth:['#77b6b0','#285b73'],jupiter:['#dec495','#ab7655'],mars:['#d78b61','#9a533c'],mercury:['#adbbc2','#606d7a'],'foggy-albion':['#d4d7d2','#708c9b'],kot:['#c0c6a3','#747f6b'],'black-holes':['#5b557c','#252138']};
for(const[id,[a,b]]of Object.entries(colors)){const grad=svgEl('radialGradient',{id:'grad-'+id,cx:'30%',cy:'25%',r:'80%'},defs);svgEl('stop',{offset:'0%','stop-color':a},grad);svgEl('stop',{offset:'100%','stop-color':b},grad);}
svgText('ПЛАНЕТЫ И НАШ ДОМ',180,28,'region-label');svgText('КОРАБЛИ И ПУТЕШЕСТВИЯ',215,427,'region-label');svgText('ЭНЕРГИЯ НАШЕГО МИРА',180,920,'region-label');svgText('УЧЁБА, ТЕХНОЛОГИИ И СИМВОЛЫ МИРА',500,1100,'region-label');
const edgeGroup=svgEl('g',{});
for(const e of data.relationships){
 const a=positions[e.source],b=positions[e.target];if(!a||!b)continue;
 const distant=Math.abs(a[1]-b[1])>700;
 const route=distant?`M ${a[0]} ${a[1]} C 25 ${a[1]} 25 ${b[1]} ${b[0]} ${b[1]}`:`M ${a[0]} ${a[1]} Q ${(a[0]+b[0])/2+20} ${(a[1]+b[1])/2-12} ${b[0]} ${b[1]}`;
 const line=svgEl('path',{d:route,class:'edge','data-source':e.source,'data-target':e.target},edgeGroup);
 const edgeTitle=svgEl('title',{},line);edgeTitle.textContent=objects.get(e.source).name+' → '+e.label+' → '+objects.get(e.target).name;
 if(!distant&&e.label!=='пример в мире')svgText(e.label,(a[0]+b[0])/2,(a[1]+b[1])/2-8,'edge-label',edgeGroup);
}
const ghostEdges=svgEl('g',{'data-ghost':'true'});
for(const g of ghosts){const a=positions[g.parent];svgEl('path',{d:`M ${a[0]} ${a[1]} L ${g.x} ${g.y}`,class:'edge ghost-edge'},ghostEdges);}
const nodeGroup=svgEl('g',{});
for(const [id,[x,y,category,title,r]]of Object.entries(positions)){
 const o=objects.get(id);if(!o)continue;const g=svgEl('g',{class:'node',transform:`translate(${x},${y})`,'data-id':id,'data-category':category,role:'button',tabindex:'0','aria-label':'Открыть объект: '+o.name},nodeGroup);
 const cover=coverFor(o);
 if(cover){
   const crop=cropFor(cover,o);
   const w=r?r*2:174,h=r?r*2:112,px=-w/2,py=-h/2;
   const clip=svgEl('clipPath',{id:'art-clip-'+id,clipPathUnits:'userSpaceOnUse'},defs);
   if(r){svgEl('circle',{cx:0,cy:0,r},clip);svgEl('circle',{r,fill:'#eaf8fc',class:'body'},g);}
   else{svgEl('rect',{x:px,y:py,width:w,height:h,rx:16},clip);svgEl('rect',{x:px,y:py,width:w,height:h,rx:16,fill:'#eaf8fc',class:'body'},g);}
   const artGroup=svgEl('g',{'clip-path':`url(#art-clip-${id})`},g);
   if(validCrop(crop)){
     const viewport=svgEl('svg',{x:px,y:py,width:w,height:h,viewBox:`${crop.col} ${crop.row} 1 1`,preserveAspectRatio:'xMidYMid slice',overflow:'hidden'},artGroup);
     svgEl('image',{href:mediaPath(cover.path),x:0,y:0,width:crop.cols,height:crop.rows,preserveAspectRatio:'none'},viewport);
   }else svgEl('image',{href:mediaPath(cover.path),x:px,y:py,width:w,height:h,preserveAspectRatio:r?'xMidYMid slice':'xMidYMid meet'},artGroup);
   svgText(title,0,h/2+23,'title',g);
 }else if(r){
   svgEl('circle',{r,fill:'url(#grad-'+id+')',class:'body'},g);
   if(id==='jupiter'){[-13,-2,10].forEach(yy=>svgEl('path',{d:`M ${-r+4} ${yy} Q 0 ${yy+13} ${r-4} ${yy}`,stroke:'#f3d4a7','stroke-width':5,fill:'none',opacity:.28},g));}
   if(id==='earth'){svgEl('path',{d:'M -28 -21 Q -10 -40 6 -24 L 0 -3 L 22 5 L 8 28 L -10 18 L -15 0 L -30 -5 Z',fill:'#c7d1a0',opacity:.7},g);}
   if(id==='kot')svgText('КОТ',0,6,'title',g);
   svgText(title,0,r+23,'title',g);
   if(id==='earth')svgText('наш дом',0,r+41,'subtitle',g);
 }else{
   svgEl('rect',{x:-87,y:-40,width:174,height:80,rx:9,fill:'#285770',class:'body'},g);
   svgText(id==='dad-base'?'⌂':'＋',0,-3,'glyph',g);svgText(title,0,26,'title',g);
 }
 g.addEventListener('click',()=>{panel('map');showObject(id,window.innerWidth<800)});
 g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();showObject(id,window.innerWidth<800)}});
}
for(const ghost of ghosts){
 const g=svgEl('g',{class:'node ghost',transform:`translate(${ghost.x},${ghost.y})`,'data-ghost':'true',role:'button',tabindex:'0','aria-label':'Будущее открытие: '+ghost.name},nodeGroup);
 svgEl('rect',{x:-90,y:-30,width:180,height:60,rx:7,class:'body'},g);svgText('+',0,-5,'glyph',g);
 const label=ghost.name.length>25?['Как мысль становится','командой?']:[ghost.name];label.forEach((s,i)=>svgText(s,0,14+i*13,'title',g));
 function open(){panel('gaps');renderGaps('Все');$('#gap-'+ghost.id).scrollIntoView({behavior:'smooth',block:'center'});}
 g.addEventListener('click',open);g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open();}});
}
$('#show-gaps').addEventListener('change',e=>document.querySelectorAll('[data-ghost]').forEach(el=>el.style.display=e.target.checked?'':'none'));
function filterMap(){
 document.querySelectorAll('.node[data-category]').forEach(n=>n.classList.toggle('dim',activeFilter!=='all'&&n.dataset.category!==activeFilter));
 document.querySelectorAll('#map-filters button').forEach(b=>b.classList.toggle('active',b.dataset.filter===activeFilter));
}
document.querySelectorAll('#map-filters button').forEach(b=>b.addEventListener('click',()=>{activeFilter=b.dataset.filter;filterMap()}));
$('#search').addEventListener('input',e=>{
 const q=e.target.value.toLocaleLowerCase('ru').trim();const container=$('#search-results');container.hidden=!q;if(!q)return;
 const hits=data.objects.filter(o=>(o.name+' '+o.kind+' '+(o.author||'')).toLocaleLowerCase('ru').includes(q));
 container.innerHTML=hits.length?hits.map(o=>`<button data-id="${o.id}">${esc(o.name)}</button>`).join(''):'<p>Пока такого объекта нет. Возможно, это следующее открытие?</p>';
 container.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{activeFilter='all';filterMap();showObject(b.dataset.id,true)}));
});
function gallery(){
 const originals=data.media.filter(m=>m.kind!=='illustration'&&!m.display_crop);
 const picture=(m,label)=>`<div class="paired-image"><span class="pair-label">${esc(label)}</span><button data-media-id="${esc(m.id)}" aria-label="${esc(label)}: ${esc(m.title)}">${artHTML(m,m.display_crop)}</button>${validCrop(m.display_crop)?`<a class="full-sheet-link" href="${esc(mediaPath(m.path))}" target="_blank" rel="noopener">Открыть полный лист ↗</a>`:''}</div>`;
 $('#gallery').innerHTML=originals.map((m,i)=>{
   const versions=(m.illustration_ids||[]).map(id=>mediaById.get(id)).filter(Boolean);
   return `<article class="artifact artifact-pair"><div class="pair-heading"><span class="artifact-no">АРТЕФАКТ ${String(i+1).padStart(2,'0')}</span><h3>${esc(m.title)}</h3></div><div class="pair-images">${picture(m,'Оригинал')}${versions.length?versions.map((v,n)=>picture(v,n?'Ещё один образ':'Дорисовка')).join(''):'<div class="placeholder"><strong>＋</strong>Здесь появится новый образ.<br>Оригинал уже сохранён в нашем мире.</div>'}</div><div class="pair-footer"><p class="artifact-note">Оригинал хранит вашу идею. Цвета и дополнительные детали дорисовок — художественная версия.</p><div class="artifact-links">${(m.object_ids||[]).filter(id=>objects.has(id)).map(id=>`<button data-object="${esc(id)}">${esc(objects.get(id).name)} ↗</button>`).join('')}</div></div></article>`;
 }).join('');
 paintArts($('#gallery'));
 $('#gallery').querySelectorAll('[data-media-id]').forEach(b=>b.addEventListener('click',()=>{const m=mediaById.get(b.dataset.mediaId);lightbox(mediaPath(m.path),m.title,m.display_crop,m)}));
 $('#gallery').querySelectorAll('[data-object]').forEach(b=>b.addEventListener('click',()=>{panel('map');showObject(b.dataset.object,true)}));
}
function characters(){
 const people=data.objects.filter(o=>/персонаж|инопланетянин/.test(o.kind));
 $('#characters').innerHTML=people.length?people.map(o=>{const m=coverFor(o);return `<button class="character-card" data-object="${esc(o.id)}"><span class="character-picture">${m?artHTML(m,cropFor(m,o)):'<span class="character-placeholder" aria-hidden="true">✦</span>'}</span><span class="character-copy"><strong>${esc(o.name)}</strong><small>${esc(o.game_trait||(o.facts||[])[0]||'Знакомимся с новым героем.')}</small></span></button>`;}).join(''):'<div class="placeholder"><strong>✦</strong>Здесь собирается наш экипаж. Образы персонажей скоро появятся.</div>';
 paintArts($('#characters'));
 $('#characters').querySelectorAll('[data-object]').forEach(b=>b.addEventListener('click',()=>{panel('map');showObject(b.dataset.object,true)}));
}
const gapGroups=['Все',...new Set(data.gaps.map(g=>g.group))];
$('#gap-filters').innerHTML=gapGroups.map(g=>`<button class="chip${g==='Все'?' active':''}" data-group="${esc(g)}">${esc(g)}</button>`).join('');
function renderGaps(group){
 document.querySelectorAll('#gap-filters button').forEach(b=>b.classList.toggle('active',b.dataset.group===group));
 $('#gap-grid').innerHTML=data.gaps.filter(g=>group==='Все'||g.group===group).map(g=>`<article class="gap-card" id="gap-${g.id}"><span class="empty-symbol">＋</span><span class="gap-kind">${esc(g.kind)} · ещё придумаем</span><h3>${esc(g.title)}</h3><p>${esc(g.prompt)}</p><button data-object="${g.object_id}">${esc(objects.get(g.object_id).name)} ↗</button></article>`).join('');
 $('#gap-grid').querySelectorAll('[data-object]').forEach(b=>b.addEventListener('click',()=>{panel('map');showObject(b.dataset.object,true)}));
}
document.querySelectorAll('#gap-filters button').forEach(b=>b.addEventListener('click',()=>renderGaps(b.dataset.group)));
const roles=[
 ['Art Planet','У меня песчаная плайя, несколько арт-объектов и одна обсерватория с несколькими телескопами.'],
 ['Альфа','Я очень красивая технологичная планета. У меня три океана. Моё силовое поле создают 14 шаров.'],
 ['ВОРА','Я вселенская валюта. Мой знак — луна и звёздочка. Меня бывает 1, 10 и 100.'],
 ['Xbox Series X8','Я устройство с Земли. У меня выдвигаются джойстики.'],
 ['Дромалогия','Я школьный предмет. Помогаю выбрать будущее. В 7 классе со мной выбирают планету для изучения.'],
 ['Наш флаг','На мне Менделеев, 125 планет и четыре элемента: A1, HO, HE, RO.'],
 ['Летающий дом','Во мне можно жить. Я летаю между планетами. Во мне двадцать маленьких кораблей.'],
 ['Мини-BMW','Я маленькая. Путешествую внутри большой BMW. Помогаю исследовать отдельную планету.'],
 ['Снежинка — самолёт Васи','Меня слепила Вася. Я синий. У меня есть крылья.'],
 ['Земля','Я планета. Именно на мне живёт ваша семья.'],
 ['Туманный Альбион','Я планета. На мне дополнительная папина база.'],
 ['Чёрная дыра','Я даю вам энергию. В вашем мире я не причиняю вам вреда.'],
 ['BMW Ultra 77','Я большой космический корабль. Внутри меня маленькая BMW. Я слушаюсь мысли и мановения.'],
 ['КОТ','Я планета. Моё название состоит из трёх букв. Моё назначение пока загадка.']
];
let roleBag=[],currentRole=null;
$('#draw-role').addEventListener('click',()=>{if(!roleBag.length)roleBag=roles.map((_,i)=>i).sort(()=>Math.random()-.5);currentRole=roles[roleBag.pop()];$('#role-name').textContent='Кто я?';$('#role-hint').textContent=currentRole[1];$('#reveal-role').hidden=false;$('#draw-role').textContent='Другая роль ↻';});
$('#reveal-role').addEventListener('click',()=>{if(currentRole){$('#role-name').textContent=currentRole[0];$('#reveal-role').hidden=true;}});
$('#mission-button').addEventListener('click',()=>{const tasks=data.gaps.filter(g=>['рисунок','персонаж','идея'].includes(g.kind));const g=tasks[Math.floor(Math.random()*tasks.length)];$('#mission-text').textContent=g.title+'. '+g.prompt;});
const journal=$('#journal-text'),storageKey='mendeleev-universe-journal-v1';
try{journal.value=localStorage.getItem(storageKey)||'';}catch{ $('#save-status').textContent='В этом браузере сохранение недоступно. Используйте кнопку скачивания.';}
journal.addEventListener('input',()=>{try{localStorage.setItem(storageKey,journal.value);$('#save-status').textContent='Черновик сохранён в этом браузере. Для архива скачайте журнал.';}catch{$('#save-status').textContent='Не удалось сохранить в браузере. Скачайте журнал, чтобы не потерять записи.';}});
$('#download-journal').addEventListener('click',()=>{
 const stamp=new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Moscow'}).format(new Date());
 const contents='# Бортовой журнал — '+stamp+'\n\n'+(journal.value.trim()||'Автор: \nНазвание: \nЧто умеет: \nС чем связано: \nОставляем в мире или пока идея: \nОткрытый вопрос: ');
 const u=URL.createObjectURL(new Blob([contents+'\n'],{type:'text/markdown;charset=utf-8'}));const a=document.createElement('a');a.href=u;a.download=stamp+'-бортовой-журнал.md';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);
});
gallery();characters();renderGaps('Все');showObject('earth');

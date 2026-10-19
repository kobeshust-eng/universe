'use strict';
const data=window.WORLD;
const objects=new Map(data.objects.map(o=>[o.id,o]));
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const mediaPath=p=>'media/'+p.split('/').pop();
const mediaById=new Map(data.media.map(m=>[m.id,m]));
const coverFor=o=>o.cover_media_id?mediaById.get(o.cover_media_id):null;
const orderedMedia=o=>{const cover=coverFor(o)?.path;return cover?[cover,...o.media.filter(p=>p!==cover)]:o.media;};
let activeObject='earth', activeFilter='all';
function panel(name){
  document.querySelectorAll('.panel').forEach(p=>p.hidden=p.id!=='panel-'+name);
  document.querySelectorAll('.tab').forEach(b=>{const yes=b.dataset.panel===name;b.classList.toggle('active',yes);yes?b.setAttribute('aria-current','page'):b.removeAttribute('aria-current');});
}
document.querySelectorAll('.tab').forEach(b=>b.addEventListener('click',()=>panel(b.dataset.panel)));
function lightbox(path,caption){$('#lightbox-image').src=path;$('#lightbox-image').alt=caption;$('#lightbox-caption').textContent=caption;$('#lightbox').showModal();}
$('#close-lightbox').addEventListener('click',()=>$('#lightbox').close());
$('#lightbox').addEventListener('click',e=>{if(e.target===$('#lightbox'))$('#lightbox').close();});
$('#open-map').addEventListener('click',()=>lightbox('media/2026-10-17-карта.png','Первая карта мира — исправленная версия. Новые объекты представлены в графе.'));

function showObject(id,scroll=false){
 const o=objects.get(id);if(!o)return;activeObject=id;
 $('#detail').innerHTML=`<p class="eyebrow">${esc(o.kind)}</p><h3>${esc(o.name)}</h3><p class="author">${o.author?'Автор: '+esc(o.author)+' · ':''}Записано ${esc(o.recorded.split('-').reverse().join('.'))}</p><ul>${o.facts.map(f=>`<li>${esc(f)}</li>`).join('')}</ul>${orderedMedia(o).length?orderedMedia(o).map(m=>`${data.media.find(item=>item.path===m)?.kind==='illustration'?'<p class="artifact-note">Дорисовка по оригиналу · художественная версия</p>':''}<button class="detail-media" data-media="${esc(m)}" aria-label="Увеличить: ${esc(o.name)}"><img src="${esc(mediaPath(m))}" alt="${esc(data.media.find(item=>item.path===m)?.title||o.name)}"></button>`).join(''):`<div class="placeholder"><strong>＋</strong>${o.artwork_status==='awaiting_user'?'Ждём ваш рисунок.<br>Семья пришлёт его позже.':`Здесь будет ваш рисунок${o.kind==='способ управления'?' или жест':''}.<br>Пока у объекта есть история.`}</div>`}${o.open_questions.length?`<h4>Ещё придумаем</h4><ul>${o.open_questions.map(q=>`<li>${esc(q)}</li>`).join('')}</ul>`:''}${o.related.length?`<h4>Связано с</h4><div class="related">${o.related.map(r=>`<button data-object="${r}">${esc(objects.get(r).name)}</button>`).join('')}</div>`:''}`;
 $('#detail').querySelectorAll('[data-media]').forEach(b=>b.addEventListener('click',()=>lightbox(mediaPath(b.dataset.media),o.name)));
 $('#detail').querySelectorAll('[data-object]').forEach(b=>b.addEventListener('click',()=>showObject(b.dataset.object)));
 document.querySelectorAll('.node').forEach(n=>n.classList.toggle('selected',n.dataset.id===id));
 if(scroll)$('#detail').scrollIntoView({behavior:'smooth',block:'nearest'});
}
const positions={
 'earth':[200,125,'planet','Земля',54], 'jupiter':[455,70,'planet','Юпитер',39], 'mars':[455,225,'planet','Марс',33],
 'levka':[940,100,'planet','Левка',32], 'mercury':[720,70,'planet','Меркурий',25], 'foggy-albion':[800,220,'planet','Туманный Альбион',40],
 'alpha':[600,315,'planet','Альфа',43], 'family-flag':[330,1180,'culture','Наш флаг'], 'currency':[680,1180,'culture','ВОРА'],
 'dromalogy':[330,1340,'culture','Дромалогия'], 'universal-bank':[680,1340,'culture','Всевселенный банк'], 'xbox-series-x8':[330,1500,'culture','Xbox Series X8'],
 'kot':[160,320,'planet','КОТ',34], 'dad-base':[800,355,'place','Папина база'],
 'vasya-plane':[130,490,'ship','Снежинка'], 'bmw-ultra-77':[365,510,'ship','BMW Ultra 77'],
 'mini-bmw':[150,650,'ship','Мини-BMW'], 'bmw-controller':[390,690,'ship','Мысль и мановение'],
 'flying-house':[800,500,'ship','Летающий дом'], 'house-mini-ships':[800,650,'ship','20 мини-кораблей'],
 'bmw-black-hole':[600,600,'energy','Энергия BMW'], 'black-holes':[610,870,'energy','Чёрные дыры',43],
 'vasya-black-hole':[365,995,'energy','Чёрная дыра Васи'], 'dad-black-hole':[825,995,'energy','Папина чёрная дыра']
};
const ghosts=[
 {id:'gap-01',parent:'kot',x:380,y:345,name:'Как выглядит КОТ?'},
 {id:'gap-08',parent:'bmw-controller',x:395,y:820,name:'Как мысль становится командой?'},
 {id:'gap-18',parent:'flying-house',x:850,y:785,name:'Комнаты дома'},
 {id:'gap-14',parent:'vasya-plane',x:140,y:810,name:'Эмблема Снежинки'}
];
const svg=$('#graph');svg.setAttribute('viewBox','0 0 1000 1580');
const ns='http://www.w3.org/2000/svg';
function svgEl(tag,attrs,parent=svg){const el=document.createElementNS(ns,tag);for(const[k,v]of Object.entries(attrs))el.setAttribute(k,v);parent.appendChild(el);return el;}
function svgText(txt,x,y,cls,parent=svg){const t=svgEl('text',{x,y,'text-anchor':'middle',class:cls},parent);t.textContent=txt;return t;}
const defs=svgEl('defs',{});
const colors={levka:['#b5c9e2','#647dab'],earth:['#77b6b0','#285b73'],jupiter:['#dec495','#ab7655'],mars:['#d78b61','#9a533c'],mercury:['#adbbc2','#606d7a'],'foggy-albion':['#d4d7d2','#708c9b'],kot:['#c0c6a3','#747f6b'],'black-holes':['#5b557c','#252138']};
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
 const o=objects.get(id);const g=svgEl('g',{class:'node',transform:`translate(${x},${y})`,'data-id':id,'data-category':category,role:'button',tabindex:'0','aria-label':'Открыть объект: '+o.name},nodeGroup);
 const cover=coverFor(o);
 if(cover){
   if(r){
     const clip=svgEl('clipPath',{id:'art-clip-'+id,clipPathUnits:'userSpaceOnUse'},defs);svgEl('circle',{cx:0,cy:0,r:r},clip);
     svgEl('circle',{r,fill:'#f6f2e9',class:'body'},g);
     svgEl('image',{href:mediaPath(cover.path),x:-r,y:-r,width:r*2,height:r*2,preserveAspectRatio:'xMidYMid slice','clip-path':`url(#art-clip-${id})`},g);
     svgText(title,0,r+23,'title',g);
   }else{
     svgEl('rect',{x:-87,y:-50,width:174,height:100,rx:8,fill:'#f6f2e9',class:'body'},g);
     svgEl('image',{href:mediaPath(cover.path),x:-81,y:-45,width:162,height:90,preserveAspectRatio:'xMidYMid meet'},g);
     svgText(title,0,67,'title',g);
   }
 }else if(r){
   svgEl('circle',{r,fill:'url(#grad-'+id+')',class:'body'},g);
   if(id==='jupiter'){[-13,-2,10].forEach(yy=>svgEl('path',{d:`M ${-r+4} ${yy} Q 0 ${yy+13} ${r-4} ${yy}`,stroke:'#f3d4a7','stroke-width':5,fill:'none',opacity:.28},g));}
   if(id==='earth'){svgEl('path',{d:'M -28 -21 Q -10 -40 6 -24 L 0 -3 L 22 5 L 8 28 L -10 18 L -15 0 L -30 -5 Z',fill:'#c7d1a0',opacity:.7},g);}
   if(id==='kot')svgText('КОТ',0,6,'title',g);
   svgText(title,0,r+23,'title',g);
   if(id==='earth')svgText('наш дом',0,r+41,'subtitle',g);
 }else{
   svgEl('rect',{x:-87,y:-40,width:174,height:80,rx:9,fill:'#20394d',class:'body'},g);
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
 const originals=data.media.filter(m=>m.kind!=='illustration');
 const picture=(m,label)=>`<div class="paired-image"><span class="pair-label">${label}</span><button data-media-id="${esc(m.id)}" aria-label="${label}: ${esc(m.title)}"><img loading="lazy" src="${esc(mediaPath(m.path))}" alt="${esc(m.title)}"></button></div>`;
 $('#gallery').innerHTML=originals.map((m,i)=>{
   const versions=(m.illustration_ids||[]).map(id=>mediaById.get(id)).filter(Boolean);
   return `<article class="artifact artifact-pair"><div class="pair-heading"><span class="artifact-no">АРТЕФАКТ ${String(i+1).padStart(2,'0')}</span><h3>${esc(m.title)}</h3></div><div class="pair-images">${picture(m,'Оригинал')}${versions.length?versions.map((v,n)=>picture(v,n?'Дополнительный вид':'Дорисовка')).join(''):'<div class="placeholder"><strong>＋</strong>Левка уже в четырёх концептах.<br><a href="styles/index.html">Выбираем будущий стиль ↗</a></div>'}</div><div class="pair-footer"><p class="artifact-note">По вашему оригиналу · цвета и новые детали — художественная версия.</p><div class="artifact-links">${m.object_ids.map(id=>`<button data-object="${id}">${esc(objects.get(id).name)} ↗</button>`).join('')}</div></div></article>`;
 }).join('');
 $('#gallery').querySelectorAll('[data-media-id]').forEach(b=>b.addEventListener('click',()=>{const m=mediaById.get(b.dataset.mediaId);lightbox(mediaPath(m.path),m.title)}));
 $('#gallery').querySelectorAll('[data-object]').forEach(b=>b.addEventListener('click',()=>{panel('map');showObject(b.dataset.object,true)}));
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
gallery();renderGaps('Все');showObject('earth');

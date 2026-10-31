
/* Biet Al Reef Studio v4 — original procedural 3D furniture. Three.js MIT (threejs.org). */
import * as T from '/three.module.min.js';
const ID='brx-studio',KEY='brx-studio-uae-v4';
const COLORS={
 wall:['#e8dcc9','#f5f2e9','#c2ad95','#a6aaa0','#ead6c4','#dde1d5'],
 floor:['#bf9b70','#e3c9a4','#94755b','#bfc0b9','#73594b'],
 fabric:['#647661','#d2bba3','#a2aba5','#b3a18e','#364d45','#9c7357','#e3d4b5'],
 wood:['#98714a','#c09b6e','#5a4130','#d3b58c'],
 metal:['#bd995d','#484a45','#ded8c9']
};
const ITEMS=[
{id:'sofa',ar:'أريكة الريف المعيارية',cat:'جلوس',dim:'240 × 94 × 82 سم',icon:'▰',foot:2.3,desc:'أريكة قابلة لتغيير القماش والتدوير بحرية'},
{id:'chair',ar:'كرسي واحة للاسترخاء',cat:'جلوس',dim:'86 × 80 × 92 سم',icon:'◫',foot:.85,desc:'كرسي بخامات خشبية ومقعد مريح'},
{id:'coffee',ar:'طاولة سُدرة الدائرية',cat:'طاولات',dim:'105 × 105 × 44 سم',icon:'◉',foot:1,desc:'طاولة مركزية بتشطيب خشبي فاخر'},
{id:'rug',ar:'سجادة رمل النسيجية',cat:'أرضيات',dim:'270 × 190 سم',icon:'▤',foot:2.7,desc:'نسيج دافئ ينسجم مع ألوان المكان'},
{id:'lamp',ar:'مصباح نور القوسي',cat:'إضاءة',dim:'52 × 52 × 172 سم',icon:'✦',foot:.6,desc:'إضاءة جانبية بلمسات معدنية'},
{id:'plant',ar:'نبات غافة للزينة',cat:'ديكور',dim:'45 × 45 × 125 سم',icon:'✿',foot:.6,desc:'تكوين أخضر مستوحى من الطبيعة'},
{id:'console',ar:'كونسول جذور',cat:'تخزين',dim:'160 × 42 × 80 سم',icon:'▥',foot:1.6,desc:'وحدة تخزين بخطوط بسيطة وخامات خشبية'},
{id:'ottoman',ar:'مقعد وثير',cat:'جلوس',dim:'70 × 70 × 44 سم',icon:'◈',foot:.7,desc:'مقعد إضافي يدعم تنويع الجلسة'}
];
const DEFAULT=[
 {uid:'g1',type:'rug',x:0,z:.72,rot:0,scale:1},
 {uid:'g2',type:'sofa',x:0,z:-.98,rot:0,scale:1},
 {uid:'g3',type:'coffee',x:0,z:.4,rot:0,scale:1},
 {uid:'g4',type:'chair',x:2.1,z:.05,rot:-.48,scale:1},
 {uid:'g5',type:'lamp',x:-2.3,z:-.3,rot:0,scale:1},
 {uid:'g6',type:'plant',x:2.65,z:-1.65,rot:0,scale:1}
];
const clone=a=>JSON.parse(JSON.stringify(a));
let state={items:clone(DEFAULT),chosen:'g2',wall:COLORS.wall[0],floor:COLORS.floor[0],fabric:COLORS.fabric[0],wood:COLORS.wood[0],metal:COLORS.metal[0]};
try{const s=JSON.parse(localStorage.getItem(KEY)||'null');if(s&&Array.isArray(s.items)&&s.items.length<=35&&s.items.every(x=>ITEMS.some(i=>i.id===x.type))){state={...state,...s,items:s.items.map(x=>({...x,x:Math.max(-3,Math.min(3,Number(x.x)||0)),z:Math.max(-2.3,Math.min(2.8,Number(x.z)||0)),scale:Math.max(.55,Math.min(1.7,Number(x.scale)||1))}))}}}catch{}
let past=[],future=[],renderer=null,scene=null,camera=null,room=null,furniture=null,objects=new Map(),raf=0,resize=null,running=false;
let yaw=.49,pitch=.42,radius=9.1,drag=null,material={};
const hex=s=>new T.Color(s);
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(state))}catch{}};
function push(){past.push(JSON.stringify(state));if(past.length>45)past.shift();future=[]}
function mat(color,rough=.75,metal=0){return new T.MeshStandardMaterial({color,roughness:rough,metalness:metal})}
function box(group,x,y,z,w,h,d,m,cast=true){const mesh=new T.Mesh(new T.BoxGeometry(w,h,d),m);mesh.position.set(x,y,z);mesh.castShadow=cast;mesh.receiveShadow=true;group.add(mesh);return mesh}
function cyl(g,x,y,z,rt,rb,h,m,n=24){let q=new T.Mesh(new T.CylinderGeometry(rt,rb,h,n),m);q.position.set(x,y,z);q.castShadow=true;q.receiveShadow=true;g.add(q);return q}
function ball(g,x,y,z,rx,ry,rz,m){const q=new T.Mesh(new T.SphereGeometry(1,18,12),m);q.scale.set(rx,ry,rz);q.position.set(x,y,z);q.castShadow=true;g.add(q);return q}
function model(type){
 const g=new T.Group(),f=material.fabric,w=material.wood,mt=material.metal,iv=material.ivory,green=material.green;
 if(type==='sofa'){
  box(g,0,.37,0,2.44,.34,.91,f);
  box(g,0,.73,-.36,2.3,.7,.21,f);
  for(let i=-1;i<=1;i++){ball(g,i*.74,.59,.05,.38,.16,.38,f);ball(g,i*.74,.86,-.32,.36,.32,.135,f)}
  for(let i of [-1,1]){box(g,i*1.17,.58,.0,.18,.56,1.0,f);cyl(g,i*1.0,.09,-.29,.03,.03,.18,w,9);cyl(g,i*1.0,.09,.31,.03,.03,.18,w,9)}
  ball(g,-.77,.8,-.12,.18,.22,.09,iv);ball(g,.74,.79,-.12,.19,.22,.1,iv)
 }else if(type==='chair'){
  for(let i of [-1,1]){box(g,i*.38,.38,0,.08,.73,.88,w);box(g,i*.38,.77,-.24,.075,.63,.09,w)}
  box(g,0,.46,0,.78,.19,.8,f);box(g,0,.77,-.3,.78,.59,.15,f);ball(g,0,.58,.05,.36,.13,.34,iv);
  for(let x of [-.35,.35])for(let z of [-.3,.3])box(g,x,.2,z,.075,.4,.075,w)
 }else if(type==='coffee'){
  cyl(g,0,.42,0,.54,.54,.075,w,40);cyl(g,0,.22,0,.22,.30,.4,w,30);
  cyl(g,.21,.48,.1,.11,.11,.025,mt,20);ball(g,.21,.52,.1,.07,.065,.07,green)
 }else if(type==='rug'){
  const rug=box(g,0,.012,0,2.7,.02,1.86,iv,false);rug.receiveShadow=true;box(g,0,.025,0,2.57,.015,1.72,material.rug,false);
  for(let i=-10;i<=10;i++){box(g,i*.115,.039,-.74,.009,.003,1.2,iv,false)}
  for(let i=-13;i<=13;i++){box(g,i*.095,.032,-.935,.009,.004,.1,iv,false);box(g,i*.095,.032,.935,.009,.004,.1,iv,false)}
 }else if(type==='lamp'){
  cyl(g,0,.04,0,.28,.28,.07,mt,32);cyl(g,0,.84,0,.027,.027,1.58,mt,14);
  let arm=box(g,.23,1.62,0,.5,.027,.028,mt);arm.rotation.z=-.12;
  cyl(g,.48,1.47,0,.27,.1,.36,mt,32);cyl(g,.48,1.26,0,.17,.17,.08,material.light,30);
 }else if(type==='plant'){
  cyl(g,0,.24,0,.2,.14,.46,material.pot,24);cyl(g,0,.49,0,.15,.19,.06,material.pot,24);
  cyl(g,0,.83,0,.025,.027,.78,w,10);
  for(let i=0;i<10;i++){
   let a=i*Math.PI*2/10,z=.65+(i%4)*.19;
   const l=ball(g,Math.cos(a)*.25,z,Math.sin(a)*.27,.12,.31,.08,green);
   l.rotation.z=-Math.cos(a)*.62;l.rotation.x=Math.sin(a)*.54;
  }
 }else if(type==='console'){
  box(g,0,.44,0,1.6,.8,.43,w);box(g,0,.87,0,1.69,.07,.49,mt);
  for(let x of [-.49,0,.49])box(g,x,.47,.226,.005,.65,.008,iv,false);
  for(let x of [-.75,.75])cyl(g,x,.04,.0,.023,.023,.09,mt,12)
 }else if(type==='ottoman'){
  cyl(g,0,.25,0,.36,.33,.38,f,30);cyl(g,0,.45,0,.37,.37,.1,iv,30);
 }
 return g;
}
function roomBuild(){
 const g=new T.Group(),M=mat(state.wall),F=mat(state.floor),trim=mat('#f6eee0'),gold=mat('#b79a67',.3,.55),window=mat('#a3c1c0',.08,.12);
 const floor=box(g,0,-.095,0,7,.18,6,F,false);floor.receiveShadow=true;
 const back=box(g,0,1.55,-2.92,7,3.1,.12,M,false);
 box(g,-3.55,1.55,0,.12,3.1,6,M,false);
 box(g,0,.08,-2.83,7,.16,.08,trim,false);
 // window and architectural frame
 box(g,1.72,1.70,-2.82,2.35,1.83,.05,window,false);
 for(let x of [.52,1.70,2.91])box(g,x,1.7,-2.76,.045,1.91,.06,trim,false);
 for(let y of [.80,2.63])box(g,1.72,y,-2.76,2.4,.045,.06,trim,false);
 box(g,1.72,1.74,-2.74,2.4,.04,.06,trim,false);
 // slat wall
 for(let i=0;i<18;i++)box(g,-3.18+i*.075,1.60,-2.78,.024,2.65,.065,mat(i%2?'#947756':'#b4976c'),false);
 // framed artwork
 box(g,-.45,1.7,-2.76,.75,.91,.07,trim,false);
 box(g,-.45,1.7,-2.71,.62,.78,.015,mat('#d9c8af'),false);
 const art=cyl(g,-.44,1.75,-2.69,.17,.17,.01,mat('#a88c68'),22);art.rotation.x=Math.PI/2;
 // planted backdrop shadow windows
 box(g,0,3.07,-2.82,7,.08,.07,trim,false);
 room=g;scene.add(g);
}
function create3D(){
 if(renderer)return;
 const mount=document.querySelector('#brx-viewport');if(!mount)return;
 try{
 renderer=new T.WebGLRenderer({antialias:true,alpha:false,preserveDrawingBuffer:true,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.8));
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
 renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
 mount.append(renderer.domElement);
 scene=new T.Scene();scene.background=hex('#ebe1d2');
 camera=new T.PerspectiveCamera(42,1,.1,100);
 scene.add(new T.HemisphereLight('#fff9ec','#c2aa8c',2.2));
 const key=new T.DirectionalLight('#fff5e6',3.2);key.position.set(2.4,6,4.8);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-8;key.shadow.camera.right=8;key.shadow.camera.top=8;key.shadow.camera.bottom=-8;scene.add(key);
 const fill=new T.DirectionalLight('#dfece8',1.1);fill.position.set(-3,3,-1);scene.add(fill);
 furniture=new T.Group();scene.add(furniture);
 rebuild();
 const resizeFn=()=>{if(!renderer)return;const rect=mount.getBoundingClientRect();if(rect.width<10||rect.height<10)return;renderer.setSize(rect.width,rect.height,false);camera.aspect=rect.width/rect.height;camera.updateProjectionMatrix()};
 resize=new ResizeObserver(resizeFn);resize.observe(mount);resizeFn();cameraUpdate();setTimeout(renderThumbnails,380);
 const loop=()=>{if(!renderer)return;renderer.render(scene,camera);raf=requestAnimationFrame(loop)};loop();
 renderer.domElement.addEventListener('pointerdown',startPointer);
 renderer.domElement.addEventListener('pointermove',movePointer);
 renderer.domElement.addEventListener('pointerup',endPointer);
 renderer.domElement.addEventListener('pointercancel',endPointer);
 renderer.domElement.addEventListener('wheel',e=>{e.preventDefault();radius=Math.min(18,Math.max(5.5,radius+Math.sign(e.deltaY)*.75));cameraUpdate()},{passive:false});
 document.querySelector('#brx-error').hidden=true;
 }catch(e){document.querySelector('#brx-error').hidden=false;console.error('Biet Al Reef WebGL:',e)}
}
function cameraUpdate(){if(!camera)return;camera.position.set(radius*Math.sin(yaw)*Math.cos(pitch),radius*Math.sin(pitch),radius*Math.cos(yaw)*Math.cos(pitch));camera.lookAt(0,1.0,0)}
function rebuild(){
 if(!scene)return;
 if(room){scene.remove(room);room.traverse(obj=>{if(obj.isMesh){obj.geometry?.dispose();obj.material?.dispose()}});room=null}
 if(furniture){while(furniture.children.length){const x=furniture.children[0];furniture.remove(x);x.traverse(obj=>{if(obj.isMesh){obj.geometry?.dispose();obj.material?.dispose()}})}}
 objects.clear();
 material={fabric:mat(state.fabric,.91),wood:mat(state.wood,.6),metal:mat(state.metal,.3,.65),ivory:mat('#e5dbcb'),green:mat('#496948'),rug:mat('#c4b49d'),pot:mat('#bdac96'),light:new T.MeshBasicMaterial({color:'#fff4c2'})};
 roomBuild();
 state.items.forEach(addGroup);
}
function addGroup(item){
 let group=model(item.type);group.userData.itemUid=item.uid;
 group.position.set(item.x,0,item.z);group.rotation.y=item.rot||0;group.scale.setScalar(item.scale||1);
 furniture.add(group);objects.set(item.uid,group)
}
function update3D(){if(!objects.size)return;for(const item of state.items){const o=objects.get(item.uid);if(o){o.position.set(item.x,0,item.z);o.rotation.y=item.rot||0;o.scale.setScalar(item.scale||1)}}}
const ray=new T.Raycaster(),mouse=new T.Vector2(),ground=new T.Plane(new T.Vector3(0,1,0),0);
function pick(event){let c=renderer.domElement.getBoundingClientRect();mouse.set((event.clientX-c.left)/c.width*2-1,-((event.clientY-c.top)/c.height*2-1));ray.setFromCamera(mouse,camera);let intersections=ray.intersectObjects([...objects.values()],true);const picked=intersections.find(x=>x.object.visible);if(!picked)return null;let o=picked.object;while(o&&!o.userData.itemUid)o=o.parent;return o?.userData.itemUid||null}
function floorIntersect(event){const box=renderer.domElement.getBoundingClientRect();mouse.set((event.clientX-box.left)/box.width*2-1,-((event.clientY-box.top)/box.height*2-1));ray.setFromCamera(mouse,camera);const out=new T.Vector3();return ray.ray.intersectPlane(ground,out)?out:null}
function startPointer(e){
 if(!renderer)return;const id=pick(e),point=floorIntersect(e);
 drag={pointer:e.pointerId,x:e.clientX,y:e.clientY,id,point,startItem:clone(state.items),before:JSON.stringify(state),yaw,pitch,moved:false};
 if(id){state.chosen=id;refreshInspector();refreshSelection()}
 renderer.domElement.setPointerCapture?.(e.pointerId);
}
function movePointer(e){
 if(!drag||drag.pointer!==e.pointerId)return;
 const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.abs(dx)+Math.abs(dy)>4)drag.moved=true;
 if(drag.id){const item=state.items.find(i=>i.uid===drag.id),initial=drag.startItem.find(i=>i.uid===drag.id);if(!item||!initial)return;
 const next=floorIntersect(e);
 if(next&&drag.point){item.x=Math.max(-3,Math.min(3,initial.x+next.x-drag.point.x));item.z=Math.max(-2.4,Math.min(2.7,initial.z+next.z-drag.point.z));update3D();}
 }else{yaw=drag.yaw-dx*.008;pitch=Math.max(.17,Math.min(.93,drag.pitch+dy*.006));cameraUpdate()}
}
function endPointer(e){if(!drag||drag.pointer!==e.pointerId)return;if(drag.moved&&drag.id){past.push(drag.before);future=[];save();refreshSummary()}drag=null}
const moneyPlaceholder='<span class="brx-price">السعر عند الطلب</span>';
function renderApp(){
 const root=document.getElementById('content');if(!root)return;
 root.innerHTML='<main class="brx-studio wrap" id="'+ID+'"><div class="brx-crumb"><a href="#home">الرئيسية</a><span>›</span><strong>استوديو بيت الريف</strong></div>'+
 '<header class="brx-intro"><div><small>BIET AL REEF  /  DESIGN STUDIO</small><h1>صمّم مساحتك <em>على ذوقك</em></h1><p>مساحة تصميم ثلاثية الأبعاد بهوية بيت الريف. حرك القطع ودوّرها وجرّب الأقمشة والألوان والخامات.</p></div><div class="brx-head-actions"><button type="button" data-brx="undo" id="brx-undo">↶ تراجع</button><button type="button" data-brx="redo" id="brx-redo">↷ إعادة</button><button type="button" class="brx-primary" data-brx="save">حفظ التصميم</button></div></header>'+
 '<section class="brx-layout"><aside class="brx-library"><header><small>مكتبة تصاميم بيت الريف</small><h2>الأثاث والديكور</h2></header><div class="brx-searchline"><input id="brx-search" placeholder="ابحث عن قطعة..." aria-label="ابحث عن قطعة" autocomplete="off"></div><div class="brx-filter" id="brx-filter"><button data-brx-cat="الكل" class="active">الكل</button>'+['جلوس','طاولات','أرضيات','إضاءة','ديكور','تخزين'].map(c=>'<button data-brx-cat="'+c+'">'+c+'</button>').join('')+'</div><div id="brx-list" class="brx-item-list">'+listItems()+'</div><p class="brx-library-note">مجسمات تصميمية أصلية من بيت الريف. لا تمثل منتجات معروضة للبيع أو أسعارًا معتمدة.</p></aside>'+
 '<div class="brx-workspace"><div class="brx-workbar"><div><strong>مساحة معيشة</strong><small>معاينة ثلاثية الأبعاد حية</small></div><div class="brx-workbuttons"><button data-brx="reset-camera">ضبط المشهد</button><button data-brx="capture">حفظ صورة</button></div></div><div id="brx-viewport" class="brx-viewport"><div class="brx-watermark">بيت الريف • تصميم تفاعلي</div><p id="brx-error" hidden>تعذّر تشغيل العرض ثلاثي الأبعاد في هذا المتصفح. استخدم متصفحًا يدعم WebGL.</p><div class="brx-canvas-tip">اسحب القطع لتحريكها • اسحب الخلفية لتدوير المشهد • عجلة الماوس للتقريب</div></div><div class="brx-footer-tools"><div><span>◉ ثلاثي الأبعاد فعلي</span><span>↺ تدوير القطعة 360°</span><span>✦ خامات قابلة للتغيير</span></div><small>نموذج إلهامي؛ الأبعاد التقريبية لا تُستخدم كمخططات تنفيذية</small></div></div>'+
 '<aside class="brx-properties"><header><small>تخصيص التصميم</small><h2>الألوان والخامات</h2></header><div id="brx-selected"></div><div class="brx-swatches" id="brx-palettes">'+palettes()+'</div><div class="brx-summary"><strong>محتويات المشهد</strong><div><span id="brx-qty">'+state.items.length+' قطع</span><span>السعر عند الطلب</span></div><p>لا تُحتسب أي قيمة شراء إلا من منتجات التجار المنشورة والمعتمدة في السوق.</p><button data-brx="export" class="brx-save-list">تنزيل قائمة العناصر</button><button data-brx="clear" class="brx-clear">إفراغ المساحة</button></div></aside></section>'+
 '<div class="brx-after"><div><h2>ابدأ من التصوّر، ثم انتقل إلى التنفيذ</h2><p>مجسمات قابلة للتعديل في مساحة حقيقية، مع انتقال آمن لاحقًا إلى المتاجر والخدمات المعتمدة.</p></div><a href="#section?category=furniture">استكشف قسم الأثاث ←</a></div></main>';
 document.title='استوديو التصميم ثلاثي الأبعاد | بيت الريف';
 create3D();refreshInspector();refreshSummary();state.chosen&&refreshSelection();
}
function listItems(filter='الكل',query=''){
 const items=ITEMS.filter(it=>(filter==='الكل'||it.cat===filter)&&(!query||it.ar.includes(query)||it.cat.includes(query)));
 return items.map(i=>'<article class="brx-product"><div class="brx-model-thumb" data-brx-thumb="'+i.id+'" aria-hidden="true">'+(brxThumbnailCache[i.id]?'<img alt="" loading="lazy" src="'+brxThumbnailCache[i.id]+'">':'')+'</div><div class="brx-product-text"><small>'+i.cat+' · '+i.dim+'</small><strong>'+i.ar+'</strong>'+moneyPlaceholder+'<button type="button" data-brx-add="'+i.id+'">+ إضافة للمساحة</button></div></article>').join('')||'<p class="brx-empty">لا توجد نتائج.</p>';
}
function palettes(){
 return Object.entries({fabric:'قماش الأثاث',wall:'دهان الجدران',floor:'ألوان الأرضية',wood:'الأخشاب',metal:'اللمسات المعدنية'}).map(([key,label])=>'<div class="brx-palette"><label>'+label+'</label><div>'+COLORS[key].map(color=>'<button class="brx-swatch'+(state[key]===color?' active':'')+'" style="background:'+color+'" data-brx-color="'+key+'" data-hex="'+color+'" aria-label="'+label+' '+color+'" title="'+color+'"></button>').join('')+'</div></div>').join('');
}
function refreshInspector(){
 const item=state.items.find(x=>x.uid===state.chosen),it=ITEMS.find(x=>x.id===item?.type),el=document.querySelector('#brx-selected');if(!el)return;
 el.innerHTML=it?'<div class="brx-chosen"><span>'+it.icon+'</span><div><small>القطعة المحددة</small><strong>'+it.ar+'</strong><small>'+it.dim+'</small></div></div><div class="brx-ops"><label>دوران ثلاثي الأبعاد</label><div><button data-brx="rotleft">↶ 15°</button><button data-brx="rotright">↷ 15°</button></div><label>حجم القطعة</label><div><button data-brx="smaller">− تصغير</button><button data-brx="bigger">+ تكبير</button></div><div><button data-brx="duplicate">نسخ</button><button class="brx-danger" data-brx="delete">حذف</button></div></div>':'<div class="brx-selecthint">اضغط على قطعة داخل الغرفة لتدويرها وتغيير حجمها وتفاصيلها.</div>';
}
function refreshSummary(){let e=document.querySelector('#brx-qty');if(e)e.textContent=state.items.length+' قطع';for(const cmd of ['undo','redo']){let b=document.querySelector('#brx-'+cmd);if(b)b.disabled=cmd==='undo'?!past.length:!future.length}}
function refreshSelection(){if(!objects.size)return;for(const [id,obj] of objects){obj.traverse(c=>{if(c.isMesh)c.userData.selected=id===state.chosen})}}
function mutate(fn){push();fn();save();refreshInspector();refreshSummary();rebuild();refreshSelection();refreshPalettes();setTimeout(renderThumbnails,120)}
function refreshPalettes(){const el=document.querySelector('#brx-palettes');if(el)el.innerHTML=palettes()}
let uidseq=0;
function handleClick(e){
 const color=e.target.closest('[data-brx-color]');if(color){mutate(()=>{state[color.dataset.brxColor]=color.dataset.hex});return}
 const add=e.target.closest('[data-brx-add]');if(add){if(state.items.length>=30)return;mutate(()=>{let id='b'+Date.now()+'-'+(++uidseq);state.items.push({uid:id,type:add.dataset.brxAdd,x:(Math.random()-.5)*2,z:(Math.random()-.5)*2,rot:0,scale:1});state.chosen=id});return}
 const btn=e.target.closest('[data-brx]');if(btn){
 const action=btn.dataset.brx,selected=state.items.find(x=>x.uid===state.chosen);
 if(action==='save'){save();btn.textContent='تم حفظ التصميم ✓';return}
 if(action==='undo'){if(!past.length)return;future.push(JSON.stringify(state));state=JSON.parse(past.pop());save();rebuild();refreshInspector();refreshSummary();refreshPalettes();return}
 if(action==='redo'){if(!future.length)return;past.push(JSON.stringify(state));state=JSON.parse(future.pop());save();rebuild();refreshInspector();refreshSummary();refreshPalettes();return}
 if(action==='reset-camera'){yaw=.49;pitch=.42;radius=9.1;cameraUpdate();return}
 if(action==='capture'){try{const a=document.createElement('a');a.download='biet-alreef-studio.png';a.href=renderer.domElement.toDataURL('image/png');a.click()}catch{}return}
 if(action==='export'){const rows=['القطعة,النوع,المقاسات,الحالة',...state.items.map(x=>{let v=ITEMS.find(i=>i.id===x.type);return [v.ar,v.cat,v.dim,'للتصميم فقط - السعر عند الطلب'].join(',')})];let a=document.createElement('a'),blob=new Blob(['\uFEFF'+rows.join('\r\n')],{type:'text/csv;charset=utf-8'});a.href=URL.createObjectURL(blob);a.download='biet-alreef-design-items.csv';a.click();URL.revokeObjectURL(a.href);return}
 if(action==='clear'){mutate(()=>{state.items=[];state.chosen=null});return}
 if(!selected)return;
 mutate(()=>{if(action==='rotleft')selected.rot-=Math.PI/12;if(action==='rotright')selected.rot+=Math.PI/12;if(action==='smaller')selected.scale=Math.max(.55,selected.scale-.1);if(action==='bigger')selected.scale=Math.min(1.7,selected.scale+.1);if(action==='delete'){state.items=state.items.filter(x=>x.uid!==selected.uid);state.chosen=null}if(action==='duplicate'&&state.items.length<30){let u='b'+Date.now()+'-'+(++uidseq);state.items.push({...selected,uid:u,x:Math.min(3,selected.x+.3)});state.chosen=u}});
 }
 const cat=e.target.closest('[data-brx-cat]');if(cat){document.querySelectorAll('[data-brx-cat]').forEach(x=>x.classList.toggle('active',x===cat));document.querySelector('#brx-list').innerHTML=listItems(cat.dataset.brxCat,document.querySelector('#brx-search')?.value?.trim()||'')}
}
function destroy(){
 if(resize){resize.disconnect();resize=null}
 if(raf){cancelAnimationFrame(raf);raf=0}
 if(renderer){renderer.dispose();renderer.domElement.remove();renderer=null}
 objects.clear();scene=null;camera=null;room=null;furniture=null;drag=null;
}

let brxThumbnailCache={};
function renderThumbnails(){
 if(!renderer||!scene)return;
 const W=144,H=144,target=new T.WebGLRenderTarget(W,H,{format:T.RGBAFormat,type:T.UnsignedByteType});
 const oldTarget=renderer.getRenderTarget(),oldClear=new T.Color();renderer.getClearColor(oldClear);const oldAlpha=renderer.getClearAlpha();
 const thumbScene=new T.Scene();thumbScene.background=null;
 thumbScene.add(new T.AmbientLight('#ffffff',2.2));
 const L=new T.DirectionalLight('#fff7e9',2.8);L.position.set(3,6,5);thumbScene.add(L);
 const cam=new T.PerspectiveCamera(37,1,.1,100),c=document.createElement('canvas');c.width=W;c.height=H;const ctx=c.getContext('2d');
 const pix=new Uint8Array(W*H*4);
 for(const meta of ITEMS){
   let g=model(meta.id);thumbScene.add(g);g.updateMatrixWorld(true);
   const bb=new T.Box3().setFromObject(g),size=new T.Vector3(),center=new T.Vector3();bb.getSize(size);bb.getCenter(center);
   const r=Math.max(size.x,size.y,size.z,.9);
   cam.position.set(center.x+r*1.5,center.y+r*1.2,center.z+r*2.45);cam.lookAt(center);
   renderer.setRenderTarget(target);renderer.setClearColor('#ffffff',0);renderer.setViewport(0,0,W,H);renderer.clear();renderer.render(thumbScene,cam);
   renderer.readRenderTargetPixels(target,0,0,W,H,pix);
   const im=ctx.createImageData(W,H);
   for(let y=0;y<H;y++)for(let x=0;x<W;x++){let si=((H-1-y)*W+x)*4,di=(y*W+x)*4;im.data[di]=pix[si];im.data[di+1]=pix[si+1];im.data[di+2]=pix[si+2];im.data[di+3]=pix[si+3]}
   ctx.putImageData(im,0,0);brxThumbnailCache[meta.id]=c.toDataURL('image/webp',.78);thumbScene.remove(g);
 }
 renderer.setRenderTarget(oldTarget);renderer.setViewport(0,0,Math.max(1,renderer.domElement.clientWidth),Math.max(1,renderer.domElement.clientHeight));renderer.setScissorTest(false);renderer.setClearColor(oldClear,oldAlpha);target.dispose();
 document.querySelectorAll('[data-brx-thumb]').forEach(el=>{let src=brxThumbnailCache[el.dataset.brxThumb];if(src)el.innerHTML='<img alt="" loading="lazy" src="'+src+'">'});
}

function route(){const active=window.marketLocation.hash.split('?')[0]==='#studio';const root=document.querySelector('#content');if(!root)return;
 if(!active){if(renderer)destroy();return}
 if(!root.querySelector('#'+ID))renderApp();
}
document.addEventListener('click',handleClick);
document.addEventListener('input',e=>{if(e.target.id==='brx-search'){const category=document.querySelector('[data-brx-cat].active')?.dataset.brxCat||'الكل';document.querySelector('#brx-list').innerHTML=listItems(category,e.target.value.trim())}});
window.addEventListener('hashchange',()=>requestAnimationFrame(route));
const mount=document.querySelector('#content');if(mount)new MutationObserver(()=>{if(window.marketLocation.hash.split('?')[0]==='#studio'&&!document.querySelector('#'+ID))queueMicrotask(route)}).observe(mount,{childList:true});
route();

window.addEventListener('brx-camera-control',e=>{if(!camera)return;const d=e.detail||{};if(d.view==='front'){yaw=0;pitch=.26;radius=8.8}else if(d.view==='iso'){yaw=.49;pitch=.42;radius=9.1}else if(d.view==='top'){yaw=.1;pitch=1.35;radius=8.5}if(Number.isFinite(d.zoom))radius=Math.max(5.2,Math.min(17,radius+d.zoom));cameraUpdate()});
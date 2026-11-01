
/* Biet Al Reef Studio v4 — original procedural 3D furniture. Three.js MIT (threejs.org). */
import * as T from '/three.module.min.js';
const ID='brx-studio',GENERAL_KEY='brx-studio-uae-v4';
let KEY=GENERAL_KEY,merchant=null;
const lang=(ar,en)=>merchant&&document.documentElement.lang.startsWith('en')?en:ar;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const COLORS={
 wall:['#e8dcc9','#f5f2e9','#c2ad95','#a6aaa0','#ead6c4','#dde1d5'],
 floor:['#bf9b70','#e3c9a4','#94755b','#bfc0b9','#73594b'],
 fabric:['#647661','#d2bba3','#a2aba5','#b3a18e','#364d45','#9c7357','#e3d4b5'],
 wood:['#98714a','#c09b6e','#5a4130','#d3b58c'],
 metal:['#bd995d','#484a45','#ded8c9']
};
const GENERAL_ITEMS=[
{id:'sofa',ar:'أريكة الريف المعيارية',cat:'جلوس',dim:'240 × 94 × 82 سم',icon:'▰',foot:2.3,desc:'أريكة قابلة لتغيير القماش والتدوير بحرية'},
{id:'chair',ar:'كرسي واحة للاسترخاء',cat:'جلوس',dim:'86 × 80 × 92 سم',icon:'◫',foot:.85,desc:'كرسي بخامات خشبية ومقعد مريح'},
{id:'coffee',ar:'طاولة سُدرة الدائرية',cat:'طاولات',dim:'105 × 105 × 44 سم',icon:'◉',foot:1,desc:'طاولة مركزية بتشطيب خشبي فاخر'},
{id:'rug',ar:'سجادة رمل النسيجية',cat:'أرضيات',dim:'270 × 190 سم',icon:'▤',foot:2.7,desc:'نسيج دافئ ينسجم مع ألوان المكان'},
{id:'lamp',ar:'مصباح نور القوسي',cat:'إضاءة',dim:'52 × 52 × 172 سم',icon:'✦',foot:.6,desc:'إضاءة جانبية بلمسات معدنية'},
{id:'plant',ar:'نبات غافة للزينة',cat:'ديكور',dim:'45 × 45 × 125 سم',icon:'✿',foot:.6,desc:'تكوين أخضر مستوحى من الطبيعة'},
{id:'console',ar:'كونسول جذور',cat:'تخزين',dim:'160 × 42 × 80 سم',icon:'▥',foot:1.6,desc:'وحدة تخزين بخطوط بسيطة وخامات خشبية'},
{id:'ottoman',ar:'مقعد وثير',cat:'جلوس',dim:'70 × 70 × 44 سم',icon:'◈',foot:.7,desc:'مقعد إضافي يدعم تنويع الجلسة'}
];
let ITEMS=GENERAL_ITEMS;
const DEFAULT=[
 {uid:'g1',type:'rug',x:0,z:.72,rot:0,scale:1},
 {uid:'g2',type:'sofa',x:0,z:-.98,rot:0,scale:1},
 {uid:'g3',type:'coffee',x:0,z:.4,rot:0,scale:1},
 {uid:'g4',type:'chair',x:2.1,z:.05,rot:-.48,scale:1},
 {uid:'g5',type:'lamp',x:-2.3,z:-.3,rot:0,scale:1},
 {uid:'g6',type:'plant',x:2.65,z:-1.65,rot:0,scale:1}
];
const clone=a=>JSON.parse(JSON.stringify(a));
let state;
function configureContext(config){
 merchant=config;KEY=config?'brx-studio-merchant-'+config.slug:GENERAL_KEY;
 ITEMS=config?config.items.map(x=>({...x,ar:String(x.ar||''),en:String(x.en||''),cat:lang('منتجات المتجر','Store products'),dim:lang('عرض التصميم','Design view'),icon:'▧'})):GENERAL_ITEMS;
 const featured=config?.items.find(i=>i.model==='wooden-kitchen')||config?.items[0];
 const initial=config?(featured?[{uid:'merchant-featured',type:featured.id,x:config.slug==='arkleen'?-.5:-1.2,z:config.slug==='arkleen'?-.45:-1.55,rot:0,scale:1}]:[]):clone(DEFAULT);
 const cleanTheme=config?.slug==='arkleen';
 state={items:initial,chosen:config?(featured?'merchant-featured':null):'g2',wall:cleanTheme?'#ffffff':COLORS.wall[0],floor:cleanTheme?'#ffffff':COLORS.floor[0],fabric:COLORS.fabric[0],wood:COLORS.wood[0],metal:COLORS.metal[0]};past=[];future=[];
 try{const s=JSON.parse(localStorage.getItem(KEY)||'null');if(s&&Array.isArray(s.items)&&s.items.length<=35&&s.items.every(x=>ITEMS.some(i=>i.id===x.type))){state={...state,...s,items:s.items.map(x=>({...x,x:Math.max(-3,Math.min(3,Number(x.x)||0)),z:Math.max(-2.3,Math.min(2.8,Number(x.z)||0)),scale:Math.max(.55,Math.min(1.7,Number(x.scale)||1))}))};if(cleanTheme&&!s.arkleenTheme){if(s.wall===COLORS.wall[0])state.wall='#ffffff';if(s.floor===COLORS.floor[0])state.floor='#ffffff'}}}catch{}
 if(cleanTheme){state.arkleenTheme=2;state.items.forEach(item=>{if(isWallDoor(item))placeWallDoor(item,item.x,item.z);else fitArkleenItem(item,item.x,item.z)})}
}
const isArkleen=()=>merchant?.slug==='arkleen';
function isWallDoor(item){return isArkleen()&&ITEMS.find(x=>x.id===item.type)?.model==='wooden-door'}
function placeWallDoor(item,x,z,wall){
 const side=wall||((Math.abs(z+2)<=Math.abs(x+2))?'back':'left');
 item.wall=side;item.scale=1;
 if(side==='back'){item.x=Math.max(-1.35,Math.min(1.35,x));item.z=-1.96;item.rot=0}
 else{item.x=-1.96;item.z=Math.max(-1.35,Math.min(1.35,z));item.rot=Math.PI/2}
}
function fitArkleenItem(item,x,z){
 const [w,d]=planFootprint({...item,scale:1}),angle=item.rot||0,c=Math.abs(Math.cos(angle)),s=Math.abs(Math.sin(angle));
 const width=w*c+d*s,depth=w*s+d*c;item.scale=Math.min(item.scale||1,1.7,3.8/width,3.8/depth);
 const limitX=Math.max(0,2-width*item.scale/2),limitZ=Math.max(0,2-depth*item.scale/2);
 item.x=Math.max(-limitX,Math.min(limitX,x));item.z=Math.max(-limitZ,Math.min(limitZ,z));
}
let past=[],future=[],renderer=null,scene=null,camera=null,perspectiveCamera=null,planCamera=null,planFallback=null,viewMode='3d',room=null,furniture=null,objects=new Map(),raf=0,resize=null,running=false;
let yaw=.49,pitch=.42,radius=9.1,drag=null,material={};
const hex=s=>new T.Color(s);
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(state))}catch{}};
function push(){past.push(JSON.stringify(state));if(past.length>45)past.shift();future=[]}
function mat(color,rough=.75,metal=0){return new T.MeshStandardMaterial({color,roughness:rough,metalness:metal})}
function box(group,x,y,z,w,h,d,m,cast=true){const mesh=new T.Mesh(new T.BoxGeometry(w,h,d),m);mesh.position.set(x,y,z);mesh.castShadow=cast;mesh.receiveShadow=true;group.add(mesh);return mesh}
function cyl(g,x,y,z,rt,rb,h,m,n=24){let q=new T.Mesh(new T.CylinderGeometry(rt,rb,h,n),m);q.position.set(x,y,z);q.castShadow=true;q.receiveShadow=true;g.add(q);return q}
function ball(g,x,y,z,rx,ry,rz,m){const q=new T.Mesh(new T.SphereGeometry(1,18,12),m);q.scale.set(rx,ry,rz);q.position.set(x,y,z);q.castShadow=true;g.add(q);return q}
function model(type){
 type=ITEMS.find(x=>x.id===type)?.model||type;
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
 }else if(type==='wooden-kitchen'){
  const stone=mat('#ebe3d6',.55),glass=mat('#242321',.24,.28),edge=mat('#bd995d',.3,.65);
  // Tall oven column and the main run of oak base cabinets.
  box(g,-1.23,1.17,-.18,.64,2.34,.66,w);box(g,-1.23,1.18,.158,.54,1.10,.025,glass);
  for(const y of [.78,1.3]){box(g,-1.23,y,.18,.48,.36,.025,glass);box(g,-1.23,y+.12,.198,.31,.012,.012,edge)}
  box(g,-.08,.44,-.18,1.66,.84,.60,w);box(g,-.08,.88,-.17,1.72,.065,.66,stone);
  for(const x of [-.62,-.08,.46]){box(g,x,.46,.135,.50,.68,.018,w);box(g,x,.70,.151,.30,.018,.015,edge);for(const y of [.18,.53])box(g,x,y,.15,.46,.009,.012,edge,false)}
  // Light upper doors and open shelving follow the product's visual identity.
  box(g,-.08,1.98,-.30,1.72,.77,.30,w);
  for(const x of [-.61,-.08,.45]){box(g,x,1.98,-.133,.50,.69,.022,iv);cyl(g,x+.19,1.75,-.114,.018,.018,.028,edge,12).rotation.x=Math.PI/2}
  box(g,.91,1.98,-.29,.25,.77,.31,w);for(const y of [1.75,2.00,2.25])box(g,.91,y,-.12,.23,.025,.32,stone,false);
  // Counter, sink and a low island use the same scene and material controls.
  box(g,.70,.44,.35,.66,.84,1.36,w);box(g,.70,.88,.35,.72,.065,1.42,stone);
  box(g,.70,.917,-.02,.39,.018,.33,glass,false);box(g,.70,.93,-.02,.31,.012,.24,stone,false);
  cyl(g,.73,1.04,-.20,.018,.018,.25,edge,12);box(g,.73,1.17,-.12,.035,.035,.20,edge);
  box(g,.25,.44,1.02,1.15,.84,.55,w);box(g,.25,.89,1.02,1.22,.07,.61,stone);box(g,.84,.43,1.02,.055,.86,.61,stone);
 }else if(type==='wooden-wardrobe'){
  const walnut=mat('#513724',.7),edge=mat('#ba9456',.3,.65),warmLight=new T.MeshBasicMaterial({color:'#ffe4aa'});
  // Four pale fronts flank a genuinely open, walnut-lined hanging bay.
  box(g,0,1.15,-.29,2.50,2.30,.055,walnut);
  for(const x of [-1.23,-.30,.30,1.23])box(g,x,1.15,0,.045,2.30,.63,w);
  box(g,0,2.31,0,2.54,.075,.67,w);box(g,0,.045,0,2.54,.09,.67,w);
  for(const x of [-.985,-.525,.525,.985]){
   box(g,x,1.16,.30,.45,2.12,.028,iv);
   const inner=x<0?x+.16:x-.16;box(g,inner,1.08,.324,.018,.82,.025,edge);
  }
  for(const y of [.18,.78,1.95,2.18])box(g,0,y,0,.57,.035,.62,w);
  for(const y of [1.93,2.16])box(g,0,y,.23,.49,.012,.025,warmLight,false);
  const rail=cyl(g,0,1.82,.04,.013,.013,.49,edge,16);rail.rotation.z=Math.PI/2;
  const clothColors=['#c9bbae','#eee8df','#b7a89a','#ded2c2'];
  for(let i=0;i<4;i++){
   const x=-.17+i*.11,shape=new T.Shape();shape.moveTo(-.065,0);shape.lineTo(-.075,.42);shape.lineTo(-.095,.48);shape.lineTo(-.045,.54);shape.lineTo(.045,.54);shape.lineTo(.095,.48);shape.lineTo(.075,.42);shape.lineTo(.065,0);shape.closePath();
   const shirt=new T.Mesh(new T.ExtrudeGeometry(shape,{depth:.016,bevelEnabled:false}),mat(clothColors[i],.95));shirt.position.set(x,1.03,.12+i*.015);shirt.castShadow=true;g.add(shirt);
   const hanger=box(g,x,1.78,.10,.12,.012,.018,edge,false);hanger.rotation.z=i%2?.10:-.10;
  }
  for(const y of [.29,.47,.65]){box(g,0,y,.27,.55,.16,.035,w);box(g,0,y+.015,.295,.16,.014,.014,edge)}
  box(g,0,.13,.10,.45,.06,.28,walnut);
 }else if(type==='wooden-door'){
  const doorWood=mat('#75543c',.62),groove=mat('#523b2b',.7),edge=mat('#bd995d',.3,.65);
  for(const x of [-.545,.545])box(g,x,1.13,0,.11,2.26,.18,doorWood);box(g,0,2.24,0,1.2,.12,.18,doorWood);
  const leaf=new T.Group();leaf.position.set(-.49,0,.03);leaf.rotation.y=-.24;g.add(leaf);box(leaf,.47,1.10,0,.94,2.14,.075,doorWood);
  for(const y of [.52,1.08,1.68])box(leaf,.47,y,.041,.78,.009,.008,groove,false);
  for(const x of [.19,.73])box(leaf,x,1.1,.041,.009,1.86,.008,groove,false);
  box(leaf,.73,1.01,.075,.15,.022,.035,edge);box(leaf,.78,1.01,.065,.025,.10,.025,edge);
 }else if(type==='ottoman'){
  cyl(g,0,.25,0,.36,.33,.38,f,30);cyl(g,0,.45,0,.37,.37,.1,iv,30);
 }
 return g;
}
function roomBuild(){
 if(isArkleen()){
  const g=new T.Group(),floor=box(g,0,-.095,0,4,.18,4,mat(state.floor),false);floor.receiveShadow=true;
  const walls=new T.Group();walls.name='arkleen-walls';g.add(walls);room=g;scene.add(g);updateArkleenWalls();return;
 }
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
function updateArkleenWalls(){
 const walls=room?.getObjectByName('arkleen-walls');if(!walls)return;
 while(walls.children.length){const child=walls.children[0];walls.remove(child);child.geometry?.dispose();child.material?.dispose()}
 for(const side of ['back','left']){
  const gaps=state.items.filter(x=>isWallDoor(x)&&x.wall===side).map(x=>{const center=side==='back'?x.x:x.z;return [Math.max(-2,center-.62),Math.min(2,center+.62)]}).sort((a,b)=>a[0]-b[0]);
  const merged=[];for(const gap of gaps){const last=merged[merged.length-1];if(last&&gap[0]<=last[1])last[1]=Math.max(last[1],gap[1]);else merged.push([...gap])}
  const wallPiece=(start,end,bottom,top,header=false)=>{if(end-start<.001)return;const center=(start+end)/2,length=end-start,height=top-bottom,y=(bottom+top)/2;const material=mat(state.wall),piece=side==='back'?box(walls,center,y,-1.96,length,height,.12,material,false):box(walls,-1.96,y,center,.12,height,length,material,false);piece.userData.doorHeader=header;if(header&&viewMode==='2d')piece.visible=false};
  let cursor=-2;for(const [start,end] of merged){wallPiece(cursor,start,0,3);wallPiece(start,end,2.32,3,true);cursor=end}wallPiece(cursor,2,0,3);
 }
}
function create3D(){
 if(renderer||planFallback)return;
 const mount=document.querySelector('#brx-viewport');if(!mount)return;
 try{
 renderer=new T.WebGLRenderer({antialias:true,alpha:false,preserveDrawingBuffer:true,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.8));
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
 renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
 mount.append(renderer.domElement);
 scene=new T.Scene();scene.background=hex(merchant?.slug==='arkleen'?'#f8fafc':'#ebe1d2');
 perspectiveCamera=new T.PerspectiveCamera(42,1,.1,100);
 planCamera=new T.OrthographicCamera(-4,4,4,-4,.1,100);planCamera.position.set(0,14,0);planCamera.up.set(0,0,-1);planCamera.lookAt(0,0,0);
 viewMode='3d';camera=perspectiveCamera;
 scene.add(new T.HemisphereLight('#fff9ec','#c2aa8c',2.2));
 const key=new T.DirectionalLight('#fff5e6',3.2);key.position.set(2.4,6,4.8);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-8;key.shadow.camera.right=8;key.shadow.camera.top=8;key.shadow.camera.bottom=-8;scene.add(key);
 const fill=new T.DirectionalLight('#dfece8',1.1);fill.position.set(-3,3,-1);scene.add(fill);
 furniture=new T.Group();scene.add(furniture);
 rebuild();
 const resizeFn=()=>{if(!renderer)return;const rect=mount.getBoundingClientRect();if(rect.width<10||rect.height<10)return;renderer.setSize(rect.width,rect.height,false);const aspect=rect.width/rect.height;perspectiveCamera.aspect=aspect;perspectiveCamera.updateProjectionMatrix();const halfHeight=Math.max(3.7,3.8/aspect);planCamera.left=-halfHeight*aspect;planCamera.right=halfHeight*aspect;planCamera.top=halfHeight;planCamera.bottom=-halfHeight;planCamera.updateProjectionMatrix();updateMeasurements()};
 resize=new ResizeObserver(resizeFn);resize.observe(mount);resizeFn();cameraUpdate();setTimeout(renderThumbnails,380);
 const loop=()=>{if(!renderer)return;renderer.render(scene,camera);raf=requestAnimationFrame(loop)};loop();
 renderer.domElement.addEventListener('pointerdown',startPointer);
 renderer.domElement.addEventListener('pointermove',movePointer);
 renderer.domElement.addEventListener('pointerup',endPointer);
 renderer.domElement.addEventListener('pointercancel',endPointer);
 renderer.domElement.addEventListener('wheel',e=>{e.preventDefault();if(viewMode==='2d'){planCamera.zoom=Math.min(3,Math.max(.75,planCamera.zoom*(e.deltaY>0?.9:1.1)));planCamera.updateProjectionMatrix()}else{radius=Math.min(18,Math.max(5.5,radius+Math.sign(e.deltaY)*.75));cameraUpdate()}},{passive:false});
 document.querySelector('#brx-error').hidden=true;
 }catch(e){
  if(renderer){renderer.dispose();renderer.domElement.remove();renderer=null}
  scene=null;camera=null;perspectiveCamera=null;planCamera=null;
  console.error('Biet Al Reef WebGL:',e);if(merchant)createPlanFallback(mount);else document.querySelector('#brx-error').hidden=false;
 }
}
// Dimensions describe the current model geometry. Gaps are measured to the
// opening edges (1.24 m), not to the slightly narrower 1.20 m door frame.
function wallDoorMeasurements(item){
 const center=item.wall==='left'?item.z:item.x;
 return {before:Math.max(0,center+2-.62),after:Math.max(0,2-center-.62),opening:1.24,width:1.2,height:2.3};
}
function updateMeasurements(){
 if(!isArkleen()||!state)return;
 const viewport=document.querySelector('#brx-viewport'),svg=viewport?.querySelector('.brx-dimension-lines'),summary=document.querySelector('#brx-dimension-summary');if(!viewport||!svg||!summary)return;
 const selected=state.items.find(x=>x.uid===state.chosen&&isWallDoor(x)),door=selected||state.items.find(isWallDoor),m=door?wallDoorMeasurements(door):null;
 const fmt=v=>new Intl.NumberFormat(document.documentElement.lang.startsWith('en')?'en':'ar',{minimumFractionDigits:2,maximumFractionDigits:2}).format(v);
 const room=lang('الحائط ٤٫٠٠ × ٣٫٠٠ م','Wall 4.00 × 3.00 m');
 const text=m?room+'  |  '+lang('الباب ','Door ')+fmt(m.width)+' × '+fmt(m.height)+lang(' م',' m')+'  |  '+lang('من بداية الحائط ','From wall start ')+fmt(m.before)+lang(' م',' m')+'  |  '+lang('إلى نهايته ','To wall end ')+fmt(m.after)+lang(' م',' m'):room;
 if(summary.textContent!==text)summary.textContent=text;
 const rect=viewport.getBoundingClientRect(),w=rect.width,h=rect.height;if(w<10||h<10)return;
 svg.setAttribute('viewBox','0 0 '+w+' '+h);
 const point=(x,y,z)=>{if(planFallback)return {x:planFallback.ox+x*planFallback.unit,y:planFallback.oy+z*planFallback.unit};if(!camera)return null;const v=new T.Vector3(x,y,z).project(camera);return {x:(v.x+1)*w/2,y:(1-v.y)*h/2}};
 if(camera)camera.updateMatrixWorld();
 const plan=viewMode==='2d',top=plan?-2.20:-1.96,height=plan?0:3.15;
 const line=(a,b,label)=>{if(!a||!b||![a.x,a.y,b.x,b.y].every(Number.isFinite))return '';const x=(a.x+b.x)/2,y=(a.y+b.y)/2;return '<line x1="'+a.x.toFixed(1)+'" y1="'+a.y.toFixed(1)+'" x2="'+b.x.toFixed(1)+'" y2="'+b.y.toFixed(1)+'"/><circle cx="'+a.x.toFixed(1)+'" cy="'+a.y.toFixed(1)+'" r="2"/><circle cx="'+b.x.toFixed(1)+'" cy="'+b.y.toFixed(1)+'" r="2"/><text x="'+x.toFixed(1)+'" y="'+(y-5).toFixed(1)+'">'+label+'</text>'};
 let markup=line(point(-2,height,top),point(2,height,top),lang('٤ م','4 m'));
 markup+=line(point(top,height,-2),point(top,height,2),lang('٤ م','4 m'));
 if(!plan)markup+=line(point(2.10,0,-1.96),point(2.10,3,-1.96),lang('٣ م','3 m'));
 if(m){const c=door.wall==='left'?door.z:door.x,level=plan?0:2.46,depth=plan?-2.04:-1.88;
  const a=door.wall==='left'?point(depth,level,c-.6):point(c-.6,level,depth),b=door.wall==='left'?point(depth,level,c+.6):point(c+.6,level,depth);
  markup+=line(a,b,lang('الباب ','Door ')+fmt(m.width)+lang(' م',' m'));
 }
 svg.innerHTML=markup;
}
function cameraUpdate(){if(!perspectiveCamera)return;perspectiveCamera.position.set(radius*Math.sin(yaw)*Math.cos(pitch),radius*Math.sin(pitch),radius*Math.cos(yaw)*Math.cos(pitch));perspectiveCamera.lookAt(0,1.0,0);updateMeasurements()}
function setViewMode(mode){
 if(planFallback){viewMode='2d';document.querySelectorAll('[data-brx-view]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.brxView==='2d')));const label=document.querySelector('[data-brx-view-status]');if(label)label.textContent=lang('عرض ثنائي الأبعاد','2D view');drawPlanFallback();updateMeasurements();return}
 if(!perspectiveCamera||!planCamera)return;
 viewMode=mode==='2d'?'2d':'3d';camera=viewMode==='2d'?planCamera:perspectiveCamera;
 if(isArkleen())room?.getObjectByName('arkleen-walls')?.traverse(x=>{if(x.userData.doorHeader)x.visible=viewMode!=='2d'});
 document.querySelectorAll('[data-brx-view]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.brxView===viewMode)));
 const label=document.querySelector('[data-brx-view-status]');if(label)label.textContent=viewMode==='2d'?lang('عرض ثنائي الأبعاد','2D view'):lang('عرض ثلاثي الأبعاد','3D view');
 const tip=document.querySelector('#brx-viewport .brx-canvas-tip');if(tip)tip.textContent=viewMode==='2d'?lang('اسحب المنتجات لترتيبها في التصميم','Drag products to arrange your design'):lang('اسحب القطع لتحريكها • اسحب الخلفية لتدوير المشهد','Drag a piece to move it • Drag the background to rotate');
 updateMeasurements();
}
// A usable plan view remains available on devices where WebGL cannot start.
function createPlanFallback(mount){
 const canvas=document.createElement('canvas');canvas.className='brx-plan-canvas';canvas.tabIndex=0;canvas.setAttribute('role','img');canvas.setAttribute('aria-label',lang('مساحة التصميم ثنائية الأبعاد، استخدم الأسهم لتحريك القطعة المحددة','2D design space, use arrow keys to move the selected piece'));mount.append(canvas);
 const ctx=canvas.getContext('2d');if(!ctx){document.querySelector('#brx-error').hidden=false;return}
 planFallback={canvas,ctx,unit:1,ox:0,oy:0,active:null};
 const error=document.querySelector('#brx-error');if(error)error.hidden=true;
 const three=document.querySelector('[data-brx-view="3d"]');if(three){three.disabled=true;three.title=lang('العرض ثلاثي الأبعاد غير متاح على هذا الجهاز','3D view is unavailable on this device')}
 const tip=document.querySelector('#brx-viewport .brx-canvas-tip');if(tip)tip.textContent=lang('اسحب القطع لترتيبها في المساحة','Drag pieces to arrange your space');
 function point(e){const rect=canvas.getBoundingClientRect();return {x:(e.clientX-rect.left-planFallback.ox)/planFallback.unit,z:(e.clientY-rect.top-planFallback.oy)/planFallback.unit}}
 canvas.addEventListener('pointerdown',e=>{const p=point(e);let best=null;for(const item of [...state.items].reverse()){const [w,d]=planFootprint(item);const dx=p.x-item.x,dz=p.z-item.z,a=item.rot||0;const x=dx*Math.cos(a)-dz*Math.sin(a),z=dx*Math.sin(a)+dz*Math.cos(a);if(Math.abs(x)<=w/2+.12&&Math.abs(z)<=d/2+.12){best=item;break}}if(!best)return;planFallback.active={id:best.uid,point:p,x:best.x,z:best.z,before:JSON.stringify(state),moved:false};state.chosen=best.uid;canvas.setPointerCapture?.(e.pointerId);refreshInspector();drawPlanFallback();updateMeasurements()});
 canvas.addEventListener('pointermove',e=>{const drag=planFallback?.active;if(!drag)return;const item=state.items.find(x=>x.uid===drag.id);if(!item)return;const p=point(e),x=drag.x+p.x-drag.point.x,z=drag.z+p.z-drag.point.z;if(isWallDoor(item))placeWallDoor(item,x,z);else if(isArkleen())fitArkleenItem(item,x,z);else{item.x=Math.max(-3,Math.min(3,x));item.z=Math.max(-2.4,Math.min(2.7,z))}drag.moved=true;update3D()});
 const finish=()=>{const drag=planFallback?.active;if(drag?.moved){past.push(drag.before);future=[];save();refreshSummary()}if(planFallback)planFallback.active=null};
 canvas.addEventListener('pointerup',finish);canvas.addEventListener('pointercancel',finish);
 canvas.addEventListener('keydown',e=>{const move={ArrowLeft:[-.1,0],ArrowRight:[.1,0],ArrowUp:[0,-.1],ArrowDown:[0,.1]}[e.key],item=state.items.find(x=>x.uid===state.chosen);if(!move||!item)return;e.preventDefault();push();if(isWallDoor(item))placeWallDoor(item,item.x+move[0],item.z+move[1],item.wall);else if(isArkleen())fitArkleenItem(item,item.x+move[0],item.z+move[1]);else{item.x=Math.max(-3,Math.min(3,item.x+move[0]));item.z=Math.max(-2.4,Math.min(2.7,item.z+move[1]))}save();update3D();refreshSummary()});
 resize=new ResizeObserver(drawPlanFallback);resize.observe(mount);setViewMode('2d');
}
function planFootprint(item){
 const type=ITEMS.find(x=>x.id===item.type)?.model||item.type;
 const sizes={'wooden-kitchen':[2.8,1.8],'wooden-wardrobe':[2.55,.72],'wooden-door':isArkleen()?[1.2,.36]:[1.2,.8]};
 const size=sizes[type]||[1,.8],scale=item.scale||1;return [size[0]*scale,size[1]*scale];
}
function drawPlanFallback(){
 if(!planFallback)return;const {canvas,ctx}=planFallback,rect=canvas.getBoundingClientRect();if(rect.width<10||rect.height<10)return;
 const ratio=Math.min(window.devicePixelRatio||1,2),w=rect.width,h=rect.height;canvas.width=Math.round(w*ratio);canvas.height=Math.round(h*ratio);ctx.setTransform(ratio,0,0,ratio,0,0);
 ctx.fillStyle=isArkleen()?'#f8fafc':'#f8f4ed';ctx.fillRect(0,0,w,h);const roomWidth=isArkleen()?4:7,roomDepth=isArkleen()?4:6,unit=Math.min((w-58)/(roomWidth+.5),(h-58)/(roomDepth+.5)),ox=w/2,oy=h/2;Object.assign(planFallback,{unit,ox,oy});
 ctx.fillStyle=state.floor||'#e9d7bd';ctx.fillRect(ox-roomWidth/2*unit,oy-roomDepth/2*unit,roomWidth*unit,roomDepth*unit);ctx.fillStyle=isArkleen()?'rgba(255,255,255,.55)':'rgba(255,252,247,.76)';ctx.fillRect(ox-roomWidth/2*unit,oy-roomDepth/2*unit,roomWidth*unit,roomDepth*unit);ctx.strokeStyle=isArkleen()?'#cbd5e1':'#d1bfaa';ctx.lineWidth=1.5;ctx.strokeRect(ox-roomWidth/2*unit,oy-roomDepth/2*unit,roomWidth*unit,roomDepth*unit);
 if(isArkleen()){
  ctx.fillStyle='#47627f';ctx.font='600 12px sans-serif';ctx.textAlign='center';ctx.fillText(lang('٤ م','4 m'),ox,oy-2*unit-12);ctx.save();ctx.translate(ox-2*unit-15,oy);ctx.rotate(-Math.PI/2);ctx.fillText(lang('٤ م','4 m'),0,0);ctx.restore();
  ctx.lineWidth=6;ctx.strokeStyle='#b7c5d6';for(const side of ['back','left']){let cursor=-2;const gaps=state.items.filter(x=>isWallDoor(x)&&x.wall===side).map(x=>{const c=side==='back'?x.x:x.z;return [Math.max(-2,c-.62),Math.min(2,c+.62)]}).sort((a,b)=>a[0]-b[0]);const line=(from,to)=>{if(to<=from)return;ctx.beginPath();if(side==='back'){ctx.moveTo(ox+from*unit,oy-1.96*unit);ctx.lineTo(ox+to*unit,oy-1.96*unit)}else{ctx.moveTo(ox-1.96*unit,oy+from*unit);ctx.lineTo(ox-1.96*unit,oy+to*unit)}ctx.stroke()};for(const [start,end] of gaps){line(cursor,start);cursor=Math.max(cursor,end)}line(cursor,2)}
 }
 for(const item of state.items){const [iw,id]=planFootprint(item),meta=ITEMS.find(x=>x.id===item.type),type=meta?.model||item.type;ctx.save();ctx.translate(ox+item.x*unit,oy+item.z*unit);ctx.rotate(-(item.rot||0));const left=-iw*unit/2,top=-id*unit/2,width=iw*unit,depth=id*unit;
  ctx.strokeStyle=item.uid===state.chosen?'#ad7e3e':'#806c58';ctx.lineWidth=item.uid===state.chosen?2.5:1.5;ctx.fillStyle=state.wood;
  if(type==='wooden-kitchen'){
   const run=depth*.30,side=width*.24;ctx.beginPath();ctx.roundRect(left,top,width,run,3);ctx.fill();ctx.stroke();ctx.beginPath();ctx.roundRect(left+width-side,top,side,depth*.72,3);ctx.fill();ctx.stroke();ctx.fillStyle='#f7f2e9';ctx.fillRect(left+3,top+3,width-6,run-6);ctx.strokeStyle='#5f554b';ctx.strokeRect(left+width*.27,top+run*.18,width*.2,run*.62);for(let i=0;i<4;i++){ctx.beginPath();ctx.arc(left+width*.31+(i%2)*width*.09,top+run*.34+Math.floor(i/2)*run*.3,Math.max(2,unit*.03),0,Math.PI*2);ctx.stroke()}ctx.strokeRect(left+width*.69,top+run*.2,width*.13,run*.55);ctx.fillStyle='#ded1bc';ctx.strokeStyle='#bba78f';ctx.beginPath();ctx.roundRect(left+width*.15,top+depth*.62,width*.46,depth*.25,3);ctx.fill();ctx.stroke();
  }else if(type==='wooden-wardrobe'){
   ctx.beginPath();ctx.roundRect(left,top,width,depth,3);ctx.fill();ctx.stroke();ctx.fillStyle='#f5f1eb';for(const start of [.025,.215,.595,.785])ctx.fillRect(left+width*start,top+4,width*.18,depth-8);ctx.fillStyle='#513724';ctx.fillRect(left+width*.405,top+4,width*.18,depth-8);ctx.strokeStyle='#d0aa69';ctx.lineWidth=Math.max(1,unit*.012);for(const pos of [.17,.25,.75,.83]){ctx.beginPath();ctx.moveTo(left+width*pos,top+depth*.28);ctx.lineTo(left+width*pos,top+depth*.72);ctx.stroke()}ctx.strokeStyle='#a98053';for(const pos of [.42,.58,.74]){ctx.beginPath();ctx.moveTo(left+width*.42,top+depth*pos);ctx.lineTo(left+width*.57,top+depth*pos);ctx.stroke()}
  }else if(isWallDoor(item)){
   ctx.fillStyle='#73513a';ctx.beginPath();ctx.roundRect(left,top,width,depth,3);ctx.fill();ctx.stroke();ctx.fillStyle='#9a7356';ctx.fillRect(left+width*.08,top+depth*.16,width*.84,depth*.68);ctx.strokeStyle='#5d4130';ctx.strokeRect(left+width*.12,top+depth*.22,width*.76,depth*.56);ctx.fillStyle='#d3a75b';ctx.beginPath();ctx.arc(left+width*.81,top+depth*.5,Math.max(2,unit*.025),0,Math.PI*2);ctx.fill();
  }else{
   ctx.fillRect(left,top,width*.12,depth);ctx.fillRect(left,top,width,Math.max(4,depth*.12));ctx.strokeRect(left,top,width,Math.max(4,depth*.12));ctx.strokeStyle='#aa8b67';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(left+width*.12,top+depth*.12,width*.72,0,Math.PI/2);ctx.stroke();ctx.beginPath();ctx.moveTo(left+width*.12,top+depth*.12);ctx.lineTo(left+width*.58,top+depth*.66);ctx.stroke();
  }
  ctx.restore()}
 updateMeasurements();
}
function rebuild(){
 if(!scene){drawPlanFallback();return}
 if(room){scene.remove(room);room.traverse(obj=>{if(obj.isMesh){obj.geometry?.dispose();obj.material?.dispose()}});room=null}
 if(furniture){while(furniture.children.length){const x=furniture.children[0];furniture.remove(x);x.traverse(obj=>{if(obj.isMesh){obj.geometry?.dispose();obj.material?.dispose()}})}}
 objects.clear();
 material={fabric:mat(state.fabric,.91),wood:mat(state.wood,.6),metal:mat(state.metal,.3,.65),ivory:mat('#e5dbcb'),green:mat('#496948'),rug:mat('#c4b49d'),pot:mat('#bdac96'),light:new T.MeshBasicMaterial({color:'#fff4c2'})};
 roomBuild();
 state.items.forEach(addGroup);
 if(viewMode==='2d')drawPlanFallback();
 updateMeasurements();
}
function addGroup(item){
 let group=model(item.type);group.userData.itemUid=item.uid;
 group.position.set(item.x,0,item.z);group.rotation.y=item.rot||0;group.scale.setScalar(item.scale||1);
 furniture.add(group);objects.set(item.uid,group)
}
function update3D(){if(planFallback&&viewMode==='2d')drawPlanFallback();if(isArkleen())updateArkleenWalls();updateMeasurements();if(!objects.size)return;for(const item of state.items){const o=objects.get(item.uid);if(o){o.position.set(item.x,0,item.z);o.rotation.y=item.rot||0;o.scale.setScalar(item.scale||1)}}}
const ray=new T.Raycaster(),mouse=new T.Vector2(),ground=new T.Plane(new T.Vector3(0,1,0),0);
function pick(event){let c=renderer.domElement.getBoundingClientRect();mouse.set((event.clientX-c.left)/c.width*2-1,-((event.clientY-c.top)/c.height*2-1));ray.setFromCamera(mouse,camera);let intersections=ray.intersectObjects([...objects.values()],true);const picked=intersections.find(x=>x.object.visible);if(!picked)return null;let o=picked.object;while(o&&!o.userData.itemUid)o=o.parent;return o?.userData.itemUid||null}
function floorIntersect(event){const box=renderer.domElement.getBoundingClientRect();mouse.set((event.clientX-box.left)/box.width*2-1,-((event.clientY-box.top)/box.height*2-1));ray.setFromCamera(mouse,camera);const out=new T.Vector3();return ray.ray.intersectPlane(ground,out)?out:null}
function startPointer(e){
 if(!renderer)return;const id=pick(e),point=floorIntersect(e);
 drag={pointer:e.pointerId,x:e.clientX,y:e.clientY,id,point,startItem:clone(state.items),before:JSON.stringify(state),yaw,pitch,moved:false};
 if(id){state.chosen=id;refreshInspector();refreshSelection();updateMeasurements()}
 renderer.domElement.setPointerCapture?.(e.pointerId);
}
function movePointer(e){
 if(!drag||drag.pointer!==e.pointerId)return;
 const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.abs(dx)+Math.abs(dy)>4)drag.moved=true;
 if(drag.id){const item=state.items.find(i=>i.uid===drag.id),initial=drag.startItem.find(i=>i.uid===drag.id);if(!item||!initial)return;
 const next=floorIntersect(e);
 if(next&&drag.point){const x=initial.x+next.x-drag.point.x,z=initial.z+next.z-drag.point.z;if(isWallDoor(item))placeWallDoor(item,x,z);else if(isArkleen())fitArkleenItem(item,x,z);else{item.x=Math.max(-3,Math.min(3,x));item.z=Math.max(-2.4,Math.min(2.7,z))}update3D();}
 }else if(viewMode==='3d'){yaw=drag.yaw-dx*.008;pitch=Math.max(.17,Math.min(.93,drag.pitch+dy*.006));cameraUpdate()}
}
function endPointer(e){if(!drag||drag.pointer!==e.pointerId)return;if(drag.moved&&drag.id){past.push(drag.before);future=[];save();refreshSummary()}drag=null}
const moneyPlaceholder='<span class="brx-price">السعر عند الطلب</span>';
function renderMerchantApp(root){
 const tr=lang;
 root.innerHTML='<div class="brx-studio brx-merchant" id="'+ID+'"><header class="brx-intro"><div><small>BIET AL REEF / DESIGN STUDIO</small><h2>'+tr('صمّم مساحتك مع المتجر','Design your space with this store')+'</h2><p>'+tr('اختر منتجًا وحرّكه وجرّب الألوان داخل مساحتك.','Choose a product, move it and try colours in your space.')+'</p></div><div class="brx-head-actions"><button type="button" data-brx="undo" id="brx-undo">↶ '+tr('تراجع','Undo')+'</button><button type="button" data-brx="redo" id="brx-redo">↷ '+tr('إعادة','Redo')+'</button><button type="button" class="brx-primary" data-brx="save">'+tr('حفظ التصميم','Save design')+'</button></div></header>'+
 '<section class="brx-layout"><aside class="brx-library"><header><small>'+tr('منتجات المتجر','STORE PRODUCTS')+'</small><h2>'+tr('اختر قطعة','Choose a piece')+'</h2></header><div class="brx-searchline"><input id="brx-search" placeholder="'+tr('ابحث عن منتج...','Search products...')+'" aria-label="'+tr('ابحث عن منتج','Search products')+'" autocomplete="off"></div><div id="brx-list" class="brx-item-list">'+listItems()+'</div><p class="brx-library-note">'+tr('نسّق المنتجات وراجع التفاصيل والمقاسات النهائية مع المتجر.','Arrange products and confirm final specifications with the store.')+'</p></aside>'+
 '<div class="brx-workspace"><div class="brx-workbar"><div><strong>'+tr('مساحتك','Your space')+'</strong><small data-brx-view-status>'+tr('عرض ثلاثي الأبعاد','3D view')+'</small>'+(isArkleen()?'<small class="brx-room-size">'+tr('الغرفة ٤ × ٤ م · ارتفاع الحائط ٣ م','Room 4 × 4 m · wall height 3 m')+'</small>':'')+'</div><div class="brx-workbuttons"><span class="brx-view-switch" role="group" aria-label="2D / 3D"><button type="button" data-brx-view="2d" aria-pressed="false">2D</button><button type="button" data-brx-view="3d" aria-pressed="true">3D</button></span><button data-brx="reset-camera">'+tr('ضبط المشهد','Reset view')+'</button><button data-brx="capture">'+tr('حفظ صورة','Save image')+'</button></div></div><div id="brx-viewport" class="brx-viewport">'+(isArkleen()?'<svg class="brx-dimension-lines" aria-hidden="true"></svg>':'')+'<div class="brx-watermark">'+tr('بيت الريف • تصميم تفاعلي','Biet Al Reef • Interactive design')+'</div><p id="brx-error" hidden>'+tr('تعذّر تشغيل العرض ثلاثي الأبعاد في هذا المتصفح.','3D preview is unavailable in this browser.')+'</p><div class="brx-canvas-tip">'+tr('اسحب القطع لتحريكها • اسحب الخلفية لتدوير المشهد','Drag a piece to move it • Drag the background to rotate')+'</div></div>'+(isArkleen()?'<div id="brx-dimension-summary" class="brx-dimension-summary"></div>':'')+'<div class="brx-footer-tools"><div><span>'+tr('تحريك القطع','Move pieces')+'</span><span>'+tr('ألوان قابلة للتغيير','Custom colours')+'</span></div><small>'+tr('تصميم قابل للتخصيص','Customisable design')+'</small></div></div>'+
 '<aside class="brx-properties"><header><small>'+tr('تخصيص التصميم','CUSTOMISE')+'</small><h2>'+tr('الألوان والخامات','Colours and materials')+'</h2></header><div id="brx-selected"></div><div class="brx-swatches" id="brx-palettes">'+palettes()+'</div><div class="brx-summary"><strong>'+tr('محتويات المشهد','In your space')+'</strong><div><span id="brx-qty"></span></div><button data-brx="export" class="brx-save-list">'+tr('تنزيل قائمة العناصر','Download item list')+'</button><button data-brx="clear" class="brx-clear">'+tr('إفراغ المساحة','Clear space')+'</button></div></aside></section>'+
 ((merchant.whatsapp||merchant.appUrl)?'<section class="brx-quote"><div><small>'+tr('تفصيل على مقاسك','MADE FOR YOUR SPACE')+'</small><h2>'+tr('اطلب عرض سعر لتصميمك','Request a quote for your design')+'</h2><p>'+tr('أخبر المتجر بما تحتاجه، وأضف المقاسات المتوفرة لديك.','Tell the store what you need and share any dimensions you have.')+'</p></div>'+(merchant.whatsapp?'<form id="brx-quote-form"><p class="brx-quote-selection" id="brx-quote-selection"></p><label>'+tr('تفاصيل الطلب','What would you like made?')+'<textarea name="details" minlength="10" maxlength="1200" required placeholder="'+tr('الخامة، اللون، التقسيم الداخلي أو أي تفاصيل أخرى','Materials, colour, internal layout or other details')+'"></textarea></label><div class="brx-quote-fields"><label>'+tr('المقاسات المتوفرة (اختياري)','Available dimensions (optional)')+'<input name="dimensions" maxlength="200" placeholder="'+tr('العرض × الارتفاع × العمق','Width × height × depth')+'"></label><label>'+tr('المدينة أو المنطقة (اختياري)','City or area (optional)')+'<input name="area" maxlength="100" placeholder="'+tr('مثال: العين','For example: Al Ain')+'"></label></div><button type="submit" class="brx-quote-submit">'+tr('متابعة الطلب عبر واتساب','Continue via WhatsApp')+' ↗</button><p class="brx-quote-note">'+tr('ستفتح المحادثة لتراجع الرسالة وترسلها. يمكنك إرفاق صورة التصميم هناك.','Review and send the message in WhatsApp. You can attach your design image there.')+'</p></form>':'')+(merchant.appUrl?'<a class="brx-quote-app" href="'+esc(merchant.appUrl)+'" target="_blank" rel="noopener noreferrer">'+tr('افتح ملف المتجر داخل تطبيق بيت الريف','Open the store in the Biet Al Reef app')+' ↗</a>':'')+'</section>':'')+'</div>';
 create3D();refreshInspector();refreshSummary();state.chosen&&refreshSelection();
}
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
 if(merchant){const q=query.toLocaleLowerCase();return ITEMS.filter(i=>!q||[i.ar,i.en].some(x=>x.toLocaleLowerCase().includes(q))).map(i=>'<article class="brx-product"><div class="brx-model-thumb">'+(i.image?'<img loading="lazy" src="'+esc(i.image)+'" alt="">':'')+'</div><div class="brx-product-text"><small>'+lang('عرض التصميم','Design view')+'</small><strong>'+esc(lang(i.ar,i.en))+'</strong><a href="'+esc(i.href)+'">'+lang('تفاصيل المنتج','Product details')+' ↗</a><button type="button" data-brx-add="'+esc(i.id)+'">+ '+lang('إضافة للمساحة','Add to space')+'</button></div></article>').join('')||'<p class="brx-empty">'+lang('لا توجد نتائج.','No results.')+'</p>'}
 const items=ITEMS.filter(it=>(filter==='الكل'||it.cat===filter)&&(!query||it.ar.includes(query)||it.cat.includes(query)));
 return items.map(i=>'<article class="brx-product"><div class="brx-model-thumb" data-brx-thumb="'+i.id+'" aria-hidden="true">'+(brxThumbnailCache[i.id]?'<img alt="" loading="lazy" src="'+brxThumbnailCache[i.id]+'">':'')+'</div><div class="brx-product-text"><small>'+i.cat+' · '+i.dim+'</small><strong>'+i.ar+'</strong>'+moneyPlaceholder+'<button type="button" data-brx-add="'+i.id+'">+ إضافة للمساحة</button></div></article>').join('')||'<p class="brx-empty">لا توجد نتائج.</p>';
}
function palettes(){
 const labels={wall:lang('دهان الجدران','Wall paint'),floor:lang('ألوان الأرضية','Floor'),wood:lang('الأخشاب','Wood'),metal:lang('اللمسات المعدنية','Metal')};const visible=merchant?labels:{fabric:lang('قماش الأثاث','Fabric'),...labels};
 return Object.entries(visible).map(([key,label])=>{const colors=merchant?.slug==='arkleen'&&(key==='wall'||key==='floor')?['#ffffff',...COLORS[key]]:COLORS[key];return '<div class="brx-palette"><label>'+label+'</label><div>'+colors.map(color=>'<button class="brx-swatch'+(state[key]===color?' active':'')+'" style="background:'+color+'" data-brx-color="'+key+'" data-hex="'+color+'" aria-label="'+label+' '+color+'" title="'+color+'"></button>').join('')+'</div></div>'}).join('');
}
function refreshInspector(){
 const item=state.items.find(x=>x.uid===state.chosen),it=ITEMS.find(x=>x.id===item?.type),el=document.querySelector('#brx-selected');if(!el)return;
 if(it&&isWallDoor(item)){el.innerHTML='<div class="brx-chosen"><span>'+esc(it.icon)+'</span><div><small>'+lang('القطعة المحددة','Selected item')+'</small><strong>'+esc(lang(it.ar,it.en))+'</strong><small>'+lang('باب داخل الحائط','Wall-mounted door')+'</small></div></div><div class="brx-ops"><label>'+lang('حرّك الباب على الحائط','Move the door along the wall')+'</label><div><button data-brx="wall-minus">− 10 '+lang('سم','cm')+'</button><button data-brx="wall-plus">+ 10 '+lang('سم','cm')+'</button></div><div><button data-brx="movewall">'+lang('نقل للحائط الآخر','Move to other wall')+'</button><button class="brx-danger" data-brx="delete">'+lang('حذف','Remove')+'</button></div></div>';return}
 if(merchant){el.innerHTML=it?'<div class="brx-chosen"><span>'+esc(it.icon)+'</span><div><small>'+lang('القطعة المحددة','Selected item')+'</small><strong>'+esc(lang(it.ar,it.en))+'</strong><small>'+lang('عرض التصميم','Design view')+'</small></div></div><div class="brx-ops"><label>'+lang('تدوير القطعة','Rotate item')+'</label><div><button data-brx="rotleft">↶ 15°</button><button data-brx="rotright">↷ 15°</button></div><label>'+lang('حجم القطعة','Item size')+'</label><div><button data-brx="smaller">− '+lang('تصغير','Smaller')+'</button><button data-brx="bigger">+ '+lang('تكبير','Larger')+'</button></div><div><button data-brx="duplicate">'+lang('نسخ','Duplicate')+'</button><button class="brx-danger" data-brx="delete">'+lang('حذف','Remove')+'</button></div></div>':'<div class="brx-selecthint">'+lang('اضغط على قطعة لتعديلها.','Select a piece to edit it.')+'</div>';return}
 el.innerHTML=it?'<div class="brx-chosen"><span>'+it.icon+'</span><div><small>القطعة المحددة</small><strong>'+it.ar+'</strong><small>'+it.dim+'</small></div></div><div class="brx-ops"><label>دوران ثلاثي الأبعاد</label><div><button data-brx="rotleft">↶ 15°</button><button data-brx="rotright">↷ 15°</button></div><label>حجم القطعة</label><div><button data-brx="smaller">− تصغير</button><button data-brx="bigger">+ تكبير</button></div><div><button data-brx="duplicate">نسخ</button><button class="brx-danger" data-brx="delete">حذف</button></div></div>':'<div class="brx-selecthint">اضغط على قطعة داخل الغرفة لتدويرها وتغيير حجمها وتفاصيلها.</div>';
}
function refreshSummary(){let e=document.querySelector('#brx-qty');if(e)e.textContent=state.items.length+' '+lang('قطع','items');const q=document.querySelector('#brx-quote-selection');if(q){const names=[...new Set(state.items.map(x=>ITEMS.find(i=>i.id===x.type)).filter(Boolean).map(i=>lang(i.ar,i.en)))];q.textContent=names.length?lang('قطع التصميم: ','Design items: ')+names.join('، '):lang('أضف قطعة إلى التصميم، أو صف ما تحتاجه مباشرة.','Add pieces to the design, or describe what you need.')}for(const cmd of ['undo','redo']){let b=document.querySelector('#brx-'+cmd);if(b)b.disabled=cmd==='undo'?!past.length:!future.length}}
function refreshSelection(){if(!objects.size)return;for(const [id,obj] of objects){obj.traverse(c=>{if(c.isMesh)c.userData.selected=id===state.chosen})}}
function mutate(fn){push();fn();save();refreshInspector();refreshSummary();rebuild();refreshSelection();refreshPalettes();setTimeout(renderThumbnails,120)}
function refreshPalettes(){const el=document.querySelector('#brx-palettes');if(el)el.innerHTML=palettes()}
let uidseq=0;
function nextMerchantPosition(type){
 if(isArkleen()){
  const modelName=ITEMS.find(i=>i.id===type)?.model;if(modelName==='wooden-door')return {x:1,z:-1.96};
  const candidates=modelName==='wooden-kitchen'?[[-.5,-.45],[0,-.45],[0,.45]]:[[0,1.25],[0,-1.25],[0,0]];
  for(const [x,z] of candidates){const item={type,scale:1,rot:0,x,z};fitArkleenItem(item,x,z);const [w,d]=planFootprint(item);if(state.items.filter(other=>!isWallDoor(other)).every(other=>{const [ow,od]=planFootprint(other);return Math.abs(item.x-other.x)>(w+ow)/2+.05||Math.abs(item.z-other.z)>(d+od)/2+.05}))return {x:item.x,z:item.z}}
  return {x:candidates[0][0],z:candidates[0][1]};
 }
 const positions=[[1.65,-1.55],[-1.75,.65],[.25,.65],[2.1,.65],[-1.8,2],[0,2],[1.8,2]],candidate={type,scale:1};const [w,d]=planFootprint(candidate);
 for(const [x,z] of positions){if(state.items.every(item=>{const [ow,od]=planFootprint(item);return Math.abs(item.x-x)>(w+ow)/2+.12||Math.abs(item.z-z)>(d+od)/2+.12}))return {x,z}}
 return {x:(Math.random()-.5)*2,z:(Math.random()-.5)*2};
}
function handleClick(e){
 const color=e.target.closest('[data-brx-color]');if(color){mutate(()=>{state[color.dataset.brxColor]=color.dataset.hex});return}
 const view=e.target.closest('[data-brx-view]');if(view){setViewMode(view.dataset.brxView);return}
 const add=e.target.closest('[data-brx-add]');if(add){if(state.items.length>=30||!ITEMS.some(i=>i.id===add.dataset.brxAdd))return;mutate(()=>{let id='b'+Date.now()+'-'+(++uidseq);const pos=merchant?nextMerchantPosition(add.dataset.brxAdd):{x:(Math.random()-.5)*2,z:(Math.random()-.5)*2},item={uid:id,type:add.dataset.brxAdd,...pos,rot:0,scale:1};if(isWallDoor(item))placeWallDoor(item,item.x,item.z,'back');else if(isArkleen())fitArkleenItem(item,item.x,item.z);state.items.push(item);state.chosen=id});return}
 const btn=e.target.closest('[data-brx]');if(btn){
 const action=btn.dataset.brx,selected=state.items.find(x=>x.uid===state.chosen);
 if(action==='save'){save();btn.textContent=lang('تم حفظ التصميم ✓','Design saved ✓');return}
 if(action==='undo'){if(!past.length)return;future.push(JSON.stringify(state));state=JSON.parse(past.pop());save();rebuild();refreshInspector();refreshSummary();refreshPalettes();return}
 if(action==='redo'){if(!future.length)return;past.push(JSON.stringify(state));state=JSON.parse(future.pop());save();rebuild();refreshInspector();refreshSummary();refreshPalettes();return}
 if(action==='reset-camera'){yaw=.49;pitch=.42;radius=9.1;cameraUpdate();if(planCamera){planCamera.zoom=1;planCamera.updateProjectionMatrix()}return}
 if(action==='capture'){try{const a=document.createElement('a');a.download='biet-alreef-studio.png';a.href=(planFallback?.canvas||renderer?.domElement).toDataURL('image/png');a.click()}catch{}return}
 if(action==='export'){const csv=x=>'"'+String(x??'').replace(/"/g,'""')+'"';const rows=[[lang('القطعة','Item'),lang('الحالة','Representation')],...state.items.map(x=>{let v=ITEMS.find(i=>i.id===x.type);return [lang(v?.ar||'',v?.en||''),lang('تصميم قابل للتخصيص','Customisable design')]})].map(row=>row.map(csv).join(','));let a=document.createElement('a'),blob=new Blob(['\uFEFF'+rows.join('\r\n')],{type:'text/csv;charset=utf-8'});a.href=URL.createObjectURL(blob);a.download='biet-alreef-design-items.csv';a.click();URL.revokeObjectURL(a.href);return}
 if(action==='clear'){mutate(()=>{state.items=[];state.chosen=null});return}
 if(!selected)return;
 mutate(()=>{if((action==='wall-minus'||action==='wall-plus')&&isWallDoor(selected)){const d=action==='wall-minus'?-.1:.1;placeWallDoor(selected,selected.x+(selected.wall==='back'?d:0),selected.z+(selected.wall==='left'?d:0),selected.wall)}if(action==='movewall'&&isWallDoor(selected)){const offset=selected.wall==='back'?selected.x:selected.z;placeWallDoor(selected,offset,offset,selected.wall==='back'?'left':'back')}if(action==='rotleft'&&!isWallDoor(selected))selected.rot-=Math.PI/12;if(action==='rotright'&&!isWallDoor(selected))selected.rot+=Math.PI/12;if(action==='smaller'&&!isWallDoor(selected))selected.scale=Math.max(.55,selected.scale-.1);if(action==='bigger'&&!isWallDoor(selected))selected.scale=Math.min(1.7,selected.scale+.1);if(isArkleen()&&!isWallDoor(selected))fitArkleenItem(selected,selected.x,selected.z);if(action==='delete'){state.items=state.items.filter(x=>x.uid!==selected.uid);state.chosen=null}if(action==='duplicate'&&state.items.length<30&&!isWallDoor(selected)){let u='b'+Date.now()+'-'+(++uidseq),copy={...selected,uid:u,x:selected.x+.3};if(isArkleen())fitArkleenItem(copy,copy.x,copy.z);else copy.x=Math.min(3,copy.x);state.items.push(copy);state.chosen=u}});
 }
 const cat=e.target.closest('[data-brx-cat]');if(cat){document.querySelectorAll('[data-brx-cat]').forEach(x=>x.classList.toggle('active',x===cat));document.querySelector('#brx-list').innerHTML=listItems(cat.dataset.brxCat,document.querySelector('#brx-search')?.value?.trim()||'')}
}
function destroy(){
 if(resize){resize.disconnect();resize=null}
 if(raf){cancelAnimationFrame(raf);raf=0}
 if(renderer){renderer.dispose();renderer.domElement.remove();renderer=null}
 if(planFallback){planFallback.canvas.remove();planFallback=null}
 objects.clear();scene=null;camera=null;perspectiveCamera=null;planCamera=null;room=null;furniture=null;drag=null;
}

let brxThumbnailCache={};
function renderThumbnails(){
 if(merchant||!renderer||!scene)return;
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
 const pane=root.querySelector('[data-merchant-panel="design"]'),target=pane?.querySelector('[data-merchant-studio-mount]');
 if(pane&&target&&!pane.hidden){
  if(!target.querySelector('#'+ID)){
   let config;try{config=JSON.parse(pane.querySelector('#brx-merchant-data')?.textContent||'null')}catch{}
   if(!config||!/^[A-Za-z0-9][A-Za-z0-9_-]{0,159}$/.test(config.slug||'')||!Array.isArray(config.items))return;
   if(!/^\d{9,15}$/.test(config.whatsapp||''))config.whatsapp='';
   if(!/^https:\/\/providers\.bietalreef\.ae\/provider\/BR-[0-9]{7,12}$/.test(config.appUrl||''))config.appUrl='';
   config.items=config.items.filter(i=>/^[A-Za-z0-9][A-Za-z0-9_-]{0,159}$/.test(i.id||'')&&['wooden-kitchen','wooden-wardrobe','wooden-door'].includes(i.model)&&/^\/(?:en\/)?(?:product\/[A-Za-z0-9_-]+|products\/[a-z0-9][a-z0-9-]{0,119}\/[a-z0-9][a-z0-9-]{0,159})$/.test(i.href||'')&&(!i.image||i.image.startsWith('/')&&!i.image.startsWith('//')||/^https:\/\//.test(i.image)));
   if(!config.items.length)return;if(renderer||planFallback)destroy();configureContext(config);renderMerchantApp(target);
  }else if(!renderer&&!planFallback){create3D();refreshInspector();refreshSummary()}
  return;
 }
 if(!active){if(renderer||planFallback)destroy();return}
 if(!root.querySelector('#'+ID)){if(renderer||planFallback)destroy();configureContext(null);renderApp()}
}
document.addEventListener('click',handleClick);
document.addEventListener('submit',e=>{
 if(e.target.id!=='brx-quote-form'||!merchant||!/^\d{9,15}$/.test(merchant.whatsapp))return;
 e.preventDefault();const form=e.target,fields=new FormData(form),details=String(fields.get('details')||'').trim();if(details.length<10){form.reportValidity();return}
 const counts=new Map();for(const x of state.items)counts.set(x.type,(counts.get(x.type)||0)+1);
 const selected=[...counts].map(([id,n])=>{const item=ITEMS.find(i=>i.id===id);return item?'- '+lang(item.ar,item.en)+' × '+n+'\nhttps://app.bietalreef.ae'+item.href:''}).filter(Boolean);
 const message=[lang('مرحبًا، أود طلب عرض سعر من ','Hello, I would like a quote from ')+merchant.name,selected.length?lang('قطع التصميم:','Design items:')+'\n'+selected.join('\n'):'',lang('التفاصيل: ','Details: ')+details,String(fields.get('dimensions')||'').trim()?lang('المقاسات المتوفرة: ','Available dimensions: ')+String(fields.get('dimensions')).trim():'',String(fields.get('area')||'').trim()?lang('الموقع: ','Location: ')+String(fields.get('area')).trim():'',lang('التصميم قابل للتخصيص فقط.','Please confirm product specifications and final dimensions with the store.')].filter(Boolean).join('\n\n');
 const a=document.createElement('a');a.href='https://wa.me/'+merchant.whatsapp+'?text='+encodeURIComponent(message);a.target='_blank';a.rel='noopener noreferrer';a.click();
});
document.addEventListener('input',e=>{if(e.target.id==='brx-search'){const category=document.querySelector('[data-brx-cat].active')?.dataset.brxCat||'الكل';document.querySelector('#brx-list').innerHTML=listItems(category,e.target.value.trim())}});
window.addEventListener('hashchange',()=>requestAnimationFrame(route));
document.addEventListener('brx-merchant-tab',()=>requestAnimationFrame(route));
const mount=document.querySelector('#content');if(mount)new MutationObserver(()=>{if(window.marketLocation.hash.split('?')[0]==='#studio'&&!document.querySelector('#'+ID))queueMicrotask(route)}).observe(mount,{childList:true});
route();

window.addEventListener('brx-camera-control',e=>{if(!camera)return;const d=e.detail||{};if(d.view&&viewMode==='2d')setViewMode('3d');if(d.view==='front'){yaw=0;pitch=.26;radius=8.8}else if(d.view==='iso'){yaw=.49;pitch=.42;radius=9.1}else if(d.view==='top'){yaw=.1;pitch=1.35;radius=8.5}if(Number.isFinite(d.zoom))radius=Math.max(5.2,Math.min(17,radius+d.zoom));cameraUpdate()});

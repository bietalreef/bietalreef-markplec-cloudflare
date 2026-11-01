import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import worker from '../dist/worker.mjs';

const response=await worker.fetch(new Request('https://app.bietalreef.ae/three.module.min.js'));
assert.equal(response.status,200);
const T=await import('data:text/javascript;base64,'+Buffer.from(await response.text()).toString('base64'));
const source=fs.readFileSync(new URL('../assets/brx-studio.js',import.meta.url),'utf8');
const geometry=source.slice(source.indexOf('function mat('),source.indexOf('function create3D('));
const api=new Function('T',`
 const ITEMS=[{id:'k',model:'wooden-kitchen'},{id:'w',model:'wooden-wardrobe'},{id:'d',model:'wooden-door'}];
 let state={wall:'#ffffff',floor:'#ffffff',items:[{type:'d',wall:'back',x:0,z:-1.96}]};
 let room,scene=new T.Scene(),viewMode='3d';
 const isArkleen=()=>true,isWallDoor=item=>ITEMS.find(x=>x.id===item.type)?.model==='wooden-door';
 let material={};for(const k of ['fabric','wood','metal','ivory','green','rug','pot','light'])material[k]=new T.MeshStandardMaterial({color:'#98714a'});
 ${geometry}
 return {model,build(){roomBuild();return room},move(offset){state.items[0].x=offset;updateArkleenWalls();return room},top(){viewMode='2d';updateArkleenWalls();return room}};
`)(T);

test('the three products have distinct dimensional model geometry',()=>{
 for(const id of ['k','w','d']){
  const group=api.model(id);let meshes=0;group.traverse(x=>{if(x.isMesh)meshes++});
  const size=new T.Box3().setFromObject(group).getSize(new T.Vector3());
  assert.ok(meshes>=7,id);assert.ok(size.x>.5&&size.y>2&&size.z>.05,id);
 }
});

test('a door opening follows the door in a four-metre room with three-metre walls',()=>{
 function check(room,center){
  const floor=room.children.find(x=>x.isMesh),size=new T.Box3().setFromObject(floor).getSize(new T.Vector3());
  assert.equal(size.x,4);assert.equal(size.z,4);
  const walls=room.getObjectByName('arkleen-walls');let header=false;
  for(const mesh of walls.children){const b=new T.Box3().setFromObject(mesh);assert.ok(b.max.y<=3+1e-6);if(Math.abs(mesh.position.z+1.96)<.001){
   if(mesh.userData.doorHeader){header=true;assert.ok(b.min.y>=2.32-1e-6);assert.ok(b.min.x<=center-.62+1e-6&&b.max.x>=center+.62-1e-6)}
   else if(b.min.y<2.2)assert.ok(b.max.x<=center-.62+1e-6||b.min.x>=center+.62-1e-6,'opening stays clear');
  }}
  assert.ok(header);
 }
 check(api.build(),0);check(api.move(.7),.7);
 assert.ok(api.top().getObjectByName('arkleen-walls').children.filter(x=>x.userData.doorHeader).every(x=>!x.visible));
});


test('door measurements track both wall positions and sum to the wall width',()=>{
 const piece=source.slice(source.indexOf('function wallDoorMeasurements('),source.indexOf('function measuredModelBounds('));
 const measure=new Function(piece+'; return wallDoorMeasurements')();
 for(const item of [{wall:'back',x:-1,z:-1.96},{wall:'back',x:.75,z:-1.96},{wall:'left',x:-1.96,z:.45}]){
  const m=measure(item);assert.ok(m.before>=0&&m.after>=0);assert.ok(Math.abs(m.before+m.width+m.after-4)<1e-8);assert.equal(m.width,1.2);assert.equal(m.height,2.3);
 }
 const d=api.model('d'),box=new T.Box3().setFromObject(d);assert.ok(Math.abs((box.max.x-box.min.x)-1.2)<.001);assert.ok(Math.abs(box.max.y-2.3)<.001);
});


test('selected product dimensions match the procedural 3D models at any scale',()=>{
 const fn=source.slice(source.indexOf('function measuredModelBounds('),source.indexOf('function updateMeasurements()'));
 const tools=new Function('ITEMS',fn+';return {measuredModelBounds,modelPlanPoint}')([{id:'k',model:'wooden-kitchen'},{id:'w',model:'wooden-wardrobe'}]);
 for(const id of ['k','w']){const item={type:id,scale:1.25,x:1,z:-.5,rot:Math.PI/2},dims=tools.measuredModelBounds(item),b=new T.Box3().setFromObject(api.model(id)),size=new T.Vector3();b.getSize(size);assert.ok(Math.abs(dims.width-size.x*1.25)<.001);assert.ok(Math.abs(dims.depth-size.z*1.25)<.001);const q=tools.modelPlanPoint(item,1,0);assert.ok(Math.abs(q.x-item.x)<1e-8);assert.ok(Math.abs(q.z-(item.z-1))<1e-8)}
});

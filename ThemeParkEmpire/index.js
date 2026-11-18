const http = require("node:http");

const PORT = process.env.PORT || 3000;

const PAGE = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Theme Park Empire</title>
<style>
*{box-sizing:border-box}
body{margin:0;background:#101827;color:#fff;font-family:Arial,sans-serif;overflow:hidden}
button,input{font:inherit}
#game{position:fixed;inset:0}
#topbar{position:absolute;top:0;left:0;right:0;height:68px;background:#111c2c;display:flex;align-items:center;justify-content:space-between;padding:0 22px;z-index:5;border-bottom:1px solid #ffffff18}
.logo{font-size:21px;font-weight:900;letter-spacing:1.5px}
.logo span{color:#63c7ff}
.stats{display:flex;gap:22px;align-items:center;font-size:13px}
.stat strong{display:block;font-size:17px;margin-top:3px}
#toolbar{position:absolute;top:85px;left:16px;width:190px;background:#111c2ceF;border:1px solid #ffffff20;border-radius:13px;padding:13px;z-index:5;max-height:calc(100vh - 110px);overflow:auto}
.panel-title{font-size:11px;color:#8da8c7;font-weight:bold;letter-spacing:1.5px;margin:5px 0 11px}
.tool{width:100%;border:1px solid #ffffff16;background:#1d2c41;color:white;padding:11px 10px;margin:4px 0;border-radius:8px;text-align:left;cursor:pointer;font-size:13px}
.tool:hover,.tool.active{background:#245b82;border-color:#69c9ff}
#rightpanel{position:absolute;right:16px;top:85px;width:225px;background:#111c2ceF;border:1px solid #ffffff20;border-radius:13px;padding:15px;z-index:5}
#rightpanel input{width:100%;background:#1d2c41;border:1px solid #ffffff25;color:#fff;padding:9px;border-radius:7px;margin:5px 0 10px}
.action{width:100%;border:0;background:#287eb2;color:white;padding:10px;border-radius:8px;margin:4px 0;cursor:pointer;font-weight:bold}
.action.secondary{background:#273a52}
.action.danger{background:#9b3d4b}
#bottom{position:absolute;bottom:16px;left:50%;transform:translateX(-50%);display:flex;gap:8px;background:#111c2ceF;padding:9px;border-radius:12px;border:1px solid #ffffff20;z-index:5}
#bottom button{border:0;border-radius:8px;padding:10px 16px;background:#263b55;color:#fff;cursor:pointer}
#bottom button.active{background:#287eb2}
#hint{position:absolute;bottom:76px;left:50%;transform:translateX(-50%);background:#111c2ceF;padding:10px 16px;border-radius:9px;font-size:12px;color:#c9d9eb;z-index:4;white-space:nowrap}
#toast{position:absolute;top:80px;left:50%;transform:translateX(-50%);background:#287eb2;padding:11px 18px;border-radius:9px;z-index:10;opacity:0;transition:opacity .2s;pointer-events:none}
#overlay{position:absolute;inset:0;background:#07111ddd;display:flex;align-items:center;justify-content:center;z-index:20}
#startcard{width:min(500px,90vw);padding:35px;background:#14243a;border:1px solid #ffffff25;border-radius:20px;text-align:center;box-shadow:0 20px 80px #0008}
#startcard h1{font-size:34px;margin:0 0 8px}
#startcard h1 span{color:#63c7ff}
#startcard p{color:#b4c7dc;line-height:1.6}
#startcard button{background:#2788c2;color:white;border:0;padding:14px 28px;border-radius:9px;font-weight:bold;cursor:pointer;margin-top:12px}
.hidden{display:none!important}
.small{font-size:12px;color:#9eb2ca;line-height:1.5}
@media(max-width:760px){
#topbar{height:58px;padding:0 10px}.logo{font-size:15px}.stats{gap:9px;font-size:10px}.stat strong{font-size:13px}
#toolbar{top:68px;left:7px;width:142px;padding:8px;max-height:calc(100vh - 125px)}
#rightpanel{top:68px;right:7px;width:155px;padding:9px}
.tool{font-size:11px;padding:9px 6px}
#bottom{bottom:8px;gap:4px;padding:6px}#bottom button{padding:9px 10px;font-size:11px}
#hint{bottom:58px;font-size:10px}
}
</style>
</head>
<body>
<div id="game"></div>

<div id="topbar">
 <div class="logo">THEME PARK <span>EMPIRE</span></div>
 <div class="stats">
  <div class="stat">CASH<strong id="cash">$25,000</strong></div>
  <div class="stat">VISITORS<strong id="visitors">0</strong></div>
  <div class="stat">PARK RATING<strong id="rating">50%</strong></div>
  <div class="stat">DAY<strong id="day">1</strong></div>
 </div>
</div>

<div id="toolbar">
 <div class="panel-title">BUILD YOUR PARK</div>
 <button class="tool active" data-type="select">Select object</button>
 <button class="tool" data-type="path">Paths — $10</button>
 <button class="tool" data-type="carousel">Carousel — $1,200</button>
 <button class="tool" data-type="ferris">Ferris wheel — $3,500</button>
 <button class="tool" data-type="coaster">Roller coaster — $5,000</button>
 <button class="tool" data-type="shop">Food shop — $650</button>
 <button class="tool" data-type="tree">Tree — $100</button>
 <button class="tool" data-type="fountain">Fountain — $450</button>
 <button class="tool" data-type="lamp">Lamp — $125</button>
 <div class="panel-title" style="margin-top:16px">PARK MANAGEMENT</div>
 <button class="tool" id="priceButton">Ticket price: $20</button>
 <button class="tool" id="saveButton">Save park</button>
 <button class="tool" id="loadButton">Load park</button>
</div>

<div id="rightpanel">
 <div class="panel-title">OBJECT CUSTOMISATION</div>
 <div id="noSelection" class="small">Select an object in your park to customise it.</div>
 <div id="selection" class="hidden">
  <label class="small">Object name</label>
  <input id="objectName" maxlength="28" placeholder="Object name">
  <label class="small">Colour</label>
  <input id="objectColour" type="color" value="#42a5f5">
  <button class="action" id="applyButton">Apply changes</button>
  <button class="action secondary" id="rotateButton">Rotate object</button>
  <button class="action danger" id="deleteButton">Delete object</button>
 </div>
 <div class="panel-title" style="margin-top:18px">PARK CONTROLS</div>
 <button class="action secondary" id="expandButton">Expand land — $10,000</button>
 <button class="action secondary" id="undoButton">Undo last build</button>
 <p class="small">Build your dream park, attract visitors and grow your empire.</p>
</div>

<div id="hint">Choose an item, then click the ground to place it.</div>
<div id="toast"></div>

<div id="bottom">
 <button id="buildMode" class="active">Build Mode</button>
 <button id="playMode">Play Mode</button>
 <button id="cameraButton">Reset Camera</button>
</div>

<div id="overlay">
 <div id="startcard">
  <h1>THEME PARK <span>EMPIRE</span></h1>
  <p>Your own amusement park starts here. Build incredible attractions, welcome visitors and turn a small piece of land into a world-famous destination.</p>
  <p class="small">You begin with $25,000. Build your first ride to attract visitors.</p>
  <button id="startButton">CREATE MY PARK</button>
 </div>
</div>

<script type="module">
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/controls/OrbitControls.js";

const mount = document.getElementById("game");
const scene = new THREE.Scene();
scene.background = new THREE.Color("#91d4f4");
scene.fog = new THREE.Fog("#91d4f4", 75, 180);

const camera = new THREE.PerspectiveCamera(55, innerWidth/innerHeight, 0.1, 500);
camera.position.set(35, 36, 42);

const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(innerWidth,innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
mount.appendChild(renderer.domElement);

const controls = new OrbitControls(camera,renderer.domElement);
controls.target.set(0,0,0);
controls.enableDamping = true;
controls.maxPolarAngle = Math.PI/2.05;
controls.minDistance = 12;
controls.maxDistance = 100;

scene.add(new THREE.HemisphereLight(0xffffff,0x78936b,2));
const sun = new THREE.DirectionalLight(0xffffff,2.3);
sun.position.set(-30,55,25);
sun.castShadow = true;
sun.shadow.mapSize.set(2048,2048);
scene.add(sun);

const ground = new THREE.Mesh(
 new THREE.PlaneGeometry(100,100),
 new THREE.MeshStandardMaterial({color:"#78bd69"})
);
ground.rotation.x=-Math.PI/2;
ground.receiveShadow=true;
ground.name="ground";
scene.add(ground);

const grid = new THREE.GridHelper(100,50,"#477c45","#8acb78");
grid.position.y=0.025;
scene.add(grid);

const parkEdge = new THREE.Mesh(
 new THREE.BoxGeometry(100,.5,100),
 new THREE.MeshStandardMaterial({color:"#568b4c"})
);
parkEdge.position.y=-.35;
scene.add(parkEdge);

const objects=[];
const visitors=[];
const raycaster=new THREE.Raycaster();
const pointer=new THREE.Vector2();
let selectedTool="select";
let selectedObject=null;
let cash=25000;
let ticketPrice=20;
let visitorCount=0;
let rating=50;
let day=1;
let playMode=false;
let landSize=50;
let history=[];
let started=false;

const prices={path:10,carousel:1200,ferris:3500,coaster:5000,shop:650,tree:100,fountain:450,lamp:125};
const labels={path:"Path",carousel:"Carousel",ferris:"Ferris wheel",coaster:"Roller coaster",shop:"Food shop",tree:"Tree",fountain:"Fountain",lamp:"Lamp"};

function material(color,roughness=.75){
 return new THREE.MeshStandardMaterial({color,roughness});
}
function box(w,h,d,color,x,y,z){
 const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material(color));
 m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;return m;
}
function cylinder(rt,rb,h,color,x,y,z,segments=24){
 const m=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,segments),material(color));
 m.position.set(x,y,z);m.castShadow=true;return m;
}
function sphere(r,color,x,y,z){
 const m=new THREE.Mesh(new THREE.SphereGeometry(r,18,14),material(color));
 m.position.set(x,y,z);m.castShadow=true;return m;
}

function createRide(type,x,z,color){
 const group=new THREE.Group();
 group.position.set(x,0,z);
 group.userData={type,name:labels[type]||"Park object",color};
 const c=color||({
  path:"#d7c5a2",carousel:"#ff6c9e",ferris:"#55a9e8",
  coaster:"#f04d4d",shop:"#ffb84d",tree:"#329b54",
  fountain:"#53c9ed",lamp:"#f5df8a"
 }[type]);
 group.userData.color=c;

 if(type==="path"){
  group.add(box(2,.12,2,c,0,.07,0));
 }else if(type==="carousel"){
  group.add(cylinder(2.6,.8,.45,"#e9d9a5",0,.25,0));
  group.add(cylinder(2.2,2.2,.12,c,0,.53,0));
  group.add(cylinder(.25,.35,3,"#f4df91",0,1.9,0));
  group.add(cylinder(2.1,2.1,.15,"#ffe18a",0,3.25,0));
  for(let i=0;i<8;i++){
   const a=i*Math.PI/4;
   const px=Math.cos(a)*1.55,pz=Math.sin(a)*1.55;
   group.add(cylinder(.13,.13,1.2,"#ffffff",px,1.65,pz));
   group.add(box(.55,.55,.8,["#ff6384","#58b9ef","#f6d365","#9b7bea"][i%4],px,1.15,pz));
  }
 }else if(type==="ferris"){
  group.add(box(.35,7,.35,"#64758a",-.9,3.5,0));
  group.add(box(.35,7,.35,"#64758a",.9,3.5,0));
  const wheel=new THREE.Group();
  wheel.position.y=5.5;
  const ring=new THREE.Mesh(new THREE.TorusGeometry(3,.15,10,40),material(c));
  wheel.add(ring);
  for(let i=0;i<12;i++){
   const a=i*Math.PI/6;
   wheel.add(box(.12,6,.12,"#f5e6c7",Math.cos(a)*1.5,Math.sin(a)*1.5,0));
   const pod=box(.65,.55,.65,["#ff6680","#54b9ec","#ffd45e","#8d79e8"][i%4],Math.cos(a)*3,Math.sin(a)*3,0);
   wheel.add(pod);
  }
  group.add(wheel);group.userData.wheel=wheel;
  group.add(box(2,.25,1.2,"#64758a",0,.4,0));
 }else if(type==="coaster"){
  group.add(box(7,.25,5,"#a2a7ad",0,.2,0));
  const points=[
   new THREE.Vector3(-3,1,-2),new THREE.Vector3(-2,3,-1),
   new THREE.Vector3(-.5,4,0),new THREE.Vector3(1,1.2,1),
   new THREE.Vector3(2,3,1.5),new THREE.Vector3(3,1,2)
  ];
  const curve=new THREE.CatmullRomCurve3(points);
  const rail=new THREE.Mesh(new THREE.TubeGeometry(curve,70,.13,8,false),material(c));
  rail.castShadow=true;group.add(rail);
  for(let i=0;i<6;i++){
   const p=points[i];
   group.add(box(.12,p.y,.12,"#667786",p.x,p.y/2,p.z));
  }
  group.add(box(1,.45,1,"#ffca54",0,1.1,0));
 }else if(type==="shop"){
  group.add(box(3,2.2,2.5,c,0,1.1,0));
  group.add(box(3.3,.35,2.8,"#fff0c5",0,2.35,0));
  group.add(box(1,.8,.12,"#9bd7ef",0,1.2,1.27));
  group.add(box(1.4,.2,.15,"#ffffff",0,2.75,1.45));
 }else if(type==="tree"){
  group.add(cylinder(.2,.3,1.7,"#805332",0,.85,0));
  group.add(sphere(1.15,c,0,2,0));
  group.add(sphere(.75,"#54b96a",-.55,2.4,.15));
 }else if(type==="fountain"){
  group.add(cylinder(2.2,2.2,.35,"#d6e4e9",0,.2,0));
  group.add(cylinder(1.7,1.7,.12,"#4eb9e6",0,.43,0));
  group.add(cylinder(.25,.4,1.1,"#d8e8ed",0,.95,0));
  group.add(sphere(.35,"#5acaf1",0,1.65,0));
 }else if(type==="lamp"){
  group.add(cylinder(.08,.12,2.8,"#414d5c",0,1.4,0));
  group.add(sphere(.35,c,0,2.9,0));
 }else{
  group.add(box(1,1,1,c,0,.5,0));
 }

 group.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
 group.userData.cost=prices[type]||0;
 scene.add(group);
 objects.push(group);
 return group;
}

function addInitialPath(){
 for(let x=-5;x<=5;x+=2){
  createRide("path",x,8);
 }
}
addInitialPath();

function money(n){return "$"+Math.floor(n).toLocaleString("en-US")}
function updateUI(){
 document.getElementById("cash").textContent=money(cash);
 document.getElementById("visitors").textContent=visitorCount;
 document.getElementById("rating").textContent=rating+"%";
 document.getElementById("day").textContent=day;
 document.getElementById("priceButton").textContent="Ticket price: "+money(ticketPrice);
}
function toast(message){
 const el=document.getElementById("toast");
 el.textContent=message;el.style.opacity=1;
 clearTimeout(toast.timer);
 toast.timer=setTimeout(()=>el.style.opacity=0,1900);
}
function selectObject(obj){
 selectedObject=obj;
 const no=document.getElementById("noSelection");
 const panel=document.getElementById("selection");
 no.classList.toggle("hidden",!!obj);
 panel.classList.toggle("hidden",!obj);
 if(obj){
  document.getElementById("objectName").value=obj.userData.name;
  document.getElementById("objectColour").value=obj.userData.color;
 }
}
function setTool(type){
 selectedTool=type;
 document.querySelectorAll("[data-type]").forEach(b=>b.classList.toggle("active",b.dataset.type===type));
 document.getElementById("hint").textContent=type==="select"?"Click an object to customise it.":"Click the ground to place "+(labels[type]||type)+".";
}
document.querySelectorAll("[data-type]").forEach(b=>b.addEventListener("click",()=>setTool(b.dataset.type)));

function snapshot(){
 return objects.map(o=>({
  type:o.userData.type,x:o.position.x,z:o.position.z,
  color:o.userData.color,name:o.userData.name,
  rotation:o.rotation.y
 }));
}
function savePark(){
 const data={objects:snapshot(),cash,ticketPrice,day,landSize};
 localStorage.setItem("themeParkEmpireSave",JSON.stringify(data));
 toast("Your park has been saved.");
}
function loadPark(){
 const raw=localStorage.getItem("themeParkEmpireSave");
 if(!raw){toast("No saved park found.");return;}
 try{
  const data=JSON.parse(raw);
  for(const o of [...objects])scene.remove(o);
  objects.length=0;
  data.objects.forEach(item=>{
   const obj=createRide(item.type,item.x,item.z,item.color);
   obj.userData.name=item.name||labels[item.type];
   obj.rotation.y=item.rotation||0;
  });
  cash=data.cash??cash;ticketPrice=data.ticketPrice??ticketPrice;
  day=data.day??day;landSize=data.landSize??landSize;
  ground.geometry.dispose();
  ground.geometry=new THREE.PlaneGeometry(landSize*2,landSize*2);
  grid.visible=landSize===50;
  selectObject(null);updateUI();toast("Park loaded.");
 }catch(e){toast("Could not load that save.");}
}
function place(type,x,z){
 const cost=prices[type]||0;
 if(cash<cost){toast("Not enough money for this item.");return;}
 history.push(snapshot());
 cash-=cost;
 const obj=createRide(type,x,z);
 selectObject(obj);
 updateUI();
}
function deleteSelected(){
 if(!selectedObject)return;
 history.push(snapshot());
 scene.remove(selectedObject);
 objects.splice(objects.indexOf(selectedObject),1);
 selectObject(null);
 toast("Object removed.");
}
function undo(){
 if(!history.length){toast("Nothing to undo.");return;}
 const previous=history.pop();
 for(const o of [...objects])scene.remove(o);
 objects.length=0;
 previous.forEach(item=>{
  const obj=createRide(item.type,item.x,item.z,item.color);
  obj.userData.name=item.name;
  obj.rotation.y=item.rotation||0;
 });
 selectObject(null);toast("Last build undone.");
}

document.getElementById("applyButton").onclick=()=>{
 if(!selectedObject)return;
 selectedObject.userData.name=document.getElementById("objectName").value||"Park object";
 const color=document.getElementById("objectColour").value;
 selectedObject.userData.color=color;
 selectedObject.traverse(o=>{
  if(o.isMesh && o.material && o.material.color){
   o.material.color.set(color);
  }
 });
 toast("Customisation applied.");
};
document.getElementById("rotateButton").onclick=()=>{
 if(selectedObject)selectedObject.rotation.y+=Math.PI/4;
};
document.getElementById("deleteButton").onclick=deleteSelected;
document.getElementById("undoButton").onclick=undo;
document.getElementById("saveButton").onclick=savePark;
document.getElementById("loadButton").onclick=loadPark;
document.getElementById("priceButton").onclick=()=>{
 ticketPrice=ticketPrice>=50?10:ticketPrice+5;
 updateUI();toast("Ticket price updated.");
};
document.getElementById("expandButton").onclick=()=>{
 if(cash<10000){toast("You need $10,000 to expand.");return;}
 history.push(snapshot());cash-=10000;landSize+=15;
 const size=landSize*2;
 ground.geometry.dispose();ground.geometry=new THREE.PlaneGeometry(size,size);
 grid.visible=false;
 updateUI();toast("Your park land has expanded.");
};

function getGroundPoint(event){
 const rect=renderer.domElement.getBoundingClientRect();
 pointer.x=((event.clientX-rect.left)/rect.width)*2-1;
 pointer.y=-((event.clientY-rect.top)/rect.height)*2+1;
 raycaster.setFromCamera(pointer,camera);
 const hits=raycaster.intersectObject(ground);
 return hits.length?hits[0].point:null;
}
renderer.domElement.addEventListener("pointerdown",event=>{
 if(!started)return;
 const rect=renderer.domElement.getBoundingClientRect();
 pointer.x=((event.clientX-rect.left)/rect.width)*2-1;
 pointer.y=-((event.clientY-rect.top)/rect.height)*2+1;
 raycaster.setFromCamera(pointer,camera);
 if(selectedTool==="select" || playMode){
  const hits=raycaster.intersectObjects(objects,true);
  if(hits.length){
   let obj=hits[0].object;
   while(obj.parent && !obj.userData.type)obj=obj.parent;
   if(obj.userData.type)selectObject(obj);
  }else selectObject(null);
  return;
 }
 const point=getGroundPoint(event);
 if(!point)return;
 const x=Math.round(point.x/2)*2;
 const z=Math.round(point.z/2)*2;
 if(Math.abs(x)>landSize-2||Math.abs(z)>landSize-2){toast("That area is outside your park.");return;}
 place(selectedTool,x,z);
});

document.getElementById("buildMode").onclick=()=>{
 playMode=false;setTool("select");
 document.getElementById("buildMode").classList.add("active");
 document.getElementById("playMode").classList.remove("active");
 toast("Build mode enabled.");
};
document.getElementById("playMode").onclick=()=>{
 playMode=true;setTool("select");
 document.getElementById("playMode").classList.add("active");
 document.getElementById("buildMode").classList.remove("active");
 selectObject(null);toast("Explore your park.");
};
document.getElementById("cameraButton").onclick=()=>{
 camera.position.set(35,36,42);controls.target.set(0,0,0);
};
document.getElementById("startButton").onclick=()=>{
 started=true;document.getElementById("overlay").classList.add("hidden");
 toast("Welcome to your new theme park!");
};

let lastTime=0;
let incomeTimer=0;
let visitorTimer=0;
function animate(time){
 requestAnimationFrame(animate);
 const dt=Math.min((time-lastTime)/1000,.05)||0;
 lastTime=time;
 controls.update();
 incomeTimer+=dt;visitorTimer+=dt;

 for(const obj of objects){
  if(obj.userData.type==="ferris"&&obj.userData.wheel){
   obj.userData.wheel.rotation.z+=dt*.25;
  }
 }
 if(visitorTimer>3){
  visitorTimer=0;
  const rides=objects.filter(o=>["carousel","ferris","coaster"].includes(o.userData.type)).length;
  const shops=objects.filter(o=>o.userData.type==="shop").length;
  const target=Math.min(250,rides*12+shops*4);
  visitorCount=Math.max(0,Math.round(target+(Math.random()*6-3)));
  rating=Math.max(10,Math.min(100,Math.round(45+rides*5+shops*2+Math.random()*8)));
  updateUI();
 }
 if(incomeTimer>8){
  incomeTimer=0;
  const income=visitorCount*ticketPrice*.12+
   objects.filter(o=>o.userData.type==="shop").length*18;
  cash+=Math.floor(income);
  day++;
  updateUI();
 }
 renderer.render(scene,camera);
}
requestAnimationFrame(animate);

addEventListener("resize",()=>{
 camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();
 renderer.setSize(innerWidth,innerHeight);
});
updateUI();
</script>
</body>
</html>`;

const server = http.createServer((req, res) => {
  if (req.url === "/favicon.ico") {
    res.writeHead(204);
    return res.end();
  }

  res.writeHead(200, {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(PAGE);
});

server.listen(PORT, "0.0.0.0", () => {
  console.log("Theme Park Empire is running on port " + PORT);
});

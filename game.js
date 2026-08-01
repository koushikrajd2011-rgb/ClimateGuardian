/* ═══════════════════════════════════════════════════════════════════
   EcoDefenders — Main Game Engine
   - Enemies: PNG sprites (flat structure, no folder)
   - Towers: EMOJI (no tower PNGs exist)
   - Road shifted right so factory isn't hidden
   - Triple T: prologue background image only
   ═══════════════════════════════════════════════════════════════════ */

let playerName = localStorage.getItem('cg_playerName') || 'Akira';
function getPlayerName(){ const v=(document.getElementById('playerNameInput')?.value||'').trim(); if(v.length>0){playerName=v.slice(0,16);localStorage.setItem('cg_playerName',playerName);} return playerName; }
function applyNameTags(){ const n=getPlayerName(); document.getElementById('worldPlayerName').textContent='Guardian: '+n; document.getElementById('introPlayerTag').textContent='Guardian: '+n; document.getElementById('zonePlayerTag').textContent='Guardian: '+n; document.getElementById('gamePlayerTag').textContent=n; document.getElementById('worldMapTitle').textContent=n+"'S MAP"; }

// ═══════════════════════════════════════════════════════════════════
// SPRITE LOADER — PNGs for enemies/factory/city, emoji for towers
// ═══════════════════════════════════════════════════════════════════
const spriteImages = {};
function loadSprite(key, src) {
    const img = new Image();
    img.src = src;
    img.onload = () => { spriteImages[key] = img; };
    img.onerror = () => { spriteImages[key] = null; };
    spriteImages[key] = img; // store even while loading
}
function getSprite(key) { return spriteImages[key] || null; }
function isSpriteReady(key) {
    const img = spriteImages[key];
    return img && img.complete && img.naturalWidth > 0;
}

function preloadAllSprites() {
    const s = CONFIG.SPRITES;
    for (const key in s) loadSprite(key, s[key]);
}

// ═══════════════════════════════════════════════════════════════════
// ECO PLEDGE
// ═══════════════════════════════════════════════════════════════════
let ecoPledges = JSON.parse(localStorage.getItem('cg_ecoPledges') || '{}');
let ecoPledgeCount = Object.keys(ecoPledges).length;
let ecoCO2Saved = 0;
for (const k in ecoPledges) { const t = CONFIG.TOWERS[k]; if (t) ecoCO2Saved += t.ecoSavings || 0; }
function makeEcoPledge(towerId) { if (ecoPledges[towerId]) return; ecoPledges[towerId] = true; ecoPledgeCount++; const t = CONFIG.TOWERS[towerId]; if (t) ecoCO2Saved += t.ecoSavings || 0; localStorage.setItem('cg_ecoPledges', JSON.stringify(ecoPledges)); updateEcoDisplay(); }
function updateEcoDisplay() { const el = document.getElementById('ecoPledgeCount'); if (el) el.textContent = ecoPledgeCount; const co2 = document.getElementById('ecoCO2Saved'); if (co2) co2.textContent = ecoCO2Saved; }

// ═══════════════════════════════════════════════════════════════════
// PARTICLES
// ═══════════════════════════════════════════════════════════════════
const particleSystems = {};
function initParticles(canvasId, parentId, hue) {
    const c = document.getElementById(canvasId); const ctx = c.getContext('2d');
    c.width = window.innerWidth; c.height = window.innerHeight;
    const particles = []; const count = Math.floor((c.width * c.height) / 5000);
    for (let i = 0; i < count; i++) particles.push({ x:Math.random()*c.width, y:Math.random()*c.height, vx:(Math.random()-.5)*.5, vy:(Math.random()-.5)*.5, r:2+Math.random()*3, baseR:2+Math.random()*3, hue:hue+Math.random()*40, alpha:.3+Math.random()*.4 });
    let mouse = {x:-9999,y:-9999};
    document.getElementById(parentId).addEventListener('mousemove', e=>{mouse.x=e.clientX;mouse.y=e.clientY;});
    document.getElementById(parentId).addEventListener('mouseleave', ()=>{mouse.x=-9999;mouse.y=-9999;});
    particleSystems[canvasId] = {canvas:c,ctx,particles,mouse};
}
function animateAllParticles() {
    for (const key in particleSystems) {
        const ps = particleSystems[key]; const parent = ps.canvas.parentElement;
        if (!parent || !parent.classList.contains('active')) continue;
        ps.ctx.clearRect(0,0,ps.canvas.width,ps.canvas.height);
        for (const p of ps.particles) {
            const dx=ps.mouse.x-p.x, dy=ps.mouse.y-p.y, dist=Math.sqrt(dx*dx+dy*dy);
            if(dist<150){const f=(150-dist)/150;p.vx-=(dx/dist)*f*.8;p.vy-=(dy/dist)*f*.8;p.r=p.baseR+f*5;p.alpha=.3+f*.7;}else{p.r+=(p.baseR-p.r)*.05;p.alpha+=(.35-p.alpha)*.02;}
            p.vx*=.98;p.vy*=.98;p.x+=p.vx;p.y+=p.vy;
            if(p.x<0)p.x=ps.canvas.width;if(p.x>ps.canvas.width)p.x=0;if(p.y<0)p.y=ps.canvas.height;if(p.y>ps.canvas.height)p.y=0;
            ps.ctx.beginPath();ps.ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ps.ctx.fillStyle=`hsla(${p.hue},70%,55%,${p.alpha})`;ps.ctx.fill();
        }
        for(let i=0;i<ps.particles.length;i++){for(let j=i+1;j<ps.particles.length;j++){const dx2=ps.particles[i].x-ps.particles[j].x,dy2=ps.particles[i].y-ps.particles[j].y,d=Math.sqrt(dx2*dx2+dy2*dy2);if(d<80){ps.ctx.beginPath();ps.ctx.moveTo(ps.particles[i].x,ps.particles[i].y);ps.ctx.lineTo(ps.particles[j].x,ps.particles[j].y);ps.ctx.strokeStyle=`rgba(42,157,106,${.12*(1-d/80)})`;ps.ctx.lineWidth=.8;ps.ctx.stroke();}}}
    }
    requestAnimationFrame(animateAllParticles);
}
document.addEventListener('mousemove',e=>{document.querySelectorAll('.btn').forEach(b=>{const r=b.getBoundingClientRect();b.style.setProperty('--mx',((e.clientX-r.left)/r.width*100)+'%');b.style.setProperty('--my',((e.clientY-r.top)/r.height*100)+'%');});});

// ═══════════════════════════════════════════════════════════════════
// CONVERSATION ENGINE
// ═══════════════════════════════════════════════════════════════════
let convD=[],convI=0,convC=0,convT=null,convCB=null,convH,convS,convP,convCh,convL,convCo;
function startConv(d,ids,cb){convD=d;convI=0;convC=0;convCB=cb;convH=ids.h;convS=ids.s;convP=ids.p;convCh=ids.ch;convL=ids.l;convCo=ids.co;document.getElementById(convH).innerHTML='';showConvLine();}
function showConvLine(){const d=convD[convI];document.getElementById(convS).textContent=d.speaker;document.getElementById(convP).textContent=d.portrait;document.getElementById(convCh).textContent=d.chapter;document.getElementById(convL).textContent='';convC=0;clearInterval(convT);convT=setInterval(()=>{const el=document.getElementById(convL);if(convC<d.text.length){el.textContent+=d.text[convC];convC++;}else{clearInterval(convT);document.getElementById(convCo).style.display='block';}},18);document.getElementById(convCo).style.display='none';}
function advanceConv(){const cur=convD[convI];if(convC<cur.text.length){clearInterval(convT);document.getElementById(convL).textContent=cur.text;document.getElementById(convCo).style.display='block';convC=cur.text.length;}else{pushBubble(convH,cur);if(convI<convD.length-1){convI++;showConvLine();}else{const cb=convCB;convCB=null;if(cb)cb();}}}
function pushBubble(id,d){const h=document.getElementById(id);const div=document.createElement('div');div.className='bubble '+d.type;div.innerHTML=`<div class="b-speaker">${d.speaker}</div><div>${d.text}</div>`;h.appendChild(div);h.scrollTop=h.scrollHeight;}

// ═══════════════════════════════════════════════════════════════════
// PROLOGUE DATA
// ═══════════════════════════════════════════════════════════════════
function getIntroDialogues(n){return[
{speaker:'PLANET EARTH — 2026',portrait:'🌍',chapter:'PROLOGUE',type:'planet',text:`${n}... can you hear me? My fever is +1.24°C and climbing. My glaciers weep. My forests burn. Every night, the Carbon Legion marches from the Old Factory toward my last clean city. I chose you because you still look up, ${n}.`},
{speaker:`YOU — ${n.toUpperCase()}`,portrait:'🧑‍🌾',chapter:'THE PROMISE',type:'player',text:`I grew up in Smog Dawn — coughing through orange skies. Grandma kept a photo of blue sky from 1998. She'd say, "Bring it back, ${n}." So I joined the Guardians.`},
{speaker:'DR. SUN',portrait:'👩‍🔬',chapter:'THE PATH',type:'planet',text:`Look at the holo-map, ${n}. The grey road is where enemies walk — watch the white dashes move from factory to city. Your towers CANNOT go on the road. But anywhere else? Free placement. You can even build during waves!`},
{speaker:'DR. SUN',portrait:'👩‍🔬',chapter:'RULES',type:'planet',text:`Starting money: 175 coins + bonus from stars earned. Each enemy hits HP differently — Microplastic only 1 HP, but Heat Dome takes 5! Build anytime, even mid-wave. Click towers to manage them!`},
{speaker:'LITTLE MIA — 8',portrait:'👧',chapter:'WHY WE FIGHT',type:'child',text:`Guardian ${n}? Will turtles come back if we clear Level 20? My mom said the beach was bottles.`},
{speaker:'SYSTEM',portrait:'⚛️',chapter:'BEGIN',type:'system',text:`Build Phase OPEN — ${n}\nRoad: grey = enemies follow, towers can't go on it\nBuild ANYTIME, even during waves\nWaves per level = zone number\nClick towers to see stats, sell, upgrade\nEach tower teaches you how to help Earth!\nBegin.`},
];}
function getZonePrologue(zid,n,lv){const p={
1:[{speaker:'GRANDMA HOLO',portrait:'👵',chapter:'ZONE 1',type:'planet',text:`${n}, when I was young, the sky was blue. Then the factory came. Your Mangroves store 4× carbon. Place them near bends.`},{speaker:`YOU — ${n}`,portrait:'🧑‍🌾',chapter:'REPLY',type:'player',text:`The grey road leads from factory to city. I'll build Solar Panels and Mangroves everywhere the road isn't.`}],
2:[{speaker:'FISHERMAN KAI',portrait:'🎣',chapter:'ZONE 2',type:'planet',text:`${n}, my net caught more bottles than fish. Your Ocean Drone — 2× vs Plastic. Use it here.`},{speaker:`YOU — ${n}`,portrait:'🧑‍🌾',chapter:'PROMISE',type:'player',text:`I'll place Recycle hubs near the bends. Build anytime, even during waves.`}],
3:[{speaker:'RANGER LUNA',portrait:'🌳',chapter:'ZONE 3',type:'child',text:`${n}! Dozers came at dawn. Each tree held 22kg CO₂ per year. Now it's oil slicks — 2 HP loss each!`},{speaker:`YOU — ${n}`,portrait:'🧑‍🌾',chapter:'VOW',type:'player',text:`I'll use Mangroves and Carbon Capture. The road curves make good ambush corners.`}],
4:[{speaker:'ENGINEER REZA',portrait:'👨‍🏭',chapter:'ZONE 4',type:'planet',text:`I built these pipelines, ${n}. Thought it was progress. One oil tanker — 2 HP if it leaks, plus 2 more slicks.`},{speaker:`YOU — ${n}`,portrait:'🧑‍🌾',chapter:'RESOLVE',type:'player',text:`We fix it with Hydro — 1.5× vs Oil. The road is just a path on the map. I own everything else.`}],
5:[{speaker:'FIREFIGHTER JON',portrait:'🚒',chapter:'ZONE 5',type:'planet',text:`We fought a dome last summer, ${n}. Methane — 4 HP. Heat Dome — 5. You need Geothermal — 1.7× vs them.`},{speaker:`YOU — ${n}`,portrait:'🧑‍🌾',chapter:'STEADY',type:'player',text:`I see the factory entry and city exit clearly. I'll not lose 5 HP to one dome.`}],
6:[{speaker:'DR. SUN',portrait:'👩‍🔬',chapter:'ZONE 6',type:'planet',text:`We did it, ${n}! Wind saved 1.2B tons CO₂. Your Green City buffs nearby towers 20% and generates income.`},{speaker:`YOU — ${n}`,portrait:'🧑‍🌾',chapter:'LIGHT',type:'player',text:`I can afford a Green City now. The road from factory to city feels hopeful.`}],
7:[{speaker:'MIA — NOW 12',portrait:'👧',chapter:'ZONE 7',type:'child',text:`Guardian ${n}! Turtles came back last week! Is that because you cleared Plastic Tide?`},{speaker:`YOU — ${n}`,portrait:'🧑‍🌾',chapter:'TEARS',type:'player',text:`Mia... yes. That's why we fight. The grey road means the whole world. I'll protect the city.`}],
8:[{speaker:'MAYOR LEE',portrait:'🏙️',chapter:'ZONE 8',type:'planet',text:`${n}, if the road reaches us, city loses 5 HP per Heat Dome. You have Fusion — ultimate. Show them net-zero.`},{speaker:`YOU — ${n}`,portrait:'🧑‍🌾',chapter:'FINAL OATH',type:'player',text:`From Smog Dawn to here — 20 levels, my name on every dossier. For Grandma's blue sky, for Mia's turtles, for Earth. Let's end this.`}],
};return p[zid]||p[1];}

// ═══════════════════════════════════════════════════════════════════
// GAME ENGINE
// ═══════════════════════════════════════════════════════════════════
const canvas=document.getElementById('game');const ctx=canvas.getContext('2d');
let pathCanvas,pathCtx,bgCanvas,bgCtx,bgImage=null;
let roadDashOffset=0;
let G={money:175,lives:22,currentWaveIndex:0,totalWaves:1,enemiesAlive:0,waveInProgress:false,state:'idle',towers:[],enemies:[],projectiles:[],mouseX:0,mouseY:0,spawnQueue:[],spawnTimer:0,message:'',messageTimer:0,currentMapIndex:0,pathPixels:null,currentFact:'',factTimer:0,time:0,co2Saved:0,enemiesKilled:0,co2ppm:412,selectedTower:null,buildPhaseTimer:0,inBuildPhase:false,levelComplete:false};
let progress={maxUnlocked:1,stars:Array(20).fill(0),introPlayed:false,zoneProloguesPlayed:new Set()};
let currentTowerType=null;let towerPopup=null;

function shiftPath(path){const ox=CONFIG.PATH_OFFSET_X;return path.map(p=>[p[0]+ox,p[1]]);}
function getWaveCount(level){const z=CONFIG.ZONES.find(z=>level>=z.range[0]&&level<=z.range[1]);return z?z.id:1;}
function getStartMoney(level){let ts=0;for(let i=0;i<level-1;i++)ts+=progress.stars[i]||0;return CONFIG.START_MONEY+5*ts;}
function getWaveData(level,waveIndex){let idx=0;for(let lv=1;lv<level;lv++)idx+=getWaveCount(lv);idx+=waveIndex;if(idx>=CONFIG.WAVE_TEMPLATES.length)idx=CONFIG.WAVE_TEMPLATES.length-1;return CONFIG.WAVE_TEMPLATES[idx];}

function initGame(){
    pathCanvas=document.createElement('canvas');pathCanvas.width=CONFIG.CANVAS_WIDTH;pathCanvas.height=CONFIG.CANVAS_HEIGHT;pathCtx=pathCanvas.getContext('2d');
    bgCanvas=document.createElement('canvas');bgCanvas.width=CONFIG.CANVAS_WIDTH;bgCanvas.height=CONFIG.CANVAS_HEIGHT;bgCtx=bgCanvas.getContext('2d');
    bgImage=new Image();bgImage.src=CONFIG.BACKGROUND_IMG;
    bgImage.onload=()=>{loadMap(G.currentMapIndex);};bgImage.onerror=()=>{bgImage=null;loadMap(G.currentMapIndex);};
    loadMap(0);G.currentFact=CONFIG.ECO_FACTS[Math.floor(Math.random()*CONFIG.ECO_FACTS.length)];
}

function loadMap(idx){
    G.currentMapIndex=idx;const map=MAPS[idx];if(!map)return;
    bgCtx.clearRect(0,0,CONFIG.CANVAS_WIDTH,CONFIG.CANVAS_HEIGHT);
    if(bgImage&&bgImage.complete&&bgImage.naturalWidth>0){bgCtx.drawImage(bgImage,0,0,CONFIG.CANVAS_WIDTH,CONFIG.CANVAS_HEIGHT);}else{drawDefaultBg(idx);}
    pathCtx.clearRect(0,0,CONFIG.CANVAS_WIDTH,CONFIG.CANVAS_HEIGHT);
    drawRoadPath(shiftPath(map.path));
    G.pathPixels=pathCtx.getImageData(0,0,CONFIG.CANVAS_WIDTH,CONFIG.CANVAS_HEIGHT);
}

function drawDefaultBg(idx){
    const rng=seedR(idx*12345+42);bgCtx.fillStyle=idx<10?'#5AA63D':'#4A8E3D';bgCtx.fillRect(0,0,CONFIG.CANVAS_WIDTH,CONFIG.CANVAS_HEIGHT);
    for(let i=0;i<30;i++){bgCtx.fillStyle=`rgba(${idx<10?'70,140,50':'50,120,40'},0.4)`;bgCtx.beginPath();bgCtx.arc(Math.floor(rng()*CONFIG.CANVAS_WIDTH),Math.floor(rng()*CONFIG.CANVAS_HEIGHT),15+rng()*25,0,Math.PI*2);bgCtx.fill();}
    for(let i=0;i<3;i++){bgCtx.fillStyle='rgba(50,115,200,0.5)';bgCtx.beginPath();bgCtx.arc(Math.floor(rng()*CONFIG.CANVAS_WIDTH),Math.floor(rng()*CONFIG.CANVAS_HEIGHT),20+rng()*35,0,Math.PI*2);bgCtx.fill();}
}

// ═══════════════════════════════════════════════════════════════════
// ROAD — grey road + animated white dashes
// ═══════════════════════════════════════════════════════════════════
function drawRoadPath(path){
    const w=CONFIG.PATH_DRAW_WIDTH;
    pathCtx.strokeStyle=CONFIG.ROAD_EDGE_COLOR;pathCtx.lineWidth=w+8;pathCtx.lineCap='round';pathCtx.lineJoin='round';
    pathCtx.beginPath();pathCtx.moveTo(path[0][0],path[0][1]);for(let i=1;i<path.length;i++)pathCtx.lineTo(path[i][0],path[i][1]);pathCtx.stroke();
    pathCtx.strokeStyle=CONFIG.PATH_COLOR;pathCtx.lineWidth=w;pathCtx.lineCap='round';pathCtx.lineJoin='round';
    pathCtx.beginPath();pathCtx.moveTo(path[0][0],path[0][1]);for(let i=1;i<path.length;i++)pathCtx.lineTo(path[i][0],path[i][1]);pathCtx.stroke();
    pathCtx.setLineDash([CONFIG.ROAD_DASH_LEN,CONFIG.ROAD_DASH_GAP]);pathCtx.strokeStyle=CONFIG.ROAD_DASH_COLOR;pathCtx.lineWidth=3;pathCtx.lineCap='butt';
    pathCtx.beginPath();pathCtx.moveTo(path[0][0],path[0][1]);for(let i=1;i<path.length;i++)pathCtx.lineTo(path[i][0],path[i][1]);pathCtx.stroke();
    pathCtx.setLineDash([]);
}

function drawAnimatedDashes(path){
    ctx.save();ctx.globalAlpha=1;ctx.setLineDash([CONFIG.ROAD_DASH_LEN,CONFIG.ROAD_DASH_GAP]);ctx.lineDashOffset=-roadDashOffset;
    ctx.strokeStyle=CONFIG.ROAD_DASH_COLOR;ctx.lineWidth=3;ctx.lineCap='butt';
    ctx.beginPath();ctx.moveTo(path[0][0],path[0][1]);for(let i=1;i<path.length;i++)ctx.lineTo(path[i][0],path[i][1]);ctx.stroke();
    ctx.setLineDash([]);ctx.restore();
}

function seedR(s){return function(){s=(s*16807+0)%2147483647;return s/2147483647;};}

function isPathPos(x,y){
    if(!G.pathPixels)return false;const px=Math.floor(x),py=Math.floor(y);
    if(px<0||px>=CONFIG.CANVAS_WIDTH||py<0||py>=CONFIG.CANVAS_HEIGHT)return false;
    const idx=(py*CONFIG.CANVAS_WIDTH+px)*4;const r=G.pathPixels.data[idx],g=G.pathPixels.data[idx+1],b=G.pathPixels.data[idx+2],a=G.pathPixels.data[idx+3];
    if(a<50)return false;const pc=CONFIG.PATH_COLOR_RGB;
    return Math.abs(r-pc[0])<CONFIG.COLOR_TOLERANCE&&Math.abs(g-pc[1])<CONFIG.COLOR_TOLERANCE&&Math.abs(b-pc[2])<CONFIG.COLOR_TOLERANCE;
}
function canPlace(x,y){if(isPathPos(x,y))return false;for(const t of G.towers){if(Math.hypot(t.x-x,t.y-y)<CONFIG.TOWER_MIN_DISTANCE)return false;}if(x<36||x>CONFIG.CANVAS_WIDTH-36||y<36||y>CONFIG.CANVAS_HEIGHT-36)return false;return true;}

// ── Game Loop ──
function updateGame(dt){
    G.time+=dt;roadDashOffset+=CONFIG.ROAD_DASH_SPEED*dt;if(roadDashOffset>CONFIG.ROAD_DASH_LEN+CONFIG.ROAD_DASH_GAP)roadDashOffset-=CONFIG.ROAD_DASH_LEN+CONFIG.ROAD_DASH_GAP;
    if(G.messageTimer>0)G.messageTimer-=dt;
    if(G.factTimer>0){G.factTimer-=dt;}else if(G.currentWaveIndex>0){G.currentFact=CONFIG.ECO_FACTS[Math.floor(Math.random()*CONFIG.ECO_FACTS.length)];G.factTimer=8;}
    if(G.inBuildPhase){G.buildPhaseTimer-=dt;if(G.buildPhaseTimer<=0){G.inBuildPhase=false;G.waveInProgress=true;showDossier('🌊 Wave '+(G.currentWaveIndex+1)+'/'+G.totalWaves+'!','Build anytime to defend!','info',['🌊 ACTIVE']);updateUI();}}
    if(G.waveInProgress&&G.spawnQueue.length>0){G.spawnTimer-=dt;if(G.spawnTimer<=0){spawnEnemy(G.spawnQueue.shift());G.spawnTimer=CONFIG.SPAWN_INTERVAL;}}
    for(const t of G.towers)t.update(dt,G);
    for(let i=G.enemies.length-1;i>=0;i--){const e=G.enemies[i];const r=e.update(dt);if(r==='reached_end'||r==='dead'){G.enemies.splice(i,1);G.enemiesAlive--;}}
    for(let i=G.projectiles.length-1;i>=0;i--){if(G.projectiles[i].update(dt)!=='alive'){G.projectiles.splice(i,1);}}
    if(G.waveInProgress&&G.spawnQueue.length===0&&G.enemies.length===0&&G.enemiesAlive<=0){
        G.waveInProgress=false;G.currentWaveIndex++;
        if(G.currentWaveIndex>=G.totalWaves){G.levelComplete=true;G.state='victory';showOverlay(true);}
        else{G.state='idle';showDossier('✅ Wave '+(G.currentWaveIndex)+'/'+G.totalWaves+' Complete!','Build more towers or start next wave.','success',['✅ CLEAR']);loadMap(G.currentMapIndex);}
        updateUI();
    }
    if(G.lives<=0&&G.state!=='gameOver'){G.state='gameOver';showOverlay(false);}
}

function renderGame(){
    ctx.globalAlpha=1;ctx.clearRect(0,0,CONFIG.CANVAS_WIDTH,CONFIG.CANVAS_HEIGHT);
    ctx.drawImage(bgCanvas,0,0);ctx.drawImage(pathCanvas,0,0);
    const map=MAPS[G.currentMapIndex];
    if(map){const sp=shiftPath(map.path);drawAnimatedDashes(sp);drawFactory(sp[0]);drawCity(sp[sp.length-1]);}
    if(G.inBuildPhase){ctx.fillStyle='rgba(0,0,0,0.55)';ctx.fillRect(CONFIG.CANVAS_WIDTH/2-140,8,280,48);ctx.fillStyle='#fff';ctx.font='16px "Press Start 2P"';ctx.textAlign='center';ctx.fillText('BUILD: '+Math.ceil(G.buildPhaseTimer)+'s',CONFIG.CANVAS_WIDTH/2,40);}
    ctx.globalAlpha=1;for(const t of G.towers)t.render(ctx);
    ctx.globalAlpha=1;for(const e of G.enemies)e.render(ctx);
    ctx.globalAlpha=1;for(const p of G.projectiles)p.render(ctx);
    drawGhost();drawTowerPopup();
    if(G.messageTimer>0){ctx.globalAlpha=1;ctx.fillStyle='#FF4444';ctx.font='16px "Press Start 2P"';ctx.textAlign='center';ctx.fillText(G.message,CONFIG.CANVAS_WIDTH/2,350);}
}

// ── Factory — PNG if available, else fallback shape ──
function drawFactory(pos){
    const fx=pos[0],fy=pos[1];
    const img=getSprite('factory');
    if(img&&img.complete&&img.naturalWidth>0){ctx.save();ctx.globalAlpha=1;ctx.drawImage(img,fx-52,fy-52,104,104);ctx.restore();}
    else{ctx.save();ctx.globalAlpha=1;ctx.translate(fx,fy);const g=ctx.createLinearGradient(-44,-52,44,18);g.addColorStop(0,'#6a6a6a');g.addColorStop(1,'#5a5a5a');ctx.fillStyle=g;ctx.fillRect(-44,-52,88,70);ctx.fillStyle='#5a5a5a';ctx.fillRect(-32,-84,18,32);ctx.fillRect(4,-94,18,42);ctx.restore();}
    ctx.save();ctx.globalAlpha=1;ctx.fillStyle='#fff';ctx.font='10px "Press Start 2P"';ctx.textAlign='center';ctx.fillRect(fx-52,fy+24,104,20);ctx.fillStyle='#0b1210';ctx.fillText('ENTRY',fx,fy+38);ctx.restore();
}

// ── City — PNG if available, else fallback shape ──
function drawCity(pos){
    const cx=pos[0],cy=pos[1];
    const img=getSprite('city');
    if(img&&img.complete&&img.naturalWidth>0){ctx.save();ctx.globalAlpha=1;ctx.drawImage(img,cx-52,cy-52,104,104);ctx.restore();}
    else{ctx.save();ctx.globalAlpha=1;ctx.translate(cx,cy);const g=ctx.createLinearGradient(-44,-48,44,18);g.addColorStop(0,'#ffffff');g.addColorStop(1,'#c8d8c8');ctx.fillStyle=g;ctx.fillRect(-44,-48,88,66);ctx.restore();}
    ctx.save();ctx.globalAlpha=1;ctx.fillStyle='#fff';ctx.font='10px "Press Start 2P"';ctx.textAlign='center';ctx.fillRect(cx-52,cy+24,104,20);ctx.fillStyle='#132a18';ctx.fillText('EXIT',cx,cy+38);ctx.restore();
}

function drawGhost(){
    if(!currentTowerType||G.state==='gameOver'||G.state==='victory')return;
    if(G.mouseX>=CONFIG.CANVAS_WIDTH)return;
    const d=CONFIG.TOWERS[currentTowerType];if(!d)return;const ok=canPlace(G.mouseX,G.mouseY);
    ctx.save();
    if(d.range>0){ctx.beginPath();ctx.arc(G.mouseX,G.mouseY,d.range,0,Math.PI*2);ctx.fillStyle=ok?'rgba(255,255,255,0.08)':'rgba(255,0,0,0.08)';ctx.fill();ctx.strokeStyle=ok?'rgba(255,255,255,0.3)':'rgba(255,0,0,0.3)';ctx.lineWidth=1;ctx.stroke();}
    ctx.globalAlpha=.65;
    ctx.beginPath();ctx.arc(G.mouseX,G.mouseY,CONFIG.TOWER_RADIUS,0,Math.PI*2);ctx.fillStyle=ok?d.color:'#ff4444';ctx.fill();ctx.strokeStyle=ok?'#fff':'#ff4444';ctx.lineWidth=2;ctx.stroke();
    ctx.font='28px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(d.emoji,G.mouseX,G.mouseY);
    ctx.restore();ctx.globalAlpha=1;
}

// ── Tower Popup ──
function drawTowerPopup(){
    if(!towerPopup||!towerPopup.tower)return;const tw=towerPopup.tower,d=tw.def;const pw=280,ph=220;
    const px=Math.min(tw.x+48,CONFIG.CANVAS_WIDTH-pw-12);const py=Math.max(tw.y-140,8);
    ctx.save();ctx.globalAlpha=1;
    ctx.fillStyle='rgba(0,0,0,0.18)';ctx.beginPath();ctx.roundRect(px+5,py+5,pw,ph,14);ctx.fill();
    ctx.fillStyle='#ffffff';ctx.strokeStyle='#2a9d6a';ctx.lineWidth=3;ctx.beginPath();ctx.roundRect(px,py,pw,ph,14);ctx.fill();ctx.stroke();
    ctx.fillStyle='#ff5a5a';ctx.beginPath();ctx.arc(px+pw-18,py+18,12,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#fff';ctx.font='bold 14px "Press Start 2P"';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('X',px+pw-18,py+18);
    ctx.fillStyle='#132a18';ctx.textAlign='left';ctx.textBaseline='top';
    ctx.font='28px sans-serif';ctx.fillText(d.emoji,px+12,py+10);
    ctx.font='12px "Press Start 2P"';ctx.fillText(d.name,px+50,py+10);
    ctx.font='10px "Press Start 2P"';ctx.fillStyle='#2a9d6a';ctx.fillText('Lv.'+tw.level,px+50,py+30);
    const sy=py+54;ctx.fillStyle='#f0f7ec';ctx.beginPath();ctx.roundRect(px+10,sy,pw-20,28,6);ctx.fill();
    ctx.fillStyle='#132a18';ctx.font='10px "Press Start 2P"';ctx.textAlign='left';
    ctx.fillText('DMG '+Math.floor(tw.dmg+(tw.level-1)*d.dmg*.5),px+18,sy+9);ctx.fillText('RNG '+Math.floor(tw.range),px+145,sy+9);
    ctx.fillStyle='#666';ctx.font='9px "Press Start 2P"';ctx.fillText('Kill '+tw.kills,px+18,sy+40);ctx.fillText('Rate '+tw.rate.toFixed(1),px+145,sy+40);
    ctx.fillStyle='#1f7a52';ctx.font='9px "Press Start 2P"';ctx.fillText('Eco tip:',px+12,sy+58);
    ctx.font='9px sans-serif';ctx.fillStyle='#333';const tipLines=wrapText(d.ecoTip||'',pw-24,9);tipLines.forEach((line,i)=>{ctx.fillText(line,px+12,sy+72+i*13);});
    const by=py+ph-46;const sellVal=tw.getSellValue(),upCost=tw.getUpgradeCost(),canUp=G.money>=upCost&&tw.level<4;
    ctx.fillStyle='#ffe0e0';ctx.strokeStyle='#ff5a5a';ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(px+10,by,120,34,8);ctx.fill();ctx.stroke();
    ctx.fillStyle='#8a1d1d';ctx.font='10px "Press Start 2P"';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('Sell '+sellVal,px+70,by+17);
    ctx.fillStyle=canUp?'#d6f5d6':'#eee';ctx.strokeStyle=canUp?'#2a9d6a':'#ccc';ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(px+140,by,130,34,8);ctx.fill();ctx.stroke();
    ctx.fillStyle=canUp?'#1f5a2f':'#999';ctx.font='10px "Press Start 2P"';ctx.fillText('Up '+upCost,px+205,by+17);
    ctx.restore();
}

function wrapText(text,maxW,fontSize){const words=text.split(' ');const lines=[];let line='';const charW=fontSize*0.55;for(const w of words){const test=line?line+' '+w:w;if(test.length*charW>maxW&&line){lines.push(line);line=w;}else{line=test;}}if(line)lines.push(line);return lines.slice(0,3);}

function handlePopupClick(canvasX,canvasY){
    if(!towerPopup||!towerPopup.tower)return false;const tw=towerPopup.tower;const pw=280,ph=220;
    const px=Math.min(tw.x+48,CONFIG.CANVAS_WIDTH-pw-12);const py=Math.max(tw.y-140,8);const by=py+ph-46;
    if(Math.hypot(canvasX-(px+pw-18),canvasY-(py+18))<14){towerPopup=null;G.selectedTower=null;return true;}
    if(canvasX>=px+10&&canvasX<=px+130&&canvasY>=by&&canvasY<=by+34){G.money+=tw.getSellValue();G.towers=G.towers.filter(t=>t!==tw);towerPopup=null;G.selectedTower=null;updateUI();return true;}
    if(canvasX>=px+140&&canvasX<=px+270&&canvasY>=by&&canvasY<=by+34){const cost=tw.getUpgradeCost();if(G.money>=cost&&tw.level<4){G.money-=cost;tw.level++;tw.range*=1.08;tw.dmg*=1.5;towerPopup=null;updateUI();}return true;}
    if(canvasX>=px&&canvasX<=px+pw&&canvasY>=py&&canvasY<=py+ph)return true;return false;
}

// ── Tower — EMOJI (no tower PNGs exist) ──
class Tower{
    constructor(tid,x,y){const d=CONFIG.TOWERS[tid];this.type=tid;this.def=d;this.x=x;this.y=y;this.level=1;this.range=d.range;this.dmg=d.dmg;this.rate=d.fireRate;this.cooldown=0;this.kills=0;this.flash=0;this.incT=0;}
    update(dt,g){
        if(this.def.effect==='buff'&&this.def.income>0){this.incT+=dt;if(this.incT>=1){this.incT-=1;g.money+=this.def.income;}}
        this.flash=Math.max(0,this.flash-dt);if(this.rate<=0||this.range<=0)return;this.cooldown-=dt;
        if(this.cooldown<=0){let best=null,bp=-1;for(const e of g.enemies){if(!e.alive)continue;const d=Math.hypot(e.x-this.x,e.y-this.y);if(d<=this.range&&e.pathIndex>bp){best=e;bp=e.pathIndex;}}if(best){this.cooldown=this.rate;g.projectiles.push(new Proj(this,best));this.flash=.15;}}
    }
    render(ctx){
        ctx.save();ctx.globalAlpha=1;ctx.translate(this.x,this.y);
        if(G.selectedTower===this&&this.range>0){ctx.fillStyle='rgba(42,157,106,0.06)';ctx.strokeStyle='rgba(42,157,106,0.2)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(0,0,this.range,0,Math.PI*2);ctx.fill();ctx.stroke();}
        ctx.globalAlpha=1;ctx.fillStyle='rgba(0,0,0,0.25)';ctx.beginPath();ctx.ellipse(0,18,26,9,0,0,Math.PI*2);ctx.fill();
        const gr=ctx.createRadialGradient(-6,-6,3,0,0,CONFIG.TOWER_RADIUS);gr.addColorStop(0,this.def.color);gr.addColorStop(1,this._dk(this.def.color,.6));
        ctx.fillStyle=this.flash>0?'#fff':gr;ctx.beginPath();ctx.arc(0,0,CONFIG.TOWER_RADIUS,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle='rgba(255,255,255,0.5)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,CONFIG.TOWER_RADIUS,0,Math.PI*2);ctx.stroke();
        ctx.font='32px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(this.flash>0?'💥':this.def.emoji,0,0);
        ctx.fillStyle='#2a9d6a';for(let i=0;i<this.level;i++){ctx.beginPath();ctx.arc(-12+i*8,22,3.2,0,Math.PI*2);ctx.fill();}
        if(G.selectedTower===this){ctx.strokeStyle='#2a9d6a';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,CONFIG.TOWER_RADIUS+4,0,Math.PI*2);ctx.stroke();}
        ctx.restore();
    }
    _dk(h,f){const r=parseInt(h.slice(1,3),16),g=parseInt(h.slice(3,5),16),b=parseInt(h.slice(5,7),16);return`rgb(${Math.floor(r*f)},${Math.floor(g*f)},${Math.floor(b*f)})`;}
    getUpgradeCost(){return Math.floor(this.def.cost*.7*this.level);}
    getSellValue(){return Math.floor(this.def.cost*.65+(this.level-1)*this.def.cost*.4);}
}

// ── Enemy — PNG ONLY, full opacity ──
class Enemy{
    constructor(type,level){
        const d=CONFIG.ENEMIES[type];this.type=type;this.def=d;
        this.maxHP=Math.floor(d.hp*(1+level*.06));this.hp=this.maxHP;
        this.speed=d.speed*(1+level*.01);this.reward=d.reward;this.livesDmg=d.lives;
        this.co2=d.co2;this.flying=d.flying;this.alive=true;this.pathIndex=0;
        this.slow=0;this.slowT=0;
        const map=MAPS[G.currentMapIndex];const sp=shiftPath(map.path);const p=sp[0];
        this.x=p[0];this.y=p[1];
    }
    update(dt){
        if(!this.alive)return'dead';
        if(this.slowT>0){this.slowT-=dt;if(this.slowT<=0)this.slow=0;}
        const map=MAPS[G.currentMapIndex];if(!map)return'alive';
        const path=shiftPath(map.path);
        let rem=this.speed*(this.slowT>0?(1-this.slow):1)*dt;
        while(rem>0.1&&this.pathIndex<path.length-1){
            const tgt=path[this.pathIndex+1];const dx=tgt[0]-this.x,dy=tgt[1]-this.y;const dist=Math.sqrt(dx*dx+dy*dy);
            if(dist<0.5){this.x=tgt[0];this.y=tgt[1];this.pathIndex++;continue;}
            if(dist<=rem){this.x=tgt[0];this.y=tgt[1];rem-=dist;this.pathIndex++;}else{this.x+=(dx/dist)*rem;this.y+=(dy/dist)*rem;rem=0;}
        }
        if(this.pathIndex>=path.length-1){this.alive=false;G.lives-=this.livesDmg;G.co2ppm+=this.co2;return'reached_end';}
        if(this.hp<=0){this.alive=false;G.money+=this.reward;G.enemiesKilled++;G.co2Saved+=this.co2;return'dead';}
        return'alive';
    }
    takeDamage(d){this.hp-=d;if(this.hp<=0){this.alive=false;G.money+=this.reward;G.enemiesKilled++;G.co2Saved+=this.co2;return true;}return false;}
    applySlow(f,d){if(f<this.slow)this.slow=f;this.slowT=Math.max(this.slowT,d);}
    render(ctx){
        if(!this.alive)return;
        ctx.save();ctx.globalAlpha=1;ctx.translate(this.x,this.y);
        const s=this.def.scale;const sz=Math.floor(CONFIG.TOWER_RADIUS*2*s);
        // Shadow
        ctx.fillStyle='rgba(0,0,0,0.25)';ctx.beginPath();ctx.ellipse(0,16*s,16*s,6*s,0,0,Math.PI*2);ctx.fill();
        // PNG sprite
        const img=getSprite('enemy_'+this.type);
        if(img&&img.complete&&img.naturalWidth>0){
            ctx.globalAlpha=1;ctx.drawImage(img,-sz/2,-sz/2,sz,sz);
        }else{
            // Fallback while loading — show name initial
            ctx.fillStyle=this.def.color||'#ff4444';ctx.beginPath();ctx.arc(0,0,sz/2,0,Math.PI*2);ctx.fill();
            ctx.fillStyle='#fff';ctx.font='bold 16px "Press Start 2P"';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(this.def.name.charAt(0),0,0);
        }
        // HP bar
        ctx.globalAlpha=1;const hpP=this.hp/this.maxHP;
        ctx.fillStyle='#333';ctx.fillRect(-26,-34*s,52,7);
        ctx.fillStyle=hpP>.5?'#4caf5e':hpP>.25?'#ffcc33':'#ff5a5a';ctx.fillRect(-26,-34*s,52*hpP,7);
        ctx.strokeStyle='#000';ctx.lineWidth=1;ctx.strokeRect(-26,-34*s,52,7);
        // HP loss label
        ctx.globalAlpha=1;ctx.fillStyle='#fff';ctx.font='bold 11px "Press Start 2P"';ctx.textBaseline='alphabetic';
        ctx.strokeStyle='#000';ctx.lineWidth=3;ctx.strokeText('-'+this.def.lives+'HP',0,-38*s);ctx.fillText('-'+this.def.lives+'HP',0,-38*s);
        // Slow ring
        if(this.slowT>0){const srImg=getSprite('slowring');if(srImg&&srImg.complete&&srImg.naturalWidth>0){ctx.globalAlpha=1;ctx.drawImage(srImg,-24*s,-24*s,48*s,48*s);}else{ctx.globalAlpha=1;ctx.strokeStyle='#7dd3ff';ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(0,0,24*s,0,Math.PI*2);ctx.stroke();}}
        ctx.restore();
    }
}

// ── Projectile ──
class Proj{
    constructor(tower,target){this.tower=tower;this.target=target;this.x=tower.x;this.y=tower.y;this.type=tower.type;this.dmg=tower.dmg+(tower.level-1)*tower.def.dmg*.5;this.speed=CONFIG.PROJECTILE_SPEED;this.alive=true;}
    update(dt){
        if(!this.alive)return'dead';if(!this.target||!this.target.alive){this.alive=false;return'lost';}
        const dx=this.target.x-this.x,dy=this.target.y-this.y,dist=Math.sqrt(dx*dx+dy*dy);
        if(dist<10){const m=getMult(this.type,this.target.type);const dead=this.target.takeDamage(this.dmg*m);if(!dead&&['mangrove','wind','hydro'].includes(this.type))this.target.applySlow(.5,1.2);this.alive=false;return'hit';}
        const md=this.speed*dt;if(md>=dist){this.x=this.target.x;this.y=this.target.y;}else{this.x+=(dx/dist)*md;this.y+=(dy/dist)*md;}return'alive';
    }
    render(ctx){
        const expImg=getSprite('explosion');
        if(expImg&&expImg.complete&&expImg.naturalWidth>0){ctx.save();ctx.globalAlpha=1;ctx.drawImage(expImg,this.x-5,this.y-5,10,10);ctx.restore();}
        else{ctx.save();ctx.globalAlpha=1;ctx.fillStyle=CONFIG.TOWERS[this.type]?.color||'#fff';ctx.beginPath();ctx.arc(this.x,this.y,5,0,Math.PI*2);ctx.fill();ctx.strokeStyle='rgba(0,0,0,0.3)';ctx.lineWidth=1;ctx.stroke();ctx.restore();}
    }
}

function getMult(t,e){if(t==='wind'&&['smog','deadzone'].includes(e))return 1.8;if(t==='carbon'&&['bulldozer','ewaste','tanker','coal','heatdome','methane'].includes(e))return 1.8;if(t==='ocean'&&['plastic','micro','oil','deadzone'].includes(e))return 2;if(t==='solar'&&['co2','wildfire'].includes(e))return 1.5;if(t==='recycle'&&['plastic','micro','ewaste'].includes(e))return 1.6;if(t==='geo'&&['methane','heatdome','wildfire','coal'].includes(e))return 1.7;if(t==='hydro'&&['oil','tanker','deadzone'].includes(e))return 1.5;if(t==='city')return 1.2;if(t==='fusion')return 1.35;return 1;}

// ── Wave System ──
function startWave(){
    if(G.waveInProgress||G.inBuildPhase||G.state==='gameOver'||G.state==='victory'||G.levelComplete)return;
    G.inBuildPhase=true;G.buildPhaseTimer=CONFIG.BUILD_PHASE_TIME;G.state='wave';
    const level=G.currentMapIndex+1;const waveData=getWaveData(level,G.currentWaveIndex);
    G.spawnQueue=[];for(const g of waveData){for(let i=0;i<g.count;i++)G.spawnQueue.push(g.type);}
    for(let i=G.spawnQueue.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[G.spawnQueue[i],G.spawnQueue[j]]=[G.spawnQueue[j],G.spawnQueue[i]];}
    G.spawnTimer=0;
    document.getElementById('startWaveBtn').disabled=true;document.getElementById('startWaveBtn').textContent='BUILD';
    document.getElementById('shopPhase').textContent='BUILD PHASE';document.getElementById('shopPhase').className='tag tag-success';
    currentTowerType=null;document.querySelectorAll('.towerCard').forEach(c=>c.classList.remove('selected'));
    showDossier('⏳ Build Phase!','Place towers! Enemies arrive in '+CONFIG.BUILD_PHASE_TIME+'s.','build',['⏳ BUILD','🔨 ANYTIME']);updateUI();
}

function spawnEnemy(type){const d=CONFIG.ENEMIES[type];if(!d)return;G.enemies.push(new Enemy(type,G.currentMapIndex+1));G.enemiesAlive++;}

function showOverlay(v){const o=document.getElementById('overlay');o.classList.add('show');const stars=G.lives>=18?3:G.lives>=10?2:1;progress.stars[G.currentMapIndex]=Math.max(progress.stars[G.currentMapIndex],stars);if(G.currentMapIndex+1>=progress.maxUnlocked&&G.currentMapIndex<19)progress.maxUnlocked=G.currentMapIndex+2;const nw=Object.values(CONFIG.TOWERS).filter(t=>t.unlock===progress.maxUnlocked);
const card=document.getElementById('overlayCard');card.innerHTML=`<div style="font-size:42px">${v?'🏆':'💀🌡️'}</div><h1 style="font-size:18px;font-family:'Press Start 2P'">${playerName} ${v?'cleared':'failed'} Lv${G.currentMapIndex+1}</h1><p style="margin:8px 0;font-size:12px;font-family:'Press Start 2P'">${v?stars+'⭐':'Game Over'} • Lives ${G.lives} • CO₂ ${G.co2Saved}</p>${nw.length?`<div style="background:#f1fbf1;border:1px dashed #b9dfb1;border-radius:9px;padding:8px;font-size:11px">🔓 ${nw.map(n=>n.emoji+' '+n.name).join(', ')}</div>`:''}<div style="display:flex;gap:8px;margin-top:12px"><button class="btn btn-primary btn-sm" id="nextLevelBtn" style="flex:1">🗺️ Map</button><button class="btn btn-ghost btn-sm" id="replayBtn" style="flex:1">🔁 Retry</button></div>`;
document.getElementById('nextLevelBtn').onclick=()=>{o.classList.remove('show');showWorldMap();};document.getElementById('replayBtn').onclick=()=>{o.classList.remove('show');startLevel(G.currentMapIndex+1);};buildWorldMap();}

function showDossier(t,txt,mood,tags){document.getElementById('dossierTitle').textContent=t;document.getElementById('dossierText').innerHTML=txt;document.getElementById('dossierIcon').textContent=mood==='danger'?'🚨':mood==='success'?'✅':mood==='build'?'🏗️':'💡';const m=document.getElementById('dossierMeta');m.innerHTML='';(tags||[]).forEach(t=>{const el=document.createElement('span');el.className='tag '+(t.includes('HP')||t.includes('LEAK')?'tag-danger':t.includes('SAVED')||t.includes('CLEAR')||t.includes('BUILD')||t.includes('ANYTIME')?'tag-success':'tag-info');el.textContent=t;m.appendChild(el);});}

function showEcoTip(towerId){const t=CONFIG.TOWERS[towerId];if(!t||!t.ecoTip)return;const popup=document.getElementById('ecoTipPopup');const content=document.getElementById('ecoTipContent');const pledged=ecoPledges[towerId];content.innerHTML=`<div style="display:flex;gap:10px;align-items:center;margin-bottom:8px"><span style="font-size:32px">${t.emoji}</span><div><b style="font-size:13px;font-family:'Press Start 2P'">${t.name}</b><br><span style="font-size:10px;opacity:.6">🌱 Eco Lesson</span></div></div><div style="font-size:12px;line-height:1.6;margin-bottom:8px">${t.ecoTip}</div><div style="background:#f0f7ec;border-radius:8px;padding:6px 10px;font-size:10px;color:#1f7a52;margin-bottom:8px">💡 <b>Why it matters:</b> ${t.fact}</div>${pledged?'<div style="text-align:center;font-size:11px;color:#2a9d6a;font-family:\'Press Start 2P\'">✅ Pledged!</div>':'<button class="btn btn-primary btn-sm" style="width:100%" id="ecoPledgeBtn">🌱 I\'ll do this!</button>'}`;popup.classList.add('show');if(!pledged){document.getElementById('ecoPledgeBtn').onclick=()=>{makeEcoPledge(towerId);showEcoTip(towerId);};}}

// ── UI — towers use emoji, enemies use <img src="enemy_xxx.png"> ──
function buildShop(){
    const shop=document.getElementById('shop');shop.innerHTML='';let uc=0;
    Object.values(CONFIG.TOWERS).forEach(t=>{
        const ul=progress.maxUnlocked>=t.unlock;if(ul)uc++;const l=!ul;
        const div=document.createElement('div');div.className='towerCard'+(l?' locked':'')+(currentTowerType===t.id?' selected':'');
        div.innerHTML=`<div style="display:flex;justify-content:space-between"><span class="emoji">${l?'🔒':t.emoji}</span><span class="tag ${l?'tag-lock':'tag-'+t.trait}">${l?'LOCKED':t.trait}</span></div><div class="name">${t.name}</div><div class="cost">${l?'Lv'+t.unlock:'🪙'+t.cost}</div><div class="meta">${l?'Level '+t.unlock:t.ability}</div>`;
        if(!l){div.onclick=()=>{document.querySelectorAll('.towerCard').forEach(c=>c.classList.remove('selected'));div.classList.add('selected');currentTowerType=t.id;G.selectedTower=null;towerPopup=null;updateSel(true);};}
        else{div.onclick=()=>showDossier('🔒 '+t.name+' locked','Clear Level '+t.unlock+' to unlock. '+t.fact,'info',['🔓 Lv '+t.unlock]);}
        shop.appendChild(div);
    });
    document.getElementById('unlockCount').textContent=uc+'/10';document.getElementById('worldUnlockCount').textContent=uc+'/10';
    const tt=document.getElementById('howToTowerTable');
    if(tt&&tt.children.length===0){
        tt.innerHTML='<tr><th></th><th>Tower + Lv</th><th>Power</th><th>Fact</th></tr>'+Object.values(CONFIG.TOWERS).map(t=>`<tr><td>${t.emoji}</td><td><b>${t.name}</b><br><small>Lv ${t.unlock} • ${t.cost}🪙</small></td><td><span class="tag tag-${t.trait}">${t.ability}</span></td><td>${t.fact}</td></tr>`).join('');
        const et=document.getElementById('howToEnemyTable');
        et.innerHTML='<tr><th></th><th>Enemy • HP loss</th><th>Best vs</th><th>Fact</th></tr>'+Object.entries(CONFIG.ENEMIES).map(([key,e])=>`<tr><td><img src="enemy_${key}.png" style="width:24px;height:24px" onerror="this.outerHTML='❌'"></td><td><b>${e.name}</b><br><small>-${e.lives}HP • +${e.co2}CO₂</small></td><td>${e.weakness}</td><td>${e.fact}</td></tr>`).join('');
        const wp=document.getElementById('howToWavesPreview');
        wp.innerHTML=CONFIG.ZONES.map(z=>`<div style="background:${z.color};border:1px solid #d7ecd7;border-radius:10px;padding:7px;display:flex;gap:8px;align-items:center"><div style="font-size:20px">${z.icon}</div><div><b>${z.name} Lv${z.range[0]}-${z.range[1]}</b> — ${z.desc} • ${z.id} waves</div></div>`).join('');
    }
}

function updateSel(isShop){
    const el=document.getElementById('selectedInfo');
    if(isShop&&currentTowerType){const t=CONFIG.TOWERS[currentTowerType];el.innerHTML=`<div style="display:flex;gap:7px;align-items:center"><span class="big">${t.emoji}</span><div><div style="font-weight:800">${t.name}</div><div style="opacity:.6;font-size:9px">🪙${t.cost} • ${t.dmg} dmg • ${t.range} rng</div></div></div><div style="margin-top:5px;font-size:10px">📚 ${t.fact}<br><span class="tag tag-${t.trait}" style="margin-top:3px">${t.ability}</span></div>`;}
    else if(G.selectedTower){const tw=G.selectedTower,d=tw.def;el.innerHTML=`<div style="display:flex;gap:7px;align-items:center"><span class="big">${d.emoji}</span><div><div style="font-weight:800">${d.name} Lv.${tw.level}</div><div style="opacity:.6;font-size:9px">${tw.kills} kills • Click tower on map for details</div></div></div><div style="margin-top:5px;display:flex;gap:4px;flex-wrap:wrap"><span class="tag tag-${d.trait}">DMG ${Math.floor(tw.dmg+(tw.level-1)*d.dmg*.5)}</span><span class="tag tag-info">RNG ${Math.floor(tw.range)}</span></div>`;}
    else{const lv=G.currentMapIndex+1;const z=CONFIG.ZONES.find(z=>lv>=z.range[0]&&lv<=z.range[1]);el.innerHTML=`<div style="opacity:.7;font-size:10.5px;line-height:1.35"><b>Level ${lv} — ${z?.name||''}</b><br>🔨 Build ANYTIME, even during waves!<br>${z?z.id:'?'} waves this level. Click towers to manage.<br>Grey road = enemy path. Can't place there.</div>`;}
    const preview=document.getElementById('enemyPreview');preview.innerHTML='';
    const level=G.currentMapIndex+1;const waveData=getWaveData(level,G.currentWaveIndex);
    for(const g of waveData){const ed=CONFIG.ENEMIES[g.type];if(!ed)continue;const row=document.createElement('div');row.className='enemyRow';
    row.innerHTML=`<div class="em"><img src="enemy_${g.type}.png" style="width:22px;height:22px" onerror="this.outerHTML='❌'"></div><div class="info"><b>${ed.name} ×${g.count}</b><span>${ed.weakness} • -${ed.lives}HP</span></div>`;
    preview.appendChild(row);}
}

function updateUI(){document.getElementById('lives').textContent=G.lives;document.getElementById('money').textContent=G.money;document.getElementById('wave').textContent=G.currentWaveIndex+' / '+G.totalWaves;const btn=document.getElementById('startWaveBtn');if(G.inBuildPhase){btn.disabled=true;btn.textContent='⏳ BUILD';}else if(G.waveInProgress){btn.disabled=true;btn.textContent='🌊 ACTIVE';}else if(G.levelComplete){btn.disabled=true;btn.textContent='✅ DONE!';}else{btn.disabled=false;btn.textContent='▶ WAVE';}
document.getElementById('shopPhase').textContent=G.inBuildPhase?'BUILD PHASE':G.waveInProgress?'WAVE ACTIVE':'BUILD';document.getElementById('shopPhase').className='tag tag-success';document.getElementById('waveTag').textContent=G.inBuildPhase?'Build Phase':G.waveInProgress?'Wave Active':'Build';document.getElementById('waveTag').className='tag tag-success';buildShop();updateSel(false);updateEcoDisplay();}

// ── World Map ──
function buildWorldMap(){const c=document.getElementById('worldZones');c.innerHTML='';CONFIG.ZONES.forEach((z,zi)=>{const ze=document.createElement('div');ze.className='zone';ze.style.background=`linear-gradient(135deg,#ffffff 72%,${z.color})`;ze.innerHTML=`<div class="zoneHeader"><div><div class="zoneTitle">${z.icon} ${z.name} <span style="font-size:9px;opacity:.5">Lv${z.range[0]}-${z.range[1]}</span></div><div class="zoneDesc">${z.desc} • ${z.id} waves</div></div><div><span class="tag ${progress.maxUnlocked>z.range[1]?'tag-success':progress.maxUnlocked>=z.range[0]?'tag-info':'tag-lock'}">${progress.maxUnlocked>z.range[1]?'✓':progress.maxUnlocked>=z.range[0]?'▶':'🔒'}</span></div></div><div class="zoneLevels" id="zone-${z.id}"></div>`;c.appendChild(ze);const ld=ze.querySelector('#zone-'+z.id);for(let lv=z.range[0];lv<=z.range[1];lv++){const idx=lv-1;const ul=lv<=progress.maxUnlocked;const cm=progress.stars[idx]>0;const nd=document.createElement('div');nd.className='levelNode'+(ul?'':' locked')+(cm?' completed':'')+(lv===progress.maxUnlocked?' current':'');nd.innerHTML=`<div class="lnum">${ul?lv:'🔒'}</div><div class="lwave">${z.id}w</div><div class="lstar">${'⭐'.repeat(progress.stars[idx])||'<span style="opacity:.25">○</span>'}</div>`;if(ul)nd.onclick=()=>startLevel(lv);ld.appendChild(nd);}if(zi<CONFIG.ZONES.length-1){const dv=document.createElement('div');dv.className='chapter-divider '+z.divider;dv.innerHTML=`<div class="divider-icon">${z.divIcon}</div><div class="divider-line"></div><div class="divider-label">${z.divLabel}<br>→ ${CONFIG.ZONES[zi+1].name}</div>`;c.appendChild(dv);}});document.getElementById('worldProgressText').textContent=`${progress.maxUnlocked-1}/20 • ${playerName}`;document.getElementById('worldStats').textContent=`🗺️ ${playerName}'s Journey — ${progress.maxUnlocked-1}/20 cleared`;document.getElementById('worldContinueBtn').onclick=()=>startLevel(progress.maxUnlocked);}

// ── Start Level ──
function startLevel(lv){const z=CONFIG.ZONES.find(z=>lv>=z.range[0]&&lv<=z.range[1]);const isStart=z&&lv===z.range[0];if(isStart&&!progress.zoneProloguesPlayed.has(z.id)){progress.zoneProloguesPlayed.add(z.id);showZonePrologue(z,lv,()=>actuallyStart(lv));}else{actuallyStart(lv);}}

function actuallyStart(lv){
    const idx=lv-1;G.currentMapIndex=idx;G.currentWaveIndex=0;G.totalWaves=getWaveCount(lv);
    G.waveInProgress=false;G.inBuildPhase=false;G.levelComplete=false;G.enemies=[];G.towers=[];G.projectiles=[];
    G.lives=CONFIG.START_LIVES;G.money=getStartMoney(lv);G.co2ppm=412+Math.floor(lv*.4);G.state='idle';
    G.co2Saved=0;G.enemiesKilled=0;G.time=0;G.selectedTower=null;towerPopup=null;currentTowerType=null;G.spawnQueue=[];
    G.enemiesAlive=0;roadDashOffset=0;
    loadMap(idx);const z=CONFIG.ZONES.find(z=>lv>=z.range[0]&&lv<=z.range[1]);
    document.getElementById('gameLevelName').textContent=`Lv${lv} — ${z?.name||''}`;
    document.getElementById('wave').textContent='0 / '+G.totalWaves;
    document.getElementById('overlay').classList.remove('show');showGameScreen();updateUI();
    showDossier(`🏗️ ${playerName} — Lv${lv}`,`Map: ${MAPS[idx].name}. ${G.totalWaves} waves! Build towers, then start!`,'build',['🔨 BUILD ANYTIME','🛣️ ROAD']);
}

// ── Navigation ──
function hideAll(){document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));document.getElementById('gameScreen').style.display='none';}
function showHome(){hideAll();document.getElementById('homeScreen').classList.add('active');document.getElementById('playerNameInput').value=playerName;}
function showHowTo(){hideAll();document.getElementById('howToScreen').classList.add('active');}
function showWorldMap(){hideAll();document.getElementById('worldMapScreen').classList.add('active');applyNameTags();buildWorldMap();}
function showGameScreen(){hideAll();document.getElementById('gameScreen').style.display='flex';}
function showIntro(cb){
    hideAll();const introEl=document.getElementById('introScreen');introEl.classList.add('active');applyNameTags();
    // Triple T: show image as prologue background
    if(playerName.trim().toLowerCase()==='triple t'){
        introEl.style.backgroundImage=`url('triple-t-removebg-preview.png')`;introEl.style.backgroundSize='cover';introEl.style.backgroundPosition='center';
    }else{
        introEl.style.backgroundImage='';introEl.style.backgroundSize='';introEl.style.backgroundPosition='';
    }
    startConv(getIntroDialogues(getPlayerName()),{h:'introHistory',s:'introSpeaker',p:'introPortrait',ch:'introChapter',l:'introLine',co:'introCont'},()=>{introEl.classList.remove('active');introEl.style.backgroundImage='';progress.introPlayed=true;if(cb)cb();else showWorldMap();});
}
function showZonePrologue(zone,lv,cb){hideAll();document.getElementById('zonePrologueScreen').classList.add('active');applyNameTags();document.getElementById('zonePlayerTag').textContent=playerName+' — Zone '+zone.id;startConv(getZonePrologue(zone.id,getPlayerName(),lv),{h:'zoneHistory',s:'zoneSpeaker',p:'zonePortrait',ch:'zoneChapter',l:'zoneLine',co:'zoneCont'},()=>{document.getElementById('zonePrologueScreen').classList.remove('active');if(cb)cb();});}

// ── Event Listeners ──
document.getElementById('homePlayBtn').onclick=()=>{getPlayerName();if(!progress.introPlayed)showIntro(()=>showWorldMap());else showWorldMap();};
document.getElementById('homeHowToBtn').onclick=showHowTo;document.getElementById('howtoBackBtn').onclick=showHome;document.getElementById('howtoPlayBtn').onclick=showWorldMap;document.getElementById('worldHomeBtn').onclick=showHome;document.getElementById('worldHowToBtn').onclick=showHowTo;
document.getElementById('headerMapBtn').onclick=()=>{if(confirm('Abandon Level '+(G.currentMapIndex+1)+'?'))showWorldMap();};
document.getElementById('startWaveBtn').onclick=startWave;
document.getElementById('ecoTipClose').onclick=()=>{document.getElementById('ecoTipPopup').classList.remove('show');};

document.getElementById('introScreen').addEventListener('click',advanceConv);document.getElementById('zonePrologueScreen').addEventListener('click',advanceConv);
window.addEventListener('keydown',e=>{if(document.getElementById('introScreen').classList.contains('active')&&(e.key===' '||e.key==='Enter')){e.preventDefault();advanceConv();}if(document.getElementById('zonePrologueScreen').classList.contains('active')&&(e.key===' '||e.key==='Enter')){e.preventDefault();advanceConv();}if(e.key===' '&&document.getElementById('gameScreen').style.display==='flex'&&!G.waveInProgress&&!G.inBuildPhase&&!G.levelComplete){e.preventDefault();startWave();}if(e.key==='Escape'){towerPopup=null;G.selectedTower=null;currentTowerType=null;document.querySelectorAll('.towerCard').forEach(c=>c.classList.remove('selected'));}});

canvas.addEventListener('mousemove',e=>{
    const r=canvas.getBoundingClientRect();G.mouseX=(e.clientX-r.left)*(CONFIG.CANVAS_WIDTH/r.width);G.mouseY=(e.clientY-r.top)*(CONFIG.CANVAS_HEIGHT/r.height);
    let overTower=false;for(const t of G.towers){if(Math.hypot(t.x-G.mouseX,t.y-G.mouseY)<CONFIG.TOWER_RADIUS+4){overTower=true;break;}}
    if(overTower)canvas.style.cursor='pointer';else if(currentTowerType)canvas.style.cursor='crosshair';else canvas.style.cursor='default';
});
canvas.addEventListener('click',e=>{
    const r=canvas.getBoundingClientRect();const x=(e.clientX-r.left)*(CONFIG.CANVAS_WIDTH/r.width);const y=(e.clientY-r.top)*(CONFIG.CANVAS_HEIGHT/r.height);
    if(handlePopupClick(x,y))return;
    let clickedTower=null;for(const t of G.towers){if(Math.hypot(t.x-x,t.y-y)<CONFIG.TOWER_RADIUS+4){clickedTower=t;break;}}
    if(clickedTower){G.selectedTower=clickedTower;towerPopup={tower:clickedTower};currentTowerType=null;document.querySelectorAll('.towerCard').forEach(c=>c.classList.remove('selected'));updateSel(false);}
    else if(currentTowerType){if(canPlace(x,y)){const cost=CONFIG.TOWERS[currentTowerType].cost;if(G.money>=cost){G.towers.push(new Tower(currentTowerType,x,y));G.money-=cost;showDossier('🛡️ '+CONFIG.TOWERS[currentTowerType].name,CONFIG.TOWERS[currentTowerType].fact,'success',['🏗️ BUILT']);showEcoTip(currentTowerType);if(!e.shiftKey){currentTowerType=null;document.querySelectorAll('.towerCard').forEach(c=>c.classList.remove('selected'));updateSel(false);}updateUI();}else showDossier('🪙 Need coins','Not enough money!','danger',['💸 LOW']);}else showDossier('🚫 Blocked',isPathPos(x,y)?"Can't place on the road!":"Too close to another tower!",'danger',['🚫 BLOCKED']);}
    else{G.selectedTower=null;towerPopup=null;updateSel(false);}
});
canvas.addEventListener('contextmenu',e=>{e.preventDefault();currentTowerType=null;towerPopup=null;G.selectedTower=null;document.querySelectorAll('.towerCard').forEach(c=>c.classList.remove('selected'));});

// ── Init ──
const sn=localStorage.getItem('cg_playerName');if(sn){document.getElementById('playerNameInput').value=sn;playerName=sn;}
initParticles('homeParticles','homeScreen',120);initParticles('introParticles','introScreen',180);initParticles('zoneParticles','zonePrologueScreen',160);initParticles('worldParticles','worldMapScreen',140);animateAllParticles();
preloadAllSprites();initGame();buildShop();buildWorldMap();applyNameTags();updateEcoDisplay();
let lastT=performance.now();function frame(now){const dt=Math.min(.05,(now-lastT)/1000);lastT=now;if(document.getElementById('gameScreen').style.display==='flex'){updateGame(dt);renderGame();document.getElementById('lives').textContent=G.lives;document.getElementById('money').textContent=G.money;if(G.state==='gameOver'&&!document.getElementById('overlay').classList.contains('show'))showOverlay(false);}requestAnimationFrame(frame);}requestAnimationFrame(frame);

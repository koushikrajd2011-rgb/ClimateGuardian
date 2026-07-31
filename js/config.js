/* ═══════════════════════════════════════════════════════════════════
   EcoDefenders — Game Configuration
   ═══════════════════════════════════════════════════════════════════ */
const CONFIG = {
    CANVAS_WIDTH: 1280,
    CANVAS_HEIGHT: 720,
    PATH_DRAW_WIDTH: 48,
    PATH_COLOR: '#8B5926',
    PATH_COLOR_RGB: [139, 89, 38],
    COLOR_TOLERANCE: 55,
    BACKGROUND_IMG: 'assets/background.png',
    START_MONEY: 240,
    START_LIVES: 22,
    SPAWN_INTERVAL: 0.5,
    PROJECTILE_SPEED: 420,
    TOWER_MIN_DISTANCE: 58,
    TOWER_RADIUS: 36,
    BUILD_PHASE_TIME: 5,

    TOWERS: {
        solar:    {id:'solar',   name:'Solar Panel',    emoji:'☀️',  cost:70,  dmg:16, range:132, fireRate:0.48, color:'#ffcc33', effect:'none',  slowFactor:0, slowDuration:0, income:0, description:'Clean energy beam', ability:'1.5× vs CO₂/Wildfire', trait:'warn', unlock:1,  fact:'Solar energy could meet global demand 10,000× over.', ecoTip:'Switch to solar — it cuts your home CO₂ by 80%. Start small: try a solar phone charger!', ecoAction:'Switch to solar energy', ecoSavings:800},
        mangrove: {id:'mangrove',name:'Mangrove',       emoji:'🌳',  cost:85,  dmg:10, range:115, fireRate:0.65, color:'#4caf5e', effect:'slow',  slowFactor:0.5, slowDuration:1.2, income:0, description:'4× carbon storage, slows', ability:'50% slow aura', trait:'slow', unlock:1,  fact:'Mangroves store 4× more carbon than rainforests.', ecoTip:'Plant a tree — each one absorbs 22 kg of CO₂ per year. Even a small garden helps!', ecoAction:'Plant a tree or garden', ecoSavings:22},
        wind:     {id:'wind',    name:'Wind Turbine',   emoji:'🌬️',  cost:100, dmg:24, range:152, fireRate:0.9,  color:'#7dd3ff', effect:'slow',  slowFactor:0.5, slowDuration:1.2, income:0, description:'1.2B tons CO₂ saved/yr', ability:'1.8× vs Flying', trait:'slow', unlock:4,  fact:'Wind saved 1.2B tons CO₂ in 2023.', ecoTip:'Choose green energy — wind power is now the cheapest new electricity source. Ask your provider!', ecoAction:'Switch to green energy', ecoSavings:1500},
        recycle:  {id:'recycle', name:'Recycle Center', emoji:'♻️',  cost:115, dmg:22, range:122, fireRate:0.72, color:'#ff8a5c', effect:'splash', slowFactor:0, slowDuration:0, income:0, description:'Splash damage, Plastic→CO₂', ability:'Splash +2× Plastic', trait:'warn', unlock:8,  fact:'Recycling reduces raw material extraction, saving energy.', ecoTip:'Recycle everything you can — one aluminum can save enough energy to run a TV for 3 hours!', ecoAction:'Recycle at home', ecoSavings:200},
        hydro:    {id:'hydro',   name:'Hydro Plant',    emoji:'💧',  cost:135, dmg:30, range:138, fireRate:0.92, color:'#5eb8ff', effect:'slow',  slowFactor:0.5, slowDuration:1.2, income:0, description:'16% world electricity', ability:'Slow +1.5× Oil', trait:'slow', unlock:13, fact:'Hydropower provides 16% of global electricity.', ecoTip:'Save water — shorter showers save 5 kg CO₂ per month. A running tap wastes 6 litres/minute!', ecoAction:'Reduce water usage', ecoSavings:60},
        carbon:   {id:'carbon',  name:'Carbon Capture', emoji:'🧪',  cost:165, dmg:58, range:195, fireRate:1.45, color:'#9b8af4', effect:'pierce', slowFactor:0, slowDuration:0, income:0, description:'DAC removes 1k t/yr', ability:'Pierce 3 +1.8× armor', trait:'capture', unlock:17, fact:'Carbon capture can remove up to 90% of CO₂ from emissions.', ecoTip:'Support carbon removal — buy from companies that offset emissions. Even small contributions add up!', ecoAction:'Support carbon offset programs', ecoSavings:500},
        geo:      {id:'geo',     name:'Geothermal',     emoji:'🌋',  cost:190, dmg:75, range:170, fireRate:1.25, color:'#ff7a4a', effect:'none',  slowFactor:0, slowDuration:0, income:0, description:'24/7 Earth heat', ability:'1.7× vs Methane/Heat', trait:'warn', unlock:17, fact:'Geothermal energy is available 24/7.', ecoTip:'Heat pumps are 3× more efficient than boilers — they save 1,500 lbs CO₂/yr. Look into one!', ecoAction:'Consider a heat pump', ecoSavings:680},
        ocean:    {id:'ocean',   name:'Ocean Drone',    emoji:'🚤',  cost:160, dmg:32, range:158, fireRate:0.62, color:'#4dd0e1', effect:'none',  slowFactor:0, slowDuration:0, income:0, description:'Cleanup restores ocean', ability:'2× vs Plastic/Micro/Oil', trait:'info', unlock:13, fact:'Ocean cleanup removes millions of tons of plastic.', ecoTip:'Skip single-use plastics — 8 million tons enter oceans yearly. Bring a reusable bottle!', ecoAction:'Reduce single-use plastic', ecoSavings:100},
        city:     {id:'city',    name:'Green City',     emoji:'🏙️',  cost:260, dmg:28, range:178, fireRate:1.0,  color:'#81c784', effect:'buff',  slowFactor:0, slowDuration:0, income:5, description:'Green city -70% emissions', ability:'Buff +20% + income', trait:'success', unlock:17, fact:'Green cities can reduce emissions by 70%.', ecoTip:'Green cities cut emissions 70% — use public transit, bike, or walk. One bus replaces 40 cars!', ecoAction:'Use public transit or bike', ecoSavings:2200},
        fusion:   {id:'fusion',  name:'Fusion',         emoji:'⚛️',  cost:420, dmg:160,range:225, fireRate:1.85, color:'#fff176', effect:'pierce', slowFactor:0, slowDuration:0, income:0, description:'Sun in a bottle — ultimate', ability:'Ultimate power', trait:'warn', unlock:17, fact:'Fusion could provide unlimited clean energy.', ecoTip:'Fusion is coming — but we can\'t wait. Act now: reduce, reuse, advocate. Every action matters!', ecoAction:'Advocate for clean energy', ecoSavings:1000}
    },

    ENEMIES: {
        micro:     {name:'Microplastic',  emoji:'🦠', hp:12,  speed:60,  reward:2,  co2:1,  lives:1, scale:1.0,  flying:false, fact:'Found in blood & clouds', weakness:'Ocean/Recycle 2×'},
        co2:       {name:'CO₂ Cloud',     emoji:'💨', hp:35,  speed:35,  reward:4,  co2:2,  lives:1, scale:1.3,  flying:false, fact:'300+ years in air', weakness:'Solar 1.5×'},
        plastic:   {name:'Plastic Swarm', emoji:'🧴', hp:22,  speed:50,  reward:3,  co2:1,  lives:1, scale:1.15, flying:false, fact:'Only 9% ever recycled', weakness:'Ocean/Recycle'},
        wildfire:  {name:'Wildfire',      emoji:'🔥', hp:44,  speed:42,  reward:5,  co2:5,  lives:2, scale:1.25, flying:false, fact:'Releases stored forest carbon', weakness:'Solar/Geo'},
        smog:      {name:'Factory Smog',  emoji:'🏭', hp:58,  speed:32,  reward:6,  co2:3,  lives:1, scale:1.3,  flying:true,  fact:'7M deaths per year', weakness:'Wind 1.8×'},
        deadzone:  {name:'Dead Zone',     emoji:'💀', hp:80,  speed:33,  reward:7,  co2:3,  lives:2, scale:1.3,  flying:true,  fact:'Ocean dead zones growing', weakness:'Ocean/Wind'},
        oil:       {name:'Oil Slick',     emoji:'🛢️', hp:110, speed:24,  reward:10, co2:4,  lives:2, scale:1.45, flying:false, fact:'Kills plankton', weakness:'Hydro/Ocean'},
        ewaste:    {name:'E-Waste',       emoji:'🔋', hp:150, speed:26,  reward:13, co2:3,  lives:2, scale:1.4,  flying:false, fact:'Toxic metals leach', weakness:'Carbon/Recycle'},
        bulldozer: {name:'Dozer Corp',    emoji:'🚜', hp:200, speed:20,  reward:18, co2:6,  lives:3, scale:1.6,  flying:false, fact:'10% of all emissions', weakness:'Carbon'},
        tanker:    {name:'Oil Tanker',    emoji:'🚛', hp:240, speed:28,  reward:22, co2:5,  lives:2, scale:1.55, flying:false, fact:'Splits into 2 Oil Slicks', weakness:'Hydro/Carbon'},
        coal:      {name:'Coal Train',    emoji:'🚂', hp:360, speed:16,  reward:28, co2:8,  lives:3, scale:1.7,  flying:false, fact:'Dirtiest fossil fuel', weakness:'Carbon/Geo'},
        methane:   {name:'Methane Titan', emoji:'🐄‍💨', hp:780, speed:18,  reward:55, co2:15, lives:4, scale:2.2,  flying:false, fact:'80× more potent than CO₂', weakness:'Geo 1.7×'},
        heatdome:  {name:'Heat Dome',     emoji:'🌡️', hp:1200,speed:15,  reward:85, co2:20, lives:5, scale:2.5,  flying:false, fact:'Blocks rain, cooks city', weakness:'Fusion focus'}
    },

    ZONES: [
        {id:1, name:"Smog Dawn",       icon:"🏭", range:[1,3],   color:"#ededed", desc:"Factories belch first smoke", divider:"river", divIcon:"🌊", divLabel:"River Crossing"},
        {id:2, name:"Plastic Tide",     icon:"🧴", range:[4,6],   color:"#d9eaff", desc:"Ocean fills with plastic", divider:"ocean", divIcon:"🐚", divLabel:"Tide Line"},
        {id:3, name:"Deforestation",    icon:"🚜", range:[7,8],   color:"#d7f0d7", desc:"Forest falls, carbon released", divider:"forest", divIcon:"🌲", divLabel:"Forest Edge"},
        {id:4, name:"Fossil Peak",      icon:"🛢️", range:[9,10],  color:"#ffe8c2", desc:"Oil empire at its height", divider:"canyon", divIcon:"🏜️", divLabel:"Canyon Pass"},
        {id:5, name:"Overheat",         icon:"🔥", range:[11,13], color:"#ffdad0", desc:"Wildfires and heat domes", divider:"fire", divIcon:"🔥", divLabel:"Ash Border"},
        {id:6, name:"Awakening",        icon:"☀️", range:[14,16], color:"#fff3b0", desc:"Renewables rise", divider:"meadow", divIcon:"🌼", divLabel:"Sun Meadow"},
        {id:7, name:"Restoration",      icon:"🌱", range:[17,18], color:"#c9f0cf", desc:"Ecosystems heal", divider:"forest", divIcon:"🌿", divLabel:"Rewilding Line"},
        {id:8, name:"Future City 2050", icon:"🏙️", range:[19,20], color:"#dcd8ff", desc:"Net-zero metropolis", divider:"city", divIcon:"🌉", divLabel:"City Gate"}
    ],

    // 1 WAVE per level, 20 levels total ≈ 30-45 min gameplay
    // More enemies per wave to compensate for single wave
    WAVES: [
        [{type:'co2',count:14}],
        [{type:'co2',count:16},{type:'plastic',count:8}],
        [{type:'plastic',count:12},{type:'oil',count:6}],
        [{type:'co2',count:18},{type:'smog',count:6}],
        [{type:'oil',count:10},{type:'smog',count:8}],
        [{type:'co2',count:20},{type:'smog',count:12},{type:'oil',count:6}],
        [{type:'oil',count:10},{type:'deadzone',count:8},{type:'bulldozer',count:5}],
        [{type:'heatdome',count:3},{type:'methane',count:6},{type:'oil',count:6}],
        [{type:'co2',count:22},{type:'methane',count:10},{type:'oil',count:8}],
        [{type:'heatdome',count:4},{type:'methane',count:8},{type:'oil',count:10}],
        [{type:'co2',count:25},{type:'smog',count:16},{type:'oil',count:6}],
        [{type:'methane',count:12},{type:'oil',count:12},{type:'smog',count:8}],
        [{type:'smog',count:20},{type:'heatdome',count:4},{type:'oil',count:6}],
        [{type:'co2',count:28},{type:'methane',count:14},{type:'smog',count:8}],
        [{type:'oil',count:16},{type:'methane',count:12},{type:'heatdome',count:3}],
        [{type:'heatdome',count:5},{type:'methane',count:12},{type:'oil',count:10}],
        [{type:'co2',count:28},{type:'smog',count:18},{type:'methane',count:10}],
        [{type:'heatdome',count:6},{type:'methane',count:14},{type:'oil',count:12}],
        [{type:'methane',count:18},{type:'heatdome',count:8},{type:'oil',count:14}],
        [{type:'heatdome',count:10},{type:'methane',count:16},{type:'oil',count:16}]
    ],

    ECO_FACTS: [
        "The Earth's average temperature has risen by 1.1°C since pre-industrial times.",
        "CO₂ levels are now over 420 ppm — the highest in 800,000 years.",
        "Renewable energy now accounts for over 30% of global electricity.",
        "Deforestation contributes about 10% of global CO₂ emissions.",
        "Methane is 80× more potent than CO₂ as a greenhouse gas over 20 years.",
        "The last 8 years were the 8 hottest on record.",
        "Climate change could displace over 200 million people by 2050.",
        "Planting trees is one of the most effective ways to remove CO₂.",
        "Switching to solar can reduce a household's carbon footprint by 80%.",
        "Wind energy is now one of the cheapest sources of new electricity.",
        "Recycling one aluminum can saves enough energy to run a TV for 3 hours.",
        "Carbon capture can remove up to 90% of CO₂ from power plant emissions.",
        "Ocean temperatures have risen by 0.88°C since 1901.",
        "Each person produces about 4 tons of CO₂ per year on average.",
        "Extreme weather events have increased by 46% since 2000."
    ]
};

(() => {
  const PY_MAX_EXP = 999999999;
  const PLAYER_EXP = [
    10, 25, 45, 70, 100, 140, 200, 280, 380, 500,
    650, 850, 1100, 1400, 1800, 2300, 2900, 3600, 4400, 5400,
    6800, 8400, 10200, 12500, 17500, 25000, 35000, 50000, 75000, 100000,
    150000, 200000, 275000, 350000, 450000, 550000, 700000, 850000, 1050000, 1300000,
    1550000, 1850000, 2150000, 2500000, 2900000, 3400000, 4000000, 4800000, 5800000, 7000000,
    8200000, 9400000, 10800000, 12600000, 14600000, 16800000, 19200000, 21800000, 24600000, 28000000,
    31500000, 35500000, 40000000, 45000000, 50500000, 56500000, 63000000, 70000000, 78000000, 87000000,
    97000000, 108000000, 120000000, 133000000, 147000000, 162000000, 178000000, 195000000, 213000000, 233000000,
    255000000, 279000000, 305000000, 333000000, 363000000, 395000000, 429000000, 465000000, 503000000, 544000000,
    588000000, 635000000, 685000000, 738000000, 796000000, 859000000, 927000000, 999000000, 999999000
  ];
  const INVENTORY_CAPACITY = 23;
  const BAGS_DEFAULT_ROW_LIMIT = 13;
  const INVENTORY_ICONS = {
    bag:'<svg viewBox="0 0 24 24"><path d="M7 7V5h10v2M6 8h12l2 4v9H4v-9zM7 13h10M9 16h6"/></svg>',
    scroll:'<svg viewBox="0 0 24 24"><path d="M7 3h11v15c0 2-1.5 3-3 3H6c2 0 3-1 3-3V6c0-2-1-3-3-3h1zM12 8h4M12 12h4M12 16h3"/></svg>',
    rod:'<svg viewBox="0 0 24 24"><path d="M5 20L18 7M15 4l5 5M4 21l4-1-3-3zM10 13l2 2"/></svg>',
    wand:'<svg viewBox="0 0 24 24"><path d="M5 19L17 7M15 5l4 4M4 20l3-1-2-2zM17 3v2M21 7h-2M19.5 4.5l-1.5 1.5"/></svg>',
    ammo:'<svg viewBox="0 0 24 24"><path d="M5 20L18 7M15 5l4-1-1 4M4 21l4-1-3-3zM8 17l-3-3M11 14l-3-3"/></svg>',
    staff:'<svg viewBox="0 0 24 24"><path d="M6 21L17 6M15 4l3-2 2 3-2 3M8 16l3 2M5 18l3 3"/></svg>',
    potion:'<svg viewBox="0 0 24 24"><path d="M9 3h6M10 3v5l-4 6v6h12v-6l-4-6V3M7 14h10"/></svg>',
    oil:'<svg viewBox="0 0 24 24"><path d="M8 3h8M9 3v5l-3 4v8h12v-8l-3-4V3M7 13h10"/><path d="M12 11c2 3 3 4 3 6a3 3 0 0 1-6 0c0-2 1-3 3-6z"/></svg>',
    ingredient:'<svg viewBox="0 0 24 24"><path d="M4 17c3-1 5-4 6-8 4 0 7 2 10 6-4 4-10 6-16 2zM9 10c-1-3 0-5 2-7M12 6c2-2 4-2 6-1"/></svg>',
    trap:'<svg viewBox="0 0 24 24"><path d="M4 19l4-12h8l4 12M6 15h12M8 11h8M10 7V4h4v3"/><path d="M9 19l3-4 3 4"/></svg>',
    food:'<svg viewBox="0 0 24 24"><path d="M4 12h16c0 5-3 8-8 8s-8-3-8-8zM3 12h18M8 8c0-2 2-2 2-4M13 9c0-2 2-2 2-5"/></svg>',
    book:'<svg viewBox="0 0 24 24"><path d="M3 5c4-2 7-1 9 1v15c-2-2-5-3-9-1zM21 5c-4-2-7-1-9 1v15c2-2 5-3 9-1zM12 6v15"/><path d="M6 9h3M6 12h3M15 9h3M15 12h3"/></svg>',
    weapon:'<svg viewBox="0 0 24 24"><path d="M5 20L17 8M14 5l5 5M16 3l5 5-3 2-4-4zM4 21l4-1-3-3zM8 15l3 3"/></svg>',
    shield:'<svg viewBox="0 0 24 24"><path d="M12 3c2.7 1.7 5.3 2.5 8 2.8v5.4c0 5-3 8.2-8 9.8-5-1.6-8-4.8-8-9.8V5.8C6.7 5.5 9.3 4.7 12 3z"/><path d="M12 6v12M7 10h10"/></svg>',
    armor:'<svg viewBox="0 0 24 24"><path d="M8 3l4 2 4-2 4 4-3 4v10H7V11L4 7z"/><path d="M9 6v12M15 6v12M7 12h10"/></svg>',
    boots:'<svg viewBox="0 0 24 24"><path d="M7 3h7v10c1 3 4 3 6 4v4H5v-5l2-3zM7 9h7M6 17h10"/></svg>',
    crown:'<svg viewBox="0 0 24 24"><path d="M4 7l4 5 4-8 4 8 4-5-2 12H6zM6 16h12M9 19h6"/><circle cx="12" cy="10" r="1.5"/></svg>'
  };
  const INVENTORY_ITEMS = [
    {name:"Potion Belt",weight:22.9,icon:"bag",color:"#cf5b43",type:"bag",subtype:"potion-belt",quantity:1,bagId:"a"},
    {name:"Antistatic Wrapping",weight:55.0,icon:"bag",color:"#9181ea",type:"bag",subtype:"device-wrap",quantity:1,bagId:"b"},
    {name:"Alchemy Satchel",weight:2.5,icon:"bag",color:"#d18a38",type:"bag",subtype:"alchemy-satchel",quantity:1,bagId:"c"},
    {name:"Trap Kit Bag",weight:2.5,icon:"bag",color:"#4d83d8",type:"bag",subtype:"trap-kit-bag",quantity:1,bagId:"d"},
    {name:"Food Bag",weight:1.5,icon:"bag",color:"#9c6b4b",type:"bag",subtype:"food-bag",quantity:1,bagId:"e"},
    {name:"3× Scrolls of Teleportation",weight:18.0,icon:"scroll",color:"#bd7a35",type:"scroll",subtype:"teleportation",quantity:3,effect:"teleport",useProfile:{effect:"Space twists and carries you far away.",message:"You are teleported a great distance.",resource:"quantity"}},
    {name:"3 Scrolls of Recharging",weight:1.5,icon:"scroll",color:"#b89254",type:"scroll",subtype:"recharging",quantity:3,effect:"recharge",useProfile:{effect:"A device is flooded with renewed magical power.",message:"The device hums with renewed power.",resource:"quantity",target:"item"}},
    {name:"12 Tungsten Rods of Disarming",weight:18.0,icon:"rod",color:"#aeb1aa",type:"rod",subtype:"disarming",quantity:12,usesDirection:true,readyCount:12,chargingCount:0},
    {name:"10 Tin-Plated Rods of Drain Life",weight:18.0,icon:"rod",color:"#a9aca5",type:"rod",subtype:"drain-life",quantity:10,usesDirection:true,readyCount:10,chargingCount:0},
    {name:"11 Tin-Plated Wands of Wall Creation",weight:16.5,icon:"wand",color:"#56d542",magic:true,type:"wand",subtype:"wall-creation",quantity:11,usesDirection:true,charges:33},
    {name:"Dwarven Broad Axe of Gondolin",weight:17.5,icon:"weapon",color:"#ff9a36",magic:true,type:"equipment",slot:"weapon",equipKind:"weapon",eligibleEquipSlots:["main-hand","off-hand"],swapTag:"@x4",quantity:1,itemLevel:42},
    {name:"Mithril Shield of Reflection",weight:12.5,icon:"shield",color:"#62d8ff",magic:true,type:"equipment",slot:"arm",equipKind:"shield",eligibleEquipSlots:["off-hand"],quantity:1,itemLevel:48},
    {name:"Multi-Hued Dragon Scale Mail",weight:28.0,icon:"armor",color:"#c16dff",magic:true,type:"equipment",slot:"body",equipKind:"armour",eligibleEquipSlots:["body"],quantity:1,itemLevel:55},
    {name:"Pair of Soft Leather Boots of Speed (+9)",weight:2.0,icon:"boots",color:"#65f05d",magic:true,type:"equipment",slot:"feet",equipKind:"armour",eligibleEquipSlots:["feet"],quantity:1,itemLevel:50},
    {name:"The Adamantite Crown 'Elenath'",weight:4.0,icon:"crown",color:"#ffe34d",magic:true,trueArtifact:true,type:"equipment",slot:"head",equipKind:"armour",eligibleEquipSlots:["head"],quantity:1,itemLevel:85,artifactLevel:85},
    {name:"3 Flasks of Oil",weight:2.1,icon:"oil",color:"#ffff00",type:"fuel",subtype:"oil",quantity:3,fuelPerItem:7500},
    {name:"5 Potions of Cure Critical Wounds",weight:2.0,icon:"potion",color:"#e45b59",type:"potion",subtype:"cure-critical",quantity:5,useProfile:{effect:"Critical wounds close and the pain recedes.",message:"You feel much better.",resource:"quantity"}},
    {name:"Handbook of Beginner Cantrips",weight:3.0,icon:"book",color:"#62d8ff",type:"book",subtype:"handbook",quantity:1,browsable:true,spellSourceId:"beginner-cantrips"},
    {name:"Divine Race Tome",weight:5.0,icon:"book",color:"#e59a3c",type:"book",subtype:"divine-race-tome",quantity:1,browsable:true,spellSourceId:"divine-race-tome"},
    {name:"Spell Scroll of Power Bolt I",weight:0.5,icon:"scroll",color:"#e59a3c",type:"book",subtype:"spell-scroll",quantity:1,browsable:true,spellSourceId:"power-bolt-scroll"},
    {name:"30 Rounded Pebbles",weight:6.0,icon:"ammo",color:"#c79d55",type:"ammo",subtype:"rounded-pebbles",trapAmmoType:"shot",quantity:30},
    {name:"24 Seeker Bolts",weight:4.8,icon:"ammo",color:"#ffb044",type:"ammo",subtype:"seeker-bolts",trapAmmoType:"bolt",quantity:24},
    {name:"2 Runes of Protection",weight:1.0,icon:"scroll",color:"#b96de1",type:"rune",subtype:"protection",quantity:2}
  ];
  const BAGS = [
    {slot:"a",name:"Potion Belt",capacity:5,icon:"bag",color:"#cf5b43",acceptsTypes:["potion"],items:[
      {name:"96 Purple Potions of Healing",weight:38.4,icon:"potion",color:"#bd4fe5",type:"potion",subtype:"healing",quantity:96,useProfile:{effect:"Powerful healing restores the body.",message:"You feel very good.",resource:"quantity"}},
      {name:"92 Smoky Potions of Speed",weight:36.8,icon:"potion",color:"#d7d3c9",type:"potion",subtype:"speed",quantity:92,useProfile:{effect:"Your movements become supernaturally swift.",message:"You feel yourself moving faster.",resource:"quantity"}},
      {name:"87 Potions of Resistance",weight:34.8,icon:"potion",color:"#6ed8dc",type:"potion",subtype:"resistance",quantity:87,useProfile:{effect:"Elemental wards gather around you.",message:"You feel resistant to the elements.",resource:"quantity"}}
    ]},
    {slot:"b",name:"Antistatic Wrapping",subtype:"device-wrap",capacity:5,icon:"bag",color:"#9181ea",acceptsTypes:["rod","staff"],requiresDirectionless:true,items:[
      {name:"22 Silver-Plated Rods of Healing",weight:33.0,icon:"rod",color:"#b4b7af",type:"rod",subtype:"healing",quantity:22,readyCount:22,chargingCount:0,usesDirection:false},
      {name:"Willow Staff of Genocide of Plenty",weight:5.0,icon:"staff",color:"#58d83d",magic:true,type:"staff",subtype:"genocide",quantity:1,charges:7,usesDirection:false}
    ]},
    {slot:"c",name:"Alchemy Satchel",capacity:9,icon:"bag",color:"#d18a38",acceptsTypes:["ingredient"],items:[
      {name:"Heap of Wood Chips",weight:0.1,icon:"ingredient",color:"#a96f46",type:"ingredient",quantity:1},
      {name:"Smattering of Sulfur",weight:0.1,icon:"ingredient",color:"#dac83e",type:"ingredient",quantity:1},
      {name:"Smattering of Saltpetre",weight:0.1,icon:"ingredient",color:"#d7d5cd",type:"ingredient",quantity:1}
    ]},
    {slot:"d",name:"Trap Kit Bag",capacity:8,icon:"bag",color:"#4d83d8",acceptsTypes:["trap"],items:[
      {name:"Catapult Trap Kit",weight:1.5,icon:"trap",color:"#d48b42",type:"trap",subtype:"catapult",quantity:1},
      {name:"Arrow Trap Kit",weight:1.5,icon:"trap",color:"#c95b4b",type:"trap",subtype:"arrow",quantity:1},
      {name:"Bolt Trap Kit",weight:1.5,icon:"trap",color:"#e45a4b",type:"trap",subtype:"bolt",quantity:1},
      {name:"Fumes Trap Kit",weight:1.5,icon:"trap",color:"#4d83d8",type:"trap",subtype:"fumes",quantity:1},
      {name:"Magic Trap Kit",weight:1.5,icon:"trap",color:"#b96de1",type:"trap",subtype:"magic",quantity:1},
      {name:"Device Trap Kit",weight:1.5,icon:"trap",color:"#aeb1aa",type:"trap",subtype:"device",quantity:1}
    ]},
    {slot:"e",name:"Food Bag",capacity:6,icon:"bag",color:"#9c6b4b",acceptsTypes:["food"],items:[
      {name:"Rations of Food",weight:1.0,icon:"food",color:"#c49d58",type:"food",quantity:15,useProfile:{effect:"The meal relieves your hunger.",message:"That tastes good.",resource:"quantity"}},
      {name:"Mushrooms of Cure Poison",weight:0.1,icon:"food",color:"#69bd66",type:"food",subtype:"cure-poison",fungus:true,fungusId:"cure-poison",quantity:3,useProfile:{effect:"The poison is purged from your body.",message:"You are no longer poisoned.",resource:"quantity"}},
      {name:"Mushrooms of Paranoia",weight:0.1,icon:"food",color:"#b77ad7",type:"food",subtype:"paranoia",fungus:true,fungusId:"paranoia",quantity:2,useProfile:{effect:"Uneasy thoughts crowd your mind.",message:"You feel terribly paranoid.",resource:"quantity"}},
      {name:"Slime Mold",weight:0.1,icon:"food",color:"#80a95c",type:"food",subtype:"slime-mold",fungus:true,fungusId:"slime-mold",quantity:1,useProfile:{effect:"The slime mold nourishes you.",message:"That tastes good.",resource:"quantity"}},
      {name:"Pints of Fine Ale",weight:1.0,icon:"potion",color:"#c68a43",type:"potion",subtype:"ale",quantity:6,useProfile:{effect:"A pleasant warmth spreads through you.",message:"That tastes good.",resource:"quantity"}}
    ]}
  ];
  const FLOOR_ITEMS = [
    {name:"2 Potions of Cure Light Wounds",weight:0.8,icon:"potion",color:"#e45b59",type:"potion",subtype:"cure-light",quantity:2,useProfile:{effect:"Minor wounds begin to close.",message:"You feel better.",resource:"quantity"}},
    {name:"Iron Long Sword",weight:13.0,icon:"weapon",color:"#d7d5cd",type:"equipment",slot:"weapon",equipKind:"weapon",eligibleEquipSlots:["main-hand","off-hand"],quantity:1,itemLevel:8,throwable:true},
    {name:"Scroll of Phase Door",weight:0.5,icon:"scroll",color:"#bd7a35",type:"scroll",subtype:"phase-door",quantity:1,effect:"teleport",useProfile:{effect:"Space folds and shifts you a short distance.",message:"You blink away through a phase door.",resource:"quantity"}}
  ];
  const EQUIPMENT_ICONS = {
    weapon:'<svg viewBox="0 0 24 24"><path d="M5 20L17 8M14 5l5 5M16 3l5 5-3 2-4-4zM4 21l4-1-3-3zM8 15l3 3"/></svg>',
    shield:'<svg viewBox="0 0 24 24"><path d="M12 3c2.7 1.7 5.3 2.5 8 2.8v5.4c0 5-3 8.2-8 9.8-5-1.6-8-4.8-8-9.8V5.8C6.7 5.5 9.3 4.7 12 3z"/><path d="M12 6v12M7 10h10"/></svg>',
    shooter:'<svg viewBox="0 0 24 24"><path d="M6 3c8 4 8 14 0 18M7 4l9 16M5 12h15M17 9l3 3-3 3"/></svg>',
    ring:'<svg viewBox="0 0 24 24"><circle cx="12" cy="14" r="6"/><path d="M8 9l2-5h4l2 5M10 4l2 3 2-3"/></svg>',
    amulet:'<svg viewBox="0 0 24 24"><path d="M6 3c0 6 2 9 6 9s6-3 6-9M12 12v3"/><path d="M12 15l4 3-4 3-4-3z"/></svg>',
    light:'<svg viewBox="0 0 24 24"><path d="M8 9h8l2 11H6zM9 9l1-5h4l1 5M9 14h6"/><path d="M12 2v2M5 6l3 2M19 6l-3 2"/></svg>',
    body:'<svg viewBox="0 0 24 24"><path d="M8 3l4 2 4-2 4 4-3 4v10H7V11L4 7z"/><path d="M9 6v12M15 6v12M7 12h10"/></svg>',
    cloak:'<svg viewBox="0 0 24 24"><path d="M9 3h6l1 4c3 3 4 8 4 14l-8-3-8 3c0-6 1-11 4-14z"/><path d="M9 3l3 4 3-4M12 7v11"/></svg>',
    hat:'<svg viewBox="0 0 24 24"><path d="M5 10l2-6 5 3 5-3 2 6-2 10H7zM6 13h12M9 16h6"/></svg>',
    gloves:'<svg viewBox="0 0 24 24"><path d="M7 21V9M7 13L4 9V5M10 12V4M13 12V3M16 13V5M7 21h7c3-3 4-7 2-10"/></svg>',
    boots:'<svg viewBox="0 0 24 24"><path d="M7 3h7v10c1 3 4 3 6 4v4H5v-5l2-3zM7 9h7M6 17h10"/></svg>',
    quiver:'<svg viewBox="0 0 24 24"><path d="M8 6h9l-2 15H7zM10 6L8 2M13 6V2M16 6l2-4M8 10h8"/></svg>',
    tool:'<svg viewBox="0 0 24 24"><path d="M5 20L17 8M15 4l5 5-3 3-5-5zM4 21l4-1-3-3z"/><path d="M4 8h7M6 5l3 6"/></svg>'
  };
  const CHARACTER_SOURCE_ICONS = {
    weapon:'<svg viewBox="0 0 16 24"><path d="M3 21L12 5M10 3l3 2-2 4M2 16l6 4M2 22l2-5"/></svg>',
    shooter:'<svg viewBox="0 0 16 24"><path d="M4 3c8 5 8 13 0 18M4 3l8 9-8 9M2 12h12M11 9l3 3-3 3"/></svg>',
    ring:'<svg viewBox="0 0 16 24"><circle cx="8" cy="15" r="5"/><path d="M4.5 11L7 5h2l2.5 6M7 5l1 3 1-3"/></svg>',
    amulet:'<svg viewBox="0 0 16 24"><path d="M3 3c0 6 2 9 5 9s5-3 5-9M8 12v3M8 15l4 3-4 3-4-3z"/></svg>',
    light:'<svg viewBox="0 0 16 24"><path d="M4 9h8l1 12H3zM5 9l1-5h4l1 5M5 14h6M8 2v2"/></svg>',
    body:'<svg viewBox="0 0 16 24"><path d="M5 3l3 2 3-2 4 4-3 4v10H4V11L1 7zM5 8h6M8 5v16"/></svg>',
    cloak:'<svg viewBox="0 0 16 24"><path d="M5 3h6l1 5c2 3 3 7 3 13l-7-3-7 3c0-6 1-10 3-13zM5 3l3 5 3-5M8 8v10"/></svg>',
    shield:'<svg viewBox="0 0 16 24"><path d="M8 2c2 2 4 3 7 3v7c0 5-3 8-7 10-4-2-7-5-7-10V5c3 0 5-1 7-3zM8 6v12M4 11h8"/></svg>',
    hat:'<svg viewBox="0 0 16 24"><path d="M2 9l2-6 4 4 4-4 2 6-2 11H4zM3 12h10M6 16h4"/></svg>',
    gloves:'<svg viewBox="0 0 16 24"><path d="M4 21V9M4 13L1 9V6M7 12V4M10 12V3M13 13V6M4 21h6c3-3 4-7 3-11"/></svg>',
    boots:'<svg viewBox="0 0 16 24"><path d="M4 3h7v11c1 2 3 2 4 3v4H2v-5l2-3zM4 9h7M3 17h9"/></svg>',
    quiver:'<svg viewBox="0 0 16 24"><path d="M4 7h9l-2 14H3zM6 7L4 2M9 7V2M12 7l2-5M4 11h8"/></svg>',
    tool:'<svg viewBox="0 0 16 24"><path d="M3 21L11 8M7 5c3-2 6-1 8 1l-2 3c-2-2-4-2-7-1zM2 18l3 3"/></svg>',
    player:'<svg viewBox="0 0 16 24"><circle cx="8" cy="5" r="3"/><path d="M4 21v-6l-2-5 3-2h6l3 2-2 5v6M5 13h6M8 8v9"/></svg>'
  };
  const TERM_COLORS = {
    white:"#ffffff",slate:"#9d9d9d",orange:"#ff8d00",red:"#b70000",green:"#009d44",blue:"#0000ff",
    umber:"#8d6600","l-dark":"#666666","l-white":"#cdcdcd",violet:"#af00ff",yellow:"#ffff00",
    "l-red":"#ff3030","l-green":"#00ff00","l-blue":"#00ffff","l-umber":"#c79d55"
  };
  const EQUIPMENT_SLOT_META = {
    "main-hand":{label:"Main hand",order:0},"off-hand":{label:"Off-hand",order:1},
    shooter:{label:"Shooter",order:2},"ring-left":{label:"Left ring",order:3},"ring-right":{label:"Right ring",order:4},
    neck:{label:"Amulet",order:5},light:{label:"Light source",order:6},body:{label:"Body armour",order:7},
    outer:{label:"Cloak",order:8},head:{label:"Head",order:9},hands:{label:"Gloves",order:10},
    feet:{label:"Boots",order:11},ammo:{label:"Ammunition",order:12},tool:{label:"Tool",order:13}
  };
  const EQUIPMENT_ITEMS = [
    {key:"a",equipSlotId:"main-hand",slot:"weapon",slotName:"(weapon)",equipKind:"weapon",eligibleEquipSlots:["main-hand","off-hand"],swapTag:"@x4",name:"+22 Silver-Plated Long Sword of Gondolin",weight:18.0,tone:"l-green",throwable:true},
    {key:"b",equipSlotId:"off-hand",slot:"shield",slotName:"(weapon / shield)",equipKind:"shield",eligibleEquipSlots:["off-hand"],name:"Mithril Shield of Reflection",weight:12.5,tone:"l-blue"},
    {key:"c",equipSlotId:"shooter",slot:"shooter",slotName:"(shooter)",equipKind:"shooter",eligibleEquipSlots:["shooter"],name:"Long Bow of Extra Might",weight:9.0,tone:"l-green"},
    {key:"d",equipSlotId:"ring-left",slot:"ring",slotName:"(ring)",equipKind:"ring",eligibleEquipSlots:["ring-left","ring-right"],name:"Ring of Speed (+11)",weight:0.2,tone:"yellow"},
    {key:"e",equipSlotId:"ring-right",slot:"ring",slotName:"(ring)",equipKind:"ring",eligibleEquipSlots:["ring-left","ring-right"]},
    {key:"f",equipSlotId:"neck",slot:"amulet",slotName:"(amulet)",equipKind:"jewellery",eligibleEquipSlots:["neck"],name:"Amulet of ESP",weight:0.3,tone:"l-blue"},
    {key:"g",equipSlotId:"light",slot:"light",slotName:"(light source)",equipKind:"light",eligibleEquipSlots:["light"],name:"Brass Lantern",weight:3.5,tone:"l-umber",finiteFuel:true,fuelType:"oil",fuelTurns:7500,maxFuelTurns:15000,itemLevel:3},
    {key:"h",equipSlotId:"body",slot:"body",slotName:"(body armour)",equipKind:"armour",eligibleEquipSlots:["body"],name:"Red Dragon Scale Mail",weight:20.0,tone:"l-red",setLevel:2,itemLevel:65,activatable:true,usesDirection:true,activationKind:"dragon-breath",activationElement:"fire",activationText:"breathing fire (600..1200) every 200+d100 turns",activationCooldown:"200+d100 turns",useProfile:{effect:"A cone of dragon fire erupts toward the selected cell.",message:"You breathe fire from the dragon scale mail.",resource:"cooldown",cooldown:"200+d100 turns",target:"grid"},properties:["Immunity to fire","Levitation","Regeneration","Fiery aura"]},
    {key:"i",equipSlotId:"outer",slot:"cloak",slotName:"(cloak)",equipKind:"armour",eligibleEquipSlots:["outer"],name:"Elven Cloak of Stealth",weight:1.5,tone:"l-green",setLevel:2},
    {key:"j",equipSlotId:"head",slot:"hat",slotName:"(hat)",equipKind:"armour",eligibleEquipSlots:["head"],name:"Iron Crown of Telepathy",weight:3.0,tone:"violet"},
    {key:"k",equipSlotId:"hands",slot:"gloves",slotName:"(gloves)",equipKind:"armour",eligibleEquipSlots:["hands"],name:"Gauntlets of Combat",weight:2.5,tone:"orange"},
    {key:"l",equipSlotId:"feet",slot:"boots",slotName:"(boots)",equipKind:"armour",eligibleEquipSlots:["feet"],name:"Soft Leather Boots of Speed",weight:2.0,tone:"l-green"},
    {key:"m",equipSlotId:"ammo",slot:"quiver",slotName:"(quiver)",equipKind:"ammo",eligibleEquipSlots:["ammo"],name:"42 Seeker Arrows",weight:4.2,tone:"yellow",ironTrade:true,trapAmmoType:"arrow",quantity:42},
    {key:"n",equipSlotId:"tool",slot:"tool",slotName:"(tool)",equipKind:"tool",eligibleEquipSlots:["tool"]}
  ];
  const MESSAGE_ARCHIVE_PATTERNS = [
    {type:"world",markup:"You enter the western quarter of Bree."},
    {type:"state",markup:"You feel watchful."},
    {type:"combat",markup:"The town guard strikes a prowling wolf."},
    {type:"loot",markup:'You see <b class="l-umber">an old torch</b>.'},
    {type:"chat",markup:'<b class="cyan">Northwatch:</b> road is safe'},
    {type:"server",markup:'<b class="gold">Server:</b> A cool breeze crosses the town.'},
    {type:"world",markup:"The Prancing Pony can be seen to the east."},
    {type:"combat",danger:true,markup:"A distant howl echoes beyond the hedge."},
    {type:"state",markup:"You hear footsteps on the cobbles."},
    {type:"chat",markup:'<b class="cyan">Greenhand:</b> anyone near the south gate?'},
    {type:"loot",markup:'You pick up <b class="gold">2 Gold</b>.'},
    {type:"world",markup:"You pass beneath a weathered wooden sign."}
  ];
  const MESSAGE_STREAM = [
    ...Array.from({length:36},(_,index) => ({...MESSAGE_ARCHIVE_PATTERNS[index % MESSAGE_ARCHIVE_PATTERNS.length]})),
    {type:"world",markup:"You leave the training hall."},
    {type:"chat",markup:'<b class="cyan">Lightbearer:</b> Bree gate is clear.'},
    {type:"state",markup:"You feel less thirsty."},
    {type:"loot",markup:'You have found <b class="l-blue">a Scroll of Identify</b>.'},
    {type:"server",markup:'<b class="gold">Server:</b> The weather turns calm.'},
    {type:"combat",markup:"A wild cat misses you."},
    {type:"chat",markup:'<b class="cyan">PlayerTwo:</b> meeting by the fountain'},
    {type:"world",markup:"You see a cobbled road leading north."},
    {type:"state",markup:"You are no longer hungry."},
    {type:"combat",markup:"You hit the wild cat for <b>12 damage</b>."},
    {type:"combat",markup:"The wild cat flees in terror."},
    {type:"loot",markup:'You pick up <b class="gold">7 Gold</b>.'},
    {type:"chat",markup:'<b class="green">MaiaMage:</b> on my way'},
    {type:"server",markup:'<b class="gold">Server:</b> Welcome, new adventurers!'},
    {type:"world",markup:"The lamps of Bree flicker in the evening wind."},
    {type:"state",markup:"You feel safe here."},
    {type:"chat",markup:'<b class="cyan">Lightbearer:</b> hi all'},
    {type:"chat",markup:'<b class="green">MaiaMage:</b> hello'},
    {type:"server",markup:'<b class="gold">Server:</b> Welcome to Bree!'},
    {type:"state",markup:"You feel wary."},
    {type:"chat",markup:'<b class="cyan">PlayerTwo:</b> anyone for xp?'},
    {type:"chat",markup:'<b class="cyan">Lightbearer:</b> sure'},
    {type:"loot",markup:'You pick up <b class="gold">3 Gold</b>.'},
    {type:"combat",markup:"The Bree guard hits the wolf for <b>17 damage</b>."},
    {type:"combat",danger:true,markup:"The wolf claws you for <b>9 damage</b>."},
    {type:"state",markup:"You sense monsters nearby."},
    {type:"world",markup:"You enter <b>Bree</b>."},
    {type:"server",markup:'<b class="gold">Server:</b> Night will fall in 20 minutes.'}
  ];
  const RIGHT_PANEL_WIDGETS = [
    {id:"msgChat",elementId:"msgChatWidget",label:"Messages"},
    {id:"inventory",elementId:"inventoryWidget",label:"Inventory"},
    {id:"equipment",elementId:"equipmentWidget",label:"Equipment"},
    {id:"bags",elementId:"bagsWidget",label:"Bags"},
    {id:"character",elementId:"characterWidget",label:"Character"}
  ];
  const DEFAULT_RIGHT_PANEL_ORDER = RIGHT_PANEL_WIDGETS.map(widget => widget.id);
  const CHARACTER_DATA = {
    name:"MaiaMage", sex:"Female", race:"Maia", className:"Mimic",
    body:"Vampire", trait:"Enlightened", mode:"Everlasting (infinite lives)", status:"Alive", totalWinner:false,
    age:124, height:72, weight:146, socialClass:57, armor:193,
    stats:[
      ["STR","18 / 180","l-umber"],["INT","18 / 180","l-umber"],["WIS","18 / 160","l-umber"],
      ["DEX","18 / 140","l-umber"],["CON","18 / 180","l-umber"],["CHR","18 / 90","l-green"]
    ],
    combat:{
      melee:[["Fighting","Heroic","l-green"],["Hit","+47","l-green"],["Damage","+38","l-green"],["Blows / Round",null,"l-green"],[null,null],["Total AC","193","l-green"]],
      ranged:[["Bows / Throw","Superb","l-green"],["Hit","+31","l-green"],["Damage","+12","l-green"],["Shots / Round","1","l-green"],[null,null],["Infra-Vision","30 feet","l-green"]],
      other:[["Stealth","Excellent","l-green"],["Disarming","Heroic","l-green"],["Perception","Superb","l-green"],["Magic Device","Legendary","l-green"],["Saving Throw","Legendary","l-umber"],["Searching","Excellent","l-green"]]
    },
    history:[
      "You are one of the Maiar, spirits who entered Arda before the shaping of the world.",
      "Long years among the Free Peoples taught you patience, craft and hidden lore.",
      "You took a mortal shape to oppose the Shadow without ruling those you protect.",
      "Now the roads of Middle-earth have drawn you to the gates of Bree."
    ]
  };
  const CHARACTER_SOURCES = [
    ["a","Weapon"],["b","Shooter"],["c","Left ring"],["d","Right ring"],
    ["e","Amulet"],["f","Light"],["g","Body armour"],["h","Cloak"],
    ["i","Shield"],["j","Headgear"],["k","Gloves"],["l","Boots"],
    ["m","Ammo"],["n","Tool"],["@","Player / body"]
  ];
  const CHARACTER_SOURCE_EQUIPMENT = [
    {icon:"weapon",name:"+22 Silver-Plated Long Sword of Gondolin",tone:"l-green"},
    {icon:"shooter",name:"Long Bow of Extra Might",tone:"l-green"},
    {icon:"ring",name:"Ring of Speed (+11)",tone:"yellow"},
    {empty:true,name:"Empty right ring slot",tone:"l-dark"},
    {icon:"amulet",name:"Amulet of ESP",tone:"l-blue"},
    {icon:"light",name:"Brass Lantern",tone:"l-umber"},
    {icon:"body",name:"Red Dragon Scale Mail",tone:"l-red"},
    {icon:"cloak",name:"Elven Cloak of Stealth",tone:"l-green"},
    {icon:"shield",name:"Mithril Shield of Reflection",tone:"l-blue"},
    {icon:"hat",name:"Iron Crown of Telepathy",tone:"violet"},
    {icon:"gloves",name:"Gauntlets of Combat",tone:"orange"},
    {icon:"boots",name:"Soft Leather Boots of Speed",tone:"l-green"},
    {icon:"quiver",name:"42 Seeker Arrows",tone:"yellow"},
    {empty:true,name:"Empty tool slot",tone:"l-dark"},
    {icon:"player",name:"Player / current body",tone:"white"}
  ];
  const CHARACTER_RESIST_GROUPS = [
    {title:"Resistances",kind:"resist",rows:["Fire","Cold","Elec","Acid","Pois","Blnd","Lite","Dark","Soun","Shrd","Nexu","Neth","Conf","Chao","Dise","Watr","Time","Mana","Mind"]},
    {title:"Abilities",kind:"flag",rows:["Fear","Para","HLif","Tele","FFal","Lvtn","Clmb","SInv","Invs","Refl","Wrth","RgHP","RgMP","Food","Vamp","AuID","AMSh","AMFi","Aggr"]},
    {title:"Bonuses",kind:"bonus",rows:["Spd","Slth","Srch","Infr","Lite","Tunn","Blow","Crit","Shot","Mght","MxHP","MxMP","Luck","STR","INT","WIS","DEX","CON","CHR"]},
    {title:"Slays / brands",kind:"slay",rows:["Spid","Anim","Orcs","Trol","Gian","Drgn","Demn","Undd","Evil","Dgri","Good","Nonl","Uniq","Fire","Cold","Elec","Acid","Pois","Vorp"]}
  ];
  const ENCUMBRANCE_STATUSES = [
    {id:"easy_wield",slot:0,group:"wield",label:"Two-handed bonus",color:"#54d84d",description:"A suitable one-handed weapon is used with both hands for a small bonus.",icon:'<svg viewBox="0 0 24 24"><path d="M12 3v14M9 6l3-3 3 3M7 20h10M8 16h8"/><path d="M5 12c2 0 3 1 3 3M19 12c-2 0-3 1-3 3"/></svg>'},
    {id:"heavy_wield",slot:0,group:"wield",label:"Heavy weapon",color:"#e3483d",description:"The wielded weapon is too heavy to use effectively.",icon:'<svg viewBox="0 0 24 24"><path d="M5 19L17 7M14 4l6 6M16 3l5 5-3 2-4-4zM3.5 20.5l3.5-1-2.5-2.5z"/><path d="M14 18h7M16 15.5h3l1 2.5-1 2.5h-3L15 18z"/></svg>'},
    {id:"awkward_wield",slot:0,group:"wield",label:"Awkward weapon",color:"#e1c53f",description:"A one-and-a-half-handed weapon is being used together with a shield.",icon:'<svg viewBox="0 0 24 24"><path d="M4 20L15 9M13 5l6 6M15 4l5 5-3 2-4-4z"/><path d="M15 13c2.1 1.2 4 1.5 6 1.7v2.5c0 2.2-1.2 3.7-3.5 4.5-2.3-.8-3.5-2.3-3.5-4.5v-1"/></svg>'},
    {id:"icky_wield",slot:1,label:"Unsuitable weapon",color:"#df852d",description:"The weapon conflicts with the character class or nature.",icon:'<svg viewBox="0 0 24 24"><path d="M4 20L17 7M14 4l6 6M16 3l5 5-3 2-4-4z"/><path d="M5 4l15 16M18.5 20.5l2-2M3.5 5.5l2-2"/></svg>'},
    {id:"heavy_tool",slot:2,label:"Heavy tool",color:"#e3483d",description:"The digging tool is too heavy and severely penalizes melee combat.",icon:'<svg viewBox="0 0 24 24"><path d="M6 21L15.5 7.5M12 5c3-1.7 6.3-1.3 9 1.2L18.5 9c-1.7-2.2-4.5-3.3-7.2-2.4z"/><path d="M3 18l3 3M15 18h6M17 15.5h2l1.3 2.5-1.3 2.5h-2L15.7 18z"/></svg>'},
    {id:"heavy_shield",slot:3,label:"Heavy shield",color:"#e3483d",description:"The shield is too heavy and greatly reduces block chance.",icon:'<svg viewBox="0 0 24 24"><path d="M12 3c2.6 1.7 5.3 2.4 8 2.7v5.5c0 5-3 8.2-8 9.8-5-1.6-8-4.8-8-9.8V5.7C6.7 5.4 9.4 4.7 12 3z"/><path d="M7 12h10M9 9h6v6H9z"/></svg>'},
    {id:"heavy_shoot",slot:4,group:"shoot",label:"Heavy shooter",color:"#e3483d",description:"The ranged weapon is too heavy to shoot effectively.",icon:'<svg viewBox="0 0 24 24"><path d="M6 3c8 4.4 8 13.6 0 18M6 3c3.3 5.5 3.3 12.5 0 18M6 12h14M17 9l3 3-3 3"/><path d="M14 18h7M16 15.5h3l1 2.5-1 2.5h-3L15 18z"/></svg>'},
    {id:"awkward_shoot",slot:4,group:"shoot",label:"Shielded shooting",color:"#e1c53f",description:"A shield on the arm reduces ranged accuracy.",icon:'<svg viewBox="0 0 24 24"><path d="M4 3c6 4.4 6 13.6 0 18M4 3c2.7 5.5 2.7 12.5 0 18M4 12h10M11 9l3 3-3 3"/><path d="M17 7c1.5 1 3 1.3 4.5 1.5v4c0 2.8-1.5 4.7-4.5 5.7-3-1-4.5-2.9-4.5-5.7v-4C14 8.3 15.5 8 17 7z"/></svg>'},
    {id:"cumber_armor",slot:5,label:"Movement armour",color:"#a77745",description:"Armour weight penalizes accuracy and sneakiness.",icon:'<svg viewBox="0 0 24 24"><path d="M8 4l4 2 4-2 4 4-3 3v10H7V11L4 8zM10 7v5h4V7"/><path d="M2.5 18h3M1.5 21h4"/></svg>'},
    {id:"monk_heavyarmor",slot:6,label:"Martial arts armour",color:"#e1c53f",description:"Armour is too heavy for martial-arts abilities.",icon:'<svg viewBox="0 0 24 24"><path d="M8 4l4 2 4-2 4 4-3 3v10H7V11L4 8z"/><path d="M9 16v-4a1 1 0 0 1 2 0v2-3a1 1 0 0 1 2 0v3-2a1 1 0 0 1 2 0v4c0 2-1.2 3.2-3 3.2S9 18 9 16z"/></svg>'},
    {id:"cumber_weight",slot:7,label:"Overloaded pack",color:"#ef6a58",description:"Backpack weight removes the Martial Arts Free Action bonus.",icon:'<svg viewBox="0 0 24 24"><path d="M8 7V5a4 4 0 0 1 8 0v2M6 8h12l2 4v9H4v-9zM7 13h10M9 16h6"/><path d="M3 12h3M18 12h3"/></svg>'},
    {id:"rogue_heavyarmor",slot:8,label:"Rogue armour",color:"#4384d9",description:"Armour is too rigid for dodging, dual-wielding and rogue abilities.",icon:'<svg viewBox="0 0 24 24"><path d="M5 19c1-7 3-12 7-16 4 4 6 9 7 16-4 2-10 2-14 0zM8 13c2.5-1 5.5-1 8 0M9 16h1M14 16h1"/><path d="M12 3v7"/></svg>'},
    {id:"awkward_armor",slot:9,label:"Mana-heavy armour",color:"#a66be0",description:"Armour weight reduces the character's mana pool.",icon:'<svg viewBox="0 0 24 24"><path d="M8 4l4 2 4-2 4 4-3 3v10H7V11L4 8z"/><path d="M12 9c2 2.5 3 4.2 3 5.6a3 3 0 0 1-6 0C9 13.2 10 11.5 12 9z"/></svg>'},
    {id:"cumber_glove",slot:10,label:"Casting gloves / helm",color:"#ae6be2",description:"Gloves or mindcrafter headgear interfere with spellcasting and reduce mana.",icon:'<svg viewBox="0 0 24 24"><path d="M6 13V7a1.3 1.3 0 0 1 2.6 0v4-6a1.3 1.3 0 0 1 2.6 0v6-5a1.3 1.3 0 0 1 2.6 0v5-3a1.3 1.3 0 0 1 2.6 0v7c0 3.7-2.3 6-5.7 6C7.5 21 5.5 19 4 16l-1-2a1.5 1.5 0 0 1 2.3-1.8L8 15"/><path d="M19 3v4M17 5h4"/></svg>'},
    {id:"heavy_swim",slot:11,label:"Heavy swimming (unused)",color:"#55bfe6",description:"Protocol-supported swimming encumbrance; currently not feasible in gameplay.",icon:'<svg viewBox="0 0 24 24"><path d="M3 16c2 0 2 1.5 4 1.5S9 16 11 16s2 1.5 4 1.5 2-1.5 4-1.5 2 1.5 3 1.5M3 20c2 0 2 1.5 4 1.5S9 20 11 20s2 1.5 4 1.5 2-1.5 4-1.5 2 1.5 3 1.5"/><circle cx="8" cy="7" r="2"/><path d="M10 10l4 2 3-3M6 14l4-4"/></svg>'}
  ];
  const STATUS_ICONS = {
    speed:'<svg viewBox="0 0 24 24"><path d="M5 15c4.4-.1 6.5-2.3 7.2-7l3.1 1.5-1 4.2 4.7 2.4c1.4.7 1.1 3-.5 3.2H7.2C4.8 19.3 3.6 18 5 15z"/><path d="M3 10h6M2 13h6M16 6l2-3M19 8l3-1"/></svg>',
    bpr:'<svg viewBox="0 0 24 24"><path d="M4 20L17 7M14 4l6 6M16 3l5 5-3 2-4-4zM3 21l4-1-3-3z"/><path d="M12 18h9M14 15h7M17 12h4"/></svg>',
    fire:'<svg viewBox="0 0 24 24"><path d="M13 2c1 4-2 5-1 8 1-1 2-2 4-2 2 2 3 4 3 7a7 7 0 0 1-14 0c0-4 2-7 6-10 0 3 1 4 2 5"/><path d="M12 12c2 2 2 5 0 7-3-1-4-5 0-7z"/></svg>',
    cold:'<svg viewBox="0 0 24 24"><path d="M12 2v20M3.3 7l17.4 10M3.3 17l17.4-10M9 4l3 3 3-3M9 20l3-3 3 3M4 10l4 1-1-4M20 14l-4-1 1 4M4 14l4-1-1 4M20 10l-4 1 1-4"/></svg>',
    elec:'<svg viewBox="0 0 24 24"><path d="M14 2L5 14h7l-2 8 9-12h-7z"/><path d="M4 5l2 2M18 17l2 2"/></svg>',
    acid:'<svg viewBox="0 0 24 24"><path d="M12 2c4 5 7 9 7 13a7 7 0 0 1-14 0c0-4 3-8 7-13z"/><path d="M8 15c1 2 2 3 4 3M14 10l2 2"/></svg>',
    poison:'<svg viewBox="0 0 24 24"><path d="M9 3h6M10 3v5l-4 6v6h12v-6l-4-6V3M7 14h10"/><path d="M9 17l6-2M10 15l5 3"/></svg>',
    mana:'<svg viewBox="0 0 24 24"><path d="M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3z"/><circle cx="12" cy="12" r="3"/></svg>',
    esp:'<svg viewBox="0 0 24 24"><path d="M2 12c3-5 6-7 10-7s7 2 10 7c-3 5-6 7-10 7S5 17 2 12z"/><circle cx="12" cy="12" r="3"/><path d="M8 3c1-1 2-1 4-1s3 0 4 1"/></svg>',
    brand:'<svg viewBox="0 0 24 24"><path d="M5 20L16 9M13 6l5 5M15 4l5 5-3 2-4-4zM4 21l4-1-3-3z"/><path d="M7 8c-1-3 2-4 2-6 3 3 3 5 1 7"/></svg>',
    regen:'<svg viewBox="0 0 24 24"><path d="M12 20S4 16 4 9a4 4 0 0 1 7-2.5A4 4 0 0 1 20 9c0 7-8 11-8 11z"/><path d="M12 8v7M8.5 11.5h7"/></svg>',
    dispersion:'<svg viewBox="0 0 24 24"><circle cx="6" cy="12" r="2"/><circle cx="13" cy="6" r="1.5"/><circle cx="17" cy="14" r="2"/><circle cx="11" cy="19" r="1"/><path d="M8 11l3.5-4M8 13l7 1M7 14l3 4"/></svg>',
    charm:'<svg viewBox="0 0 24 24"><path d="M12 20S4 15.5 4 9a4 4 0 0 1 7-2.3A4 4 0 0 1 20 9c0 6.5-8 11-8 11z"/><path d="M12 3v4M9 4l3 3 3-3"/></svg>',
    thunder:'<svg viewBox="0 0 24 24"><path d="M6 15a4 4 0 1 1 2-7.5A5 5 0 0 1 18 9a3 3 0 0 1 0 6H6z"/><path d="M13 13l-3 5h3l-1 4 5-7h-3l2-2"/></svg>',
    pfe:'<svg viewBox="0 0 24 24"><path d="M12 3c2.7 1.7 5.3 2.5 8 2.8v5.4c0 5-3 8.2-8 9.8-5-1.6-8-4.8-8-9.8V5.8C6.7 5.5 9.3 4.7 12 3z"/><path d="M8 15l4-7 4 7M9.5 12h5"/></svg>',
    crit:'<svg viewBox="0 0 24 24"><path d="M12 2l2.2 7.3L22 12l-7.8 2.7L12 22l-2.2-7.3L2 12l7.8-2.7z"/><path d="M8 5l8 14M17 6l-2 2M7 16l2-2"/></svg>',
    shield:'<svg viewBox="0 0 24 24"><path d="M12 3c2.7 1.7 5.3 2.5 8 2.8v5.4c0 5-3 8.2-8 9.8-5-1.6-8-4.8-8-9.8V5.8C6.7 5.5 9.3 4.7 12 3z"/><path d="M8 12h8M12 8v8"/></svg>',
    mushroom:'<svg viewBox="0 0 24 24"><path d="M3 12c.7-5.5 4-9 9-9s8.3 3.5 9 9H3zM9 12v3.5L7 21h10l-2-5.5V12"/><path d="M7 9l1-1M12 7V5M17 9l-1-1"/></svg>',
    food:'<svg viewBox="0 0 24 24"><path d="M4 12h16c0 5-3 8-8 8s-8-3-8-8zM3 12h18M8 8c0-2 2-2 2-4M13 9c0-2 2-2 2-5"/></svg>',
    blind:'<svg viewBox="0 0 24 24"><path d="M2 12c3-5 6-7 10-7s7 2 10 7c-3 5-6 7-10 7S5 17 2 12zM4 4l16 16"/><path d="M10 10a3 3 0 0 0 4 4"/></svg>',
    hallu:'<svg viewBox="0 0 24 24"><path d="M3 12c3-5 6-7 9-7s6 2 9 7c-3 5-6 7-9 7s-6-2-9-7z"/><path d="M12 9c4 0 4 6 0 6s-4-4-1-5c2-.7 3 2 1 2"/></svg>',
    confused:'<svg viewBox="0 0 24 24"><path d="M5 8c0-4 4-6 8-5 5 1 7 6 4 9-2 2-5 1-5 4M12 21v-1"/><path d="M4 15c-2-2-1-5 1-6M19 15c2 2 1 4-1 5"/></svg>',
    fear:'<svg viewBox="0 0 24 24"><path d="M5 4c4 2 10 2 14 0v8c0 5-3 8-7 9-4-1-7-4-7-9z"/><path d="M8 10l2 1M16 10l-2 1M9 16c2-2 4-2 6 0"/></svg>',
    disease:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4M5 5l3 3M16 16l3 3M19 5l-3 3M8 16l-3 3"/><circle cx="12" cy="12" r="2"/></svg>',
    search:'<svg viewBox="0 0 24 24"><circle cx="10" cy="10" r="6"/><path d="M14.5 14.5L21 21M10 7v6M7 10h6"/></svg>',
    rest:'<svg viewBox="0 0 24 24"><path d="M17 3a8 8 0 1 0 4 14 9 9 0 0 1-4-14z"/><path d="M4 19h16"/></svg>',
    paralysis:'<svg viewBox="0 0 24 24"><path d="M8 3v6M16 3v6M7 9h10v11H7zM4 12h3M17 12h3M10 13v4M14 13v4"/></svg>',
    wound:'<svg viewBox="0 0 24 24"><path d="M5 3l14 18M18 4L6 20M8 7l3 1-1 3 3 1-1 3 4 2"/></svg>',
    stun:'<svg viewBox="0 0 24 24"><path d="M12 2l2 6 6-2-3 6 5 4-7 1-1 5-4-5-7 1 4-6-4-5 7 1z"/><circle cx="12" cy="13" r="2"/></svg>'
  };
  const STATUS_INDICATORS = [
    {id:"resFire",label:"Resist Fire",color:"#e54b37",icon:"fire"}, {id:"resCold",label:"Resist Cold",color:"#e7edf0",icon:"cold"},
    {id:"resElec",label:"Resist Electricity",color:"#4d83ed",icon:"elec"}, {id:"resAcid",label:"Resist Acid",color:"#9aa19c",icon:"acid"},
    {id:"resPois",label:"Resist Poison",color:"#42c875",icon:"poison"}, {id:"resDivine",label:"Divine / Mana Resistance",color:"#b96de1",icon:"mana"},
    {id:"esp",label:"Temporary Full ESP",color:"#e4e0d5",icon:"esp"}, {id:"meleeBrand",label:"Melee Brand",color:"#e7c54b",icon:"brand"},
    {id:"regen",label:"HP Regeneration",color:"#55d970",icon:"regen"}, {id:"dispersion",label:"Dispersion",color:"#969f9b",icon:"dispersion"},
    {id:"charm",label:"Charm / Possess",color:"#62bbdf",icon:"charm"}, {id:"thunderstorm",label:"Thunderstorm",color:"#5187e8",icon:"thunder"},
    {id:"pfe",label:"Protection from Evil",color:"#72d861",icon:"pfe"}, {id:"corruptedForce",label:"Corrupted Silent Force",color:"#df872f",icon:"crit"}
  ];
  const SHIELD_OPTIONS = [
    {value:"none",label:"None"}, {value:"reflect",label:"Reflect Shield",color:"#e7edf0",mark:"↺"},
    {value:"lightning",label:"Lightning Cage",color:"#5f91ed",mark:"ϟ"}, {value:"counter",label:"Counter Shield",color:"#a77745",mark:"×"},
    {value:"fire",label:"Fire Shield",color:"#e44b37",mark:"⌁"}, {value:"ice",label:"Ice Shield",color:"#e7edf0",mark:"✣"},
    {value:"plasma",label:"Plasma Shield",color:"#ee725f",mark:"✦"}, {value:"mystic",label:"Mystic Shield",color:"#b16ee0",mark:"◇"}
  ];
  const CONDITION_DEFINITIONS = [
    {id:"food",label:"Food",options:[{value:"normal",label:"Normal"},{value:"hungry",label:"Hungry",icon:"food",color:"#d9bd43"},{value:"starved",label:"Starved",icon:"food",color:"#e27e34",severity:2,critical:true},{value:"fainting",label:"Starved (fainting)",icon:"food",color:"#ef5445",severity:3},{value:"full",label:"Full",icon:"food",color:"#64c95c"},{value:"gorged",label:"Gorged",icon:"food",color:"#319c4c",severity:2}]},
    {id:"vision",label:"Vision",options:[{value:"none",label:"Normal"},{value:"blind",label:"Blind",icon:"blind",color:"#e08137",severity:2,critical:true},{value:"hallu",label:"Hallucinating",icon:"hallu",color:"#e4c641"},{value:"blind_hallu",label:"Blind & Hallucinating",icon:"blind",color:"#ee6246",severity:3}]},
    {id:"confusion",label:"Confusion",options:[{value:"none",label:"None"},{value:"confused",label:"Confused",icon:"confused",color:"#df8436",severity:2,critical:true}]},
    {id:"fear",label:"Fear",options:[{value:"none",label:"None"},{value:"afraid",label:"Afraid",icon:"fear",color:"#df8436",severity:2,critical:true}]},
    {id:"poison",label:"Poison / Disease",options:[{value:"none",label:"None"},{value:"poisoned",label:"Poisoned",icon:"poison",color:"#e78035",severity:2,critical:true},{value:"slow_poison",label:"Poisoned (slowed)",icon:"poison",color:"#d5c140"},{value:"diseased",label:"Diseased",icon:"disease",color:"#ee6946",severity:3}]},
    {id:"activity",label:"State",options:[{value:"none",label:"None"},{value:"searching",label:"Searching",icon:"search",color:"#d9d5c9"},{value:"resting",label:"Resting",icon:"rest",color:"#8ba9c9"},{value:"paralyzed",label:"Paralyzed",icon:"paralysis",color:"#e44b3e",severity:2,critical:true},{value:"stasis",label:"In Stasis",icon:"paralysis",color:"#da5145",severity:3},{value:"suspended",label:"Suspended",icon:"paralysis",color:"#bd6bdc",severity:3}]},
    {id:"cut",label:"Wounds",options:[{value:"none",label:"None"},{value:"graze",label:"Graze",icon:"wound",color:"#dec647",severity:1},{value:"light",label:"Light Cut",icon:"wound",color:"#e1ba3d",severity:1},{value:"bad",label:"Bad Cut",icon:"wound",color:"#df8734",severity:2},{value:"nasty",label:"Nasty Cut",icon:"wound",color:"#e36b37",severity:2},{value:"severe",label:"Severe Cut",icon:"wound",color:"#df4539",severity:3},{value:"deep",label:"Deep Gash",icon:"wound",color:"#e23632",severity:3},{value:"mortal",label:"Mortal Wound",icon:"wound",color:"#fa493e",severity:4}]},
    {id:"stun",label:"Stun",options:[{value:"none",label:"None"},{value:"stun",label:"Stunned",icon:"stun",color:"#e4a03a",severity:1},{value:"heavy",label:"Heavy Stun",icon:"stun",color:"#e47731",severity:2,critical:true},{value:"knocked",label:"Knocked Out",icon:"stun",color:"#e5483b",severity:4}]}
  ];
  const CONDITION_BASES = {
    food:{icon:"food",color:"#8b8d80"}, vision:{icon:"esp",color:"#8b8d80"},
    confusion:{icon:"confused",color:"#8b8d80"}, fear:{icon:"fear",color:"#8b8d80"},
    poison:{icon:"poison",color:"#8b8d80"}, activity:{icon:"paralysis",color:"#8b8d80"},
    cut:{icon:"wound",color:"#8b8d80"}, stun:{icon:"stun",color:"#8b8d80"}
  };
  const STATUS_SLOTS = [
    ...STATUS_INDICATORS.map(status => ({...status,kind:"indicator"})),
    {id:"mycorrhiza",kind:"mycorrhiza",label:"Mycorrhiza",icon:"mushroom",color:"#69bd66"},
    {id:"shield",kind:"shield",label:"Reactive Shield",icon:"shield",color:"#8b8d80"},
    ...CONDITION_DEFINITIONS.map(condition => ({
      id:`condition-${condition.id}`,kind:"condition",conditionId:condition.id,label:condition.label,...CONDITION_BASES[condition.id]
    }))
  ];
  const DEFAULT_INDICATORS = Object.fromEntries(STATUS_INDICATORS.map(status => [status.id, ["resFire","resCold","resElec","resAcid","resPois","esp"].includes(status.id)]));
  const DEFAULT_CONDITIONS = Object.fromEntries(CONDITION_DEFINITIONS.map(condition => [condition.id, condition.options[0].value]));
  const DEFAULT_ENCUMBRANCE = Object.fromEntries(ENCUMBRANCE_STATUSES.map(status => [status.id, status.id === "heavy_wield"]));

  window.TomeNetPrototype.data = {
    PY_MAX_EXP,PLAYER_EXP,INVENTORY_CAPACITY,BAGS_DEFAULT_ROW_LIMIT,INVENTORY_ICONS,INVENTORY_ITEMS,BAGS,FLOOR_ITEMS,
    EQUIPMENT_ICONS,CHARACTER_SOURCE_ICONS,TERM_COLORS,EQUIPMENT_SLOT_META,EQUIPMENT_ITEMS,MESSAGE_STREAM,RIGHT_PANEL_WIDGETS,DEFAULT_RIGHT_PANEL_ORDER,
    CHARACTER_DATA,CHARACTER_SOURCES,CHARACTER_SOURCE_EQUIPMENT,CHARACTER_RESIST_GROUPS,ENCUMBRANCE_STATUSES,STATUS_ICONS,STATUS_INDICATORS,
    SHIELD_OPTIONS,CONDITION_DEFINITIONS,CONDITION_BASES,STATUS_SLOTS,DEFAULT_INDICATORS,DEFAULT_CONDITIONS,DEFAULT_ENCUMBRANCE
  };
})();

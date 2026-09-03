(() => {
  const root = window.TomeNetPrototype;
  const width = 64;
  const height = 64;
  const player = {x:31,y:31,label:"Bree · demo origin"};
  const biomes = {
    unknown:{name:"Unknown sector",glyph:" ",fill:"#080a09",line:"#111511"},
    ocean:{name:"Ocean",glyph:"%",fill:"#102849",line:"#1b4771"},
    coast:{name:"Coast",glyph:",",fill:"#6e5a32",line:"#9a7a42"},
    grass:{name:"Grassland",glyph:".",fill:"#24552c",line:"#39743e"},
    forest:{name:"Forest",glyph:"*",fill:"#173c24",line:"#2e6638"},
    dense:{name:"Dense forest",glyph:"#",fill:"#102d1c",line:"#22502e"},
    swamp:{name:"Swamp",glyph:"%",fill:"#3d2850",line:"#62406e"},
    waste:{name:"Wasteland",glyph:".",fill:"#594325",line:"#80613a"},
    mountain:{name:"Mountain",glyph:"^",fill:"#343a3a",line:"#646b69"},
    river:{name:"River",glyph:"~",fill:"#174d67",line:"#2b7d9b"},
    desert:{name:"Desert",glyph:".",fill:"#76632c",line:"#ab913f"},
    ice:{name:"Ice field",glyph:".",fill:"#80939a",line:"#bfd0d1"}
  };
  const features = new Map([
    ["31,31",{name:"Bree · demo origin",glyph:"T",color:"#f0ca55",kind:"town"}],
    ["18,19",{name:"Northern demo outpost",glyph:"T",color:"#e3c34f",kind:"town"}],
    ["45,42",{name:"Eastern demo outpost",glyph:"T",color:"#e3c34f",kind:"town"}],
    ["26,47",{name:"Demo tower",glyph:"<",color:"#7fd8ff",kind:"tower"}],
    ["39,16",{name:"Demo dungeon",glyph:">",color:"#ff9a55",kind:"dungeon"}],
    ["50,28",{name:"Demo tower and dungeon",glyph:"X",color:"#ef6d62",kind:"both"}]
  ]);

  function terrainAt(x,y) {
    if (x < 3 || y < 3 || x >= width-3 || y >= height-3) return "ocean";
    if (x < 6 || y < 6 || x >= width-6 || y >= height-6) return "coast";
    const riverX = 29 + Math.round(Math.sin(y / 6) * 3);
    if (Math.abs(x-riverX) <= (y % 9 === 0 ? 1 : 0)) return "river";
    if ((x > 42 && y < 27) || (x > 49 && y < 38)) return "mountain";
    if (x < 18 && y > 40) return "swamp";
    if (x > 39 && y > 43) return "desert";
    if (y < 12 && x > 18 && x < 39) return "ice";
    const noise = (x * 17 + y * 31 + x * y * 3) % 29;
    if (noise < 5) return "dense";
    if (noise < 12) return "forest";
    if (noise === 28) return "waste";
    return "grass";
  }
  function isKnown(x,y) {
    const distance = Math.hypot(x-player.x,y-player.y);
    return distance <= 25 || Math.abs(x-player.x) <= 1 || Math.abs(y-player.y) <= 1 || features.has(`${x},${y}`);
  }

  const cells = Array.from({length:height},(_,y) => Array.from({length:width},(_,x) => {
    const known = isKnown(x,y);
    const biome = known ? terrainAt(x,y) : "unknown";
    return {x,y,known,biome,feature:known ? features.get(`${x},${y}`) || null : null};
  }));

  root.data.MINI_MAP_LOCAL_PRIORITY = {
    default:10,passable:18,blocked:48,
    symbols:{"<":100,">":100,"1":95,"2":95,"3":95,"4":95,"5":95,"6":95,"7":95,"8":95,"9":95,"+":80},
    names:{Building:95,"up staircase":100,"down staircase":100,"cobblestone road":34,dirt:28,"open floor":16,"open grass":12}
  };
  root.data.MINI_MAP_TERM_PALETTE = [
    "#000000","#ffffff","#9d9d9d","#ff8d00","#b70000","#009d44","#0000ff","#8d6600",
    "#666666","#cdcdcd","#af00ff","#ffff00","#ff3030","#00ff00","#00ffff","#c79d55"
  ];
  root.data.MINI_MAP_WORLD_DEMO = {
    width,height,viewWidth:64,viewHeight:44,scrollStep:9,player,biomes,cells,
    label:"Wilderness demo · prototype-only fixture"
  };
})();

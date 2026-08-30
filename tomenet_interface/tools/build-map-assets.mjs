#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

const toolDir = path.dirname(fileURLToPath(import.meta.url));
const prototypeDir = path.resolve(toolDir,"..");
const repoDir = path.resolve(prototypeDir,"..");
const gameDir = path.join(repoDir,"lib/game");
const userDir = path.join(repoDir,"lib/user");
const sourceAtlas = path.join(repoDir,"lib/xtra/graphics/16x24sv.bmp");
const outputAtlas = path.join(prototypeDir,"assets/classic-16x24-bree.bmp");
const outputData = path.join(prototypeDir,"map-data.js");

const TILE_WIDTH = 16;
const TILE_HEIGHT = 24;
const SOURCE_TILES_PER_ROW = 100;
const PALETTE = [
  [0,0,0],[255,255,255],[157,157,157],[255,141,0],
  [183,0,0],[0,157,68],[0,0,255],[141,102,0],
  [102,102,102],[205,205,205],[175,0,255],[255,255,0],
  [255,48,48],[0,255,0],[0,255,255],[199,157,85]
];
const COLOR_INDEX = Object.fromEntries([..."dwsorgbuDWvyRGBU"].map((color,index) => [color,index]));
const MASKS = {
  foreground:[252,0,251], shade1:[148,0,147], shade2:[76,0,75], shade3:[26,0,25],
  background:[62,61,0], background2:[29,33,28]
};

function readText(file) { return fs.readFileSync(file,"utf8"); }

function parseFeatureDefinitions(source) {
  const features = new Map();
  let current = null;
  for (const line of source.split(/\r?\n/)) {
    let match = line.match(/^N:(\d+):(.*)$/);
    if (match) {
      current = {id:Number(match[1]),name:match[2],glyph:"?",color:1,flags:new Set()};
      features.set(current.id,current);
      continue;
    }
    if (!current) continue;
    match = line.match(/^G:(.):(.)$/);
    if (match) {
      current.glyph = match[1];
      current.color = COLOR_INDEX[match[2]] ?? 1;
      continue;
    }
    match = line.match(/^F:(.*)$/);
    if (match) match[1].split("|").forEach(flag => current.flags.add(flag.trim()));
  }
  return features;
}

function parseTemplateMappings(...sources) {
  const mappings = new Map();
  for (const source of sources) for (const line of source.split(/\r?\n/)) {
    const match = line.match(/^F:(.):(\d+):/);
    if (match) mappings.set(match[1],Number(match[2]));
  }
  return mappings;
}

function parseGraphics(source) {
  const graphics = new Map();
  for (const line of source.split(/\r?\n/)) {
    const match = line.match(/^F:(\d+):([^/]*)\/(\d+)/);
    if (match) graphics.set(Number(match[1]),{
      color:match[2] === "" ? null : Number(match[2]),
      sourceTile:Number(match[3])
    });
  }
  return graphics;
}

function isPassable(symbol,feature) {
  if (!feature || symbol === "&" || symbol === " ") return false;
  if (!feature.flags.has("FLOOR") || feature.flags.has("NO_WALK")) return false;
  return !/(?:deep|shallow) water|lava|mud|dark pit/i.test(feature.name);
}

function buildMapData() {
  const bree = readText(path.join(gameDir,"t_bree.txt"));
  const pref = readText(path.join(gameDir,"t_pref.txt"));
  const features = parseFeatureDefinitions(readText(path.join(gameDir,"f_info.txt")));
  const mappings = parseTemplateMappings(pref,bree);
  const graphics = parseGraphics(readText(path.join(userDir,"graphics-16x24sv.prf")));
  const rows = [...bree.matchAll(/^D:(.*)$/gm)].map(match => match[1]);
  const startMatch = bree.match(/^P:(\d+):(\d+)$/m);
  if (rows.length !== 66 || rows.some(row => row.length !== 198) || !startMatch)
    throw new Error("Unexpected Bree template dimensions or missing start position");

  const symbols = [...new Set(rows.join(""))].sort();
  const tiles = {};
  for (const symbol of symbols) {
    const featureId = mappings.get(symbol) ?? 0;
    const feature = features.get(featureId);
    const graphic = graphics.get(featureId);
    tiles[symbol] = {
      featureId,
      name:symbol === " " ? "open grass" : feature?.name || "unmapped terrain",
      glyph:feature?.glyph || symbol,
      color:symbol === " " ? 5 : graphic?.color ?? feature?.color ?? 1,
      sourceTile:Number.isInteger(graphic?.sourceTile) ? graphic.sourceTile : null,
      passable:symbol === " " ? true : isPassable(symbol,feature)
    };
  }
  /* Blank template cells preserve generated outdoor terrain on the server. The
     standalone prototype uses deterministic grass there; the explicit Bree
     structures, roads and terrain remain byte-for-byte aligned to the template. */
  tiles[" "].sourceTile = graphics.get(89)?.sourceTile ?? 53;
  tiles[" "].glyph = ".";
  tiles["&"] = {...tiles["&"],name:"town boundary",passable:false,
    sourceTile:graphics.get(96)?.sourceTile ?? 451,color:13,glyph:"#"};

  const sourceTiles = [...new Set(Object.values(tiles).map(tile => tile.sourceTile).filter(Number.isInteger))].sort((a,b) => a - b);
  const atlasSlots = new Map(sourceTiles.map((sourceTile,index) => [sourceTile,index]));
  Object.values(tiles).forEach(tile => {
    tile.tile = Number.isInteger(tile.sourceTile) ? atlasSlots.get(tile.sourceTile) : null;
    delete tile.sourceTile;
  });

  return {data:{
    version:1,
    source:"lib/game/t_bree.txt",
    width:198,
    height:66,
    viewport:{width:66,height:44,tileWidth:TILE_WIDTH,tileHeight:TILE_HEIGHT},
    start:{y:Number(startMatch[1]),x:Number(startMatch[2])},
    rows,
    atlasTiles:sourceTiles.length,
    tiles
  },sourceTiles};
}

function rgbEquals(rgb,mask) { return rgb[0] === mask[0] && rgb[1] === mask[1] && rgb[2] === mask[2]; }
function shaded(color,alpha) { return color.map(channel => Math.round(channel * alpha)); }

function buildBrowserAtlas(sourceTiles) {
  const input = fs.readFileSync(sourceAtlas);
  if (input.toString("ascii",0,2) !== "BM" || input.readUInt16LE(28) !== 24)
    throw new Error("Expected an uncompressed 24-bit BMP atlas");
  const pixelOffset = input.readUInt32LE(10);
  const width = input.readInt32LE(18);
  const height = Math.abs(input.readInt32LE(22));
  const inputStride = Math.ceil(width * 3 / 4) * 4;
  if (width < SOURCE_TILES_PER_ROW * TILE_WIDTH || height < TILE_HEIGHT)
    throw new Error("The source atlas is smaller than the expected 16x24 row");

  const outputWidth = sourceTiles.length * TILE_WIDTH;
  const outputHeight = PALETTE.length * TILE_HEIGHT;
  const outputStride = Math.ceil(outputWidth * 3 / 4) * 4;
  const output = Buffer.alloc(54 + outputStride * outputHeight);
  output.write("BM",0,"ascii");
  output.writeUInt32LE(output.length,2);
  output.writeUInt32LE(54,10);
  output.writeUInt32LE(40,14);
  output.writeInt32LE(outputWidth,18);
  output.writeInt32LE(outputHeight,22);
  output.writeUInt16LE(1,26);
  output.writeUInt16LE(24,28);
  output.writeUInt32LE(outputStride * outputHeight,34);
  output.writeInt32LE(4724,38);
  output.writeInt32LE(4724,42);

  for (let paletteIndex = 0; paletteIndex < PALETTE.length; paletteIndex++) {
    const color = PALETTE[paletteIndex];
    for (let y = 0; y < TILE_HEIGHT; y++) for (let slot = 0; slot < sourceTiles.length; slot++) for (let tileX = 0; tileX < TILE_WIDTH; tileX++) {
      const sourceTile = sourceTiles[slot];
      const sourceX = (sourceTile % SOURCE_TILES_PER_ROW) * TILE_WIDTH + tileX;
      const sourceY = Math.floor(sourceTile / SOURCE_TILES_PER_ROW) * TILE_HEIGHT + y;
      if (sourceY >= height) throw new Error(`Tile ${sourceTile} is outside the source atlas`);
      const sourceRow = height - 1 - sourceY;
      const sourceAt = pixelOffset + sourceRow * inputStride + sourceX * 3;
      const rgb = [input[sourceAt + 2],input[sourceAt + 1],input[sourceAt]];
      let rendered = rgb;
      if (rgbEquals(rgb,MASKS.foreground)) rendered = color;
      else if (rgbEquals(rgb,MASKS.shade1)) rendered = shaded(color,151 / 255);
      else if (rgbEquals(rgb,MASKS.shade2)) rendered = shaded(color,79 / 255);
      else if (rgbEquals(rgb,MASKS.shade3)) rendered = shaded(color,31 / 255);
      else if (rgbEquals(rgb,MASKS.background) || rgbEquals(rgb,MASKS.background2)) rendered = [0,0,0];
      const logicalY = paletteIndex * TILE_HEIGHT + y;
      const outputRow = outputHeight - 1 - logicalY;
      const x = slot * TILE_WIDTH + tileX;
      const outputAt = 54 + outputRow * outputStride + x * 3;
      output[outputAt] = rendered[2];
      output[outputAt + 1] = rendered[1];
      output[outputAt + 2] = rendered[0];
    }
  }
  fs.mkdirSync(path.dirname(outputAtlas),{recursive:true});
  fs.writeFileSync(outputAtlas,output);
}

const {data,sourceTiles} = buildMapData();
buildBrowserAtlas(sourceTiles);
fs.writeFileSync(outputData,`/* Generated by tools/build-map-assets.mjs. */\nwindow.TOMENET_BREE_MAP = ${JSON.stringify(data,null,2)};\n`);
console.log(`Generated ${path.relative(repoDir,outputData)} and ${path.relative(repoDir,outputAtlas)}`);

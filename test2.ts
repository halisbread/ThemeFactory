import {NAttheme} from "./src/lib/wapper/NAttheme";

import * as fs from "node:fs";
let buffer = fs.readFileSync("makeWallpaper/Rum Luster.attheme");
let nAttheme = new NAttheme(buffer);
let wallPaer=fs.readFileSync("makeWallpaper/photo_2025-08-20_01-17-07.jpg")
nAttheme.setWallpaper(wallPaer);
fs.writeFileSync("Rum Luster.attheme",nAttheme.toFile());

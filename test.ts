import {NAttheme} from "./src/lib/wapper/NAttheme";
import fs from "fs";
import tinycolor from "tinycolor2";

let theme=new NAttheme(fs.readFileSync("public/deault/Day.attheme"))

/**
 * 处理每一行主题数据
 * @param {string} line - 类似 "windowBackgroundWhite=#ff120a2a" 的字符串
 */
// function processThemeLine(line) {
//     // 优化正则表达式：
//     // 1. \s* 处理等号两边的空格
//     // 2. ([^=\s]+) 匹配不含等号和空格的 Key
//     // 3. (-?\d+) 匹配整型颜色值（包含负数）
//     const match = line.match(/^\s*([^=\s]+)\s*=\s*(-?\d+)\s*$/);
//
//     if (!match) return null;
//
//     const x = match[1]; // Key 名
//     const intColor = parseInt(match[2], 10);
//
//     // 关键步骤：int → unsigned 32-bit → hex (AARRGGBB)
//     // >>> 0 是 JavaScript 处理有符号整型颜色（如 -2731439）转为十六进制的最快方法
//     const hex = (intColor >>> 0).toString(16).padStart(8, '0');
//
//     // 拆分 ARGB 分量
//     // Telegram 整型颜色的顺序通常是 AARRGGBB
//     const aHex = hex.slice(0, 2);
//     const rHex = hex.slice(2, 4);
//     const gHex = hex.slice(4, 6);
//     const bHex = hex.slice(6, 8);
//
//     const a = parseFloat((parseInt(aHex, 16) / 255).toFixed(2));
//     const r = parseInt(rHex, 16);
//     const g = parseInt(gHex, 16);
//     const b = parseInt(bHex, 16);
//
//     const y = { r, g, b, a };
//
//     return { x, y };
// }

// 处理 ARGB 格式
function processThemeLine(line) {
    // 1. 使用正则匹配 键 (x) 和 颜色值 (y)
    // 匹配格式：键=值
    const match = line.match(/^([^=]+)=#?([0-9a-fA-F]+)/);
    if (!match) return null;
    let x = match[1].trim(); // 属性键
    let hexValue = match[2].trim(); // 颜色值部分
    // 2. 处理 ARGB 格式 (Telegram 常用 8 位 HEX: AARRGGBB)
    // tinycolor 期望的 8 位格式通常是 RRGGBBAA，所以我们需要转换
    let colorToProcess;
    if (hexValue.length === 8) {
        const alpha = hexValue.slice(0, 2);
        const rgb = hexValue.slice(2);
        // 转换为 tinycolor 识别的 RGBA 十六进制或直接传 alpha
        colorToProcess = `#${rgb}${alpha}`;
    } else {
        colorToProcess = `#${hexValue}`;
    }
    // 3. 使用 tinycolor 转换为 RGBA 字符串 (y)
    const color = tinycolor(colorToProcess);
    const y = color.toRgb(); // 格式为 "rgba(r, g, b, a)"

    return { x, y };
}

// --- 测试示例 ---
const rawData = fs.readFileSync("Ai/AiText.txt").toString()

const lines = rawData.trim().split('\n');
const result = lines.map(processThemeLine).filter(item => item !== null);

result.forEach((x,y)=>{
    console.log(x)
    if (x!==null && x.x!=="chat_wallpaper"){
        let color=x.y
        theme.set(x.x, {red:color.r,green:color.g,blue:color.b,alpha:color.a*255})
    }
})
theme.setWallpaper(fs.readFileSync("Ai/photo_2024-10-13_09-42-24.jpg"))
fs.writeFileSync("Ai.attheme", theme.toFile())
/* 输出:
[
  { x: 'windowBackgroundWhite', y: 'rgba(18, 10, 42, 1)' },
  { x: 'actionBarDefault', y: 'rgba(31, 15, 61, 1)' },
  { x: 'chat_outBubble', y: 'rgba(111, 255, 236, 1)' }
]
*/

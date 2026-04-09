import {NAttheme} from "./src/lib/wapper/NAttheme";
import fs from "fs";
import tinycolor from "tinycolor2";

let theme=new NAttheme(fs.readFileSync("public/deault/Day.attheme"))

/**
 * 处理每一行主题数据
 * @param {string} line - 类似 "windowBackgroundWhite=#ff120a2a" 的字符串
 */
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
    console.log(x?.x)
    if (x!==null){
        let color=x.y
        theme.set(x.x, {red:color.r,green:color.g,blue:color.b,alpha:color.a*100})
    }
})
theme.setWallpaper(fs.readFileSync("Ai/6e0c75e0b09d0887f454daff269d71e3.jpg"))
fs.writeFileSync("Ai.attheme", theme.toFile())
/* 输出:
[
  { x: 'windowBackgroundWhite', y: 'rgba(18, 10, 42, 1)' },
  { x: 'actionBarDefault', y: 'rgba(31, 15, 61, 1)' },
  { x: 'chat_outBubble', y: 'rgba(111, 255, 236, 1)' }
]
*/

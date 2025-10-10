import process from "node:process";
import { devObject, proObject } from "../../config";
import { HttpsProxyAgent } from "https-proxy-agent";
import path from "path";
import logger from "../lib/config/log_config";
import iMod from "../db/mysql-use";
import map from "../restore/pubmap";
import * as fs from "node:fs";
import { Bot, InputFile } from "grammy";
import render from "../lib/preview/render-pool";
import {
    MINIMALISTIC_TEMPLATE, // 移动端主题
    REGULAR_TEMPLATE, // 移动端主题
    NEW_TEMPLATE,
    DESKTOP_TEMPLATE, // 桌面模板
} from "../lib/preview/preview-maker.js";
import axios from "axios";

let log = logger.getLogger(`${__filename}`);
let botApi: string;
let httpAgent: any;

if (process.env.NODE_ENV !== "dev") {
    botApi = proObject.botApi;
} else {
    botApi = devObject.botApi;
    httpAgent = new HttpsProxyAgent("http://127.0.0.1:10810");
}

let bot = new Bot(botApi);

bot.command("start", async (ctx) => {
    try {
        let basePath = "public/myserver-bot-public/source";
        let arStr = ctx.match;
        if (arStr.length == 0) return;
        let fileName = arStr.substring(0, arStr.length - 1);
        if (arStr.endsWith("A")) {
            iMod.jump_to_theme.create({
                type: 0,
                theme_name: fileName,
                date: new Date(),
            });
            fileName = fileName + ".attheme";
            let filePath = path.join(basePath, "attheme", fileName);
            await ctx.replyWithDocument(new InputFile( fs.readFileSync(filePath), path.join("attheme", fileName)));
        }

        if (arStr.endsWith("D")) {
            iMod.jump_to_theme.create({
                type: 1,
                theme_name: fileName,
                date: new Date(),
            });
            fileName = fileName + ".tdesktop-theme";
            let filePath = path.join(basePath, "desk", fileName);
            await ctx.replyWithDocument(new InputFile( fs.readFileSync(filePath),
                path.join("desk", fileName)));
        }
        //安卓主题文件
        if (arStr.endsWith("L")) {
            let fd = map.get(ctx.match);
            if(fd===undefined) return;
            let buffer = fs.readFileSync(fd.tempName);
            await ctx.reply("请使用安卓版telegram打开主题文件");
            await ctx.replyWithDocument(new InputFile(buffer,fd.themeName + ".attheme"));
            fs.rmSync(fd.tempName);
            log.info(`已经使用Bot跳转,路径 ${fd.tempName}`);
        }
        if (arStr.endsWith("M")) {
            let fd = map.get(ctx.match);
            if(fd===undefined) return;
            let buffer = fs.readFileSync(fd.tempName);
            await ctx.reply("请使用桌面版telegram打开主题文件");
            await ctx.replyWithDocument(new InputFile(
                buffer,fd.themeName + ".tdesktop-theme"));
            fs.rmSync(fd.tempName);
            log.info(`已经使用Bot跳转,路径 ${fd.tempName}`);
        }
    } catch (e) {
        log.error(e);
    }
});
//TODO 机器人关于主题的制作完全是 基于已有主题匹配

// bot.command("getPreview", async (ctx) => {
//     ctx.session.waitingForTheme = true;
//     await ctx.reply("请发送主题文件");
// });
// bot.on(message("document"), async (ctx, next) => {
//     log.info(`收到文档: ${ctx.message.document.file_name} from user ${ctx.from.id}`);
//     if (!ctx.session?.waitingForTheme) return next();
//     ctx.session.waitingForTheme = false;
//     const doc = ctx.message.document;
//     await ctx.reply("主题文件已收到，正在生成预览…");
//
//     try {
//         // 获取文件信息和下载链接
//         const fileInfo = await ctx.telegram.getFile(doc.file_id);
//         const fileLink = await ctx.telegram.getFileLink(doc.file_id);
//         log.info(`文件链接: ${fileLink}, 文件路径: ${fileInfo}`);
//         // 验证文件大小（可选，限制 20MB）
//         if (doc.file_size > 20 * 1024 * 1024) {
//             await ctx.reply("文件过大，请上传小于 20MB 的文件");
//             return;
//         }
//
//         // 下载文件为 Buffer
//         const response = await axios.get(fileLink.href, {
//             httpsAgent:new HttpsProxyAgent("socks5://127.0.0.1:10810"),
//             proxy: false, // 禁用 axios 的 proxy 自动处理
//             responseType:"arraybuffer",
//             // 添加 Telegram API 所需的 headers（可选）
//             // 增加超时时间
//             timeout: 30000, // 30 秒
//         }).catch(async (error) => {
//             if (error.response?.status === 400) {
//                 log.error(`Axios 400 错误，文件链接: ${fileLink}, 错误详情: ${error.message}`);
//                 throw new Error("无法下载文件：Telegram API 返回 400 Bad Request，可能文件 ID 无效或已过期");
//             }
//             throw error; // 抛出其他错误
//         });
//
//         const themeBuffer = Buffer.from(response.data);
//         let template;
//
//         // 根据文件扩展名选择模板
//         if (fileInfo.file_path.endsWith(".tdesktop-theme")) {
//             template = DESKTOP_TEMPLATE;
//         } else if (fileInfo.file_path.endsWith(".attheme")) {
//             template = MINIMALISTIC_TEMPLATE;
//         } else {
//             await ctx.reply("不支持的文件类型，仅支持 .attheme 和 .tdesktop-theme 文件");
//             return;
//         }
//
//         // 渲染预览
//         const preview = await render({
//             themeBuffer,
//             name: doc.file_name || "theme",
//             template,
//         });
//
//         // 发送预览图片
//         await ctx.replyWithPhoto({ source: preview });
//         await ctx.reply("预览生成成功！");
//
//         // 清理临时文件（如果 preview 是文件路径）
//         if (typeof preview === "string" && fs.existsSync(preview)) {
//             fs.rmSync(preview);
//             log.info(`已清理临时文件: ${preview}`);
//         }
//     } catch (error) {
//         log.error(`处理文档时出错 (user: ${ctx.from.id}, file: ${doc.file_name}):`, error);
//         await ctx.reply(`生成预览时出错：${error.message || "未知错误"}，请稍后重试`);
//     }
// });



export { bot};

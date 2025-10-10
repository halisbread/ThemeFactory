/*
nohup npx ts-node server.ts
ctrl + z
bg
disown -a
 */
import {bot} from "./src/bot/bot";
import {initHttp} from "./src/express/http-config";
import logger from "./src/lib/config/log_config";
let log=logger.getLogger(`${__filename}`);

//启动http服务
initHttp()
//启动bot
bot.start()

process.on('uncaughtException', (err) => {
    log.error('未捕获的异常:', err);
     process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    log.error('未捕获的异常:', reason);
     process.exit(1);
});

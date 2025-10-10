import log4js from "log4js"
import process from "node:process";

const logConfig = {
    appenders: {
        console: { type: 'console' },
        file: {
            type: 'file',
            filename: 'log/app.log', // 路径
            pattern:"yyyy-MM-dd", //精确到天
            compress: false, //压缩
            numBackups: 7, //7天
        },
    },
    categories: {
        default: {
            appenders: process.env.NODE_ENV!=="dev"?['file'] : ['console'],
            level: process.env.NODE_ENV!=="dev"?'info':'debug'
        }
    }
};

const log=log4js.configure(logConfig);

export  default log;

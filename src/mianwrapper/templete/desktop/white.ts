import {DeBaseThemeOperation, ThemeType} from "../base-theme-operation";
import Buffer from "node:buffer";
import path from "path";
import fs from "fs";
import {adjustHue} from "../../tool/colorcacu";
import tinycolor from "tinycolor2";
import logger from "../../../lib/config/log_config";
let log=logger.getLogger(`${__filename}`);

export namespace DesktopWhite {
    class WhiteThemeBase extends DeBaseThemeOperation{
        constructor(
            public id: string,
            public tP: string,
            public pP: string = "捕获.PNG",  // 默认值
            public mainColorSelect: string,
            public colorType:ThemeType=ThemeType.Simple
        )
         {super("white",id,tP,pP,mainColorSelect,colorType);}

        protected addTaOperation() {
            super.addTaOperation();
            //windowActiveTextFg 为主色H 互补 +180
            let {red:r,green:g,blue:b,alpha:a} = this.tO.resolveVariable("windowFg");
            let  kp= tinycolor({ r,g,b,a}).toHsl()
            kp.h=adjustHue(kp.h,-90)
            let {r:red,g:green,b:blue,a:alpha}= tinycolor(kp).toRgb()
            // console.log({red,green,blue,alpha:ap})
            this.tO.setVariable("windowActiveTextFg",{red,green,blue,alpha:a})
            // console.log(this.tO.resolveVariable("windowActiveTextFg"))
            // console.log(this.tO.resolveVariable(this.mainColorSelect))
            log.debug(kp)
            log.debug({red,green,blue,alpha:255})
            log.debug(a)
        }
    }

    // 创建不同的主题实例
    const whiteThemes = [
        new WhiteThemeBase("white1", "awesome.tdesktop-theme", "捕获.PNG", "windowSubTextFg"),
        new WhiteThemeBase("white2", "awesome01.tdesktop-theme", "捕获.PNG", "sideBarTextFgActive"),
        new WhiteThemeBase("white3", "awesome.tdesktop-theme", "捕获.PNG", "sideBarTextFgActive"),
        new WhiteThemeBase("white4", "awesome.tdesktop-theme", "捕获.PNG", "windowBgRipple"),

    ];

    // 初始化 Map 并设置数据
    export const desktopWhiteMap = new Map<string, WhiteThemeBase>(
        whiteThemes.map(theme => [theme.id, theme])
    );
}

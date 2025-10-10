import {AnBaseThemeOperation, ThemeType} from "../base-theme-operation";

export namespace AndroidBlack {
    class BlackThemeBase extends AnBaseThemeOperation{
        constructor(
            public id: string, //black{number}
            public tP: string, //主题名
            public pP: string = "捕获.PNG",  // 默认值
            public mainColorSelect: string,
            public colorType:ThemeType=ThemeType.Simple
        ) {
            super("black",id,tP,pP,mainColorSelect,colorType);
        }
    }

    const blackThemes = [
        new BlackThemeBase("black1", "TwilightEbony.attheme", "捕获.PNG", "actionBarDefaultTitle"),
        new BlackThemeBase("black2", "@Gumiho_tem2.attheme", "捕获.PNG", "actionBarDefaultTitle"),
        new BlackThemeBase("black3", "Gojo Purple Theme @aestheticpicsuwu.attheme", "捕获.PNG", "actionBarTabLine"),
        new BlackThemeBase("black4", "@Gumiho_tem2.attheme", "捕获.PNG", "actionBarDefaultTitle"),
        new BlackThemeBase("black5", "Girl 1 @AloneSnowflake.attheme", "捕获.PNG", "actionBarTabLine"),
        new BlackThemeBase("black6", "@Gumiho_tem1.attheme", "捕获.PNG", "actionBarDefault")
    ];

    // 初始化 Map 并设置数据
    export const androidBlackMap = new Map<string, BlackThemeBase>(
        blackThemes.map(theme => [theme.id, theme])
    );
}


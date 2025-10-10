//@ts-nocheck
import fs from "fs";
import {NAttheme as Attheme} from "../../lib/wapper/NAttheme";
import tinycolor from "tinycolor2";
import path from "path";
import {Tdesktop as TdesktopTheme} from "../../lib/wapper/NTdesktop";
import HSLA = tinycolor.ColorFormats.HSLA;
import logger from "../../lib/config/log_config";
let log=logger.getLogger(`${__filename}`);

export enum ThemeType {
    //单色
    Simple ,
    //单色 但不同 S L
    SimpleDifference ,
    //包括多色 且不同 S L
    MultiColor,
}

// 基本安卓抽象类
export  class AnBaseThemeOperation {
    protected chatBg="chat_inBubble"
    protected chatBgOut="chat_outBubble"
    protected prx = "public/tempelete/tohuemodle/android/";
    protected ta:Attheme
    protected toHueColor:number
    protected targetS:number
    protected targetL:number
    private mainHSL: tinycolor.ColorFormats.HSLA;
    protected constructor(
     public type:string,
     public id: string,
     public tP: string,
     public pP: string = "捕获.PNG",  // 默认值
     public mainColorSelect: string,
     public colorType:ThemeType=ThemeType.Simple
    ){}
    init(){
        this.ta = new Attheme(this.getBuffer())
        let {red:r,green:g,blue:b,alpha:a}= this.ta.get(this.mainColorSelect)
        this.mainHSL=tinycolor({r,g,b,a}).toHsl()
    }
    translateHue(toHueColor:number,targetS:number,targetL:number,background:Buffer,alphaT:number=1){
        this.init()
        //为 addTaOpreation添加变量
        this.toHueColor=toHueColor
        this.targetS=targetS
        this.targetL=targetL
        // 目标hue
        // sideBarBgActive 为主要改变颜色 标准
        // @ts-ignore
        let {h:mainH,s:mainS}=this.mainHSL

        let en=this.ta.getVariablesList()
        log.info(`mainH 为${mainH} 目标H ${toHueColor}`)

        for (const e of en) {
            // if(e=="actionBarDefault"){
            //     console.log("")
            // }
            let kp:HSLA;
            // @ts-ignore
            let {red:r,green:g,blue:b,alpha:a} = this.ta.get(e)

            kp=  tinycolor({ r,g,b,a}).toHsl()
            let minH=kp.h-mainH
            let minS=(kp.s-mainS)*100
            // hue 上下 15
            if(minH<15 && minH>-15){
                kp.h=toHueColor
                if(minS<30 && minS>-30){
                    kp.l=targetL/100
                }
                let {r:red,g:green,b:blue,a:alpha}= tinycolor(kp).toRgb()
                this.ta.set(e,{red,green,blue,alpha:a})
            }
        }
        // console.log(alphaT)
        if (alphaT<1){
            // log.info(`${alphaT}`)
            // @ts-ignore
            let {red:r,green:g,blue:b} = this.ta.get(this.chatBg)
            this.ta.set(this.chatBg,{red:r,green:g,blue:b,alpha:Math.floor(alphaT*255)})
        }
        this.addTaOperation()
        //@ts-ignore
        this.ta.setWallpaper(background)
        return this.ta.toFile()
    }
    public  addTaOperation(){

    }
    //基本 buffer 获取
   private getBuffer(){
        return  fs.readFileSync(this.getPath())
    }
   private getPath(){
        return  path.join(this.prx,this.type,this.id,this.tP)
    }

}

// 基本桌面抽象类
export  class DeBaseThemeOperation {
    private chatBg="msgInBg"
    private prx = "public/tempelete/tohuemodle/desktop/"
    protected mainHSL: tinycolor.ColorFormats.HSLA;
    protected tO: any;
    protected constructor(
        public type: string,
        public id: string,
        public tP: string,
        public pP: string = "捕获.PNG",
        public mainColorSelect: string,
        public colorType:ThemeType=ThemeType.Simple
    ) {}
    init(){
        this.tO=new TdesktopTheme(this.getBuffer())
        let {red:r,green:g,blue:b,alpha:a} = this.tO.resolveVariable(this.mainColorSelect)
        this.mainHSL=tinycolor({ r,g,b,a}).toHsl()
    }
    translateHue(toHueColor:number,targetS:number,targetL:number,background:Buffer,alphaT:number=1){
        this.init()
        log.info(`mainH 为${this.mainHSL.h} 目标H ${toHueColor}`)
        // sideBarBgActive
        // 目标hue 为主要改变颜色 标准
        //const mianColorSelect="sideBarBgActive"
        // @ts-ignore
        let {h:mainH,s:mainS}=this.mainHSL
        let en=this.tO.entries()
        for (const e of en) {
            let kp:HSLA;
            let ap;
            if(typeof e[1]=="string") {
                let resolveVariable = this.tO.resolveVariable(e[1]);
                if (resolveVariable==null)
                    continue
//@ts-ignore
                let {red:r,green:g,blue:b,alpha:a} = this.tO.resolveVariable(e[1]);
                // console.log(`${e[0]}}`);
                // console.log(JSON.stringify();
                kp= tinycolor({ r,g,b,a}).toHsl()
                ap=a
                // @ts-ignore
            }else {
                let {red:r,green:g,blue:b,alpha:a} = e[1];
                // console.log(`${e[0]}`)
                // console.log(JSON.stringify(tinycolor({ r,g,b,a}).toHsv()));
                kp=tinycolor({ r,g,b,a}).toHsl()
                ap=a
            }
            let minH=kp.h-mainH
            let minS=(kp.s-mainS)*100
            // console.log(e[0])
            // console.log(`${kp.s} ${mainS} ${minS} ${targetS}`)
            // let minL=(kp.l-mianL)*100
            // hue 上下 15
            if(minH<15 && minH>-15){
                kp.h=toHueColor
                if(minS<30 && minS>-30){
                    kp.l=targetL/100
                }
                // console.log(kp)
                let {r:red,g:green,b:blue,a:alpha}= tinycolor(kp).toRgb()
                // console.log({red,green,blue,alpha:ap})
                this.tO.setVariable(e[0],{red,green,blue,alpha:ap})
            }
            // 目标变量
            // 当 H 和目标变量的H相等 并且S接近 差值为30 则修改S=targetS
            // L同理
        }
        if (alphaT<1){
            // @ts-ignore
            let {red:r,green:g,blue:b} = this.tO.resolveVariable(this.chatBg)

            this.tO.setVariable(this.chatBg,{red:r,green:g,blue:b,alpha:Math.floor(alphaT*255)})
        }
        this.addTaOperation()
        // tO.wallpaper.free()
        this.tO.backbit=background
        //fs.writeFileSync("j.jpg",tO.backbit)
        return this.tO.toZip()
    }

    protected  addTaOperation(){

    }

    private getBuffer(){
        return  fs.readFileSync(this.getPath())
    }
    private getPath(){
        return  path.join(this.prx,this.type,this.id,this.tP)
    }


}

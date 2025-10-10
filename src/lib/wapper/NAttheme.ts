//NAtttheme 是新的Attheme类
import Attheme from "../atthemejs";
export interface RgbColor {
    red: number;
    green: number;
    blue: number;
    alpha: number;
}
export class NAttheme{
    readonly wpsHeader = Buffer.from('WPS\n');
    readonly wpeFooter = Buffer.from('\nWPE\n');
    wpsWPE: Buffer
    private _attheme: Attheme

    constructor(content:Buffer|Map<string,string>) {
        //分割
        if(content instanceof Buffer) {
            let varbs:Buffer;
            const ai = content.indexOf('WPS');
            if (ai === -1) {
                varbs = content
                // @ts-ignore
                this.wpsWPE = Buffer.from('');
            } else {
                varbs = content.subarray(0, ai);
                this.wpsWPE = content.subarray(ai);
            }
            this._attheme=new Attheme(varbs.toString())
        } else {
            let rgbMap= new Map<string,RgbColor>();
            content.forEach((v,k)=>{
                if(k==="wallpaper"){
                    return;
                }
                rgbMap.set(k,parseValue(v))
            })
            this._attheme=new Attheme(rgbMap)
            this.wpsWPE=Buffer.from("");
        }
        // 从找到的位置开始读取数据
    }

    //外观模式
    get(name:string){
        return this._attheme.get(name)
    }
    set(str:string,color:RgbColor){
        this._attheme.set(str,color)
    }
    getBackground():Buffer {
        if (this.wpsWPE==null){
            return Buffer.alloc(0);
        }
        // 读取文件内容
        // 从找到的位置开始读取数据
        let filePart = this.wpsWPE
        // 处理数据，去掉 'WPS\n' 和 '\nWPE\n'
        // 处理数据，去掉 'WPS\n' 和 '\nWPE\n'
        filePart = filePart.subarray(this.wpsHeader.length); // 移除 'WPS\n' 头部
        const wpeIndex = filePart.indexOf(this.wpeFooter);
        if (wpeIndex !== -1) {
            filePart = filePart.subarray(0, wpeIndex); // 移除 'WPE\n' 尾部
        }
        return filePart
    }
    setWallpaper(buf:Buffer){
        this.wpsWPE= Buffer.concat([this.wpsHeader,buf,this.wpeFooter])
    }
    toFile(){
        return Buffer.concat([Buffer.from(this._attheme.toString("int"))
            ,this.wpsWPE]);
    }
    getVariablesList(){
        return this._attheme.getVariablesList()
    }
}


const parseValue = (value:string) => {
    const trimmedValue = value.trim();
    if (!/#[\da-f]{6}|#[\da-f]{8}|-{0,1}[\d]+/i.test(trimmedValue)) {
        throw new SyntaxError(`The color is invalid: ${trimmedValue}`);
    }
    let hex;
    if (trimmedValue.startsWith(`#`)) {
        hex = trimmedValue.slice(1).padStart(8, `f`);
    }
    else {
        const unfoledValue = Number.parseInt(trimmedValue, 10) >>> 0;
        hex = unfoledValue.toString(16).padStart(8, `0`);
    }
    return {
        alpha: Number.parseInt(hex.slice(0, 2), 16),
        red: Number.parseInt(hex.slice(2, 4), 16),
        green: Number.parseInt(hex.slice(4, 6), 16),
        blue: Number.parseInt(hex.slice(6, 8), 16),
    };
};

const Attheme=require('attheme-js')
const { TdesktopTheme } = require(`tdesktop-theme/node`);
const fs = require(`fs`);
const defaultVariablesValues = require(`./attheme-default-values`).default;
const { DOMParser, XMLSerializer } = require(`xmldom`);
const sharp = require(`sharp`);
const sizeOf = require(`image-size`);
const { serializeToString: serialize } = new XMLSerializer();
const Color = require(`@snejugal/color`);
const rgbToHsl = Color.rgbToHsl;
const puppeteer = require(`puppeteer`);
const { fallbacks } = require(`./fallbacks`);
const log_config = require("../config/log_config").default.getLogger(`${__filename}`);

const browser = puppeteer.launch({
    args:[
        '--no-sandbox'
    ]
})

const variablesList = {
    dialogsBg: {
        historyPeer1UserpicBg: `historyPeerUserpicFg`,
        historyPeer2UserpicBg: `historyPeerUserpicFg`,
        historyPeer3UserpicBg: `historyPeerUserpicFg`,
        historyPeer4UserpicBg: `historyPeerUserpicFg`,
        historyPeer5UserpicBg: `historyPeerUserpicFg`,
        historyPeer6UserpicBg: `historyPeerUserpicFg`,
        historyPeer7UserpicBg: `historyPeerUserpicFg`,
        historyPeerSavedMessagesBg: `historyPeerUserpicFg`,
        dialogsUnreadBgMuted: `dialogsUnreadFg`,
        dialogsUnreadBg: `dialogsUnreadFg`,
    },
    titleBg: {
        titleButtonCloseBg: `titleButtonCloseFg`,
        titleButtonBg: `titleButtonFg`,
    },
    msgInBg: {
        msgFileInBg: `historyFileInIconFg`,
    },
    msgOutBg: {
        msgFileOutBg: `historyFileOutIconFg`,
    },
};
const userPicList = [
    `historyPeerSavedMessagesBg`,
    `historyPeer1UserpicBg`,
    `historyPeer2UserpicBg`,
    `historyPeer3UserpicBg`,
    `historyPeer4UserpicBg`,
    `historyPeer5UserpicBg`,
    `historyPeer6UserpicBg`,
    `historyPeer7UserpicBg`,
];

const RENDER_CONFIG = {
    density: 150,
};
const parser = new DOMParser();

const MINIMALISTIC_TEMPLATE = Symbol();
const REGULAR_TEMPLATE = Symbol();
const NEW_TEMPLATE = Symbol();
const DESKTOP_TEMPLATE = Symbol();

const templates = {
    [MINIMALISTIC_TEMPLATE]: fs.readFileSync(`public/svg/new-theme-preview.svg`, `utf8`),
    [REGULAR_TEMPLATE]: fs.readFileSync(`public/svg/theme-preview.svg`, `utf8`),
    [NEW_TEMPLATE]: fs.readFileSync(`public/svg/new-preview.svg`, `utf8`),
    [DESKTOP_TEMPLATE]: fs.readFileSync(`public/svg/tdesktop-preview.svg`, `utf8`),
};
const defaultThemeBuffer = fs.readFileSync(`public/classic-tdesktheme/classic.tdesktop-theme`);
const defaultTheme = new TdesktopTheme(defaultThemeBuffer);

const WALLPAPERS_AMOUNT = 32;
const wallpapers = [];

for (let index = 0; index < WALLPAPERS_AMOUNT; index++) {
    const wallpaper = fs.readFileSync(`public/wallpapers/${index}.jpg`, `binary`);

    wallpapers.push(wallpaper);
}

const get = (node, className, tag) =>
    Array.from(node.getElementsByTagName(tag)).filter(
        (element) =>
            element.getAttribute && element.getAttribute(`class`) === className
    );

const getElementsByClassName = (node, className) => [
    ...get(node, className, `rect`),
    ...get(node, className, `circle`),
    ...get(node, className, `path`),
    ...get(node, className, `g`),
    ...get(node, className, `polygon`),
    ...get(node, className, `image`),
    ...get(node, className, `tspan`),
    ...get(node, className, `stop`),
    ...get(node, className, `ellipse`),
];

const addWallpaper = async (elements, wallpaper) => {
    const result = await Promise.all(
        elements.map(async (element) => {
            let chatWidth = Number(element.getAttribute(`width`));
            let chatHeight = Number(element.getAttribute(`height`));
            let ratio = chatHeight / chatWidth;
            const imageBuffer = Buffer.from(wallpaper, `binary`);

            const { width, height } = sizeOf(imageBuffer);
            const imageRatio = height / width;
            let finalHeight;
            let finalWidth;
            if (ratio > imageRatio) {
                finalHeight = chatHeight;
                finalWidth = Math.round(chatHeight / imageRatio);
            } else {
                finalWidth = chatWidth;
                finalHeight = Math.round(chatWidth * imageRatio);
            }
            const resizedImage = await sharp(imageBuffer)
                .resize(finalWidth, finalHeight)
                .png()
                .toBuffer();
            const croppedImage = await sharp(resizedImage)
                .resize(chatWidth, chatHeight)
                .png()
                .toBuffer();
            element.setAttribute(
                `xlink:href`,
                `data:image/png;base64,${croppedImage.toString(`base64`)}`
            );
        })
    );
    return result;
};

const isGray = (hsl) =>
    hsl.saturation < 0.05 || hsl.lightness > 0.92 || hsl.lightness < 0.08;

const areColorsEqual = (firstColor, secondColor) =>
    Math.abs(firstColor.hue - secondColor.hue) < Number.EPSILON &&
    Math.abs(firstColor.saturation - secondColor.saturation) < Number.EPSILON &&
    Math.abs(firstColor.lightness - secondColor.lightness) < Number.EPSILON;

const calculateAccentColor = (colorsHsl) => {
    const colors = [];
    let grayColorsAmount = 0;
    for (const colorHsl of colorsHsl) {
        if (isGray(colorHsl)) {
            grayColorsAmount += 1;
        } else {
            colors.push(Math.round(colorHsl.hue));
        }
    }
    if (grayColorsAmount / 6 > colors.length) {
        return {
            background: { hue: 0, saturation: 0, lightness: 0.9 },
            shadow: { hue: 0, saturation: 0, lightness: 0.3 },
        };
    }
    const quantity = new Map();
    let accentQuantity = 0;
    let accent;
    for (const color of colors) {
        quantity.set(color, (quantity.get(color) ?? 0) + 1);
        if (quantity.get(color) > accentQuantity) {
            accent = color;
            accentQuantity = quantity.get(color);
        }
    }
    return {
        background: { hue: accent, saturation: 1, lightness: 0.9 },
        shadow: { hue: accent, saturation: 1, lightness: 0.02 },
    };
};

const rgbDifference = (color1, color2) =>
    Math.hypot(
        color1.red - color2.red,
        color1.green - color2.green,
        color1.blue - color2.blue
    );

const fill = (rootNode, color) => {
    const cssColor =
        `red` in color
            ? `rgba(${color.red}, ${color.green}, ${color.blue}, ${
                color.alpha / 255
            })`
            : `hsl(${color.hue}, ${color.saturation * 100}%, ${
                color.lightness * 100
            }%)`;

    const innerFill = (node) => {
        if (node.tagName === `stop`) {
            node.setAttribute(`stop-color`, cssColor);
        } else {
            node.setAttribute(`fill`, cssColor);
        }

        if (node.childNodes) {
            for (let child of Array.from(node.childNodes)) {
                if (child.setAttribute) {
                    innerFill(child, cssColor);
                }
            }
        }
    };

    innerFill(rootNode);
};

const makePrevDesktop = async (themeBuffer) => {

    const originalTheme = new TdesktopTheme(themeBuffer);
    const theme = originalTheme.fallbackTo(defaultTheme);
    originalTheme.free();

    const preview = parser.parseFromString(templates[DESKTOP_TEMPLATE]);
    const variables = theme.variables();

    let colors = [];
    for (const variable of variables) {
        const elements = getElementsByClassName(preview, variable);
        const color = theme.resolveVariable(variable);
        if (!color){
            log_config.warn(`变量${variable}为空, 已经跳过!`)
            continue
        }

        for (const element of elements) {
            fill(element, color);
        }
        const dialogsBg = rgbToHsl(theme.resolveVariable(`dialogsBg`));

        let colorHsl;
        try {
            colorHsl = rgbToHsl(color);
        }catch (e) {
            log_config.error(`makePrevDesktop出错(创建桌面主题出错 ) 传入的 rgbToHsl函数参数 color 为 ${color}`)
            log_config.error(e.stack)
        }


        if (!areColorsEqual(dialogsBg, colorHsl) && elements.length > 0) {
            colors.push(colorHsl);
        }

    }

    let { background, shadow } = calculateAccentColor(colors);

    for (const previewBack of getElementsByClassName(preview, `PreviewBack`)) {
        fill(previewBack, background);
    }
    for (const previewShadow of getElementsByClassName(
        preview,
        `PreviewShadow`
    )) {
        fill(previewShadow, shadow);
    }

    for (let background in variablesList) {
        for (let elementName in variablesList[background]) {
            const backgroundColor = theme.resolveVariable(background);
            const elementColor = theme.resolveVariable(elementName);
            const elementInnerColor = theme.resolveVariable(
                variablesList[background][elementName]
            );

            const difference = rgbDifference(backgroundColor, elementColor);
            const differenceInner = rgbDifference(backgroundColor, elementInnerColor);

            if (
                (difference < 25 && differenceInner > difference) ||
                elementColor.alpha === 0
            ) {
                const elements = getElementsByClassName(preview, elementName);
                for (const element of elements) {
                    fill(element, elementInnerColor);
                }
            }
        }
    }

    for (const userPic of userPicList) {
        const userPicElement = getElementsByClassName(preview, userPic)[0];
        const userPicColor = userPicElement.getAttribute(`stop-color`);
        //rgba(255,255,255,255)
        const color = userPicColor.slice("rgba(".length, -")".length).split(`,`);
        const colorRgb = {
            red: parseInt(color[0]),
            green: parseInt(color[1]),
            blue: parseInt(color[2]),
            alpha: parseInt(color[3]),
        };
        const colorHsl = rgbToHsl(colorRgb);
        colorHsl.lightness -= 0.2;
        const userPicShadow = `${userPic}Shadow`;
        const elements = getElementsByClassName(preview, userPicShadow);
        for (const element of elements) {
            fill(element, colorHsl);
        }
    }

    const elements = getElementsByClassName(preview, `IMG`);

    const wallpaper = theme.wallpaper;
    const wallpaperBytes =
        wallpaper?.bytes.length > 0
            ? wallpaper.bytes
            : defaultTheme.wallpaper.bytes;
    await addWallpaper(elements, Buffer.from(wallpaperBytes));
    wallpaper?.free();
    theme.free();
    return preview;
};

const makePrevAndroid = async (
    themeBuffer,
    themeName,
    themeAuthor,
    template
) => {
    let theme, accentHue;
    if (themeBuffer instanceof Buffer) {
        theme = new Attheme(themeBuffer.toString());
    } else {
        theme = themeBuffer;
    }
    for (const [variable, fallbackVariable] of fallbacks) {
            theme[variable] ??=
                theme[fallbackVariable] ?? defaultVariablesValues[variable];
    }
    const preview = parser.parseFromString(templates[template]);
    const AVATAR_VARIABLES = [
        `avatar_backgroundRed`,
        `avatar_backgroundOrange`,
        `avatar_backgroundViolet`,
        `avatar_backgroundGreen`,
        `avatar_backgroundCyan`,
        `avatar_backgroundBlue`,
    ];
    const windowBackgroundWhite =
        theme[`windowBackgroundWhite`] ||
        defaultVariablesValues[`windowBackgroundWhite`];

    const inBubble =
        theme[`chat_inBubble`] || defaultVariablesValues[`chat_inBubble`];
    const outBubble =
        theme[`chat_outBubble`] || defaultVariablesValues[`chat_outBubble`];
    if (Color.brightness(inBubble) > Color.brightness(outBubble)) {
        theme[`chat_{in/out}Bubble__darkest`] = inBubble;
    } else {
        theme[`chat_{in/out}Bubble__darkest`] = outBubble;
    }
    let colors = [];
    for (const variable in defaultVariablesValues) {
        if (variable === `chat_wallpaper` && !theme.chat_wallpaper) {
            continue;
        }
        const elements = getElementsByClassName(preview, variable);
        const color = theme[variable] || defaultVariablesValues[variable];
        for (const element of elements) {
            fill(element, color);
        }
        const colorHsl = rgbToHsl(color);
        const dialogsBg = rgbToHsl(windowBackgroundWhite);
        if (!areColorsEqual(dialogsBg, colorHsl) && elements.length > 0) {
            colors.push(colorHsl);
        }
    }

    let { background, shadow } = calculateAccentColor(colors);

    for (const outBubbleGradientelement of getElementsByClassName(
        preview,
        `chat_outBubbleGradient`
    )) {
        const color =
            theme[`chat_outBubbleGradient`] ||
            theme[`chat_outBubble`] ||
            defaultVariablesValues[`chat_outBubble`];
        fill(outBubbleGradientelement, color);
    }
    const outBubbleHsl = rgbToHsl(outBubble);
    const outBubbleGradient = theme[`chat_outBubbleGradient`] || outBubble;
    const outBubbleGradientHsl = rgbToHsl(outBubbleGradient);
    for (const previewBackLinear of getElementsByClassName(
        preview,
        `PreviewBackLinear`
    )) {
        const colorSaturation = isGray(outBubbleGradientHsl) ? 0 : 1;
        fill(previewBackLinear, {
            hue: outBubbleGradientHsl.hue,
            saturation: colorSaturation,
            lightness: 0.9,
        });
    }
    for (const previewBackLinearShadow of getElementsByClassName(
        preview,
        `PreviewBackLinearShadow`
    )) {
        const colorSaturation = isGray(outBubbleHsl) ? 0 : 1;
        fill(previewBackLinearShadow, {
            hue: outBubbleHsl.hue,
            saturation: colorSaturation,
            lightness: 0.9,
        });
    }
    for (const previewBack of getElementsByClassName(preview, `PreviewBack`)) {
        fill(previewBack, background);
    }
    for (const chatShadow of getElementsByClassName(preview, `ChatShadow`)) {
        fill(chatShadow, shadow);
    }
    if (
        `chat_outBubbleGradient` in theme &&
        rgbDifference(outBubble, outBubbleGradient) < 10
    ) {
        for (const previewBack of getElementsByClassName(preview, `PreviewBack`)) {
            fill(previewBack, { red: 0, green: 0, blue: 0, alpha: 0 });
        }
    }

    const avatarTextColor =
        theme[`avatar_text`] || defaultVariablesValues[`avatar_text`];
    for (const avatarVariable of AVATAR_VARIABLES) {
        const avatarColor =
            theme[avatarVariable] || defaultVariablesValues[avatarVariable];
        const avatarAndBackgroundDifference = rgbDifference(
            avatarColor,
            windowBackgroundWhite
        );
        if (avatarAndBackgroundDifference < 25) {
            for (const avatar of getElementsByClassName(preview, avatarVariable)) {
                fill(avatar, avatarTextColor);
            }
            for (const avatarShadow of getElementsByClassName(
                preview,
                `${avatarVariable}Shadow`
            )) {
                let hslChoose = rgbToHsl(avatarTextColor);
                hslChoose.lightness += hslChoose.lightness < 0.25 ? 0.1 : -0.2;
                fill(avatarShadow, hslChoose);
            }
        } else {
            for (const avatarShadow of getElementsByClassName(
                preview,
                `${avatarVariable}Shadow`
            )) {
                const choose =
                    theme[avatarVariable] || defaultVariablesValues[avatarVariable];
                const hslChoose = rgbToHsl(choose);
                hslChoose.lightness += hslChoose.lightness < 0.25 ? 0.1 : -0.2;
                fill(avatarShadow, hslChoose);
            }
        }
    }

    const chatInLoader =
        theme[`chat_inLoader`] || defaultVariablesValues[`chat_inLoader`];
    const chatInBubble =
        theme[`chat_inBubble`] || defaultVariablesValues[`chat_inBubble`];
    const chatOutLoader =
        theme[`chat_outLoader`] || defaultVariablesValues[`chat_outLoader`];
    const inLoaderAndBubbleDifference = rgbDifference(chatInLoader, chatInBubble);
    const outLoaderAndBubbleDifference = rgbDifference(chatOutLoader, outBubble);
    const chatInMediaIcon =
        theme[`chat_inMediaIcon`] || defaultVariablesValues[`chat_inMediaIcon`];
    const chatOutMediaIcon =
        theme[`chat_outMediaIcon`] || defaultVariablesValues[`chat_outMediaIcon`];

    if (inLoaderAndBubbleDifference < 25) {
        for (const chatInLoader of getElementsByClassName(
            preview,
            `chat_inLoader`
        )) {
            fill(chatInLoader, chatInMediaIcon);
        }
    }
    if (outLoaderAndBubbleDifference < 25) {
        for (const chatOutLoader of getElementsByClassName(
            preview,
            `chat_outLoader`
        )) {
            fill(chatOutLoader, chatOutMediaIcon);
        }
    }

    if (theme[Attheme.IMAGE_KEY] && !theme.chat_wallpaper) {
        // Check that the wallpaper is valid, and delete it if it's invalid
        try {
            const wallpaperBuffer = Buffer.from(theme[Attheme.IMAGE_KEY], `binary`);
            sizeOf(wallpaperBuffer);
        } catch {
            delete theme[Attheme.IMAGE_KEY];
        }
    }

    if (!theme[Attheme.IMAGE_KEY] && !theme.chat_wallpaper) {
        const randomWallpaper = Math.floor(Math.random() * WALLPAPERS_AMOUNT);
        const image = wallpapers[randomWallpaper];


        theme[Attheme.IMAGE_KEY] = image;
    }

    const elements = getElementsByClassName(preview, `IMG`);

    if (theme[Attheme.IMAGE_KEY] && !theme.chat_wallpaper) {
        const imageBuffer = Buffer.from(theme[Attheme.IMAGE_KEY], `binary`);
        await addWallpaper(elements, imageBuffer);
    }

    const authorIndex = themeName.search(/ [bB]y @?[a-zA-Z0-9]/);

    if (themeAuthor === `` && authorIndex !== -1) {
        themeAuthor = themeName.slice(authorIndex);
        themeName = themeName.slice(0, authorIndex);
    }

    for (const element of getElementsByClassName(preview, `theme_name`)) {
        element.textContent = themeName;
    }

    for (const element of getElementsByClassName(preview, `theme_author`)) {
        element.textContent = themeAuthor;
    }
    return preview;
};

const makePrev = async (themeBuffer, themeName, themeAuthor, template) => {

    let preview;
    try {
        if (template == DESKTOP_TEMPLATE) {
            preview = await makePrevDesktop(themeBuffer);
        } else {
            preview = await makePrevAndroid(
                themeBuffer,
                themeName,
                themeAuthor,
                template
            );
        }
    }catch (error) {
        log_config.error(` makePrev 发生错误 , ${error}`);
        throw error; //继续抛出
    }
    const svg = preview.getElementsByTagName(`svg`)[0];
    const widthSvg = parseInt(svg.getAttribute(`width`));
    const heightSvg = parseInt(svg.getAttribute(`height`));

    const page = await browser.then((browser) => browser.newPage());
    await page.setViewport({
        width: widthSvg,
        height: heightSvg,
        deviceScaleFactor: 0,
    });
    await page.goto(`data:text/html,`);
    await page.setContent(`
    <style>
        * {
            margin: 0;
        }
    </style>
    ${serialize(preview)}
  `);
    const screen = await page.screenshot();
    await page.close();
    return screen;
};

module.exports = {
    MINIMALISTIC_TEMPLATE,
    REGULAR_TEMPLATE,
    NEW_TEMPLATE,
    DESKTOP_TEMPLATE,
    makePrev,
};

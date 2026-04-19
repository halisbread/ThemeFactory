
这是一个基于 Node.js 的 Telegram 主题处理工具。它可以读取文本格式的主题，将其转换为标准的 Telegram 主题格式 (`.attheme`)，并支持自动嵌入背景图片。

## 🚀 功能特性

* **智能解析**：支持解析 `key=#AARRGGBB` 格式的颜色定义。
* **格式转换**：自动将 Telegram 特有的 **ARGB** 顺序转换为标准的 **RGBA** 逻辑进行处理。
* **背景合成**：支持直接读取本地图片并将其设置为主题的 `chat_wallpaper`。
* **十六进制处理**：兼容有符号整型颜色值与标准十六进制字符串。

## 🛠️ 安装

在开始之前，请确保你的项目中已安装以下依赖：

```bash
npm install tinycolor2
# 确保你的项目根目录下有 ./src/lib/wapper/NAttheme 路径下的核心类库
```

## 📂 项目结构

Ai功能使用以下目录结构：

```text
.
├── Ai/
│   ├── AiText.txt          # 存放原始颜色配置 (如 windowBackgroundWhite=#ff120a2a)
│   └── background.jpg      # 主题背景图片
├── public/
│   └── deault/
│       └── Day.attheme     # 基础模板主题
├── src/
│   └── lib/wapper/
│       └── NAttheme.js     # 核心主题处理类
└── Ai_main.ts                # 你的主逻辑代码(自行修改)
```

## 📖 使用说明

### 1\. 配置颜色文件 (`AiText.txt`) 由AI生成，把Ai生成的attheme字段放到 Ai/AiText.txt

在文件中按行写入颜色配置：

```text
windowBackgroundWhite=#ff120a2a
actionBarDefault=#ff1f0f3d
chat_inBubble=#ffffffff
```

### 2\. 运行转换

核心逻辑会读取 `Day.attheme` 作为基板，遍历 `AiText.txt` 中的每一行，通过 `tinycolor2` 处理透明度后，更新主题色块，最后输出为 `Ai.attheme`,放在根目录

### 3\. 代码逻辑解析

* **ARGB 转换**：代码通过 `hexValue.slice(0, 2)` 提取 Alpha 通道，并将其移动至末尾，以符合 `tinycolor` 的处理逻辑。
* **位运算技巧**：注释中提到了 `intColor >>> 0`，这是处理 Telegram 导出的负数整型颜色的高效方案。

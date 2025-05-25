Digital Human 按实时性分类:
1. 实时数字人: 如果是Agent这类助手我理解必须是实时的，用户在与数字人互动时，能即时生成表情、语音、动作和回复内容。
  1. 2D: ChatGPT风格的源泉或以Live2D Cubism为代表的虚拟角色形象, 包括Cubism, FaceRig/VUP, AliGenie
  2. 3D: 写实或卡通化的 3D 虚拟人，可实时动嘴、表情、手势 (UE5+Metahuman, Unity+Humanoid, threejs, MediaPipe/ARKit/OpenSeeFace)
3. 非实时数字人: 大量基于AIGC的产品, HeyGen、Synthesia、DeepBrain、腾讯智影, 包括很多one shot one talk, echomimic, mimictalk,fay这些都是典型的AIGC，虽然好但无法实时。

所以，Live2D和DeepSeek的结合看上去是非常"完美"的:
- 足够轻: 相比 UE/Unity 等 3D 引擎，Live2D 资源包体积小，渲染开销低，可直接在浏览器中流畅运行，适合 Web、移动、小程序等低算力场景
- 兼容性强: Live2D 支持多平台部署, 包括Web, App和桌面应用，Web在电脑、Pad和手机侧都支持的非常好
- 开发成本: Live2D 模型制作成本远低于 3D 模型
- 生态好: 可以选择的形象非常多，开发虚拟角色成本低
- 可快速上线: Live2D虽然需要授权，但是综合成本非常低，和DeepSeek配合可快速实现互动Agent

Cubism SDK是Live 2D Inc.旗下的2D建模和动画的产品SDK:
- Cubism 2.x, 2014年发布, 初代商业化产品，支持基本变形、动作、表情等，资源格式为 .moc。主要用于 PC 游戏与移动应用
- Cubism 3.x, 2017年发布, 引入 .moc3 格式和 model3.json 结构，支持物理演算、表情融合、参数更细致控制；编辑器和 SDK 分离度更高
- Cubism 4.x, 2020年发布, 加入实时光影表现（Ambient Light）、人脸捕捉精度增强，SDK 分平台模块化（Core + Framework）；支持 ARKit BlendShape；Web SDK 更加完善。
- Cubism 5.x, 2023年发布, 引入“粒子运动”、“自定义着色器”、“扩展参数”、“高级物理系统”，Web 平台支持 TypeScript 和模块化构建（支持 Vite/Webpack），更加现代化。

在这两天学习的过程中，有两个坑:
1. 太过于“信任" ChatGPT 4o, 但他的思路和代码都是停留在Cubism 4，对于5非常陌生，虽然一路鼓励，离终点之差一步了，但实际上耽误了很多时间
2. 被github上pixi-live2d-display带到沟里去，因为他封装了Cubism 4，所以能够很方便的显示live2d模型，但是但是他2年不维护，导致大量的依赖都停留在2年以前，2年前对应的PIXI已经从6升级到了8，而Cubism也从4.x升级到5.x

所以，这也跟我上了一课，不能让ChatGPT带着你走，目前这个情况下还只能是你带着他走:
1. 阅读官方文档和示例代码，这一步千万不要跳过
2. 采用最新文档版本，不要相信那些常年不更新的repo
3. 一定要带着可持续性(sustainability)的角度看待问题

## Step 1: 运行官方Demo

首先打开live2d.com找到Cubism SDK for Web的下载，然后选择下载Cubism SDK for Web，截止到May 25, 2025的最新版本是CubismSdkForWeb-5-r.4:
```sh
> cd Samples/TypeScript/Demo
> yarn
> yarn start
```

打开浏览器, 效果如下:
<img width="686" alt="Image" src="https://github.com/user-attachments/assets/0abe42aa-0a8d-418c-bd1d-d5b4a602ff54" />

通过右上角的gear可以切换不同的虚拟形象。

观察SDK中结构:
```sh
CubismSdkForWeb-5-r.4/
├── Core/                # ✅ runtime
├── Framework/           # ✅ TypeScript 编写的 Live2D 框架（模型控制逻辑）
├── Resources/           # ✅ 示例用模型资源（Mark、Hiyori 等）
├── Samples/
│   └── TypeScript/
│       ├── src/
│       │   ├── lappdefine.ts      # 定义路径和常量
│       │   ├── lappdelegate.ts    # 应用生命周期主控制器
│       │   ├── lappmodel.ts       # Live2D 模型加载与控制逻辑
│       │   ├── lappview.ts        # 渲染与视图控制
│       │   ├── lapptexturemanager.ts  # 纹理加载与缓存
│       │   ├── lapppal.ts         # 平台抽象层（日志、计时等）
│       │   ├── lappsprite.ts      # UI 元素精灵（如按钮）
│       │   ├── touchmanager.ts    # 触摸交互处理
│       │   ├── ...
│       ├── index.html 
│       ├── vite.config.mts
├── README.md
└── LICENSE.txt
```

## Step 2: 从零构建

项目结构规划
```sh
hello-live2d/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.js
├── yarn.lock

├── src/
│   └── main.js                    # 项目入口

├── live2d/                        # TypeScript 源码（含 Framework + Demo）
│   ├── Framework/                 # Cubism Framework SDK
│   └── *.ts                       # 各类 Demo 类如 lappmodel.ts 等

├── public/
│   └── live2d/
│       ├── core/                  # Core JS 文件（live2dcubismcore.js 等）
│       └── models/               # 多个模型（Haru、Mark、Kei 等）
```

a. 初始化项目
```sh
mkdir hello-live2d
cd hello-live2d
yarn init -y
yarn add vite typescript
```

b. 复制SDK文件
从 Cubism SDK 中复制以下内容：

- Core/* → /public/live2d/live2d/Core/
- Samples/Resources/ → /public/live2d/models
- Framework/* → live2d/Framework/
- Samples/TypeScript/Demo/src/* → live2d/ (不要复制main.ts)

c. index.html
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Live2D Hello</title>
    <style>
      html, body {
        margin: 0;
        background-color: #111;
        overflow: hidden;
      }
      canvas {
        display: block;
      }
    </style>
    <!-- Core 必须先引入并注册为全局变量 -->
    <script src="/live2d/core/live2dcubismcore.js"></script>
    <script>
      window.Live2DCubismCore = Live2DCubismCore;
    </script>
  </head>
  <body>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

d. src/main.js

```js
import { LAppDelegate } from '../live2d/lappdelegate';

/**
 * 页面加载完成后初始化 Live2D 系统
 */
window.addEventListener(
  'load',
  () => {
    console.log('📦 Live2D 页面加载完成，开始初始化');

    // 初始化 WebGL 和模型等
    const initialized = LAppDelegate.getInstance().initialize();

    if (!initialized) {
      console.error('❌ 初始化失败');
      return;
    }

    // 启动渲染主循环
    console.log('🚀 启动渲染主循环');
    LAppDelegate.getInstance().run();
  },
  { passive: true }
);

/**
 * 页面关闭前清理资源
 */
window.addEventListener(
  'beforeunload',
  () => {
    console.log('🧹 清理 Live2D 实例');
    LAppDelegate.releaseInstance();
  },
  { passive: true }
);
```

e. vite.config.js

```js
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@framework': path.resolve(__dirname, 'live2d/framework/src')
    }
  }
});
```

f. tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES6",
    "module": "ESNext",
    "moduleResolution": "Node",
    "baseUrl": ".",
    "paths": {
      "@framework/*": ["live2d/framework/*"]
    },
    "lib": ["DOM", "ESNext"],
    "strict": true
  },
  "include": ["live2d/**/*.ts"]
}
```

g. 修改models路径，lappdefine.ts

```ts
// 相対パス
// export const ResourcesPath = '../../Resources/';
export const ResourcesPath = 'live2d/models/';
```

注: vite会把public挂在root下，所以不用写public

h. `yarn vite`

运行后可以看到和SDK一样的效果。

代码放在这里了: https://github.com/nonocast/hello-live2d

## Step 3: 稍作修改
我们可以在 [Live2D示例数据集 (可免费下载) | Live2D Cubism](https://www.live2d.com/zh-CHS/learn/sample/) 中下载新的模型，

<img width="1000" alt="Image" src="https://github.com/user-attachments/assets/418fbad4-18ac-45aa-afa6-77beac646fde" />

下载后放到/public/live2d/models下，只需要复制runtime, 同时保持目录名称和model3.json文件名一致；然后在lappdefine.ts修改ModelDir，在array中加入'kei_vowels_pro'即可

```ts
// モデル定義---------------------------------------------
// モデルを配置したディレクトリ名の配列
// ディレクトリ名とmodel3.jsonの名前を一致させておくこと
export const ModelDir: string[] = [
  'kei_vowels_pro',
  'Haru',
  'Hiyori',
  'Mark',
  'Natori',
  'Rice',
  'Mao',
  'Wanko'
];
export const ModelDirSize: number = ModelDir.length;
````

最后我们再换一个background, 也一样是修改lappdefine.ts

```ts
// モデルの後ろにある背景の画像ファイル
export const BackImageName = 'ShinPuhKan.jpg';
```

这里我们将背景图片保持比例缩放到没有黑边，修改lappview.ts

```ts
    // 非同期なのでコールバック関数を作成
    // 背景图片加载完成后，按 cover 方式初始化背景 sprite
    // 修改为等比缩放，无黑边模式
    const initBackGroundTexture = (textureInfo: TextureInfo): void => {
      const canvasWidth = this._subdelegate.getCanvas().width;
      const canvasHeight = this._subdelegate.getCanvas().height;
      const imageWidth = textureInfo.width;
      const imageHeight = textureInfo.height;

      const canvasRatio = canvasWidth / canvasHeight;
      const imageRatio = imageWidth / imageHeight;

      let drawWidth: number, drawHeight: number;

      if (imageRatio > canvasRatio) {
        // 图片更宽：以高度为准，横向裁剪
        drawHeight = canvasHeight;
        drawWidth = imageRatio * drawHeight;
      } else {
        // 图片更高：以宽度为准，纵向裁剪
        drawWidth = canvasWidth;
        drawHeight = drawWidth / imageRatio;
      }

      const centerX = canvasWidth * 0.5;
      const centerY = canvasHeight * 0.5;

      this._back = new LAppSprite(centerX, centerY, drawWidth, drawHeight, textureInfo.id);
      this._back.setSubdelegate(this._subdelegate);
    };
```

lapp*.ts是官方对Framework的封装，管理了canvas, WebGL, 动作, 贴图等一系列工作，我起先没用这些ts的时候真的是寸步难行，本身的文档和ChatGPT的混乱根本无法写出可以运行的程序，但是借助lapp*会非常方便，所以一定要去适应的官方提供的指引。

运行后效果如下：

<img src="https://github.com/user-attachments/assets/644f6be6-5a24-4755-90f4-dfa9299a52e3" />

下一步就是要考虑嘴形和DeepSeek对接了。

参考阅读:
- [MetaHuman | Realistic Person Creator - Unreal Engine](https://www.unrealengine.com/en-US/metahuman)
- [公司信息 | 株式会社Live2D](https://www.live2d.jp/zh-CHS/company/)
- - [Live2D Cubism](https://www.live2d.com/zh-CHS/)
- [Live2D Cubism SDK | Live2D Cubism](https://www.live2d.com/zh-CHS/sdk/about/)
- [下载Live2D Cubism SDK for Web | Live2D Cubism](https://www.live2d.com/zh-CHS/sdk/download/web/)
- [Cubism SDK手册 | Cubism SDK 手册 | Live2D Manuals & Tutorials](https://docs.live2d.com/zh-CHS/cubism-sdk-manual/top/?

<img width="1478" alt="Image" src="https://github.com/user-attachments/assets/66340977-9d1b-4bf3-b567-8922539e37ab" />

_gl=1*78xmjy*_gcl_au*MTEwOTczMjk3OS4xNzQ3MDY4NzY0*_ga*MTE0NjU0Mzk5Ni4xNzQ3MDY4NzY1*_ga_VH6T56L1P1*czE3NDgxNzU1NDkkbzckZzEkdDE3NDgxNzY1NzMkajM4JGwwJGgwJGRhVFB4WXVybi1DREZOWFdFWnlJM1R0NXJGRWpLM2tZMXN3)

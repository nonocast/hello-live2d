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

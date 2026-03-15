# 音乐播放器重测报告 (2026-03-16)

## 项目概述

对已配置QQ音乐的音乐播放器进行全面重测，修复MetingJS使用方式错误。

## 发现的BUG

### BUG #4: MetingJS构造函数错误

- **现象**: `TypeError: window.Meting is not a constructor`
- **原因**: MetingJS是自定义元素(custom element)，不是构造函数
- **修复**: 改用Meting API获取歌单数据，直接初始化APlayer
- **修改文件**: `blog/src/components/layout/DynamicIsland/MusicPlayer.tsx`

## 修复方案

### 旧代码 (错误)
```typescript
metingScript.onload = () => {
  playerRef.current = new window.Meting({
    container: containerRef.current,
    server: config.platform,
    type: 'playlist',
    id: trimmedPlaylistId,
    // ...
  });
};
```

### 新代码 (正确)
```typescript
// 从 Meting API 获取歌单数据
const apiUrl = `https://api.injahow.cn/meting/?type=playlist&id=${trimmedPlaylistId}&server=${config.platform}`;
const response = await fetch(apiUrl);
const songs = await response.json();

// 转换为 APlayer 格式
const audio = songs.map((song: any) => ({
  name: song.name || song.title,
  artist: song.artist || song.author,
  url: song.url,
  cover: song.pic || song.cover,
  lrc: song.lrc,
}));

// 初始化 APlayer
playerRef.current = new window.APlayer({
  container: containerRef.current,
  mini: true,
  autoplay: config.autoPlay,
  theme: '#89CFF0',
  audio: audio,
});
```

## 测试覆盖

### 单元测试 (MusicPlayer.test.tsx)

| 测试分类 | 测试数量 | 覆盖内容 |
|----------|----------|----------|
| 占位符显示 | 4 | null配置、空字符串、空白字符、有效配置 |
| 渲染结构 | 3 | 容器渲染、播放器挂载点、空配置处理 |
| API调用 | 4 | URL正确性、平台参数、歌单ID、初始化参数 |
| 错误处理 | 3 | 网络错误、API错误、空歌单 |
| 边界情况 | 4 | 音量边界值、自动播放、多平台支持 |
| 清理 | 1 | 组件卸载时销毁播放器 |

**总计**: 19个单元测试

### 集成测试 (integration.test.tsx)

- 核心用户流程测试 (4个)
- 可访问性测试 (2个)
- 错误处理测试 (1个)
- 配置加载测试 (1个)

**总计**: 8个集成测试

### 功能测试 (Playwright)

- ✅ 真实QQ音乐歌单加载成功
- ✅ 歌曲显示: 口是心非 - 张雨生
- ✅ 播放控制按钮正常显示
- ✅ 时间进度显示: 00:00 / 04:51

## 测试结果

```
Test Files  4 passed (4)
Tests       29 passed (29)
Duration    3.28s
```

## 技术改进

### 1. API调用方式
- 使用 `fetch` 从 Meting API 获取歌单数据
- 正确解析返回的 JSON 数据
- 转换为 APlayer 需要的格式

### 2. 错误处理增强
- 添加 try-catch 包裹初始化逻辑
- 网络错误、API错误、空歌单分别处理
- 显示用户友好的错误提示: "音乐加载失败，请检查歌单配置"

### 3. 资源清理
- 组件卸载时正确销毁 APlayer 实例
- 使用 try-catch 包裹 destroy 避免二次错误
- 清空 playerRef 引用

### 4. 加载状态优化
- 显示 "加载中..." 状态
- 错误时显示具体错误信息
- 成功后隐藏加载状态

## 潜在问题与解决方案

### 问题1: API跨域
**现象**: 某些环境可能遇到 CORS 错误
**解决**: 使用代理或配置 Next.js API 路由转发

### 问题2: API不可用
**现象**: api.injahow.cn 可能不可用
**解决**: 
1. 添加备用 API 地址
2. 或自建 Meting API 服务

### 问题3: 热重载重复初始化
**现象**: 开发模式下热重载可能导致重复初始化
**解决**: 
1. 添加实例检查，避免重复初始化
2. 清理时正确销毁实例

## 开发规则记录

### [2026-03-16] 第三方库正确使用规则

- **场景**: 使用第三方库前必须查阅官方文档确认使用方式
- **正确做法**: 
  1. 先阅读库的 README 和示例代码
  2. 确认是构造函数还是自定义元素
  3. 测试时 mock 正确的接口
- **示例**: 
  ```typescript
  // 错误: 假设所有库都是构造函数
  new window.SomeLibrary()
  
  // 正确: 查阅文档确认使用方式
  // 如果是自定义元素: <some-library />
  // 如果是构造函数: new SomeLibrary()
  ```

### [2026-03-16] 测试选择器精确性规则

- **场景**: CSS 选择器匹配测试元素
- **正确做法**: 使用足够精确的选择器，避免匹配到非目标元素
- **示例**:
  ```typescript
  // 错误: 选择器太宽泛
  const island = container.querySelector('[class*="island"]');
  
  // 正确: 使用更精确的选择器
  const island = container.querySelector('[class*="_island_"]');
  ```

## 后续优化建议

1. **性能优化**: 缓存已加载的歌单数据
2. **用户体验**: 添加播放列表展开/收起
3. **功能增强**: 
   - 歌词滚动显示
   - 播放模式切换 (单曲循环/列表循环/随机)
   - 音量调节滑块
4. **错误恢复**: 添加重试按钮

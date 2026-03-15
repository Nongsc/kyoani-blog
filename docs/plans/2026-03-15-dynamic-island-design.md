# 灵动岛导航栏设计方案

**设计日期**: 2026-03-15  
**设计风格**: 紫罗兰永恒花园 + Apple Dynamic Island  
**目标**: 将传统Header改造为灵动岛样式，集成QQ音乐播放器

---

## 一、设计目标

### 核心需求
1. ✅ 灵动岛居中胶囊样式
2. ✅ 移除网站标题
3. ✅ 展开内容显示音乐播放器
4. ✅ QQ音乐平台集成
5. ✅ 艺术化演绎 + 紫罗兰风格创意动画

### 视觉结构

```
收缩态（胶囊形）：
┌───────────────────────────────┐
│  🎵  Home  │  About           │
└───────────────────────────────┘
尺寸：280px × 44px（桌面）/ 200px × 44px（移动）

展开态（圆角矩形）：
┌─────────────────────────────────┐
│  🎵 正在播放：紫罗兰永恒花园     │
│  ▶ ━━━━━━━○━━━━━━━  2:34/4:12  │
│  🔀  ⏮  ▶  ⏭  🔁    音量 🔊    │
│  [Home] [About]                 │
└─────────────────────────────────┘
尺寸：360px × 180px（桌面）/ 300px × 180px（移动）
```

---

## 二、配色方案

### 紫罗兰永恒花园风格

```css
/* 灵动岛配色 */
--island-bg: rgba(26, 58, 74, 0.85);          /* 深海蓝背景 */
--island-glass: rgba(168, 216, 234, 0.15);    /* 毛玻璃层 */
--island-border: rgba(137, 207, 240, 0.3);    /* 边框光晕 */
--island-accent: #89CFF0;                     /* 活跃指示器 */
--island-text: #E8F4F8;                       /* 文字颜色 */
--island-muted: #A7D8F0;                      /* 次要文字 */
```

---

## 三、动画设计

### 1. 收缩态动画

**呼吸动画**：
- 周期：2s
- 效果：脉冲发光，模拟生命律动
- 实现：`@keyframes breathe`

**星光闪烁**：
- 触发：音乐播放时
- 位置：边缘随机星点
- 效果：微弱闪烁，增添灵动感

### 2. 展开动画

**弹性曲线**：
```css
transition: cubic-bezier(0.34, 1.56, 0.64, 1);
duration: 400ms;
```

**波纹扩散**：
- 从中心向外展开
- 紫罗兰光晕渐隐

### 3. 紫罗兰特色动画

**花瓣呼吸**：
- 背景层浮动渐变
- 模拟花瓣飘落
- 代码：`@keyframes float`

**波浪进度条**：
- 音乐进度条使用波浪动画
- 呼应Hero区域设计
- 代码：`@keyframes wave-flow`

---

## 四、技术实现方案

### 方案选择：APlayer + MetingJS

**理由**：
1. ✅ 完全自定义UI，完美融入灵动岛设计
2. ✅ 支持QQ音乐平台
3. ✅ 纯前端实现，无需后端代理
4. ✅ 歌单支持，用户输入歌单ID即可同步
5. ✅ 响应式设计，移动端友好

### 核心依赖

```bash
npm install aplayer meting
```

### 组件架构

```
src/components/layout/DynamicIsland/
├── DynamicIsland.tsx          # 主容器组件
├── IslandCollapsed.tsx        # 收缩态UI
├── IslandExpanded.tsx         # 展开态UI
├── MusicPlayer.tsx            # APlayer封装
├── NavigationItems.tsx        # 导航项组件
├── animations.ts              # 动画配置
└── island.module.css          # 样式文件
```

### 数据流

```
Supabase (music_config表)
    ↓
blog前端 (getMusicConfig)
    ↓
DynamicIsland (Client Component)
    ↓
MetingJS (加载QQ音乐歌单)
    ↓
APlayer (渲染播放器)
```

---

## 五、QQ音乐集成

### MetingJS 配置

```typescript
<Meting
  id="123456789"              // QQ音乐歌单ID
  server="tencent"            // QQ音乐平台
  type="playlist"             // 歌单类型
  fixed={false}
  mini={true}
  theme="#89CFF0"
/>
```

### 歌单ID获取方式

1. 在QQ音乐创建歌单
2. 分享歌单 → 复制链接
3. 链接格式：`https://y.qq.com/n/ryqq/playlist/123456789`
4. 提取ID：`123456789`

### 数据库表结构

```sql
CREATE TABLE music_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT DEFAULT 'tencent' CHECK (platform IN ('tencent', 'netease', 'kugou')),
  playlist_id TEXT NOT NULL,
  auto_play BOOLEAN DEFAULT false,
  volume DECIMAL(3,2) DEFAULT 0.7 CHECK (volume >= 0 AND volume <= 1),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 六、后台管理界面

### 位置
`admin/src/features/settings/MusicSettings.tsx`

### 配置表单

```typescript
interface MusicConfigForm {
  platform: 'tencent' | 'netease' | 'kugou';
  playlistId: string;
  autoPlay: boolean;
  defaultVolume: number;
}
```

### 用户操作流程

1. 在QQ音乐创建公开歌单
2. 复制歌单ID
3. 在后台填入ID并选择平台
4. 保存后前端自动同步

---

## 七、实施计划

### 阶段1：数据库与后台配置
- [ ] 创建 `music_config` 表
- [ ] 添加音乐配置表单
- [ ] 实现配置的 CRUD API

### 阶段2：灵动岛基础结构
- [ ] 创建组件目录结构
- [ ] 实现收缩态 UI
- [ ] 实现展开/收缩动画
- [ ] 添加呼吸灯、花瓣飘落动画

### 阶段3：音乐播放器集成
- [ ] 安装依赖
- [ ] 封装 APlayer 组件
- [ ] 实现播放状态管理
- [ ] 集成 MetingJS

### 阶段4：导航功能迁移
- [ ] 迁移导航项到灵动岛
- [ ] 删除原 Header 组件
- [ ] 调整 layout.tsx

### 阶段5：响应式优化
- [ ] 移动端适配
- [ ] 无障碍访问
- [ ] `prefers-reduced-motion` 支持

---

## 八、测试策略

### 单元测试
- 组件渲染测试
- 展开/收缩状态切换
- 播放状态指示器

### 集成测试
- QQ音乐歌单加载
- 播放/暂停控制
- 进度条交互

### 可访问性测试
- ARIA属性验证
- 键盘导航支持
- 屏幕阅读器兼容

---

## 九、性能优化

1. **懒加载 APlayer**：仅在首次展开时加载
2. **CSS containment**：`contain: layout style paint`
3. **will-change**：动画元素预声明
4. **节流/防抖**：滚动和resize事件

---

## 十、潜在问题与解决方案

| 问题 | 解决方案 |
|------|----------|
| MetingJS API 不可用 | 使用公共CDN代理或自建代理 |
| QQ音乐歌单私密 | 引导用户创建公开歌单 |
| 移动端触摸冲突 | 使用 `touch-action: manipulation` |
| 播放器样式冲突 | 使用CSS Module隔离样式 |

---

## 十一、设计决策记录

### 为什么选择APlayer而不是iframe？
- iframe样式不可定制，无法融入灵动岛设计
- APlayer支持完全自定义UI
- MetingJS提供QQ音乐API接入

### 为什么选择QQ音乐而不是网易云？
- 用户偏好QQ音乐
- QQ音乐API更稳定
- 歌单管理更便捷

### 为什么使用Supabase存储配置？
- 与现有技术栈一致
- 便于后台管理
- 支持实时更新

---

**设计状态**: ✅ 已批准  
**下一步**: 创建实施计划

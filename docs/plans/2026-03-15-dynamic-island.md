# 灵动岛导航栏实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将传统Header改造为灵动岛样式，集成QQ音乐播放器

**Architecture:** 使用APlayer + MetingJS实现音乐播放，通过Supabase存储配置。灵动岛组件采用React状态管理展开/收缩，CSS Module实现紫罗兰风格动画。

**Tech Stack:** Next.js 16, React, APlayer, MetingJS, Supabase, CSS Modules, Vitest

---

## Task 1: 安装依赖并配置类型

**Files:**
- Modify: `blog/package.json`
- Create: `blog/src/types/music.ts`

**Step 1: 安装 APlayer 和 MetingJS**

```bash
cd blog
npm install aplayer meting
npm install -D @types/meting
```

**Step 2: 创建音乐类型定义**

Create: `blog/src/types/music.ts`

```typescript
export interface MusicConfig {
  id: string;
  platform: 'tencent' | 'netease' | 'kugou';
  playlistId: string;
  autoPlay: boolean;
  volume: number;
  createdAt: string;
  updatedAt: string;
}

export interface Song {
  name: string;
  artist: string;
  url: string;
  cover: string;
  lrc?: string;
}

export interface PlayerState {
  isPlaying: boolean;
  currentSong: Song | null;
  progress: number;
  duration: number;
}
```

**Step 3: 验证安装**

```bash
npm run build
```

Expected: Build succeeds with no errors

**Step 4: Commit**

```bash
git add package.json package-lock.json src/types/music.ts
git commit -m "chore: 安装APlayer和MetingJS依赖"
```

---

## Task 2: 创建数据库表和API

**Files:**
- Create: `admin/supabase/migrations/003_music_config.sql`
- Create: `blog/src/lib/music.ts`

**Step 1: 创建数据库迁移文件**

Create: `admin/supabase/migrations/003_music_config.sql`

```sql
-- 创建音乐配置表
CREATE TABLE IF NOT EXISTS music_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT DEFAULT 'tencent' CHECK (platform IN ('tencent', 'netease', 'kugou')),
  playlist_id TEXT NOT NULL DEFAULT '',
  auto_play BOOLEAN DEFAULT false,
  volume DECIMAL(3,2) DEFAULT 0.7 CHECK (volume >= 0 AND volume <= 1),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 插入默认配置
INSERT INTO music_config (platform, playlist_id) 
VALUES ('tencent', '');

-- 启用RLS
ALTER TABLE music_config ENABLE ROW LEVEL SECURITY;

-- 创建公开读取策略
CREATE POLICY "公开读取音乐配置" ON music_config
  FOR SELECT USING (true);

-- 创建管理策略
CREATE POLICY "管理员可以管理音乐配置" ON music_config
  FOR ALL USING (auth.role() = 'authenticated');
```

**Step 2: 创建音乐配置API**

Create: `blog/src/lib/music.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import type { MusicConfig } from '@/types/music';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function getMusicConfig(): Promise<MusicConfig | null> {
  const { data, error } = await supabase
    .from('music_config')
    .select('*')
    .limit(1)
    .single();

  if (error) {
    console.error('Failed to fetch music config:', error);
    return null;
  }

  return data;
}
```

**Step 3: 测试数据库连接**

```typescript
// blog/src/lib/music.test.ts
import { describe, it, expect, vi } from 'vitest';

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        limit: vi.fn(() => ({
          single: vi.fn(() => ({
            data: {
              id: '1',
              platform: 'tencent',
              playlistId: '123456',
              autoPlay: false,
              volume: 0.7,
            },
            error: null,
          })),
        })),
      })),
    })),
  })),
}));

describe('getMusicConfig', () => {
  it('should fetch music config from database', async () => {
    const config = await getMusicConfig();
    expect(config).toBeDefined();
    expect(config?.platform).toBe('tencent');
  });
});
```

**Step 4: 运行测试**

```bash
npm run test:run src/lib/music.test.ts
```

Expected: Test passes

**Step 5: Commit**

```bash
git add admin/supabase/migrations/003_music_config.sql src/lib/music.ts src/lib/music.test.ts
git commit -m "feat: 添加音乐配置数据库表和API"
```

---

## Task 3: 创建灵动岛基础组件结构

**Files:**
- Create: `blog/src/components/layout/DynamicIsland/DynamicIsland.tsx`
- Create: `blog/src/components/layout/DynamicIsland/island.module.css`
- Create: `blog/src/components/layout/DynamicIsland/index.ts`

**Step 1: 创建主容器组件**

Create: `blog/src/components/layout/DynamicIsland/DynamicIsland.tsx`

```typescript
"use client";

import { useState, useCallback } from 'react';
import { IslandCollapsed } from './IslandCollapsed';
import { IslandExpanded } from './IslandExpanded';
import styles from './island.module.css';

export function DynamicIsland() {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  return (
    <header className={styles.islandContainer}>
      <div 
        className={`${styles.island} ${isExpanded ? styles.expanded : styles.collapsed}`}
        onClick={!isExpanded ? toggleExpand : undefined}
      >
        {isExpanded ? (
          <IslandExpanded onCollapse={() => setIsExpanded(false)} />
        ) : (
          <IslandCollapsed onExpand={toggleExpand} />
        )}
      </div>
    </header>
  );
}
```

**Step 2: 创建样式文件**

Create: `blog/src/components/layout/DynamicIsland/island.module.css`

```css
.islandContainer {
  position: fixed;
  top: 16px;
  left: 0;
  right: 0;
  z-index: 50;
  display: flex;
  justify-content: center;
  pointer-events: none;
}

.island {
  pointer-events: auto;
  background: rgba(26, 58, 74, 0.85);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(137, 207, 240, 0.3);
  box-shadow: 
    0 4px 24px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  overflow: hidden;
}

.collapsed {
  width: 280px;
  height: 44px;
  border-radius: 22px;
}

.expanded {
  width: 360px;
  height: 180px;
  border-radius: 24px;
  cursor: default;
}

@media (max-width: 640px) {
  .collapsed {
    width: 200px;
  }
  
  .expanded {
    width: 300px;
  }
}

/* 呼吸动画 */
.island::before {
  content: '';
  position: absolute;
  inset: -2px;
  background: radial-gradient(
    ellipse at center,
    rgba(137, 207, 240, 0.3) 0%,
    transparent 70%
  );
  animation: breathe 2s ease-in-out infinite;
  pointer-events: none;
}

@keyframes breathe {
  0%, 100% { 
    opacity: 0.3; 
    transform: scale(1); 
  }
  50% { 
    opacity: 0.8; 
    transform: scale(1.05); 
  }
}

/* 花瓣飘落效果 */
.island::after {
  content: '';
  position: absolute;
  top: 10px;
  left: 20%;
  width: 6px;
  height: 6px;
  background: linear-gradient(135deg, #E8F4F8, #A7D8F0);
  border-radius: 50% 0 50% 50%;
  opacity: 0.3;
  animation: float 8s ease-in-out infinite;
  pointer-events: none;
}

@keyframes float {
  0%, 100% { 
    transform: translateY(0) rotate(0deg); 
    opacity: 0.3;
  }
  50% { 
    transform: translateY(-15px) rotate(180deg); 
    opacity: 0.6;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .island::before,
  .island::after {
    animation: none;
  }
  
  .island {
    transition: none;
  }
}
```

**Step 3: 创建导出文件**

Create: `blog/src/components/layout/DynamicIsland/index.ts`

```typescript
export { DynamicIsland } from './DynamicIsland';
```

**Step 4: 创建收缩态组件占位**

Create: `blog/src/components/layout/DynamicIsland/IslandCollapsed.tsx`

```typescript
"use client";

import styles from './island.module.css';

interface IslandCollapsedProps {
  onExpand: () => void;
}

export function IslandCollapsed({ onExpand }: IslandCollapsedProps) {
  return (
    <div className={styles.collapsedContent}>
      <span className={styles.placeholder}>灵动岛</span>
    </div>
  );
}
```

**Step 5: 创建展开态组件占位**

Create: `blog/src/components/layout/DynamicIsland/IslandExpanded.tsx`

```typescript
"use client";

import styles from './island.module.css';

interface IslandExpandedProps {
  onCollapse: () => void;
}

export function IslandExpanded({ onCollapse }: IslandExpandedProps) {
  return (
    <div className={styles.expandedContent}>
      <button 
        onClick={onCollapse}
        className={styles.closeButton}
        aria-label="收起灵动岛"
      >
        ✕
      </button>
      <span className={styles.placeholder}>音乐播放器区域</span>
    </div>
  );
}
```

**Step 6: 添加占位样式**

在 `island.module.css` 末尾添加：

```css
.collapsedContent,
.expandedContent {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.placeholder {
  color: #E8F4F8;
  font-size: 14px;
  opacity: 0.5;
}

.closeButton {
  position: absolute;
  top: 8px;
  right: 12px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #E8F4F8;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.closeButton:hover {
  background: rgba(255, 255, 255, 0.2);
}
```

**Step 7: 测试基础渲染**

```typescript
// blog/src/components/layout/DynamicIsland/DynamicIsland.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DynamicIsland } from './DynamicIsland';

describe('DynamicIsland', () => {
  it('should render collapsed state by default', () => {
    render(<DynamicIsland />);
    expect(screen.getByText('灵动岛')).toBeInTheDocument();
  });
});
```

**Step 8: 运行测试**

```bash
npm run test:run src/components/layout/DynamicIsland/DynamicIsland.test.tsx
```

Expected: Test passes

**Step 9: Commit**

```bash
git add src/components/layout/DynamicIsland/
git commit -m "feat: 创建灵动岛基础组件结构"
```

---

## Task 4: 实现导航项组件

**Files:**
- Create: `blog/src/components/layout/DynamicIsland/NavigationItems.tsx`
- Modify: `blog/src/components/layout/DynamicIsland/IslandCollapsed.tsx`

**Step 1: 创建导航项组件**

Create: `blog/src/components/layout/DynamicIsland/NavigationItems.tsx`

```typescript
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, User } from 'lucide-react';
import styles from './island.module.css';

const NAV_ITEMS = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/about', icon: User, label: 'About' },
] as const;

export function NavigationItems() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav} aria-label="主导航">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.navItem} ${isActive ? styles.active : ''}`}
            aria-current={isActive ? 'page' : undefined}
            onClick={(e) => e.stopPropagation()}
          >
            <Icon className={styles.navIcon} aria-hidden="true" />
            <span className={styles.navLabel}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
```

**Step 2: 添加导航样式**

在 `island.module.css` 末尾添加：

```css
.nav {
  display: flex;
  align-items: center;
  gap: 4px;
}

.navItem {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 16px;
  color: #E8F4F8;
  text-decoration: none;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s;
}

.navItem:hover {
  background: rgba(255, 255, 255, 0.15);
}

.navItem.active {
  background: rgba(137, 207, 240, 0.3);
  color: #89CFF0;
}

.navIcon {
  width: 16px;
  height: 16px;
}

.navLabel {
  font-size: 13px;
}
```

**Step 3: 集成到收缩态组件**

Modify: `blog/src/components/layout/DynamicIsland/IslandCollapsed.tsx`

```typescript
"use client";

import { NavigationItems } from './NavigationItems';
import styles from './island.module.css';

interface IslandCollapsedProps {
  onExpand: () => void;
}

export function IslandCollapsed({ onExpand }: IslandCollapsedProps) {
  return (
    <div className={styles.collapsedContent}>
      <NavigationItems />
    </div>
  );
}
```

**Step 4: 测试导航项**

```typescript
// blog/src/components/layout/DynamicIsland/NavigationItems.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NavigationItems } from './NavigationItems';

// Mock Next.js hooks
vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

describe('NavigationItems', () => {
  it('should render navigation links', () => {
    render(<NavigationItems />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
  });

  it('should mark active link', () => {
    render(<NavigationItems />);
    const homeLink = screen.getByText('Home').closest('a');
    expect(homeLink).toHaveAttribute('aria-current', 'page');
  });
});
```

**Step 5: 运行测试**

```bash
npm run test:run src/components/layout/DynamicIsland/NavigationItems.test.tsx
```

Expected: Test passes

**Step 6: Commit**

```bash
git add src/components/layout/DynamicIsland/
git commit -m "feat: 实现导航项组件"
```

---

## Task 5: 集成音乐播放器

**Files:**
- Create: `blog/src/components/layout/DynamicIsland/MusicPlayer.tsx`
- Modify: `blog/src/components/layout/DynamicIsland/IslandExpanded.tsx`

**Step 1: 创建音乐播放器组件**

Create: `blog/src/components/layout/DynamicIsland/MusicPlayer.tsx`

```typescript
"use client";

import { useEffect, useRef, useState } from 'react';
import type { MusicConfig } from '@/types/music';
import styles from './island.module.css';

declare global {
  interface Window {
    APlayer: any;
    Meting: any;
  }
}

interface MusicPlayerProps {
  config: MusicConfig | null;
}

export function MusicPlayer({ config }: MusicPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!config?.playlistId || !containerRef.current) return;

    // 动态加载 APlayer CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/aplayer/dist/APlayer.min.css';
    document.head.appendChild(link);

    // 动态加载 APlayer JS
    const aplayerScript = document.createElement('script');
    aplayerScript.src = 'https://cdn.jsdelivr.net/npm/aplayer/dist/APlayer.min.js';
    aplayerScript.async = true;

    aplayerScript.onload = () => {
      // 动态加载 MetingJS
      const metingScript = document.createElement('script');
      metingScript.src = 'https://cdn.jsdelivr.net/npm/meting@2.0.1/dist/Meting.min.js';
      metingScript.async = true;

      metingScript.onload = () => {
        // 初始化播放器
        playerRef.current = new window.Meting({
          container: containerRef.current,
          server: config.platform,
          type: 'playlist',
          id: config.playlistId,
          fixed: false,
          mini: true,
          autoplay: config.autoPlay,
          volume: config.volume,
          theme: '#89CFF0',
        });

        setIsLoading(false);
      };

      document.body.appendChild(metingScript);
    };

    document.body.appendChild(aplayerScript);

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [config]);

  if (!config?.playlistId) {
    return (
      <div className={styles.playerPlaceholder}>
        请在后台配置音乐歌单
      </div>
    );
  }

  return (
    <div className={styles.playerContainer}>
      {isLoading && <div className={styles.loading}>加载中...</div>}
      <div ref={containerRef} className={styles.player} />
    </div>
  );
}
```

**Step 2: 添加播放器样式**

在 `island.module.css` 末尾添加：

```css
.playerContainer {
  width: 100%;
  padding: 40px 16px 16px;
}

.player {
  width: 100%;
}

.playerPlaceholder {
  color: #A7D8F0;
  font-size: 14px;
  text-align: center;
  padding: 20px;
}

.loading {
  color: #A7D8F0;
  font-size: 13px;
  text-align: center;
  margin-bottom: 8px;
}

/* APlayer 样式覆盖 */
.player :global(.aplayer) {
  background: transparent;
  box-shadow: none;
}

.player :global(.aplayer .aplayer-body) {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
}

.player :global(.aplayer .aplayer-info) {
  padding: 8px 12px;
}

.player :global(.aplayer .aplayer-music) {
  margin: 0;
}

.player :global(.aplayer .aplayer-title) {
  color: #E8F4F8;
  font-size: 14px;
}

.player :global(.aplayer .aplayer-author) {
  color: #A7D8F0;
  font-size: 12px;
}
```

**Step 3: 集成到展开态组件**

Modify: `blog/src/components/layout/DynamicIsland/IslandExpanded.tsx`

```typescript
"use client";

import { NavigationItems } from './NavigationItems';
import { MusicPlayer } from './MusicPlayer';
import type { MusicConfig } from '@/types/music';
import styles from './island.module.css';

interface IslandExpandedProps {
  onCollapse: () => void;
  musicConfig?: MusicConfig | null;
}

export function IslandExpanded({ onCollapse, musicConfig }: IslandExpandedProps) {
  return (
    <div className={styles.expandedContent}>
      <button 
        onClick={onCollapse}
        className={styles.closeButton}
        aria-label="收起灵动岛"
      >
        ✕
      </button>
      
      <MusicPlayer config={musicConfig} />
      
      <div className={styles.expandedNav}>
        <NavigationItems />
      </div>
    </div>
  );
}
```

**Step 4: 更新主组件传递配置**

Modify: `blog/src/components/layout/DynamicIsland/DynamicIsland.tsx`

```typescript
"use client";

import { useState, useCallback, useEffect } from 'react';
import { IslandCollapsed } from './IslandCollapsed';
import { IslandExpanded } from './IslandExpanded';
import { getMusicConfig } from '@/lib/music';
import type { MusicConfig } from '@/types/music';
import styles from './island.module.css';

export function DynamicIsland() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [musicConfig, setMusicConfig] = useState<MusicConfig | null>(null);

  useEffect(() => {
    getMusicConfig().then(setMusicConfig);
  }, []);

  const toggleExpand = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  return (
    <header className={styles.islandContainer}>
      <div 
        className={`${styles.island} ${isExpanded ? styles.expanded : styles.collapsed}`}
        onClick={!isExpanded ? toggleExpand : undefined}
      >
        {isExpanded ? (
          <IslandExpanded 
            onCollapse={() => setIsExpanded(false)} 
            musicConfig={musicConfig}
          />
        ) : (
          <IslandCollapsed onExpand={toggleExpand} />
        )}
      </div>
    </header>
  );
}
```

**Step 5: 添加展开态导航样式**

在 `island.module.css` 末尾添加：

```css
.expandedNav {
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
}

.expandedNav .navItem {
  padding: 4px 10px;
  font-size: 12px;
}

.expandedNav .navIcon {
  width: 14px;
  height: 14px;
}

.expandedNav .navLabel {
  font-size: 12px;
}
```

**Step 6: 测试音乐播放器渲染**

```typescript
// blog/src/components/layout/DynamicIsland/MusicPlayer.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MusicPlayer } from './MusicPlayer';

describe('MusicPlayer', () => {
  it('should show placeholder when no config', () => {
    render(<MusicPlayer config={null} />);
    expect(screen.getByText('请在后台配置音乐歌单')).toBeInTheDocument();
  });

  it('should show placeholder when no playlist ID', () => {
    const config = {
      id: '1',
      platform: 'tencent' as const,
      playlistId: '',
      autoPlay: false,
      volume: 0.7,
      createdAt: '',
      updatedAt: '',
    };
    render(<MusicPlayer config={config} />);
    expect(screen.getByText('请在后台配置音乐歌单')).toBeInTheDocument();
  });
});
```

**Step 7: 运行测试**

```bash
npm run test:run src/components/layout/DynamicIsland/MusicPlayer.test.tsx
```

Expected: Test passes

**Step 8: Commit**

```bash
git add src/components/layout/DynamicIsland/
git commit -m "feat: 集成QQ音乐播放器"
```

---

## Task 6: 替换原Header组件

**Files:**
- Modify: `blog/src/app/layout.tsx`
- Delete: `blog/src/components/layout/Header.tsx`

**Step 1: 更新layout使用灵动岛**

Read: `blog/src/app/layout.tsx`

找到 Header 导入和使用位置，替换为：

```typescript
import { DynamicIsland } from '@/components/layout/DynamicIsland';

// 在 body 内替换
<DynamicIsland />
<main className="pt-20">{children}</main>
```

**Step 2: 删除旧Header组件**

```bash
rm src/components/layout/Header.tsx
```

**Step 3: 验证构建**

```bash
npm run build
```

Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/app/layout.tsx
git rm src/components/layout/Header.tsx
git commit -m "refactor: 替换Header为灵动岛组件"
```

---

## Task 7: 创建后台音乐配置界面

**Files:**
- Create: `admin/src/features/settings/MusicSettings.tsx`
- Modify: `admin/src/app/dashboard/settings/page.tsx`

**Step 1: 创建音乐配置表单**

Create: `admin/src/features/settings/MusicSettings.tsx`

```typescript
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase/client';

interface MusicConfig {
  id: string;
  platform: 'tencent' | 'netease' | 'kugou';
  playlistId: string;
  autoPlay: boolean;
  volume: number;
}

export function MusicSettings() {
  const [config, setConfig] = useState<MusicConfig>({
    id: '',
    platform: 'tencent',
    playlistId: '',
    autoPlay: false,
    volume: 0.7,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    const { data } = await supabase
      .from('music_config')
      .select('*')
      .single();
    
    if (data) {
      setConfig(data);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    const { error } = await supabase
      .from('music_config')
      .upsert({
        ...config,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      alert('保存失败');
    } else {
      alert('保存成功');
    }
  };

  if (loading) return <div>加载中...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>音乐播放器配置</CardTitle>
        <CardDescription>
          配置灵动岛音乐播放器。支持QQ音乐、网易云音乐、酷狗音乐。
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>音乐平台</Label>
          <select
            value={config.platform}
            onChange={(e) => setConfig({ ...config, platform: e.target.value as any })}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="tencent">QQ音乐</option>
            <option value="netease">网易云音乐</option>
            <option value="kugou">酷狗音乐</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label>歌单ID</Label>
          <Input
            value={config.playlistId}
            onChange={(e) => setConfig({ ...config, playlistId: e.target.value })}
            placeholder="例如：123456789"
          />
          <p className="text-sm text-muted-foreground">
            从歌单分享链接中提取ID，例如 https://y.qq.com/n/ryqq/playlist/<strong>123456789</strong>
          </p>
        </div>

        <div className="flex items-center justify-between">
          <Label>自动播放</Label>
          <Switch
            checked={config.autoPlay}
            onCheckedChange={(checked) => setConfig({ ...config, autoPlay: checked })}
          />
        </div>

        <div className="space-y-2">
          <Label>默认音量: {Math.round(config.volume * 100)}%</Label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={config.volume}
            onChange={(e) => setConfig({ ...config, volume: parseFloat(e.target.value) })}
            className="w-full"
          />
        </div>

        <Button onClick={handleSave} className="w-full">
          保存配置
        </Button>
      </CardContent>
    </Card>
  );
}
```

**Step 2: 集成到设置页面**

Modify: `admin/src/app/dashboard/settings/page.tsx`

添加 MusicSettings 组件到页面。

**Step 3: Commit**

```bash
git add admin/src/features/settings/MusicSettings.tsx admin/src/app/dashboard/settings/page.tsx
git commit -m "feat: 添加后台音乐配置界面"
```

---

## Task 8: 添加响应式优化和可访问性

**Files:**
- Modify: `blog/src/components/layout/DynamicIsland/island.module.css`
- Modify: `blog/src/components/layout/DynamicIsland/DynamicIsland.tsx`

**Step 1: 添加移动端触摸优化**

在 `island.module.css` 添加：

```css
/* 移动端触摸优化 */
.island {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

/* 移动端尺寸调整 */
@media (max-width: 640px) {
  .collapsed {
    width: 200px;
    height: 40px;
  }
  
  .expanded {
    width: calc(100vw - 32px);
    max-width: 300px;
    height: 160px;
  }
  
  .navLabel {
    display: none;
  }
  
  .navItem {
    padding: 6px;
  }
}
```

**Step 2: 添加可访问性属性**

Modify: `blog/src/components/layout/DynamicIsland/DynamicIsland.tsx`

```typescript
<header className={styles.islandContainer} role="banner">
  <div 
    className={`${styles.island} ${isExpanded ? styles.expanded : styles.collapsed}`}
    onClick={!isExpanded ? toggleExpand : undefined}
    role="button"
    tabIndex={0}
    aria-expanded={isExpanded}
    aria-label={isExpanded ? "收起灵动岛" : "展开灵动岛"}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleExpand();
      }
    }}
  >
    {/* ... */}
  </div>
</header>
```

**Step 3: 测试可访问性**

```typescript
// blog/src/components/layout/DynamicIsland/DynamicIsland.test.tsx
it('should support keyboard navigation', async () => {
  const { container } = render(<DynamicIsland />);
  const island = container.querySelector('[role="button"]');
  
  fireEvent.keyDown(island!, { key: 'Enter' });
  await waitFor(() => {
    expect(screen.getByLabelText('收起灵动岛')).toBeInTheDocument();
  });
});
```

**Step 4: Commit**

```bash
git add src/components/layout/DynamicIsland/
git commit -m "feat: 添加响应式优化和可访问性支持"
```

---

## Task 9: 最终测试和文档更新

**Files:**
- Create: `blog/src/components/layout/DynamicIsland/DynamicIsland.integration.test.tsx`
- Modify: `blog/CODEBUDDY.md`

**Step 1: 创建集成测试**

Create: `blog/src/components/layout/DynamicIsland/DynamicIsland.integration.test.tsx`

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DynamicIsland } from './DynamicIsland';

vi.mock('@/lib/music', () => ({
  getMusicConfig: vi.fn(() => Promise.resolve({
    id: '1',
    platform: 'tencent',
    playlistId: '123456',
    autoPlay: false,
    volume: 0.7,
    createdAt: '',
    updatedAt: '',
  })),
}));

describe('DynamicIsland Integration', () => {
  it('should expand and collapse', async () => {
    render(<DynamicIsland />);
    
    // 初始状态：收缩
    expect(screen.getByText('Home')).toBeInTheDocument();
    
    // 点击展开
    const island = screen.getByRole('button');
    fireEvent.click(island);
    
    await waitFor(() => {
      expect(screen.getByLabelText('收起灵动岛')).toBeInTheDocument();
    });
    
    // 点击收起
    const closeButton = screen.getByLabelText('收起灵动岛');
    fireEvent.click(closeButton);
    
    await waitFor(() => {
      expect(screen.getByText('Home')).toBeInTheDocument();
    });
  });

  it('should load music config', async () => {
    render(<DynamicIsland />);
    
    // 展开
    fireEvent.click(screen.getByRole('button'));
    
    // 等待音乐配置加载
    await waitFor(() => {
      expect(screen.getByText('加载中...')).toBeInTheDocument();
    }, { timeout: 100 });
  });
});
```

**Step 2: 运行所有测试**

```bash
npm run test:run
```

Expected: All tests pass

**Step 3: 更新CODEBUDDY.md**

在开发历史中添加新条目：

```markdown
## 2026-03-15 灵动岛导航栏实现

### 项目概述
将传统Header改造为灵动岛样式，集成QQ音乐播放器，采用紫罗兰永恒花园风格动画。

### 技术栈
- **音乐播放器**: APlayer + MetingJS
- **音乐平台**: QQ音乐
- **动画**: CSS Modules + Keyframes
- **配置存储**: Supabase

### 已实现功能

#### 前端组件
- DynamicIsland: 主容器组件，管理展开/收缩状态
- IslandCollapsed: 收缩态UI，显示导航项
- IslandExpanded: 展开态UI，显示音乐播放器
- MusicPlayer: APlayer封装，支持QQ音音乐歌单
- NavigationItems: 导航项组件

#### 后台管理
- 音乐配置表单（平台选择、歌单ID、自动播放、音量）
- Supabase数据库存储配置

#### 动画效果
- 呼吸动画（2s周期脉冲发光）
- 花瓣飘落效果
- 弹性展开动画
- 波形音乐指示器

### 文件清单
```
blog/src/components/layout/DynamicIsland/
├── DynamicIsland.tsx
├── IslandCollapsed.tsx
├── IslandExpanded.tsx
├── MusicPlayer.tsx
├── NavigationItems.tsx
├── island.module.css
└── index.ts

admin/src/features/settings/
└── MusicSettings.tsx
```

### 环境配置
需要配置 Supabase 连接：
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### 运行命令
```bash
cd blog
npm run dev    # 开发服务器
npm run test   # 运行测试
```
```

**Step 4: 最终Commit**

```bash
git add .
git commit -m "docs: 更新CODEBUDDY开发历史"
```

---

## 完成标志

- [ ] 所有测试通过
- [ ] 构建成功
- [ ] 代码已提交
- [ ] 文档已更新

---

**计划状态**: ✅ 完成  
**预计实施时间**: 2-3小时

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MusicPlayer } from './MusicPlayer';
import type { MusicConfig } from '@/types/music';

/**
 * 测试目标: 验证MusicPlayer组件的核心功能
 * 
 * 测试策略:
 * - 专注于组件逻辑和渲染输出
 * - 不模拟复杂的异步脚本加载（APlayer/Meting由第三方库保证）
 * - 测试用户可见的行为
 */

describe('MusicPlayer Component', () => {
  const mockConfig: MusicConfig = {
    id: 'test-id',
    platform: 'tencent',
    playlistId: '123456789',
    autoPlay: false,
    volume: 0.7,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  };

  beforeEach(() => {
    // Mock window.APlayer and window.Meting
    (window as any).APlayer = vi.fn();
    (window as any).Meting = vi.fn().mockImplementation(() => ({
      destroy: vi.fn(),
    }));
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
    
    // Clean up DOM
    document.querySelectorAll('script[src*="aplayer"], script[src*="meting"]').forEach(el => el.remove());
    document.querySelectorAll('link[href*="aplayer"]').forEach(el => el.remove());
  });

  describe('占位符显示（核心功能）', () => {
    it('should show placeholder when config is null', () => {
      render(<MusicPlayer config={null} />);
      expect(screen.getByText('请在后台配置音乐歌单')).toBeInTheDocument();
    });

    it('should show placeholder when playlistId is empty string', () => {
      const configWithEmptyPlaylist = { ...mockConfig, playlistId: '' };
      render(<MusicPlayer config={configWithEmptyPlaylist} />);
      expect(screen.getByText('请在后台配置音乐歌单')).toBeInTheDocument();
    });

    it('should show placeholder when playlistId is only whitespace', () => {
      const configWithWhitespace = { ...mockConfig, playlistId: '   ' };
      render(<MusicPlayer config={configWithWhitespace} />);
      expect(screen.getByText('请在后台配置音乐歌单')).toBeInTheDocument();
    });

    it('should show loading state when playlistId is valid', () => {
      render(<MusicPlayer config={mockConfig} />);
      expect(screen.getByText('加载中...')).toBeInTheDocument();
    });
  });

  describe('渲染结构', () => {
    it('should render player container when config is valid', () => {
      const { container } = render(<MusicPlayer config={mockConfig} />);
      
      const playerContainer = container.querySelector('[class*="playerContainer"]');
      expect(playerContainer).toBeTruthy();
    });

    it('should render player div for Meting attachment', () => {
      const { container } = render(<MusicPlayer config={mockConfig} />);
      
      const playerDiv = container.querySelector('[class*="player"]');
      expect(playerDiv).toBeTruthy();
    });

    it('should not render player container when config is null', () => {
      const { container } = render(<MusicPlayer config={null} />);
      
      const playerContainer = container.querySelector('[class*="playerContainer"]');
      expect(playerContainer).toBeFalsy();
    });
  });

  describe('动态脚本加载（基本验证）', () => {
    it('should attempt to load APlayer CSS', () => {
      render(<MusicPlayer config={mockConfig} />);
      
      // 给一点时间让脚本开始加载
      return new Promise(resolve => setTimeout(resolve, 100)).then(() => {
        const link = document.querySelector('link[href*="aplayer"]');
        expect(link).toBeTruthy();
      });
    });

    it('should not load scripts when config is null', () => {
      render(<MusicPlayer config={null} />);
      
      const scripts = document.querySelectorAll('script[src*="aplayer"], script[src*="meting"]');
      expect(scripts.length).toBe(0);
    });
  });

  describe('边界情况', () => {
    it('should handle minimum volume value', () => {
      const configWithMinVolume = { ...mockConfig, volume: 0 };
      const { container } = render(<MusicPlayer config={configWithMinVolume} />);
      
      // 组件应该正常渲染
      expect(container.firstChild).toBeTruthy();
    });

    it('should handle maximum volume value', () => {
      const configWithMaxVolume = { ...mockConfig, volume: 1 };
      const { container } = render(<MusicPlayer config={configWithMaxVolume} />);
      
      expect(container.firstChild).toBeTruthy();
    });

    it('should handle all supported platforms', () => {
      const platforms: Array<'tencent' | 'netease' | 'kugou'> = ['tencent', 'netease', 'kugou'];
      
      platforms.forEach(platform => {
        const configWithPlatform = { ...mockConfig, platform };
        const { container } = render(<MusicPlayer config={configWithPlatform} />);
        expect(container.firstChild).toBeTruthy();
      });
    });

    it('should handle autoPlay enabled', () => {
      const configWithAutoPlay = { ...mockConfig, autoPlay: true };
      const { container } = render(<MusicPlayer config={configWithAutoPlay} />);
      
      expect(container.firstChild).toBeTruthy();
    });
  });
});

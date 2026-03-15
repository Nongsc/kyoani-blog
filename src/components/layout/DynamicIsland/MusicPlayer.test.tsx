import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { MusicPlayer } from './MusicPlayer';
import type { MusicConfig } from '@/types/music';

/**
 * 测试目标: 验证MusicPlayer组件的核心功能
 * 
 * 测试策略:
 * - 专注于组件逻辑和渲染输出
 * - 使用真实的API响应模拟（mock fetch）
 * - 测试用户可见的行为
 */

// Mock fetch for Meting API
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock APlayer
class MockAPlayer {
  static instances: MockAPlayer[] = [];
  options: any;
  destroyed = false;
  audio = { paused: true };
  list = { index: 0 };
  private eventListeners: Map<string, Function[]> = new Map();

  constructor(options: any) {
    this.options = options;
    MockAPlayer.instances.push(this);
  }

  on(event: string, callback: Function) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)?.push(callback);
  }

  toggle() {
    this.audio.paused = !this.audio.paused;
  }

  skipBack() {
    this.list.index = Math.max(0, this.list.index - 1);
  }

  skipForward() {
    this.list.index = this.list.index + 1;
  }

  destroy() {
    this.destroyed = true;
  }
}

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

  const mockSongs = [
    {
      name: 'Test Song 1',
      artist: 'Artist 1',
      url: 'https://example.com/song1.mp3',
      pic: 'https://example.com/pic1.jpg',
      lrc: '',
    },
    {
      name: 'Test Song 2',
      artist: 'Artist 2',
      url: 'https://example.com/song2.mp3',
      pic: 'https://example.com/pic2.jpg',
      lrc: '',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    MockAPlayer.instances = [];
    
    // Mock window.APlayer
    (window as any).APlayer = MockAPlayer;
    
    // Mock successful fetch
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockSongs),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    
    // Clean up DOM
    document.querySelectorAll('script[src*="aplayer"]').forEach(el => el.remove());
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

    it('should render player div for APlayer attachment', () => {
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

  describe('API调用与播放器初始化', () => {
    it('should fetch songs from correct API URL', async () => {
      render(<MusicPlayer config={mockConfig} />);
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('api.injahow.cn/meting')
        );
      });
    });

    it('should fetch songs with correct platform and playlistId', async () => {
      render(<MusicPlayer config={mockConfig} />);
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('server=tencent')
        );
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('id=123456789')
        );
      });
    });

    it('should initialize APlayer with fetched songs', async () => {
      render(<MusicPlayer config={mockConfig} />);
      
      await waitFor(() => {
        expect(MockAPlayer.instances.length).toBeGreaterThan(0);
      });
      
      const playerInstance = MockAPlayer.instances[0];
      expect(playerInstance.options.audio).toHaveLength(2);
      expect(playerInstance.options.audio[0].name).toBe('Test Song 1');
    });

    it('should pass correct options to APlayer', async () => {
      render(<MusicPlayer config={mockConfig} />);
      
      await waitFor(() => {
        expect(MockAPlayer.instances.length).toBeGreaterThan(0);
      });
      
      const playerInstance = MockAPlayer.instances[0];
      // showLyrics 默认为 true，所以 mini 为 false
      expect(playerInstance.options.mini).toBe(false);
      expect(playerInstance.options.autoplay).toBe(false);
      expect(playerInstance.options.volume).toBe(0.7);
      expect(playerInstance.options.theme).toBe('#89CFF0');
      expect(playerInstance.options.lrcType).toBe(3);
    });
  });

  describe('错误处理', () => {
    it('should show error message when API fails', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));
      
      render(<MusicPlayer config={mockConfig} />);
      
      await waitFor(() => {
        expect(screen.getByText('音乐加载失败，请检查歌单配置')).toBeInTheDocument();
      });
    });

    it('should show error message when API returns error', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
      });
      
      render(<MusicPlayer config={mockConfig} />);
      
      await waitFor(() => {
        expect(screen.getByText('音乐加载失败，请检查歌单配置')).toBeInTheDocument();
      });
    });

    it('should show error when playlist is empty', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([]),
      });
      
      render(<MusicPlayer config={mockConfig} />);
      
      await waitFor(() => {
        expect(screen.getByText('音乐加载失败，请检查歌单配置')).toBeInTheDocument();
      });
    });
  });

  describe('边界情况', () => {
    it('should handle minimum volume value', async () => {
      const configWithMinVolume = { ...mockConfig, volume: 0 };
      render(<MusicPlayer config={configWithMinVolume} />);
      
      await waitFor(() => {
        expect(MockAPlayer.instances.length).toBeGreaterThan(0);
      });
      
      expect(MockAPlayer.instances[0].options.volume).toBe(0);
    });

    it('should handle maximum volume value', async () => {
      const configWithMaxVolume = { ...mockConfig, volume: 1 };
      render(<MusicPlayer config={configWithMaxVolume} />);
      
      await waitFor(() => {
        expect(MockAPlayer.instances.length).toBeGreaterThan(0);
      });
      
      expect(MockAPlayer.instances[0].options.volume).toBe(1);
    });

    it('should handle autoPlay enabled', async () => {
      const configWithAutoPlay = { ...mockConfig, autoPlay: true };
      render(<MusicPlayer config={configWithAutoPlay} />);
      
      await waitFor(() => {
        expect(MockAPlayer.instances.length).toBeGreaterThan(0);
      });
      
      expect(MockAPlayer.instances[0].options.autoplay).toBe(true);
    });

    it('should handle different platforms', async () => {
      const platforms: Array<'tencent' | 'netease' | 'kugou'> = ['tencent', 'netease', 'kugou'];
      
      for (const platform of platforms) {
        MockAPlayer.instances = [];
        const configWithPlatform = { ...mockConfig, platform };
        render(<MusicPlayer config={configWithPlatform} />);
        
        await waitFor(() => {
          expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining(`server=${platform}`)
          );
        });
      }
    });
  });

  describe('清理', () => {
    it('should destroy player on unmount', async () => {
      const { unmount } = render(<MusicPlayer config={mockConfig} />);
      
      await waitFor(() => {
        expect(MockAPlayer.instances.length).toBeGreaterThan(0);
      });
      
      const playerInstance = MockAPlayer.instances[0];
      expect(playerInstance.destroyed).toBe(false);
      
      unmount();
      
      expect(playerInstance.destroyed).toBe(true);
    });
  });
});

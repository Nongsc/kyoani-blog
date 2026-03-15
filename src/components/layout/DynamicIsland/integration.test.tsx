import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DynamicIsland } from './DynamicIsland';
import * as musicApi from '@/lib/music';
import type { MusicConfig } from '@/types/music';

/**
 * 集成测试：DynamicIsland与MusicPlayer的完整交互
 */

vi.mock('@/lib/music', () => ({
  getMusicConfig: vi.fn(),
}));

describe('DynamicIsland Integration Tests', () => {
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
    vi.clearAllMocks();
    vi.mocked(musicApi.getMusicConfig).mockResolvedValue(mockConfig);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('核心用户流程', () => {
    it('should load and display navigation', async () => {
      render(<DynamicIsland />);

      await waitFor(() => {
        expect(screen.getByText('Home')).toBeInTheDocument();
        expect(screen.getByText('About')).toBeInTheDocument();
      });
    });

    it('should have aria-expanded attribute on island', async () => {
      const { container } = render(<DynamicIsland />);

      await waitFor(() => {
        const island = container.querySelector('[class*="island"]');
        expect(island).toHaveAttribute('aria-expanded', 'false');
      });
    });

    it('should show placeholder when no playlist configured', async () => {
      vi.mocked(musicApi.getMusicConfig).mockResolvedValue({
        ...mockConfig,
        playlistId: '',
      });

      const { container } = render(<DynamicIsland />);

      // 等待初始渲染
      await waitFor(() => {
        expect(screen.getByText('Home')).toBeInTheDocument();
      });

      // 点击collapsed content展开
      const collapsedContent = container.querySelector('[class*="collapsedContent"]');
      if (collapsedContent) {
        fireEvent.click(collapsedContent);
      }

      // 等待展开后显示占位符
      await waitFor(() => {
        expect(screen.getByText('请在后台配置音乐歌单')).toBeInTheDocument();
      }, { timeout: 5000 });
    });
  });

  describe('可访问性', () => {
    it('should have correct ARIA attributes', async () => {
      render(<DynamicIsland />);

      await waitFor(() => {
        const banner = screen.getByRole('banner');
        expect(banner).toBeInTheDocument();
      });
    });

    it('should have aria-expanded attribute', async () => {
      const { container } = render(<DynamicIsland />);

      await waitFor(() => {
        const button = container.querySelector('[aria-expanded]');
        expect(button).toHaveAttribute('aria-expanded', 'false');
      });
    });
  });

  describe('错误处理', () => {
    it('should handle null config gracefully', async () => {
      vi.mocked(musicApi.getMusicConfig).mockResolvedValue(null);

      render(<DynamicIsland />);

      await waitFor(() => {
        // 应该仍然渲染导航
        expect(screen.getByText('Home')).toBeInTheDocument();
      });
    });
  });

  describe('配置加载', () => {
    it('should call getMusicConfig on mount', async () => {
      render(<DynamicIsland />);

      await waitFor(() => {
        expect(musicApi.getMusicConfig).toHaveBeenCalled();
      });
    });
  });
});

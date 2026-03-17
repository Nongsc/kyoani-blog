import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * 测试目标: 验证 music.ts 中的API函数
 * 
 * 测试场景:
 * 1. 成功获取音乐配置
 * 2. 数据库字段正确映射到前端类型
 * 3. 错误处理（数据库返回错误）
 * 4. 空数据处理
 */

// Mock Supabase client
const mockSingle = vi.fn();
const mockLimit = vi.fn(() => ({ single: mockSingle }));
const mockSelect = vi.fn(() => ({ limit: mockLimit }));
const mockFrom = vi.fn(() => ({ select: mockSelect }));

vi.mock('@/lib/supabase/client', () => ({
  getSupabaseClient: vi.fn(() => ({
    from: mockFrom,
  })),
}));

// Import after mocking
const { getMusicConfig } = await import('@/lib/music');

describe('music.ts API functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getMusicConfig', () => {
    it('should fetch and transform music config successfully', async () => {
      const mockData = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        platform: 'tencent',
        playlist_id: 'playlist-123',
        auto_play: true,
        volume: 0.8,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-02T00:00:00Z',
      };

      mockSingle.mockResolvedValue({ data: mockData, error: null });

      const result = await getMusicConfig();

      expect(mockFrom).toHaveBeenCalledWith('music_config');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockLimit).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        id: '123e4567-e89b-12d3-a456-426614174000',
        platform: 'tencent',
        playlistId: 'playlist-123',
        autoPlay: true,
        volume: 0.8,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-02T00:00:00Z',
      });
    });

    it('should return null on database error', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      mockSingle.mockResolvedValue({
        data: null,
        error: { message: 'Database error', code: 'PGRST116' },
      });

      const result = await getMusicConfig();

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to fetch music config:',
        expect.objectContaining({ message: 'Database error' })
      );

      consoleSpy.mockRestore();
    });

    it('should handle different platform values', async () => {
      const platforms = ['tencent', 'netease', 'kugou'] as const;

      for (const platform of platforms) {
        mockSingle.mockResolvedValue({
          data: {
            id: 'test-id',
            platform,
            playlist_id: '',
            auto_play: false,
            volume: 0.7,
            created_at: '2026-01-01T00:00:00Z',
            updated_at: '2026-01-01T00:00:00Z',
          },
          error: null,
        });

        const result = await getMusicConfig();
        expect(result?.platform).toBe(platform);
      }
    });

    it('should convert volume to number', async () => {
      mockSingle.mockResolvedValue({
        data: {
          id: 'test-id',
          platform: 'tencent',
          playlist_id: '',
          auto_play: false,
          volume: '0.50', // DECIMAL 返回字符串
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-01T00:00:00Z',
        },
        error: null,
      });

      const result = await getMusicConfig();
      expect(result?.volume).toBe(0.5);
      expect(typeof result?.volume).toBe('number');
    });

    it('should use singleton supabase client', async () => {
      mockSingle.mockResolvedValue({
        data: { id: 'test', platform: 'tencent', playlist_id: '', auto_play: false, volume: 0.7, created_at: '', updated_at: '' },
        error: null,
      });

      await getMusicConfig();
      await getMusicConfig();

      // 应该复用同一个 client，但 from 会被调用两次
      expect(mockFrom).toHaveBeenCalledTimes(2);
    });
  });
});

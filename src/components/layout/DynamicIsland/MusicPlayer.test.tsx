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

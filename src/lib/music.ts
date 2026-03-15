import { getSupabaseClient } from '@/lib/supabase/client';
import type { MusicConfig } from '@/types/music';

/**
 * 获取音乐配置
 * @returns 音乐配置或null（如果出错）
 */
export async function getMusicConfig(): Promise<MusicConfig | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('music_config')
    .select('*')
    .limit(1)
    .single();

  if (error) {
    console.error('Failed to fetch music config:', error);
    return null;
  }

  // 将数据库字段映射到前端类型
  return {
    id: data.id,
    platform: data.platform,
    playlistId: data.playlist_id,
    autoPlay: data.auto_play,
    volume: Number(data.volume),
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

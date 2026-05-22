/**
 * Video utility functions for ProofStudio
 */

export function getEmbedUrl(videoUrl: string): { type: 'youtube' | 'loom' | 'direct' | 'unknown', embedUrl: string } {
  if (!videoUrl) return { type: 'unknown', embedUrl: '' };

  // YouTube — handle all formats
  // youtube.com/watch?v=ID
  // youtu.be/ID
  // youtube.com/embed/ID
  // youtube.com/shorts/ID
  const ytMatch = videoUrl.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (ytMatch) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0`
    };
  }

  // Loom — handle share and embed formats
  // loom.com/share/ID
  // loom.com/embed/ID
  const loomMatch = videoUrl.match(/loom\.com\/(?:share|embed)\/([a-zA-Z0-9]+)/);
  if (loomMatch) {
    return {
      type: 'loom',
      embedUrl: `https://www.loom.com/embed/${loomMatch[1]}?autoplay=1`
    };
  }

  // Direct mp4 or other direct video file
  if (videoUrl.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i)) {
    return { type: 'direct', embedUrl: videoUrl };
  }

  // Unknown — just return original url
  return { type: 'unknown', embedUrl: videoUrl };
}

export function getVideoThumbnail(videoUrl: string): string | null {
  if (!videoUrl) return null;

  // YouTube
  const ytMatch = videoUrl.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (ytMatch) {
    // hqdefault is 480x360 and always exists for valid YouTube videos
    return `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
  }

  // Loom
  const loomMatch = videoUrl.match(/loom\.com\/(?:share|embed)\/([a-zA-Z0-9]+)/);
  if (loomMatch) {
    return `https://cdn.loom.com/sessions/thumbnails/${loomMatch[1]}-with-play.gif`;
  }

  // Direct video file — no thumbnail available
  return null;
}

/**
 * Extracts the domain name from a URL for direct/unknown video fallback cards.
 */
export function getDomainName(videoUrl: string): string {
  if (!videoUrl) return '';
  try {
    const parsed = new URL(videoUrl.trim());
    return parsed.hostname.replace('www.', '');
  } catch {
    return 'External Video';
  }
}

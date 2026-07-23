// api/download.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { url, format } = req.body; // format: 'video' atau 'audio'

  if (!url) {
    return res.status(400).json({ success: false, message: 'URL tidak boleh kosong!' });
  }

  try {
    // 1. Logika untuk TikTok
    if (url.includes('tiktok.com')) {
      const response = await fetch('https://api.tikwm.com/api/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ url, hd: '1' })
      });
      const data = await response.json();

      if (data.code === 0) {
        return res.status(200).json({
          success: true,
          platform: 'TikTok',
          title: data.data.title,
          cover: data.data.cover,
          author: data.data.author.nickname,
          downloadUrl: format === 'audio' ? data.data.music : data.data.play,
          format: format === 'audio' ? 'MP3' : 'MP4'
        });
      }
    } 
    
    // 2. Logika Universal (YouTube, Instagram, Facebook via Public API Engine)
    // Menggunakan Endpoint Public Cobalt/Y2Mate Engine
    const genericResponse = await fetch('https://co.wuk.sh/api/json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        url: url,
        isAudioOnly: format === 'audio',
        aFormat: 'mp3',
        vQuality: '720'
      })
    });
    
    const genericData = await genericResponse.json();

    if (genericData.url) {
      return res.status(200).json({
        success: true,
        platform: 'Social Media',
        title: 'Media Siap Diunduh',
        cover: 'https://placehold.co/600x400/0f172a/06b6d4?text=Media+Ready',
        author: 'User',
        downloadUrl: genericData.url,
        format: format === 'audio' ? 'MP3' : 'MP4'
      });
    }

    return res.status(400).json({ 
      success: false, 
      message: 'Gagal memproses URL. Pastikan link publik dan valid!' 
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server Proxy.' });
  }
}
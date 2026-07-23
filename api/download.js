// api/download.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ success: false, message: 'URL tidak boleh kosong!' });
  }

  try {
    // 1. Logika untuk TikTok
    if (url.includes('tiktok.com')) {
      const response = await fetch('https://www.tikwm.com/api/', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*'
        },
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
          videoUrl: data.data.hdplay || data.data.play,
          audioUrl: data.data.music
        });
      } else {
         return res.status(400).json({ success: false, message: 'Gagal mendapatkan data dari TikTok. Pastikan URL valid.' });
      }
    } 
    
    // 2. Logika Universal (YouTube, Instagram, dll)
    // Coba gunakan Cobalt API terbaru atau fallback
    const fetchCobalt = async (isAudio) => {
      try {
        const res = await fetch('https://api.cobalt.tools/api/json', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            url: url,
            isAudioOnly: isAudio,
            aFormat: 'mp3',
            vQuality: '720'
          })
        });
        const data = await res.json();
        return data.url || null;
      } catch (err) {
        return null;
      }
    };
    
    const [videoUrl, audioUrl] = await Promise.all([
      fetchCobalt(false),
      fetchCobalt(true)
    ]);

    if (videoUrl || audioUrl) {
      return res.status(200).json({
        success: true,
        platform: 'Social Media',
        title: 'Media Siap Diunduh',
        cover: 'https://placehold.co/600x400/0f172a/06b6d4?text=Preview+Tersedia',
        author: 'User',
        videoUrl: videoUrl,
        audioUrl: audioUrl
      });
    }

    return res.status(400).json({ 
      success: false, 
      message: 'Gagal memproses URL. API tidak merespons atau link tidak valid.' 
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server: ' + error.message });
  }
}
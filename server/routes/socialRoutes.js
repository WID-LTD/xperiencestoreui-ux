const express = require('express');
const router = express.Router();
const YouTubeService = require('../services/youtubeService');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

/**
 * @route   GET /api/social/youtube/search
 * @desc    Search YouTube videos
 * @access  Private (Dropshipper/Supplier)
 */
router.get('/youtube/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.status(400).json({ message: 'Search query required' });
        
        const videos = await YouTubeService.searchVideos(q);
        res.json(videos);
    } catch (error) {
        res.status(500).json({ message: 'YouTube search failed' });
    }
});

/**
 * @route   POST /api/social/youtube/download
 * @desc    Get download link for YouTube video
 * @access  Private (Dropshipper/Supplier)
 */
router.post('/youtube/download', async (req, res) => {
    try {
        const { videoId } = req.body;
        if (!videoId) return res.status(400).json({ message: 'Video ID required' });

        const downloadLink = await YouTubeService.getDownloadLink(videoId);
        res.json({ downloadLink, message: 'Download feature is currently in preview. Direct MP4 downloads require local server setup with yt-dlp.' });
    } catch (error) {
        res.status(500).json({ message: 'Download init failed' });
    }
});

module.exports = router;

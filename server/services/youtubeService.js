const axios = require('axios');

/**
 * YouTube Service - Handles YouTube API interactions
 */
const YouTubeService = {
    /**
     * Search for videos on YouTube
     * @param {string} query 
     * @returns {Promise<Array>}
     */
    async searchVideos(query) {
        try {
            const apiKey = process.env.YOUTUBE_API_KEY;
            if (!apiKey || apiKey === 'your_youtube_api_key') {
                console.warn('YouTube API Key not configured. Using mockup data.');
                return this.getMockSearch();
            }

            const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
                params: {
                    part: 'snippet',
                    q: query,
                    maxResults: 10,
                    type: 'video',
                    key: apiKey
                }
            });

            return response.data.items.map(item => ({
                id: item.id.videoId,
                title: item.snippet.title,
                description: item.snippet.description,
                thumbnail: item.snippet.thumbnails.high.url,
                channelTitle: item.snippet.channelTitle,
                publishedAt: item.snippet.publishedAt
            }));
        } catch (error) {
            console.error('YouTube Search error:', error.response?.data || error.message);
            return this.getMockSearch();
        }
    },

    /**
     * Get download link for a YouTube video
     * @param {string} videoId 
     * @returns {Promise<string>}
     */
    async getDownloadLink(videoId) {
        // Since we don't have local yt-dlp/ffmpeg, we use a placeholder or a third-party API
        // For production, a dedicated service should be used.
        // This is a placeholder that simulates the beginning of a download
        return `https://www.youtube.com/watch?v=${videoId}`; 
    },

    getMockSearch() {
        return [
            {
                id: 'dQw4w9WgXcQ',
                title: 'Never Gonna Give You Up',
                description: 'The official music video for "Never Gonna Give You Up" by Rick Astley.',
                thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
                channelTitle: 'Rick Astley',
                publishedAt: '2009-10-25T06:57:33Z'
            }
        ];
    }
};

module.exports = YouTubeService;

/**
 * RedCircle Integration Service
 *
 * Handles the integration with RedCircle for podcast hosting and distribution.
 * RedCircle provides automatic distribution to Spotify, Apple Podcasts, YouTube
 * and other platforms via its hosting infrastructure.
 *
 * Configuration via environment variables:
 *   REDCIRCLE_API_KEY   – API key from RedCircle dashboard
 *   REDCIRCLE_SHOW_ID   – The show ID on RedCircle
 */

const config = require('../config');

const REDCIRCLE_BASE_URL = 'https://api.redcircle.com/v1';

/**
 * Get the current RedCircle configuration status
 */
function getStatus() {
  return {
    configured: !!(config.redcircleApiKey && config.redcircleShowId),
    showId: config.redcircleShowId || null,
  };
}

/**
 * Publish an episode to RedCircle for distribution.
 * RedCircle automatically distributes to connected platforms (Spotify, YouTube, etc.)
 *
 * @param {object} episode - Episode data
 * @param {string} episode.title
 * @param {string} episode.description
 * @param {string} episode.audioUrl - Public URL to the audio file
 * @param {string} [episode.artworkUrl] - Public URL to the artwork
 * @param {number} [episode.durationSeconds]
 * @returns {object} Distribution result with platform links
 */
async function publishEpisode(episode) {
  const status = getStatus();
  if (!status.configured) {
    return {
      success: false,
      error: 'RedCircle nicht konfiguriert. REDCIRCLE_API_KEY und REDCIRCLE_SHOW_ID erforderlich.',
      platforms: {},
    };
  }

  try {
    const response = await fetch(`${REDCIRCLE_BASE_URL}/shows/${config.redcircleShowId}/episodes`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.redcircleApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: episode.title,
        description: episode.description || '',
        audio_url: episode.audioUrl,
        artwork_url: episode.artworkUrl || null,
        duration: episode.durationSeconds || null,
        status: 'published',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: `RedCircle API Fehler: ${response.status} – ${errorText}`,
        platforms: {},
      };
    }

    const data = await response.json();

    return {
      success: true,
      redcircleEpisodeId: data.id || null,
      platforms: {
        spotify: data.spotify_url || null,
        apple: data.apple_url || null,
        youtube: data.youtube_url || null,
        redcircle: data.url || null,
      },
    };
  } catch (err) {
    return {
      success: false,
      error: `RedCircle Verbindungsfehler: ${err.message}`,
      platforms: {},
    };
  }
}

/**
 * Fetch listener analytics from RedCircle for a specific episode.
 *
 * @param {string} redcircleEpisodeId
 * @returns {object} Analytics data (downloads, plays, listeners)
 */
async function getEpisodeAnalytics(redcircleEpisodeId) {
  const status = getStatus();
  if (!status.configured || !redcircleEpisodeId) {
    return { downloads: 0, plays: 0, uniqueListeners: 0, platforms: {} };
  }

  try {
    const response = await fetch(
      `${REDCIRCLE_BASE_URL}/shows/${config.redcircleShowId}/episodes/${redcircleEpisodeId}/analytics`,
      {
        headers: { 'Authorization': `Bearer ${config.redcircleApiKey}` },
      }
    );

    if (!response.ok) return { downloads: 0, plays: 0, uniqueListeners: 0, platforms: {} };

    const data = await response.json();
    return {
      downloads: data.total_downloads || 0,
      plays: data.total_plays || 0,
      uniqueListeners: data.unique_listeners || 0,
      platforms: data.platform_breakdown || {},
    };
  } catch {
    return { downloads: 0, plays: 0, uniqueListeners: 0, platforms: {} };
  }
}

/**
 * Fetch show-level analytics from RedCircle.
 *
 * @returns {object} Overall show analytics
 */
async function getShowAnalytics() {
  const status = getStatus();
  if (!status.configured) {
    return { totalDownloads: 0, totalPlays: 0, totalListeners: 0, platformBreakdown: {} };
  }

  try {
    const response = await fetch(
      `${REDCIRCLE_BASE_URL}/shows/${config.redcircleShowId}/analytics`,
      {
        headers: { 'Authorization': `Bearer ${config.redcircleApiKey}` },
      }
    );

    if (!response.ok) {
      return { totalDownloads: 0, totalPlays: 0, totalListeners: 0, platformBreakdown: {} };
    }

    const data = await response.json();
    return {
      totalDownloads: data.total_downloads || 0,
      totalPlays: data.total_plays || 0,
      totalListeners: data.unique_listeners || 0,
      platformBreakdown: data.platform_breakdown || {},
    };
  } catch {
    return { totalDownloads: 0, totalPlays: 0, totalListeners: 0, platformBreakdown: {} };
  }
}

/**
 * Get the distribution status for all connected platforms.
 *
 * @returns {object} Platform distribution status
 */
async function getDistributionStatus() {
  const status = getStatus();
  if (!status.configured) {
    return {
      configured: false,
      platforms: {
        spotify: { connected: false, status: 'nicht konfiguriert' },
        youtube: { connected: false, status: 'nicht konfiguriert' },
        schulradio: { connected: false, status: 'nicht konfiguriert' },
      },
    };
  }

  try {
    const response = await fetch(
      `${REDCIRCLE_BASE_URL}/shows/${config.redcircleShowId}/distribution`,
      {
        headers: { 'Authorization': `Bearer ${config.redcircleApiKey}` },
      }
    );

    if (!response.ok) {
      return { configured: true, platforms: {} };
    }

    const data = await response.json();
    return {
      configured: true,
      platforms: {
        spotify: {
          connected: !!data.spotify,
          status: data.spotify ? 'verbunden' : 'nicht verbunden',
          url: data.spotify?.url || null,
        },
        youtube: {
          connected: !!data.youtube,
          status: data.youtube ? 'verbunden' : 'nicht verbunden',
          url: data.youtube?.url || null,
        },
        schulradio: {
          connected: !!data.custom_rss,
          status: data.custom_rss ? 'verbunden' : 'nicht verbunden',
          feedUrl: data.custom_rss?.url || null,
        },
      },
    };
  } catch {
    return { configured: true, platforms: {} };
  }
}

module.exports = {
  getStatus,
  publishEpisode,
  getEpisodeAnalytics,
  getShowAnalytics,
  getDistributionStatus,
};

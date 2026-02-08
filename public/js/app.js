function formatDuration(seconds) {
  if (!seconds) return '';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function renderPodcastCard(ep) {
  const thumb = ep.artworkUrl || 'https://bbs2-wob.de/wp-content/uploads/2023/08/BBS-II_Podcast_Logo_2023.png';
  const duration = formatDuration(ep.durationSeconds);
  const date = ep.publishDate ? new Date(ep.publishDate).toLocaleDateString('de-DE') : '';
  return `
    <div class="podcast-card" data-id="${ep.id}">
      <img class="thumb" src="${thumb}" alt="">
      <div class="info">
        <h3 class="title">${escapeHtml(ep.title)}</h3>
        <p class="desc">${escapeHtml(ep.description || '').slice(0, 120)}${(ep.description || '').length > 120 ? '...' : ''}</p>
        <div class="meta">${duration} ${date ? '| ' + date : ''}</div>
        <div class="platforms" style="margin-top:0.5rem;font-size:0.75rem;">
          <span>Spotify</span> <span>Apple</span> <span>YouTube</span>
        </div>
      </div>
      ${ep.audioUrl ? `<button class="play-btn" data-audio="${escapeHtml(ep.audioUrl)}" onclick="playEpisode(this)" title="Abspielen">▶</button>` : ''}
    </div>
  `;
}

function escapeHtml(s) {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

let currentAudio = null;
function playEpisode(btn) {
  const url = btn.dataset.audio;
  if (!url) return;
  if (currentAudio) {
    currentAudio.pause();
    if (currentAudio.src === url) { currentAudio = null; return; }
  }
  currentAudio = new Audio(url);
  currentAudio.play();
}

function renderPodcastsList(episodes, container, viewMode = 'list') {
  container.className = viewMode === 'grid' ? 'podcasts-grid' : 'podcasts-list';
  container.innerHTML = (episodes || []).map(renderPodcastCard).join('') || '<p>Keine Podcasts gefunden.</p>';
}

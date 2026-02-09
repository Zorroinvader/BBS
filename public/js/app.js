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

  const platformLinks = [];
  if (ep.spotifyUrl) platformLinks.push(`<a href="${escapeHtml(ep.spotifyUrl)}" target="_blank" rel="noopener noreferrer">Spotify</a>`);
  if (ep.appleUrl) platformLinks.push(`<a href="${escapeHtml(ep.appleUrl)}" target="_blank" rel="noopener noreferrer">Apple&nbsp;Podcasts</a>`);
  if (ep.youtubeUrl) platformLinks.push(`<a href="${escapeHtml(ep.youtubeUrl)}" target="_blank" rel="noopener noreferrer">YouTube</a>`);

  const hasSeries = !!(ep.series && ep.series.trim());
  const hasCategory = !!(ep.category && ep.category.trim());
  const hasClassInfo = !!(ep.classInfo && ep.classInfo.trim());

  return `
    <article class="podcast-card" data-id="${ep.id}">
      <div class="thumb-wrap">
        <img class="thumb" src="${thumb}" alt="">
        ${duration ? `<span class="chip chip-duration">${duration}</span>` : ''}
        ${ep.audioUrl ? `<button class="play-btn" data-audio="${escapeHtml(ep.audioUrl)}" onclick="playEpisode(this)" title="Abspielen">▶</button>` : ''}
      </div>
      <div class="info">
        <header class="info-header">
          <h3 class="title">${escapeHtml(ep.title)}</h3>
          <div class="meta-row">
            ${date ? `<span class="meta-item">${date}</span>` : ''}
            ${hasSeries ? `<span class="meta-item">${escapeHtml(ep.series)}</span>` : ''}
            ${hasClassInfo ? `<span class="meta-item">${escapeHtml(ep.classInfo)}</span>` : ''}
          </div>
        </header>
        ${hasCategory ? `<div class="tags-row"><span class="tag tag-series">${escapeHtml(ep.category)}</span></div>` : ''}
        <p class="desc">
          ${escapeHtml(ep.description || '').slice(0, 160)}${(ep.description || '').length > 160 ? '…' : ''}
        </p>
        ${platformLinks.length ? `<div class="platforms">Auf: ${platformLinks.join(' · ')}</div>` : ''}
      </div>
    </article>
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

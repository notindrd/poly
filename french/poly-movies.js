/* ═══════════════════════════
   SOURCES
═══════════════════════════ */
const MOVIE_TV_SOURCES = [
  { id:'vidlink',    name:'VidLink',      movie:'https://vidlink.pro/movie/{id}',                             tv:'https://vidlink.pro/tv/{id}/{season}/{episode}' },
  { id:'videasy',    name:'VidEasy 4K',   movie:'https://player.videasy.net/movie/{id}',                      tv:'https://player.videasy.net/tv/{id}/{season}/{episode}' },
  { id:'vidfast',    name:'VidFast 4K',   movie:'https://vidfast.pro/movie/{id}',                             tv:'https://vidfast.pro/tv/{id}/{season}/{episode}' },
  { id:'vidsrccc',   name:'VidSrc CC',    movie:'https://vidsrc.cc/v2/embed/movie/{id}',                      tv:'https://vidsrc.cc/v2/embed/tv/{id}/{season}/{episode}' },
  { id:'embedsu',    name:'EmbedSU',      movie:'https://embed.su/embed/movie/{id}',                          tv:'https://embed.su/embed/tv/{id}/{season}/{episode}' },
  { id:'multiembed', name:'MultiEmbed',   movie:'https://multiembed.mov/?video_id={id}&tmdb=1',               tv:'https://multiembed.mov/?video_id={id}&tmdb=1&s={season}&e={episode}' },
  { id:'pstream',    name:'P-Stream',     movie:'https://iframe.pstream.mov/media/tmdb-movie-{id}',           tv:'https://iframe.pstream.mov/media/tmdb-tv-{id}/{season}/{episode}' },
  { id:'moviesapi',  name:'MoviesAPI',    movie:'https://moviesapi.club/movie/{id}',                          tv:'https://moviesapi.club/tv/{id}-{season}-{episode}' },
  { id:'hexa',       name:'Hexa',         movie:'https://hexa.watch/watch/movie/{id}',                        tv:'https://hexa.watch/watch/tv/{id}/{season}/{episode}' },
  { id:'vidsrcXyz',  name:'VidSrc XYZ',   movie:'https://vidsrc.xyz/embed/movie/{id}',                        tv:'https://vidsrc.xyz/embed/tv/{id}/{season}/{episode}' },
  { id:'vidsrcrip',  name:'VidSrc RIP',   movie:'https://vidsrc.rip/embed/movie/{id}',                        tv:'https://vidsrc.rip/embed/tv/{id}/{season}/{episode}' },
  { id:'2embed',     name:'2Embed',       movie:'https://www.2embed.cc/embed/{id}',                           tv:'https://www.2embed.cc/embedtv/{id}&s={season}&e={episode}' },
  { id:'vidking',    name:'VidKing',      movie:'https://www.vidking.net/embed/movie/{id}',                   tv:'https://www.vidking.net/embed/tv/{id}/{season}/{episode}' },
  { id:'autoembed',  name:'AutoEmbed',    movie:'https://player.autoembed.cc/embed/movie/{id}',               tv:'https://player.autoembed.cc/embed/tv/{id}/{season}/{episode}' },
  { id:'smashystream',name:'SmashyStream',movie:'https://player.smashy.stream/movie/{id}',                    tv:'https://player.smashy.stream/tv/{id}?s={season}&e={episode}' },
  { id:'rive',       name:'RiveStream',   movie:'https://rivestream.org/embed?type=movie&id={id}',            tv:'https://rivestream.org/embed?type=tv&id={id}&season={season}&episode={episode}' },
];

const ANIME_SOURCES = [
  { id:'vidnest', name:'VidNest (Main)' },
];

const TMDB_KEY = '0c7387ed17fe3d2959530a2f0ca70022';
const TMDB     = 'https://api.themoviedb.org/3';
const IMG      = 'https://image.tmdb.org/t/p/w500';
const STILL    = 'https://image.tmdb.org/t/p/w300';
const JIKAN    = 'https://api.jikan.moe/v4';
const ANILIST  = 'https://graphql.anilist.co';
const VIDNEST  = 'https://vidnest.fun/animepahe';

/* ═══════════════════════════
   STATE
═══════════════════════════ */
let activeTab    = 'movies';
let activeFilter = 'all';
let activeCat    = 'all';
let activeGenre  = 'all';
let searchMode   = false;
let searchQuery  = '';
let page         = 1;

let currentItem  = null;
let selSeason    = 1;
let selEp        = 1;
let selSource    = 'vidlink';
let selSubDub    = 'sub';
let episodes     = [];
let anilistId    = null;
let totalAnimeEps = 0;

/* ═══════════════════════════
   BOOT
═══════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initDropdown();
  initSearch();
  buildTabBar();
  buildGenreBar();
  buildSrcMenu();
  initSrcDropdown();
  fetchContent();
  fetchTrending();

  document.getElementById('nextBtn').onclick = () => { page++; scrollTo(0,0); fetchContent(); };
  document.getElementById('prevBtn').onclick = () => { if(page>1){ page--; scrollTo(0,0); fetchContent(); } };
  document.getElementById('playerModal').addEventListener('click', e => { if(e.target===e.currentTarget) closePlayer(); });
});

/* ═══════════════════════════
   DROPDOWN
═══════════════════════════ */
function initDropdown() {
  const btn  = document.getElementById('ddBtn');
  const menu = document.getElementById('ddMenu');
  btn.onclick = e => { e.stopPropagation(); menu.classList.toggle('hidden'); btn.classList.toggle('open'); };
  document.querySelectorAll('.dd-opt').forEach(opt => {
    opt.onclick = () => {
      activeTab    = opt.dataset.tab;
      activeFilter = opt.dataset.val;
      activeCat    = 'all'; activeGenre = 'all'; page = 1; searchMode = false;
      document.getElementById('searchBar').value = '';
      document.getElementById('ddLabel').textContent = opt.textContent.trim();
      const isAnime = activeTab === 'anime';
      document.getElementById('ddDot').className = isAnime ? 'dd-dot anime' : 'dd-dot';
      document.querySelectorAll('.dd-opt').forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      menu.classList.add('hidden'); btn.classList.remove('open');
      buildTabBar(); buildGenreBar(); buildSrcMenu(); updateTitle(); fetchContent(); fetchTrending();
    };
  });
  document.addEventListener('click', e => { if(!e.target.closest('#ddWrap')){ menu.classList.add('hidden'); btn.classList.remove('open'); } });
}

/* ═══════════════════════════
   TAB BAR & GENRE BAR
═══════════════════════════ */
const MOVIE_TV_TABS   = [['all','All','ph-squares-four'],['movie','Movies','ph-film-clapperboard'],['tv','TV Shows','ph-television']];
const ANIME_TABS      = [['all','All Anime','ph-squares-four'],['tv','Series','ph-monitor-play'],['movie','Films','ph-film-slate']];
const MOVIE_TV_GENRES = ['All','Action','Comedy','Drama','Sci-Fi','Thriller','Horror','Romance','Animation','Fantasy','Documentary'];
const ANIME_GENRES    = ['All','Action','Comedy','Drama','Fantasy','Sci-Fi','Romance','Slice of Life','Sports','Mystery','Horror'];

function buildTabBar() {
  const tabs = activeTab === 'anime' ? ANIME_TABS : MOVIE_TV_TABS;
  document.getElementById('tabBar').innerHTML = tabs.map(([v,l,i]) =>
    `<button class="tab-btn${(activeTab==='anime'?v:v)===activeCat?' active':''}" onclick="setCat('${v}',this)">
       <i class="ph ${i}"></i> ${l}
     </button>`).join('');
}

function buildGenreBar() {
  const genres = activeTab === 'anime' ? ANIME_GENRES : MOVIE_TV_GENRES;
  document.getElementById('genreBar').innerHTML = genres.map(g =>
    `<button class="genre-pill${g===activeGenre||(g==='All'&&activeGenre==='all')?' active':''}" onclick="setGenre('${g}',this)">${g}</button>`).join('');
}

function setCat(v, el) {
  activeCat = v; page = 1;
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active'); fetchContent();
}

function setGenre(g, el) {
  activeGenre = g === 'All' ? 'all' : g; page = 1;
  document.querySelectorAll('.genre-pill').forEach(b => b.classList.remove('active'));
  el.classList.add('active'); fetchContent();
}

function updateTitle() {
  const titles = {
    movies: { all:'Trending Now', movie:'Top Movies', tv:'Top TV Shows' },
    anime:  { all:'Trending Anime', tv:'Trending Series', movie:'Trending Films' },
  };
  document.getElementById('sectionTitle').textContent = (titles[activeTab]||titles.movies)[activeFilter]||'Trending';
}

/* ═══════════════════════════
   SEARCH
═══════════════════════════ */
function initSearch() {
  let t;
  document.getElementById('searchBar').oninput = e => {
    clearTimeout(t);
    t = setTimeout(() => {
      searchQuery = e.target.value.trim();
      searchMode  = searchQuery.length > 1;
      page = 1; fetchContent();
    }, 400);
  };
}

function resetAll() {
  activeTab = 'movies'; activeFilter = 'all'; activeCat = 'all'; activeGenre = 'all';
  page = 1; searchMode = false; searchQuery = '';
  document.getElementById('searchBar').value = '';
  document.getElementById('ddLabel').textContent = 'Movies & TV';
  document.getElementById('ddDot').className = 'dd-dot';
  document.querySelectorAll('.dd-opt').forEach((o,i) => o.classList.toggle('active', i===0));
  buildTabBar(); buildGenreBar(); buildSrcMenu(); updateTitle(); fetchContent(); fetchTrending();
}

/* ═══════════════════════════
   FETCH TRENDING
═══════════════════════════ */
async function fetchTrending() {
  const row = document.getElementById('trendingRow');
  row.innerHTML = '';
  try {
    let items = [];
    if (activeTab === 'anime') {
      const d = await fetch(`${JIKAN}/top/anime?limit=8&filter=airing`).then(r=>r.json());
      items = (d.data||[]).slice(0,8).map((it,i) => ({
        title: it.title_english||it.title,
        img:   it.images?.jpg?.large_image_url||'',
        sub:   `${it.year||''}  •  ${it.genre||''}`,
        rank:  i+1,
        _raw:it, _type:'anime'
      }));
    } else {
      const d = await fetch(`${TMDB}/trending/all/week?api_key=${TMDB_KEY}`).then(r=>r.json());
      items = (d.results||[]).slice(0,8).map((it,i) => ({
        title: it.title||it.name,
        img:   it.backdrop_path ? `https://image.tmdb.org/t/p/w780${it.backdrop_path}` : (it.poster_path ? IMG+it.poster_path : ''),
        sub:   `${(it.release_date||it.first_air_date||'').slice(0,4)} • ${it.vote_average?.toFixed(1)||''}★`,
        rank:  i+1,
        _raw:it, _type:it.media_type||'movie'
      }));
    }
    items.forEach(item => {
      const el = document.createElement('div');
      el.className = 'trending-card';
      el.innerHTML = `
        <img src="${item.img}" alt="${item.title}" loading="lazy" onerror="this.style.background='var(--s3)'">
        <span class="trending-rank">#${item.rank}</span>
        <div class="trending-info"><h4>${item.title}</h4><span>${item.sub}</span></div>`;
      el.onclick = () => item._type==='anime' ? openAnimePlayer(item._raw) : openPlayer(item._raw, item._type);
      row.appendChild(el);
    });
  } catch(e) { row.innerHTML = ''; }
}

/* ═══════════════════════════
   FETCH GRID CONTENT
═══════════════════════════ */
async function fetchContent() {
  document.getElementById('pageNum').textContent = page;
  document.getElementById('prevBtn').disabled = page === 1;
  const grid = document.getElementById('mediaGrid');
  grid.innerHTML = `<div class="empty-state"><i class="ph ph-circle-notch spin" style="opacity:0.4;font-size:32px;"></i><p>Loading…</p></div>`;

  activeTab === 'anime' ? await fetchAnime() : await fetchMovieTv();
}

async function fetchMovieTv() {
  const filter = activeCat !== 'all' ? activeCat : activeFilter !== 'all' ? activeFilter : null;
  let url;
  if (searchMode) {
    url = `${TMDB}/search/multi?api_key=${TMDB_KEY}&query=${encodeURIComponent(searchQuery)}&page=${page}`;
  } else if (filter) {
    let genreParam = '';
    if (activeGenre !== 'all') {
      try {
        const gd = await fetch(`${TMDB}/genre/${filter}/list?api_key=${TMDB_KEY}`).then(r=>r.json());
        const gObj = (gd.genres||[]).find(g => g.name.toLowerCase().includes(activeGenre.toLowerCase()));
        if (gObj) genreParam = `&with_genres=${gObj.id}`;
      } catch(e) {}
    }
    url = `${TMDB}/discover/${filter}?api_key=${TMDB_KEY}&sort_by=popularity.desc&page=${page}${genreParam}`;
  } else {
    url = `${TMDB}/trending/all/week?api_key=${TMDB_KEY}&page=${page}`;
  }

  try {
    const data = await fetch(url).then(r=>r.json());
    let results = (data.results||[]).filter(i => i.poster_path && i.media_type !== 'person');
    if (searchMode && filter) results = results.filter(i => (i.media_type||'movie') === filter);
    renderMovieTvGrid(results);
    document.getElementById('nextBtn').disabled = page >= (data.total_pages||1);
  } catch(e) {
    document.getElementById('mediaGrid').innerHTML = `<div class="empty-state"><i class="ph ph-warning-circle"></i><p>Failed to load</p></div>`;
  }
}

async function fetchAnime() {
  const typeMap = { all:'', tv:'tv', movie:'movie' };
  const catType = activeCat !== 'all' ? typeMap[activeCat] : typeMap[activeFilter] || '';
  let url;

  if (searchMode) {
    url = `${JIKAN}/anime?q=${encodeURIComponent(searchQuery)}&page=${page}&limit=24&sfw=true${catType?`&type=${catType}`:''}`;
  } else if (activeGenre !== 'all') {
    try {
      const gd = await fetch(`${JIKAN}/genres/anime`).then(r=>r.json());
      const gObj = (gd.data||[]).find(g => g.name.toLowerCase().includes(activeGenre.toLowerCase()));
      if (gObj) {
        url = `${JIKAN}/anime?genres=${gObj.mal_id}&page=${page}&limit=24&sfw=true${catType?`&type=${catType}`:''}`;
      }
    } catch(e) {}
    if (!url) url = `${JIKAN}/top/anime?page=${page}&limit=24${catType?`&type=${catType}`:'&filter=airing'}`;
  } else {
    if (catType === 'movie') url = `${JIKAN}/top/anime?page=${page}&limit=24&type=movie`;
    else if (catType === 'tv') url = `${JIKAN}/top/anime?page=${page}&limit=24&filter=airing&type=tv`;
    else url = `${JIKAN}/top/anime?page=${page}&limit=24&filter=airing`;
  }

  try {
    const data = await fetch(url).then(r=>r.json());
    renderAnimeGrid(data.data||[]);
    const pag = data.pagination;
    document.getElementById('nextBtn').disabled = pag ? !pag.has_next_page : false;
  } catch(e) {
    document.getElementById('mediaGrid').innerHTML = `<div class="empty-state"><i class="ph ph-warning-circle"></i><p>Failed to load</p></div>`;
  }
}

/* ═══════════════════════════
   RENDER GRIDS
═══════════════════════════ */
function renderMovieTvGrid(items) {
  const grid = document.getElementById('mediaGrid');
  if (!items.length) { grid.innerHTML = `<div class="empty-state"><i class="ph ph-magnifying-glass"></i><p>No results found</p></div>`; return; }
  grid.innerHTML = '';
  items.forEach((item, i) => {
    const type   = item.media_type || (item.title ? 'movie' : 'tv');
    const title  = item.title || item.name || 'Unknown';
    const year   = (item.release_date||item.first_air_date||'').slice(0,4);
    const rating = item.vote_average ? item.vote_average.toFixed(1) : 'NR';

    const card = document.createElement('div');
    card.className = 'media-card';
    card.style.animationDelay = `${(i%24)*0.025}s`;
    card.innerHTML = `
      <span class="card-type-tag">${type === 'tv' ? 'Series' : 'Movie'}</span>
      <img src="${IMG}${item.poster_path}" alt="${title}" loading="lazy" onerror="this.style.background='var(--s3)'">
      <div class="card-overlay">
        <h3>${title}</h3>
        <p>${year} • ★ ${rating}</p>
        <div class="card-play-row">
          <button class="icon-btn" onclick="openPlayer(${JSON.stringify(item).replace(/"/g,'&quot;')},'${type}')"><i class="ph-fill ph-play"></i></button>
        </div>
      </div>`;
    card.onclick = () => openPlayer(item, type);
    grid.appendChild(card);
  });
}

function renderAnimeGrid(items) {
  const grid = document.getElementById('mediaGrid');
  if (!items.length) { grid.innerHTML = `<div class="empty-state"><i class="ph ph-magnifying-glass"></i><p>No anime found</p></div>`; return; }
  grid.innerHTML = '';
  items.forEach((item, i) => {
    const title   = item.title_english || item.title || 'Unknown';
    const year    = item.year || (item.aired?.from ? new Date(item.aired.from).getFullYear() : '');
    const score   = item.score ? item.score.toFixed(1) : 'NR';
    const poster  = item.images?.jpg?.large_image_url || item.images?.jpg?.image_url || '';
    const isMovie = item.type === 'Movie';

    const card = document.createElement('div');
    card.className = 'media-card';
    card.style.animationDelay = `${(i%24)*0.025}s`;
    card.innerHTML = `
      <span class="card-type-tag${isMovie?'':' anime-tag'}">${isMovie ? 'Film' : 'Anime'}</span>
      <img src="${poster}" alt="${title}" loading="lazy" onerror="this.style.background='var(--s3)'">
      <div class="card-overlay">
        <h3>${title}</h3>
        <p>${year} • ★ ${score}</p>
        <div class="card-play-row">
          <button class="icon-btn" style="border-color:rgba(200,169,110,0.3)"><i class="ph-fill ph-play"></i></button>
        </div>
      </div>`;
    card.onclick = () => openAnimePlayer(item);
    grid.appendChild(card);
  });
}

/* ═══════════════════════════
   SOURCE MENU
═══════════════════════════ */
function buildSrcMenu() {
  const menu    = document.getElementById('srcMenu');
  const sources = activeTab === 'anime' ? ANIME_SOURCES : MOVIE_TV_SOURCES;
  if (!sources.find(s => s.id === selSource)) selSource = sources[0].id;
  document.getElementById('srcLabel').textContent = sources.find(s=>s.id===selSource)?.name || sources[0].name;
  menu.innerHTML = '';
  sources.forEach((s, i) => {
    const btn = document.createElement('button');
    btn.className = 'src-opt' + (s.id === selSource ? ' active' : '');
    btn.innerHTML = `<span class="src-num">${i+1}</span>${s.name}`;
    btn.onclick = () => {
      selSource = s.id;
      document.getElementById('srcLabel').textContent = s.name;
      document.querySelectorAll('.src-opt').forEach(o => o.classList.remove('active'));
      btn.classList.add('active');
      closeSrcMenu();
      if (currentItem) loadStream();
    };
    menu.appendChild(btn);
  });
}

function initSrcDropdown() {
  const btn  = document.getElementById('srcBtn');
  const menu = document.getElementById('srcMenu');
  btn.onclick = e => { e.stopPropagation(); menu.classList.toggle('hidden'); btn.classList.toggle('open'); };
  document.addEventListener('click', e => { if (!e.target.closest('#srcWrap')) closeSrcMenu(); });
}
function closeSrcMenu() {
  document.getElementById('srcMenu').classList.add('hidden');
  document.getElementById('srcBtn').classList.remove('open');
}

/* ═══════════════════════════
   OPEN MOVIE/TV
═══════════════════════════ */
async function openPlayer(item, type) {
  currentItem = { ...item, type };
  selSeason = 1; selEp = 1; episodes = []; anilistId = null;
  selSource = MOVIE_TV_SOURCES[0].id; buildSrcMenu();

  document.getElementById('subdubWrap').classList.add('hidden');
  document.getElementById('epsBadge').classList.add('hidden');

  const title  = item.title || item.name || 'Untitled';
  const year   = (item.release_date||item.first_air_date||'').slice(0,4) || 'N/A';
  const rating = item.vote_average ? item.vote_average.toFixed(1) : 'NR';

  document.getElementById('modalTitle').textContent    = title;
  document.getElementById('modalOverview').textContent = item.overview || 'No synopsis available.';
  document.getElementById('infoPosterImg').src = IMG + (item.poster_path || '');

  document.getElementById('modalMeta').innerHTML = `
    <span class="mpill year">${year}</span>
    <span class="mpill type">${type === 'tv' ? 'TV Series' : 'Feature Film'}</span>
    <span class="mpill rating"><i class="ph-fill ph-star"></i> ${rating}</span>`;

  fetchTMDBExtra(item.id, type);

  const modal   = document.getElementById('playerModal');
  const sidebar = document.getElementById('tvSidebar');
  document.getElementById('seasonDdWrap').style.display = '';
  document.getElementById('sidebarLbl').textContent = 'Episodes';

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  resetIframe();

  if (type === 'tv') {
    sidebar.classList.remove('hidden');
    document.getElementById('episodeList').innerHTML = '<div class="ep-loader"><i class="ph ph-circle-notch spin"></i><span>Loading…</span></div>';
    await setupTV(item.id);
  } else {
    sidebar.classList.add('hidden');
    loadStream();
  }
}

async function fetchTMDBExtra(id, type) {
  try {
    const data = await fetch(`${TMDB}/${type}/${id}?api_key=${TMDB_KEY}`).then(r=>r.json());
    const genres  = (data.genres||[]).slice(0,3).map(g=>`<span class="mpill genre">${g.name}</span>`).join('');
    const status  = data.status  ? `<span class="mpill status">${data.status}</span>` : '';
    const runtime = data.runtime ? `<span class="mpill eps"><i class="ph ph-clock"></i> ${data.runtime}m</span>` : '';
    const epCount = data.number_of_episodes ? `<span class="mpill eps">${data.number_of_episodes} eps</span>` : '';
    const meta = document.getElementById('modalMeta');
    if (meta) meta.innerHTML += genres + status + runtime + epCount;
  } catch(e) {}
}

/* ═══════════════════════════
   TV SETUP
═══════════════════════════ */
async function setupTV(id) {
  try {
    const data  = await fetch(`${TMDB}/tv/${id}?api_key=${TMDB_KEY}`).then(r=>r.json());
    const valid = (data.seasons||[]).filter(s => s.season_number > 0);
    const sel   = document.getElementById('seasonSelect');
    sel.innerHTML = '';
    if (!valid.length) return;
    selSeason = valid[0].season_number;
    valid.forEach(s => {
      const o = document.createElement('option');
      o.value = s.season_number; o.textContent = `Season ${s.season_number}`;
      if (s.season_number === selSeason) o.selected = true;
      sel.appendChild(o);
    });
    sel.onchange = e => { selSeason = +e.target.value; selEp = 1; fetchEpisodes(id, selSeason); };
    await fetchEpisodes(id, selSeason);
  } catch(e) {
    document.getElementById('episodeList').innerHTML = '<div class="ep-loader"><i class="ph ph-warning-circle"></i><span>Failed to load</span></div>';
  }
}

async function fetchEpisodes(showId, seasonNum) {
  document.getElementById('episodeList').innerHTML = '<div class="ep-loader"><i class="ph ph-circle-notch spin"></i><span>Loading…</span></div>';
  try {
    const data = await fetch(`${TMDB}/tv/${showId}/season/${seasonNum}?api_key=${TMDB_KEY}`).then(r=>r.json());
    episodes = data.episodes||[];
    renderEpisodes();
    loadStream();
  } catch(e) {
    document.getElementById('episodeList').innerHTML = '<div class="ep-loader"><i class="ph ph-warning-circle"></i><span>Failed to load</span></div>';
  }
}

function renderEpisodes() {
  const list = document.getElementById('episodeList');
  list.innerHTML = '';
  if (!episodes.length) { list.innerHTML = '<div class="ep-loader"><span>No episodes found</span></div>'; return; }
  const fallback = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='169'><rect fill='%231c1c1c' width='300' height='169'/></svg>`;

  episodes.forEach(ep => {
    const active = ep.episode_number === selEp;
    const img    = ep.still_path ? `${STILL}${ep.still_path}` : fallback;
    const btn    = document.createElement('button');
    btn.className = 'ep-card' + (active ? ' active' : '');
    btn.innerHTML = `
      <div class="ep-thumb">
        <img src="${img}" loading="lazy" onerror="this.src='${fallback}'">
        ${active ? `<div class="ep-playing"><i class="ph-fill ph-play-circle"></i></div>` : `<div class="ep-thumb-overlay"><i class="ph-fill ph-play-circle"></i></div>`}
        ${ep.runtime ? `<span class="ep-runtime">${ep.runtime}m</span>` : ''}
      </div>
      <div class="ep-info">
        <div class="ep-title">${ep.episode_number}. ${ep.name}</div>
        <div class="ep-desc">${ep.overview||'No synopsis available.'}</div>
      </div>`;
    btn.onclick = () => { if(selEp===ep.episode_number)return; selEp=ep.episode_number; renderEpisodes(); loadStream(); };
    list.appendChild(btn);
    if (active) setTimeout(()=>btn.scrollIntoView({behavior:'smooth',block:'nearest'}),60);
  });
}

/* ═══════════════════════════
   OPEN ANIME
═══════════════════════════ */
async function openAnimePlayer(item) {
  const title   = item.title_english || item.title || 'Untitled';
  const poster  = item.images?.jpg?.large_image_url || item.images?.jpg?.image_url || '';
  const year    = item.year || (item.aired?.from ? new Date(item.aired.from).getFullYear() : 'N/A');
  const score   = item.score ? item.score.toFixed(1) : 'NR';
  const isMovie = item.type === 'Movie';

  currentItem = { ...item, type:'anime', isAnimeMovie:isMovie, title };
  selSeason=1; selEp=1; episodes=[]; anilistId=null;
  selSource='vidnest'; selSubDub='sub'; buildSrcMenu();

  document.getElementById('subdubWrap').classList.remove('hidden');
  document.getElementById('subBtn').classList.add('active');
  document.getElementById('dubBtn').classList.remove('active');

  document.getElementById('modalTitle').textContent    = title;
  document.getElementById('modalOverview').textContent = item.synopsis || 'No synopsis available.';
  document.getElementById('infoPosterImg').src = poster;

  const epCount = item.episodes || '?';
  document.getElementById('modalMeta').innerHTML = `
    <span class="mpill year">${year}</span>
    <span class="mpill anime">${isMovie ? 'Anime Film' : 'Anime Series'}</span>
    <span class="mpill rating"><i class="ph-fill ph-star"></i> ${score}</span>
    ${!isMovie ? `<span class="mpill eps">${epCount} eps</span>` : ''}
    ${item.status ? `<span class="mpill status">${item.status}</span>` : ''}
    ${(item.genres||[]).slice(0,3).map(g=>`<span class="mpill genre">${g.name}</span>`).join('')}`;

  const modal   = document.getElementById('playerModal');
  const sidebar = document.getElementById('tvSidebar');

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  resetIframe();

  if (isMovie) {
    sidebar.classList.add('hidden');
    document.getElementById('epsBadge').classList.add('hidden');
  } else {
    document.getElementById('seasonDdWrap').style.display = 'none';
    document.getElementById('sidebarLbl').textContent = 'Episodes';
    sidebar.classList.remove('hidden');
    document.getElementById('episodeList').innerHTML = '<div class="ep-loader"><i class="ph ph-circle-notch spin"></i><span>Fetching episodes…</span></div>';
  }

  await resolveAnilist(item.mal_id, isMovie);
}

async function resolveAnilist(malId, isMovie) {
  const q = `query($malId:Int){Media(idMal:$malId,type:ANIME){id episodes}}`;
  try {
    const res   = await fetch(ANILIST, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({query:q,variables:{malId}}) }).then(r=>r.json());
    const media = res?.data?.Media;
    if (media) {
      anilistId     = media.id;
      totalAnimeEps = media.episodes || currentItem.episodes || (isMovie ? 1 : 12);
      if (!isMovie) {
        const badge = document.getElementById('epsBadge');
        badge.textContent = `${totalAnimeEps} eps`;
        badge.classList.remove('hidden');
        buildAnimeEpList();
      }
      loadStream();
    } else {
      if (!isMovie) document.getElementById('episodeList').innerHTML = '<div class="ep-loader"><i class="ph ph-warning-circle"></i><span>Not found on AniList</span></div>';
      document.getElementById('loaderOverlay').style.display = 'none';
    }
  } catch(e) {
    document.getElementById('episodeList').innerHTML = '<div class="ep-loader"><i class="ph ph-warning-circle"></i><span>Failed</span></div>';
  }
}

function buildAnimeEpList() {
  const list = document.getElementById('episodeList');
  list.innerHTML = '';
  const count = totalAnimeEps || 12;
  for (let ep = 1; ep <= count; ep++) {
    const active = ep === selEp;
    const btn = document.createElement('button');
    btn.className = 'ep-card' + (active ? ' anime-active' : '');
    btn.innerHTML = `
      <div class="ep-thumb" style="display:flex;align-items:center;justify-content:center;background:var(--s3);">
        ${active ? `<div class="ep-playing anime"><i class="ph-fill ph-play-circle"></i></div>` : `<div class="ep-thumb-overlay"><i class="ph-fill ph-play-circle"></i></div>`}
        <span style="font-size:20px;font-weight:800;color:${active?'var(--gold)':'rgba(255,255,255,0.12)'};">${ep}</span>
      </div>
      <div class="ep-info">
        <div class="ep-title">Episode ${ep}</div>
        <div class="ep-desc">${selSubDub==='sub'?'Japanese · Subtitled':'English Dubbed'}</div>
      </div>`;
    btn.onclick = () => { if(selEp===ep)return; selEp=ep; buildAnimeEpList(); loadStream(); };
    list.appendChild(btn);
    if (active) setTimeout(()=>btn.scrollIntoView({behavior:'smooth',block:'nearest'}),60);
  }
}

/* ═══════════════════════════
   SUB / DUB
═══════════════════════════ */
function setSubDub(m) {
  selSubDub = m;
  document.getElementById('subBtn').classList.toggle('active', m==='sub');
  document.getElementById('dubBtn').classList.toggle('active', m==='dub');
  if (!currentItem?.isAnimeMovie) buildAnimeEpList();
  if (currentItem?.type === 'anime') loadStream();
}

/* ═══════════════════════════
   LOAD STREAM
═══════════════════════════ */
function loadStream() {
  const iframe     = document.getElementById('videoPlayer');
  const loader     = document.getElementById('loaderOverlay');
  const loaderText = document.getElementById('loaderText');
  let url;

  if (currentItem.type === 'anime') {
    if (!anilistId) return;
    const ep = currentItem.isAnimeMovie ? 1 : selEp;
    url = `${VIDNEST}/${anilistId}/${ep}/${selSubDub}`;
    loaderText.textContent = currentItem.isAnimeMovie ? `Film · ${selSubDub.toUpperCase()}` : `Ep ${ep} · ${selSubDub.toUpperCase()}`;
  } else {
    const src = MOVIE_TV_SOURCES.find(s=>s.id===selSource) || MOVIE_TV_SOURCES[0];
    url = currentItem.type === 'tv'
      ? src.tv.replace('{id}',currentItem.id).replace('{season}',selSeason).replace('{episode}',selEp)
      : src.movie.replace('{id}',currentItem.id);
    loaderText.textContent = currentItem.type === 'tv' ? `S${selSeason}·E${selEp} — ${src.name}` : src.name;
  }

  iframe.classList.remove('loaded');
  loader.style.display = 'flex';
  iframe.src = url;
  iframe.onload = () => { iframe.classList.add('loaded'); loader.style.display = 'none'; };
}

function resetIframe() {
  const iframe = document.getElementById('videoPlayer');
  iframe.src = ''; iframe.classList.remove('loaded');
  document.getElementById('loaderOverlay').style.display = 'flex';
}

function reloadStream() {
  const iframe = document.getElementById('videoPlayer');
  const src = iframe.src;
  iframe.classList.remove('loaded');
  document.getElementById('loaderOverlay').style.display = 'flex';
  iframe.src = '';
  setTimeout(() => { iframe.src = src; }, 100);
  iframe.onload = () => { iframe.classList.add('loaded'); document.getElementById('loaderOverlay').style.display = 'none'; };
}

function closePlayer() {
  document.getElementById('playerModal').classList.remove('open');
  document.body.style.overflow = '';
  setTimeout(() => { document.getElementById('videoPlayer').src = ''; }, 300);
}

document.addEventListener('keydown', e => { if(e.key==='Escape') closePlayer(); });

/* ═══════════════════════════
   TOAST
═══════════════════════════ */
function showToast(msg) {
  const el = document.getElementById('toast');
  document.getElementById('toastMsg').textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 3000);
}

// Window Management
function openWindow(id) {
    const win = document.getElementById(id);
    if (win) {
        win.style.display = 'block'; 
        bringToFront(win);
    }
}

function closeWindow(id) {
    const win = document.getElementById(id);
    if (win) {
        win.style.display = 'none';
    }
}

function bringToFront(element) {
    const windows = document.querySelectorAll('.window');
    let maxZ = 10;
    windows.forEach(w => {
        const z = parseInt(window.getComputedStyle(w).zIndex) || 10;
        if (z > maxZ) maxZ = z;
    });
    element.style.zIndex = maxZ + 1;
}

let isDragging = false;
let currentWindow = null;
let dragOffsetX = 0;
let dragOffsetY = 0;

document.querySelectorAll('.title-bar').forEach(header => {
    header.addEventListener('mousedown', (e) => {
        if (e.target.closest('.title-bar-controls')) return;

        isDragging = true;
        currentWindow = header.closest('.window');
        bringToFront(currentWindow);
        
        const rect = currentWindow.getBoundingClientRect();
        dragOffsetX = e.clientX - rect.left;
        dragOffsetY = e.clientY - rect.top;
    });
});

document.addEventListener('mousemove', (e) => {
    if (isDragging && currentWindow) {
        e.preventDefault();
        currentWindow.style.left = (e.clientX - dragOffsetX) + 'px';
        currentWindow.style.top = (e.clientY - dragOffsetY) + 'px';
    }
});

document.addEventListener('mouseup', () => {
    isDragging = false;
    currentWindow = null;
});

async function loadEvents() {
    try {
        const response = await fetch('data/events.json?t=' + Date.now());
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        const items = Array.isArray(data.items) ? data.items.slice() : [];
        const today = new Date();
        
        const isValidDate = (d) => d && !isNaN(new Date(d).getTime());

        const upcoming = items.filter(e => !e.date || (isValidDate(e.date) && new Date(e.date) >= today))
                              .sort((a, b) => {
                                  if (!a.date) return 1;
                                  if (!b.date) return -1;
                                  return new Date(a.date) - new Date(b.date);
                              });
                              
        const previous = items.filter(e => e.date && isValidDate(e.date) && new Date(e.date) < today)
                              .sort((a, b) => new Date(b.date) - new Date(a.date));

        const render = (list, targetId) => {
            const target = document.getElementById(targetId);
            if (!target) return;
            if (!list.length) {
                target.innerHTML = '<p>No events found.</p>';
                return;
            }
            target.innerHTML = list.map(event => `
                <div class="event-row">
                    <div class="event-left">
                        ${event.image ? `<img src="${event.image}" class="event-image" alt="${event.title}">` : `<div class="event-image placeholder"></div>`}
                    </div>
                    <div class="event-right">
                        <h3 class="event-title">${event.title}</h3>
                        <div class="event-details">
                            ${event.date ? `<div><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</div>` : ''}
                            ${event.time ? `<div><strong>Time:</strong> ${event.time}</div>` : ''}
                            ${event.location ? `<div><strong>Location:</strong> ${event.location}</div>` : ''}
                            ${event.tickets ? `<div><strong>Tickets:</strong> ${event.tickets}</div>` : ''}
                        </div>
                        ${event.body ? `<button class="event-more" onclick="alert('${escapeHtml(event.body)}')">More details</button>` : ''}
                    </div>
                </div>
            `).join('');
        };

        if (document.getElementById('events-list')) {
            render(items, 'events-list');
        }
        render(upcoming, 'upcoming-list');
        render(previous, 'previous-list');
    } catch (error) {
        const ids = ['events-list', 'upcoming-list', 'previous-list'];
        ids.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = '<p>No events added yet or error loading.</p>';
        });
    }
}

function escapeHtml(text) {
  if (!text) return '';
  return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('events-list') || document.getElementById('upcoming-list') || document.getElementById('previous-list')) {
        loadEvents();
    }
    if (document.getElementById('gallery-container')) {
        loadPictures();
    }
    if (document.getElementById('about-title')) {
        loadAbout();
        setupTabs();
    }
    if (document.getElementById('note-content')) {
        loadNote();
    }
    if (document.getElementById('watch-grid')) {
        loadWatch();
    }
    if (document.getElementById('listen-grid')) {
        loadListen();
    }
    
    ensureDesktopIcons();
});

function ensureDesktopIcons() {
    // If icons already exist (e.g. index.html), do nothing
    if (document.querySelector('.desktop-icons')) {
        return;
    }

    // Remove single "Desktop" link if present to avoid clutter
    const oldLink = document.querySelector('.desktop-link');
    if (oldLink) oldLink.remove();

    const overlay = document.createElement('div');
    overlay.className = 'desktop-icons-overlay';
    overlay.innerHTML = `
        <div class="desktop-icons">
            <div class="icon icon-shop" onclick="window.location.href='shop.html'">
                <img src="images/icons/directory_favorites-3.png" class="icon-img" alt="Video Project">
                <div class="icon-label">Video Project</div>
            </div>
            <div class="icon icon-folder" onclick="window.location.href='folder.html'">
                <img src="images/icons/directory_open_file_mydocs-4.png" class="icon-img" alt="New Folder">
                <div class="icon-label">New Folder</div>
            </div>
            <div class="icon icon-pictures" onclick="window.location.href='pictures.html'">
                <img src="images/icons/directory_open_file_mydocs_2k-4.png" class="icon-img" alt="Pictures">
                <div class="icon-label">Pictures</div>
            </div>
            <div class="icon icon-listen" onclick="window.location.href='listen.html'">
                <img src="images/icons/cd_audio_cd_a-4.png" class="icon-img" alt="Listen">
                <div class="icon-label">Listen</div>
            </div>
            <div class="icon icon-watch" onclick="window.location.href='watch.html'">
                <img src="images/icons/camera3_vid-4.png" class="icon-img" alt="Watch">
                <div class="icon-label">Watch</div>
            </div>
            <div class="icon icon-agenda" onclick="window.location.href='agenda.html'">
                <img src="images/icons/calendar-1.png" class="icon-img" alt="Agenda">
                <div class="icon-label">Agenda</div>
            </div>
            <div class="icon icon-note" onclick="window.location.href='note.html'">
                <img src="images/icons/notepad_file-2.png" class="icon-img" alt="Note">
                <div class="icon-label">Note</div>
            </div>
            <div class="icon icon-unknown" onclick="window.location.href='unknown.html'">
                <img src="images/icons/file_eye.ico" class="icon-img" style="padding-left: 13px;" alt="??">
                <div class="icon-label">??</div>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    document.body.classList.add('has-overlay-icons');
}

async function loadWatch() {
    const grid = document.getElementById('watch-grid');
    if (!grid) return;

    try {
        const response = await fetch('data/watch.json?t=' + Date.now());
        if (!response.ok) throw new Error('Failed to load videos');
        
        const data = await response.json();
        const items = Array.isArray(data.items) ? data.items : [];
        
        if (!items.length) {
            grid.innerHTML = '<p style="color:white; text-align:center; width:100%;">No videos available.</p>';
            return;
        }

        grid.innerHTML = items.map(video => {
            let videoContent = '';
            let url = video.video_url || '';
            
            if (url.includes('youtube.com/watch') || url.includes('youtu.be')) {
                let videoId = '';
                if (url.includes('youtu.be')) {
                    videoId = url.split('/').pop();
                } else {
                    const urlParams = new URLSearchParams(new URL(url).search);
                    videoId = urlParams.get('v');
                }
                videoContent = `<iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`;
            } else if (url.match(/\.(mp4|webm|ogg)$/i)) {
                videoContent = `<video src="${url}" controls></video>`;
            } else {
                videoContent = `<div style="display:flex;align-items:center;justify-content:center;height:100%;"><a href="${url}" target="_blank">Watch Video</a></div>`;
            }

            return `
            <div class="window video-window">
                <div class="title-bar">
                    <div class="title-bar-text">${video.title || 'Video'}</div>
                    <div class="title-bar-controls">
                        <button aria-label="Minimize"></button>
                        <button aria-label="Maximize"></button>
                        <button aria-label="Close"></button>
                    </div>
                </div>
                <div class="window-body">
                    <div class="video-container">
                        ${videoContent}
                    </div>
                    <div class="video-title">${video.title || ''}</div>
                    ${video.description ? `<div class="video-desc">${video.description}</div>` : ''}
                </div>
            </div>
            `;
        }).join('');

    } catch (e) {
        console.error(e);
        grid.innerHTML = '<p style="color:white;">Error loading videos.</p>';
    }
}

async function loadListen() {
    const grid = document.getElementById('listen-grid');
    if (!grid) return;

    try {
        const response = await fetch('data/listen.json?t=' + Date.now());
        if (!response.ok) throw new Error('Failed to load music');
        
        const data = await response.json();
        const items = Array.isArray(data.items) ? data.items : [];
        
        if (!items.length) {
            grid.innerHTML = '<p style="color:white; text-align:center; width:100%;">No music available.</p>';
            return;
        }

        grid.innerHTML = items.map(track => {
            let embedContent = '';
            if (track.audio_url && (track.audio_url.includes('spotify.com') || track.audio_url.includes('open.spotify.com'))) {
                let spotifyUrl = track.audio_url;
                if (!spotifyUrl.includes('/embed')) {
                    spotifyUrl = spotifyUrl.replace('open.spotify.com/', 'open.spotify.com/embed/');
                    const urlObj = new URL(spotifyUrl);
                    spotifyUrl = urlObj.origin + urlObj.pathname; 
                }
                embedContent = `<iframe src="${spotifyUrl}" width="100%" height="100%" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>`;
            } else {
                 embedContent = `
                    <div class="album-art" style="background-image: url('${track.cover_image || 'images/logo.png'}'); background-size: cover; background-position: center; width: 100px; height: 100px; border: 2px inset white; margin-bottom: 10px;"></div>
                    <div class="track-info">
                        <div class="track-title" style="font-weight:bold;">${track.title || 'Unknown Title'}</div>
                    </div>
                    <audio controls class="audio-player" style="width:100%" src="${track.audio_url}"></audio>
                `;
            }

            return `
            <div class="window audio-window">
                <div class="title-bar">
                    <div class="title-bar-text">${track.title || 'Music'}</div>
                    <div class="title-bar-controls">
                        <button aria-label="Minimize"></button>
                        <button aria-label="Maximize"></button>
                        <button aria-label="Close"></button>
                    </div>
                </div>
                <div class="window-body">
                    ${track.audio_url && track.audio_url.includes('spotify') ? 
                        `<div class="spotify-container">${embedContent}</div>` : 
                        embedContent
                    }
                </div>
            </div>
            `;
        }).join('');

    } catch (e) {
        console.error(e);
        grid.innerHTML = '<p style="color:white;">Error loading music.</p>';
    }
}

async function loadNote() {
    const container = document.getElementById('note-content');
    if (!container) return;

    try {
        const response = await fetch('data/note.json?t=' + Date.now());
        if (!response.ok) throw new Error('Failed to load note');
        
        const data = await response.json();
        
        let html = '';
        if (data.title) {
            html += `<h2>${escapeHtml(data.title)}</h2>`;
        }
        if (data.content) {
            const paragraphs = data.content.split('\n').filter(p => p.trim() !== '');
            html += paragraphs.map(p => `<p>${escapeHtml(p)}</p>`).join('');
        } else {
            html = '<p>No content available.</p>';
        }
        
        container.innerHTML = html;

    } catch (e) {
        console.error(e);
        container.innerHTML = '<p>Error loading note.</p>';
    }
}

async function loadAbout() {
    if (!document.getElementById('about-title')) return;

    try {
        const response = await fetch('data/about.json?t=' + Date.now());
        if (!response.ok) throw new Error('Failed to load about data');
        const data = await response.json();

        if (data.summary_title) document.getElementById('about-title').innerText = data.summary_title;
        if (data.summary_text) document.getElementById('about-text').innerText = data.summary_text;
        if (data.summary_image) document.getElementById('about-image').src = data.summary_image;

        if (data.contact_email) document.getElementById('contact-email').value = data.contact_email;
        if (data.contact_phone) document.getElementById('contact-phone').value = data.contact_phone;

        const setBtn = (id, url) => {
            const btn = document.getElementById(id);
            if (btn && url) {
                btn.onclick = () => window.open(url, '_blank');
            } else if (btn) {
                btn.disabled = true;
                btn.style.display = 'none'; 
            }
        };
        setBtn('btn-insta', data.instagram_url);
        setBtn('btn-tiktok', data.tiktok_url);
        setBtn('btn-twitter', data.linkedin_url); // Mapping LinkedIn URL to Twitter button for now, or use a new field
        setBtn('btn-youtube', data.youtube_url);
        setBtn('btn-spotify', data.spotify_url);

    } catch (e) {
        console.error('Error loading about:', e);
    }
}

function setupTabs() {
    const tabs = document.querySelectorAll('.tab-link');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.removeAttribute('aria-selected'));
            tab.setAttribute('aria-selected', 'true');

            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            const targetId = tab.getAttribute('data-tab');
            const targetContent = document.getElementById('tab-content-' + targetId);
            if (targetContent) targetContent.classList.add('active');
        });
    });
}

function makeDraggable(element) {
    const header = element.querySelector('.title-bar');
    if (!header) return;
    
    header.addEventListener('mousedown', (e) => {
        if (e.target.closest('.title-bar-controls')) return;

        isDragging = true;
        currentWindow = element;
        bringToFront(currentWindow);
        
        const rect = currentWindow.getBoundingClientRect();
        dragOffsetX = e.clientX - rect.left;
        dragOffsetY = e.clientY - rect.top;
    });
}

async function loadProjects() {
    const desktop = document.getElementById('desktop-area');
    if (!desktop) return;

    try {
        const response = await fetch('data/projects.json?t=' + Date.now());
        if (!response.ok) throw new Error('Failed to load projects');
        const data = await response.json();
        const items = Array.isArray(data.items) ? data.items : [];

        desktop.innerHTML = '';

        if (!items.length) {
            desktop.innerHTML = '<p style="color:white; padding:20px;">No projects found.</p>';
            return;
        }

        items.forEach((project) => {
            const win = document.createElement('div');
            win.className = `window`;
            
            // Determine size based on type
            const type = project.type || 'small';
            const isLarge = type === 'large';
            
            // Apply grid spanning for large items
            if (isLarge) {
                win.style.gridRow = 'span 2';
            } else {
                win.style.gridRow = 'span 1';
            }

            // Common Text Content
            const titleDate = `
                <div style="flex-shrink:0; margin-bottom: 5px;">
                    <h3 style="margin:0;font-size:16px;">${project.title}</h3>
                    <p style="margin:2px 0;font-size:12px;"><strong>${project.date}</strong></p>
                </div>
            `;
            
            const summary = project.summary ? 
                `<p style="margin:0; font-size:13px; line-height:1.3; flex:1; overflow-y:auto; padding-right:2px;">${project.summary}</p>` : 
                '<div style="flex:1;"></div>';
                
            const readMoreBtn = `<button class="read-more-btn" onclick="openProjectModal('${project.id}')" style="margin-top:5px; flex-shrink:0; align-self: flex-start;">Read More</button>`;

            // Media Generation
            let mediaEl = '';
            if (project.media_src) {
                const imgStyle = 'width:100%; height:100%; object-fit:cover; display:block;';
                if (project.media_type === 'video') {
                     mediaEl = `<video src="${project.media_src}" controls style="${imgStyle}"></video>`;
                } else {
                     mediaEl = `<img src="${project.media_src}" alt="${project.title}" style="${imgStyle}">`;
                }
            }

            let internalContent = '';

            if (isLarge) {
                // TALL LAYOUT (Vertical Stack) for Large items
                internalContent = `
                    <div class="window-body" style="background-color:#fff; flex:1; display:flex; flex-direction:column; overflow:hidden; padding:6px; gap:6px; margin:0;">
                        ${mediaEl ? `<div style="height:45%; flex-shrink:0;">${mediaEl}</div>` : ''}
                        <div style="flex:1; padding:0; display:flex; flex-direction:column; overflow:hidden;">
                            ${titleDate}
                            ${summary}
                            ${readMoreBtn}
                        </div>
                    </div>
                `;
            } else {
                // SHORT LAYOUT (Side-by-Side) for Small items
                internalContent = `
                    <div class="window-body" style="background-color:#fff; flex:1; display:flex; flex-direction:row; overflow:hidden; padding:6px; gap:6px; margin:0;">
                        ${mediaEl ? `<div style="width:40%; flex-shrink:0; height:100%;">${mediaEl}</div>` : ''}
                        <div style="flex:1; padding:0; display:flex; flex-direction:column; overflow:hidden;">
                            ${titleDate}
                            ${summary}
                            ${readMoreBtn}
                        </div>
                    </div>
                `;
            }

            win.innerHTML = `
                <div class="title-bar" style="cursor: default;">
                    <div class="title-bar-text">${project.title}</div>
                </div>
                ${internalContent}
            `;
            
            desktop.appendChild(win);
        });

        // Store projects globally
        window.allProjects = items;

    } catch (e) {
        console.error(e);
        desktop.innerHTML = '<p style="color:white; padding:20px;">Error loading projects.</p>';
    }
}

function openProjectModal(id) {
    const project = window.allProjects ? window.allProjects.find(p => p.id === id) : null;
    if (!project) return;
    
    // Check if modal already exists
    const existing = document.getElementById(`modal-${id}`);
    if (existing) {
        existing.style.display = 'block';
        bringToFront(existing);
        return;
    }

    // Collect all media items (Cover + Gallery)
    const mediaList = [];
    if (project.media_src) {
        mediaList.push({
            type: project.media_type || 'image',
            src: project.media_src,
            caption: 'Main Cover'
        });
    }
    if (project.gallery && Array.isArray(project.gallery)) {
        mediaList.push(...project.gallery);
    }

    const modal = document.createElement('div');
    modal.className = 'window';
    modal.id = `modal-${id}`;
    modal.style.position = 'fixed';
    modal.style.top = '50%';
    modal.style.left = '50%';
    modal.style.transform = 'translate(-50%, -50%)';
    modal.style.width = '800px';
    modal.style.maxWidth = '95%';
    modal.style.height = '85vh';
    modal.style.setProperty('display', 'flex', 'important');
    modal.style.flexDirection = 'column';
    modal.style.zIndex = 9999;
    modal.style.padding = '2px';
    modal.style.background = '#ffffff';
    modal.style.boxShadow = '0 0 20px rgba(0,0,0,0.5)';

    const descriptionHtml = project.description ? 
        project.description.split('\n').filter(p => p.trim()).map(p => `<p>${p}</p>`).join('') : 
        '<p>No detailed description available.</p>';

    // Initial Render Structure
    modal.innerHTML = `
        <div class="title-bar">
            <div class="title-bar-text">${project.title}</div>
            <div class="title-bar-controls">
                <button aria-label="Close"></button>
            </div>
        </div>
        <div class="window-body" style="flex: 1 1 auto; min-height: 0; overflow-y: auto; padding: 15px; background: white; margin: 0; display: block;">
            <!-- Carousel Container -->
            <div id="carousel-${id}" style="margin-bottom: 10px; text-align: center; position: relative; width: 100%;">
                
                <!-- Main Media View -->
                <div id="media-view-${id}" style="position: relative; height: 350px; display: flex; align-items: center; justify-content: center; overflow: hidden; background: transparent;">
                    <!-- Media will be injected here -->
                </div>

                <!-- Navigation Buttons (only if > 1 item) -->
                ${mediaList.length > 1 ? `
                    <button id="prev-btn-${id}" style="position: absolute; top: 50%; left: 0; transform: translateY(-50%); z-index: 10; cursor: pointer; padding: 5px 10px; font-weight: bold;">&lt;</button>
                    <button id="next-btn-${id}" style="position: absolute; top: 50%; right: 0; transform: translateY(-50%); z-index: 10; cursor: pointer; padding: 5px 10px; font-weight: bold;">&gt;</button>
                ` : ''}

                <!-- Thumbnails Strip -->
                ${mediaList.length > 1 ? `
                    <div id="thumbnails-${id}" style="display: flex; gap: 10px; justify-content: center; margin-top: 10px; flex-wrap: wrap;">
                        <!-- Thumbnails will be injected here -->
                    </div>
                ` : ''}

            </div>

            <h2 style="margin-top: 10px; font-size: 22px; text-align:center;">${project.title}</h2>
            <p style="margin-bottom: 10px; color: #555; text-align:center;"><strong>Date:</strong> ${project.date}</p>
            <div class="project-description" style="line-height: 1.5; font-size: 15px; max-width: 90%; margin: 0 auto;">
                ${descriptionHtml}
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    
    // Logic for Carousel
    let currentIndex = 0;
    const mediaView = document.getElementById(`media-view-${id}`);
    const thumbContainer = document.getElementById(`thumbnails-${id}`);
    const prevBtn = document.getElementById(`prev-btn-${id}`);
    const nextBtn = document.getElementById(`next-btn-${id}`);

    function updateCarousel() {
        if (mediaList.length === 0) {
            mediaView.innerHTML = '<p>No media available</p>';
            return;
        }

        const item = mediaList[currentIndex];
        
        // Render Main Media
        if (item.type === 'video') {
            mediaView.innerHTML = `<video src="${item.src}" controls autoplay style="max-height:100%; max-width:100%; width:auto; height:auto; border:none; display:block; margin: 0 auto; object-fit: contain;"></video>`;
        } else {
            mediaView.innerHTML = `<img src="${item.src}" style="max-height:100%; max-width:100%; width:auto; height:auto; border:none; display:block; margin: 0 auto; object-fit: contain;" alt="${item.caption || 'Project Image'}">`;
        }

        // Render Thumbnails (Highlight active)
        if (thumbContainer) {
            thumbContainer.innerHTML = mediaList.map((m, idx) => {
                const isActive = idx === currentIndex;
                const borderStyle = isActive ? 'border: 2px solid blue;' : 'border: 2px outset white;';
                
                if (m.type === 'video') {
                    return `
                        <div onclick="document.getElementById('modal-${id}').dispatchEvent(new CustomEvent('changeSlide', {detail: ${idx}}))" 
                             style="width: 60px; height: 60px; background: black; ${borderStyle} display: flex; align-items: center; justify-content: center; color: white; cursor: pointer;">
                            ▶
                        </div>
                    `;
                } else {
                    return `
                        <img src="${m.src}" 
                             onclick="document.getElementById('modal-${id}').dispatchEvent(new CustomEvent('changeSlide', {detail: ${idx}}))"
                             style="width: 60px; height: 60px; object-fit: cover; ${borderStyle} cursor: pointer;"
                        >
                    `;
                }
            }).join('');
        }
    }

    // Initial Render
    updateCarousel();

    // Event Listeners
    modal.addEventListener('changeSlide', (e) => {
        currentIndex = e.detail;
        updateCarousel();
    });

    if (prevBtn) {
        prevBtn.onclick = () => {
            currentIndex = (currentIndex - 1 + mediaList.length) % mediaList.length;
            updateCarousel();
        };
    }

    if (nextBtn) {
        nextBtn.onclick = () => {
            currentIndex = (currentIndex + 1) % mediaList.length;
            updateCarousel();
        };
    }

    modal.querySelector('button[aria-label="Close"]').onclick = () => modal.remove();
    makeDraggable(modal);
}

async function loadPictures() {
    const container = document.getElementById('gallery-container');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const loading = document.getElementById('gallery-loading');
    
    if (!container) return;

    try {
        const response = await fetch('data/pictures.json?t=' + Date.now());
        if (!response.ok) throw new Error('Failed to load pictures');
        
        const data = await response.json();
        const items = Array.isArray(data.items) ? data.items : [];
        
        if (items.length === 0) {
            loading.innerText = 'No pictures found.';
            prevBtn.classList.add('disabled');
            nextBtn.classList.add('disabled');
            return;
        }

        loading.style.display = 'none';
        container.innerHTML = items.map((item, index) => `
            <img src="${item.image}" class="gallery-image ${index === 0 ? 'active' : ''}" alt="${item.title || 'Gallery Image'}" data-index="${index}">
        `).join('');

        let currentIndex = 0;
        const totalItems = items.length;

        const updateButtons = () => {
            if (currentIndex === 0) {
                prevBtn.classList.add('disabled');
            } else {
                prevBtn.classList.remove('disabled');
            }
            
            if (currentIndex === totalItems - 1) {
                nextBtn.classList.add('disabled');
            } else {
                nextBtn.classList.remove('disabled');
            }
        };

        const showImage = (index) => {
            document.querySelectorAll('.gallery-image').forEach(img => img.classList.remove('active'));
            const newImg = container.querySelector(`.gallery-image[data-index="${index}"]`);
            if (newImg) newImg.classList.add('active');
            updateButtons();
        };

        prevBtn.onclick = () => {
            if (currentIndex > 0) {
                currentIndex--;
                showImage(currentIndex);
            }
        };

        nextBtn.onclick = () => {
            if (currentIndex < totalItems - 1) {
                currentIndex++;
                showImage(currentIndex);
            }
        };

        updateButtons();

    } catch (e) {
        console.error(e);
        loading.innerText = 'Error loading pictures.';
    }
}
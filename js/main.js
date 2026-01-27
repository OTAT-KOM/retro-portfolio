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
    if (document.getElementById('products-grid')) {
        loadProducts();
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
                <img src="images/icons/directory_favorites-3.png" class="icon-img" alt="The Shop">
                <div class="icon-label">The Shop</div>
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

        // Fixed Layout Map (Indices 0-6 match the user's grid request)
        // 1 | 2 3
        // 1 | 4 | 7
        // 5 6   | 7
        // Grid System: 3 Columns, 3 Rows.
        // Gap: 2% Horizontal, 4% Vertical (for visual consistency).
        // Width: 30%. Height: 25%.
        // Start: Top 10%, Left 2%.
        const layouts = [
            // 0 (1): Top Left, Tall (Rows 1-2)
            { top: '10%', left: '2%', width: '30%', height: '54%', zIndex: 10 },
            
            // 1 (2): Top Center (Row 1)
            { top: '10%', left: '34%', width: '30%', height: '25%', zIndex: 9 },
            
            // 2 (3): Top Right (Row 1)
            { top: '10%', left: '66%', width: '30%', height: '25%', zIndex: 8 },
            
            // 3 (4): Center (Row 2)
            { top: '39%', left: '34%', width: '30%', height: '25%', zIndex: 7 },
            
            // 4 (5): Bottom Left (Row 3)
            { top: '68%', left: '2%', width: '30%', height: '25%', zIndex: 6 },
            
            // 5 (6): Bottom Center (Row 3)
            { top: '68%', left: '34%', width: '30%', height: '25%', zIndex: 5 },
            
            // 6 (7): Right Tall (Rows 2-3)
            { top: '39%', left: '66%', width: '30%', height: '54%', zIndex: 4 }
        ];

        items.forEach((project, index) => {
            if (index >= layouts.length) return; // Only show first 7 projects
            
            const pos = layouts[index];
            const win = document.createElement('div');
            // We use a generic class but override styles
            win.className = `window`;
            win.style.position = 'absolute';
            win.style.top = pos.top;
            win.style.left = pos.left;
            win.style.width = pos.width;
            win.style.height = pos.height;
            win.style.zIndex = pos.zIndex;
            win.style.display = 'flex';
            win.style.flexDirection = 'column';
            
            // Determine Layout Type based on shape
            // Tall windows: 0, 6 -> Column Layout
            // Short windows: 1, 2, 3, 4, 5 -> Row Layout (Image Left)
            const isTall = (index === 0 || index === 6);
            
            let internalContent = '';

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
                
            const readMoreBtn = `<button class="read-more-btn" style="margin-top:5px; flex-shrink:0; align-self: flex-start;">Read More</button>`;

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

            if (isTall) {
                // TALL LAYOUT (Vertical Stack)
                // Image Top (45%), Content Bottom
                internalContent = `
                    <div class="window-body" style="background-color:#fff; flex:1; display:flex; flex-direction:column; overflow:hidden; padding:6px; gap:6px;">
                        ${mediaEl ? `<div style="height:45%; flex-shrink:0;">${mediaEl}</div>` : ''}
                        <div style="flex:1; padding:0; display:flex; flex-direction:column; overflow:hidden;">
                            ${titleDate}
                            ${summary}
                            ${readMoreBtn}
                        </div>
                    </div>
                `;
            } else {
                // SHORT LAYOUT (Side-by-Side)
                // Image Left (40%), Content Right
                internalContent = `
                    <div class="window-body" style="background-color:#fff; flex:1; display:flex; flex-direction:row; overflow:hidden; padding:6px; gap:6px;">
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
        desktop.innerHTML = '<p style="color:white;">Error loading projects.</p>';
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

    const modal = document.createElement('div');
    modal.className = 'window';
    modal.id = `modal-${id}`;
    modal.style.position = 'fixed';
    modal.style.top = '50%';
    modal.style.left = '50%';
    modal.style.transform = 'translate(-50%, -50%)';
    modal.style.width = '600px';
    modal.style.maxWidth = '90%';
    modal.style.zIndex = 9999;
    modal.style.boxShadow = '0 0 20px rgba(0,0,0,0.5)';

    modal.innerHTML = `
        <div class="title-bar">
            <div class="title-bar-text">${project.title} - Details</div>
            <div class="title-bar-controls">
                <button aria-label="Close"></button>
            </div>
        </div>
        <div class="window-body" style="max-height:80vh;overflow-y:auto;">
            <h2>${project.title}</h2>
            <p><strong>Date:</strong> ${project.date}</p>
            ${project.media_src ? `<div style="text-align:center;margin:10px 0;"><img src="${project.media_src}" style="max-width:100%;border:2px inset white;"></div>` : ''}
            <div class="project-description">
                ${project.description || 'No detailed description available.'}
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    
    modal.querySelector('button[aria-label="Close"]').onclick = () => modal.remove();
    
    // Modal IS draggable
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
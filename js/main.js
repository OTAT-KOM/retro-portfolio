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

async function loadBooking() {
    const container = document.getElementById('booking-container');
    if (!container) return;

    try {
        const response = await fetch('data/booking.json?t=' + Date.now());
        if (!response.ok) throw new Error('Failed to load booking info');
        const data = await response.json();

        // Set title if exists
        const titleEl = document.getElementById('booking-title');
        if (titleEl && data.title) {
            titleEl.textContent = data.title;
        }

        // Set instructions
        const instructionsEl = document.getElementById('booking-instructions');
        if (instructionsEl && data.instructions) {
            instructionsEl.textContent = data.instructions;
        }

        // Set iframe
        const iframeContainer = document.getElementById('booking-iframe-container');
        if (iframeContainer) {
            if (data.booking_url && data.booking_url.includes('http')) {
                iframeContainer.innerHTML = `
                    <iframe src="${data.booking_url}" style="border: 0" width="100%" height="900" frameborder="0" scrolling="no"></iframe>
                `;
            } else {
                iframeContainer.innerHTML = `
                    <div style="padding: 20px; text-align: center; background: #fff; border: 2px inset #fff;">
                        <p><strong>Booking System Not Configured</strong></p>
                        <p>Please update the Booking URL in the CMS (admin panel).</p>
                        <p>If you are the admin, go to /admin/ and edit "Booking Settings".</p>
                    </div>
                `;
            }
        }
    } catch (error) {
        console.error("Error loading booking:", error);
        container.innerHTML = '<p>Error loading booking system.</p>';
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
    if (document.getElementById('playlist-grid')) {
        loadListen();
    }
    if (document.getElementById('booking-container')) {
        loadBooking();
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
            <div class="icon icon-shop" onclick="window.location.href='videoprojects.html'">
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
                <img src="images/icons/cd_audio_cd_a-4.png" class="icon-img" alt="Audio projects">
                <div class="icon-label">Audio projects</div>
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
            <div class="icon icon-unknown" onclick="window.location.href='index.html?tab=contact'">
                <img src="images/icons/file_eye.ico" class="icon-img" style="padding-left: 13px;" alt="Contact">
                <div class="icon-label">Contact</div>
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
                        <button aria-label="Minimize">
                            <svg width="10" height="10" viewBox="0 0 10 10">
                                <rect x="2" y="8" width="6" height="2" fill="black"/>
                            </svg>
                        </button>
                        <button aria-label="Maximize">
                            <svg width="10" height="10" viewBox="0 0 10 10">
                                <path d="M1,1 H9 V9 H1 V1 M2,2 V8 H8 V2 H2" fill="black" fill-rule="evenodd"/>
                            </svg>
                        </button>
                        <button aria-label="Close">
                            <svg width="10" height="10" viewBox="0 0 10 10">
                                <path d="M1,1 L9,9 M9,1 L1,9" stroke="black" stroke-width="2"/>
                            </svg>
                        </button>
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
    const grid = document.getElementById('playlist-grid');
    const player = document.getElementById('audio-player');
    const playBtn = document.getElementById('play-btn');
    const stopBtn = document.getElementById('stop-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const seekBar = document.getElementById('seek-bar');
    const seekFill = document.getElementById('seek-fill');
    const volumeBar = document.getElementById('volume-bar');
    const currentCover = document.getElementById('current-cover');
    const currentTitle = document.getElementById('current-title');
    const currentArtist = document.getElementById('current-artist');
    const stats = document.getElementById('playlist-stats');

    if (!grid) return;

    try {
        const response = await fetch('data/listen.json?t=' + Date.now());
        if (!response.ok) throw new Error('Failed to load data');
        const data = await response.json();

        // Update Profile Info
        if (data.profile_name) {
            const el = document.getElementById('profile-name');
            if (el) el.innerText = data.profile_name;
        }
        if (data.profile_image) {
            const el = document.getElementById('profile-pic');
            if (el) el.src = data.profile_image;
        }
        if (data.profile_summary) {
            const el = document.getElementById('profile-summary');
            if (el) el.innerText = data.profile_summary;
        }
        if (data.spotify_url) {
             const btn = document.getElementById('spotify-btn');
             if (btn) btn.onclick = () => window.open(data.spotify_url, '_blank');
        }

        const items = data.items || [];

        // Stats removed as per request

        if (items.length === 0) {
            grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center;">No tracks found.</div>';
            return;
        }

        // Render Grid
        grid.innerHTML = items.map((item, index) => `
            <div class="playlist-item" data-index="${index}">
                <img src="${item.cover || 'images/icons/cd_audio_cd_a-4.png'}" class="playlist-cover" onerror="this.src='images/icons/cd_audio_cd_a-4.png'">
                <div class="playlist-info">
                    <div class="playlist-title">${item.title}</div>
                    <div class="playlist-artist">${item.artist || 'Unknown Artist'}</div>
                </div>
            </div>
        `).join('');

        // Carousel Logic
        const tracksPrevBtn = document.getElementById('tracks-prev-btn');
        const tracksNextBtn = document.getElementById('tracks-next-btn');
        
        const updateArrows = () => {
             if (!grid || !tracksPrevBtn || !tracksNextBtn) return;
             
             // Check if scrollable
             const isScrollable = grid.scrollWidth > grid.clientWidth;
             
             if (!isScrollable) {
                 tracksPrevBtn.disabled = true;
                 tracksNextBtn.disabled = true;
                 return;
             }

             // Left Arrow
             tracksPrevBtn.disabled = grid.scrollLeft <= 0;

             // Right Arrow (allow 1px tolerance)
             tracksNextBtn.disabled = Math.ceil(grid.scrollLeft + grid.clientWidth) >= grid.scrollWidth;
        };

        if (tracksPrevBtn) {
            tracksPrevBtn.onclick = () => {
                grid.scrollBy({ left: -grid.clientWidth * 0.5, behavior: 'smooth' });
            };
        }
        if (tracksNextBtn) {
            tracksNextBtn.onclick = () => {
                grid.scrollBy({ left: grid.clientWidth * 0.5, behavior: 'smooth' });
            };
        }
        
        grid.addEventListener('scroll', updateArrows);
        window.addEventListener('resize', updateArrows);
        
        // Initial check
        setTimeout(updateArrows, 100);

        // Player Logic
        let currentIndex = -1;
        let isPlaying = false;
        let isSeeking = false;
        let animationFrameId;

        const updateSeekUI = () => {
            if (!player.paused && !player.ended && !isSeeking && player.duration && seekBar) {
                const value = (player.currentTime / player.duration) * 100;
                seekBar.value = value;
                if (seekFill) {
                    seekFill.style.width = `${value}%`;
                }
                animationFrameId = requestAnimationFrame(updateSeekUI);
            }
        };

        const loadTrack = (index, autoPlay = true) => {
            if (index < 0 || index >= items.length) return;
            currentIndex = index;
            const item = items[index];
            
            player.src = item.audio;
            currentCover.src = item.cover || 'images/icons/cd_audio_cd_a-4.png';
            currentCover.style.opacity = 1;
            currentTitle.innerText = item.title;
            // currentArtist.innerText = item.artist || 'Unknown Artist';
            
            if (seekBar) {
                seekBar.value = 0;
            }
            if (seekFill) {
                seekFill.style.width = '0%';
            }
            
            cancelAnimationFrame(animationFrameId);

            if (autoPlay) {
                playTrack();
            }
        };

        // Load first track info immediately (without auto-playing)
        if (items.length > 0) {
            loadTrack(0, false);
        }

        const playTrack = () => {
            if (currentIndex === -1 && items.length > 0) {
                loadTrack(0);
                return;
            }
            player.play().then(() => {
                isPlaying = true;
                playBtn.innerHTML = `
                    <svg width="10" height="10" viewBox="0 0 10 10">
                        <path d="M2,1 H4 V9 H2 Z M6,1 H8 V9 H6 Z" fill="black"/>
                    </svg>
                `;
                cancelAnimationFrame(animationFrameId);
                updateSeekUI();
            }).catch(e => console.error("Playback error:", e));
        };

        const pauseTrack = () => {
            player.pause();
            isPlaying = false;
            cancelAnimationFrame(animationFrameId);
            playBtn.innerHTML = `
                <svg width="10" height="10" viewBox="0 0 10 10">
                    <path d="M2,1 L9,5 L2,9 Z" fill="black"/>
                </svg>
            `;
        };

        const stopTrack = () => {
            player.pause();
            player.currentTime = 0;
            cancelAnimationFrame(animationFrameId);
            if (seekBar) {
                seekBar.value = 0;
            }
            if (seekFill) {
                seekFill.style.width = '0%';
            }
            isPlaying = false;
            playBtn.innerHTML = `
                <svg width="10" height="10" viewBox="0 0 10 10">
                    <path d="M2,1 L9,5 L2,9 Z" fill="black"/>
                </svg>
            `;
        };

        // Event Listeners
        grid.querySelectorAll('.playlist-item').forEach(item => {
            item.addEventListener('click', () => {
                loadTrack(parseInt(item.dataset.index));
            });
        });

        if (playBtn) playBtn.onclick = () => {
            if (isPlaying) pauseTrack();
            else playTrack();
        };

        if (stopBtn) stopBtn.onclick = stopTrack;

        if (prevBtn) prevBtn.onclick = () => {
            if (currentIndex > 0) loadTrack(currentIndex - 1);
        };

        if (nextBtn) nextBtn.onclick = () => {
            if (currentIndex < items.length - 1) loadTrack(currentIndex + 1);
        };

        if (volumeBar) volumeBar.oninput = (e) => {
            player.volume = e.target.value;
        };

        if (player) {
            // Removed ontimeupdate UI logic to prevent conflict with rAF
            player.ontimeupdate = null; 
            
            player.onended = () => {
                 cancelAnimationFrame(animationFrameId);
                 if (currentIndex < items.length - 1) {
                     loadTrack(currentIndex + 1);
                 } else {
                     pauseTrack();
                 }
            };
        }

        if (seekBar) {
            // Initialize background
            if (seekFill) {
                seekFill.style.width = '0%';
            }

            seekBar.onmousedown = () => { isSeeking = true; };
            seekBar.ontouchstart = () => { isSeeking = true; };
            
            seekBar.oninput = (e) => {
                // Update time while dragging
                const value = e.target.value;
                if (seekFill) {
                    seekFill.style.width = `${value}%`;
                }
                
                // Optional: Update player time smoothly while dragging? 
                // Usually better to just update UI and commit on change, 
                // but updating currentTime can be choppy.
                // Let's keep existing logic but ensure loop doesn't fight us.
                
                if (player.duration) {
                    const time = (value / 100) * player.duration;
                    player.currentTime = time;
                }
            };

            seekBar.onchange = (e) => {
                // Commit time change
                const value = e.target.value;
                if (seekFill) {
                    seekFill.style.width = `${value}%`;
                }

                if (player.duration) {
                    const time = (value / 100) * player.duration;
                    player.currentTime = time;
                }
                isSeeking = false;
                // If playing, the loop is already running or will pick up new time
                if (!player.paused && !player.ended) {
                     cancelAnimationFrame(animationFrameId);
                     updateSeekUI();
                }
            };
            
            // Handle mouse up outside the element just in case
            seekBar.onmouseup = () => { isSeeking = false; };
            seekBar.ontouchend = () => { isSeeking = false; };
        }

    } catch (e) {
        console.error(e);
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center;">Error loading tracks.</div>';
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
                btn.disabled = false;
                btn.style.display = 'inline-block';
            } else if (btn) {
                btn.disabled = true;
                btn.style.display = 'none'; 
            }
        };

        // Map social media list to specific buttons if they exist
        const social = Array.isArray(data.social_media) ? data.social_media : [];
        const findUrl = (name) => {
            const item = social.find(s => s.name && s.name.toLowerCase().includes(name.toLowerCase()));
            return item ? item.url : null;
        };

        setBtn('btn-insta', findUrl('instagram'));
        setBtn('btn-tiktok', findUrl('tiktok'));
        setBtn('btn-twitter', findUrl('twitter') || findUrl('x.com') || findUrl('linkedin'));
        setBtn('btn-youtube', findUrl('youtube'));
        setBtn('btn-spotify', findUrl('spotify'));

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
            const isMedium = type === 'medium';
            
            // Add specific class for sizing
            win.classList.add(`window-${type}`);
            
            /* Grid row spans are now handled in CSS for better responsiveness */

            // Common Text Content
            const titleDate = `
                <div style="flex-shrink:0; margin-bottom: 5px;">
                    <h3 style="margin:0;font-size:16px;">${project.title}</h3>
                    <p style="margin:2px 0;font-size:12px;"><strong>${project.date}</strong></p>
                </div>
            `;
            
            // Conditional summary style: Large items pack content at top; others fill space
            const summaryStyle = isLarge 
                ? 'margin:0; font-size:13px; line-height:1.3; padding-right:2px;' 
                : 'margin:0; font-size:13px; line-height:1.3; flex:1; overflow-y:auto; padding-right:2px;';

            const summary = project.summary ? 
                `<p style="${summaryStyle}">${project.summary}</p>` : 
                (isLarge ? '' : '<div style="flex:1;"></div>');
                
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
                internalContent = `
                    <div class="window-body" onclick="openProjectModal('${project.id}')" style="background-color:#fff; flex:1; display:flex; flex-direction:column; overflow-y:auto; overflow-x:hidden; padding:6px; gap:6px; margin:0; cursor: pointer;">
                        ${mediaEl ? `<div style="width:100%; aspect-ratio:1/1; flex-shrink:0; overflow:hidden; position:relative; background:black; border: 2px inset white; box-sizing:border-box;">${mediaEl}</div>` : ''}
                        <div style="flex:1; padding:0; display:flex; flex-direction:column; overflow:visible;">
                            ${titleDate}
                            ${summary}
                            ${readMoreBtn}
                        </div>
                    </div>
                `;
            } else if (isMedium) {
                // MEDIUM LAYOUT (Vertical Stack, Fixed Image Height)
                internalContent = `
                    <div class="window-body" onclick="openProjectModal('${project.id}')" style="background-color:#fff; flex:1; display:flex; flex-direction:column; overflow:hidden; padding:6px; gap:6px; margin:0; cursor: pointer;">
                        ${mediaEl ? `<div style="width:100%; height:200px; flex-shrink:0; border: 2px inset white;">${mediaEl}</div>` : ''}
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
                    <div class="window-body" onclick="openProjectModal('${project.id}')" style="background-color:#fff; flex:1; display:flex; flex-direction:row; overflow:hidden; padding:6px; gap:6px; margin:0; cursor: pointer;">
                        ${mediaEl ? `<div style="width:40%; flex-shrink:0; aspect-ratio:1/1; border: 2px inset white;">${mediaEl}</div>` : ''}
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

        // Dynamic Grid Layout (Masonry-like)
        const resizeGridItem = (item) => {
            const grid = document.getElementById("desktop-area");
            if (!grid) return;
            
            const rowHeight = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-auto-rows'));
            const rowGap = parseInt(window.getComputedStyle(grid).getPropertyValue('row-gap')) || 0;
            const marginBottom = parseInt(window.getComputedStyle(item).getPropertyValue('margin-bottom')) || 0;
            
            // Reset grid row to auto to calculate natural height first
            item.style.gridRowEnd = 'auto';
            
            // Calculate required span
            const contentHeight = item.querySelector('.window-body').getBoundingClientRect().height + item.querySelector('.title-bar').getBoundingClientRect().height;
            
            // If rowHeight is small (e.g., 1px), use simpler formula
            // Height needed = contentHeight + marginBottom (since rowGap is usually 0 when using 1px rows + margin)
            // Total height = span * rowHeight + (span - 1) * rowGap
            // If rowGap is 0: Total height = span * rowHeight
            // So span = Total height / rowHeight
            
            let rowSpan;
            if (rowGap === 0) {
                 rowSpan = Math.ceil((contentHeight + marginBottom) / rowHeight);
            } else {
                 rowSpan = Math.ceil((contentHeight + rowGap) / (rowHeight + rowGap));
            }
            
            item.style.gridRowEnd = "span " + rowSpan;
        };

        const resizeAllGridItems = () => {
            const allItems = document.getElementsByClassName("window");
            for (let x = 0; x < allItems.length; x++) {
                resizeGridItem(allItems[x]);
            }
        };

        // Run resize after creation and on window resize
        resizeAllGridItems();
        window.addEventListener("resize", resizeAllGridItems);
        
        // Also run after a short delay to ensure rendering is complete
        setTimeout(resizeAllGridItems, 100);

        // Store projects globally
        window.allProjects = items;

    } catch (e) {
        console.error(e);
        desktop.innerHTML = '<p style="color:white; padding:20px;">Error loading projects.</p>';
    }
}

function renderModal(item, mediaList) {
    const id = item.id;
    
    const descriptionHtml = item.description ? 
        item.description.split('\n').filter(p => p.trim()).map(p => `<p>${p}</p>`).join('') : 
        '<p>No detailed description available.</p>';

    // Check for Mobile View (iOS 6 Voice Control Theme)
    const isMobile = window.innerWidth <= 768;

    const modal = document.createElement('div');
    modal.className = isMobile ? 'ios-voice-modal' : 'window';
    modal.id = `modal-${id}`;
    
    if (isMobile) {
        // iOS 6 Standard Details View Theme Styles
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100vw';
        modal.style.height = '100vh';
        modal.style.zIndex = 10000;
        modal.style.background = '#c5ccd4'; // Standard iOS list/detail background
        modal.style.display = 'flex';
        modal.style.flexDirection = 'column';
        modal.style.overflow = 'hidden';
        modal.style.fontFamily = 'Helvetica, Arial, sans-serif';
        
        // Mobile Layout Content
        modal.innerHTML = `
            <!-- Top Navigation Bar -->
            <div style="
                height: 44px;
                background: linear-gradient(to bottom, #b0bccd 0%, #889bb3 50%, #8195af 51%, #6d84a2 100%);
                border-bottom: 1px solid #2d3642;
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 0 8px;
                box-shadow: 0 1px 2px rgba(0,0,0,0.3);
                flex-shrink: 0;
                position: relative;
                z-index: 10;
                box-sizing: border-box;
                padding-top: env(safe-area-inset-top);
                height: calc(44px + env(safe-area-inset-top));
            ">
                <!-- Back Button -->
                <button id="close-btn-${id}" style="
                    background: linear-gradient(to bottom, #6d84a2 0%, #3d526d 50%, #354a65 51%, #2b3f59 100%);
                    border: 1px solid #24354b;
                    border-radius: 4px;
                    color: white;
                    font-weight: bold;
                    padding: 6px 12px;
                    font-size: 13px;
                    text-shadow: 0 -1px 0 rgba(0,0,0,0.5);
                    cursor: pointer;
                    box-shadow: inset 0 1px 0 rgba(255,255,255,0.2), 0 1px 0 rgba(255,255,255,0.2);
                    font-family: Helvetica, Arial, sans-serif;
                    position: relative;
                    z-index: 20;
                ">Back</button>

                <!-- Title -->
                <div style="
                    color: white;
                    font-weight: bold;
                    font-size: 20px;
                    text-shadow: 0 -1px 0 rgba(0,0,0,0.5);
                    position: absolute;
                    left: 50%;
                    top: 50%;
                    transform: translate(-50%, -50%);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    max-width: 60%;
                    padding-top: env(safe-area-inset-top);
                ">${item.title}</div>

                <!-- Spacer -->
                <div style="width: 50px;"></div>
            </div>

            <!-- Main Scrollable Content Area -->
            <div style="
                flex: 1; 
                overflow-y: auto; 
                -webkit-overflow-scrolling: touch; 
                overscroll-behavior: contain;
                background: #c5ccd4;
                padding: 15px;
                display: flex;
                flex-direction: column;
                gap: 15px;
                box-sizing: border-box;
                width: 100%;
            ">
                <!-- Media Container (White Box) -->
                <div style="
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                    overflow: hidden;
                    border: 1px solid #a0a0a0;
                    display: flex;
                    flex-direction: column;
                ">
                    <!-- Main Media -->
                    <div id="media-view-${id}" style="
                        width: 100%; 
                        height: 350px; /* Fixed height for consistency */
                        max-height: 50vh; /* Don't take up too much vertical space */
                        min-height: 200px;
                        position: relative;
                        flex-shrink: 0;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        background: white; /* Transparent/White background */
                    ">
                        <!-- Media Injected Here -->
                    </div>

                    <!-- Counter Overlay -->
                    ${mediaList.length > 1 ? `
                    <div id="counter-${id}" style="
                        text-align: center;
                        padding: 5px;
                        font-size: 12px;
                        color: #666;
                        background: #f0f0f0;
                        border-bottom: 1px solid #e0e0e0;
                        flex-shrink: 0;
                    ">
                        Image 1 of ${mediaList.length}
                    </div>
                    ` : ''}

                    <!-- Thumbnails / Carousel Dots -->
                    <div id="thumbnails-${id}" style="
                        display: flex; 
                        gap: 8px; 
                        padding: 10px; 
                        overflow-x: auto; 
                        background: #f0f0f0;
                        border-top: 1px solid #e0e0e0;
                        justify-content: flex-start; /* Changed from center to allow scrolling start */
                        flex-shrink: 0;
                        -webkit-overflow-scrolling: touch;
                        min-height: 70px; /* Ensure space for thumbnails */
                    ">
                        <!-- Thumbnails injected here -->
                    </div>
                </div>

                <!-- Details Container (Grouped List Style) -->
                <div style="
                    background: white;
                    border-radius: 8px;
                    border: 1px solid #a0a0a0;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                    padding: 15px;
                ">
                    <h2 style="
                        margin: 0 0 10px 0; 
                        font-size: 18px; 
                        color: black;
                        font-family: Helvetica, Arial, sans-serif;
                    ">${item.title}</h2>
                    
                    <p style="
                        margin: 0 0 15px 0; 
                        color: #8e8e93; 
                        font-size: 14px;
                    "><strong>Date:</strong> ${item.date}</p>
                    
                    <div style="
                        font-size: 15px; 
                        line-height: 1.4; 
                        color: #000;
                    ">
                        ${descriptionHtml}
                    </div>
                </div>
                
                <!-- Bottom Spacer for safe area -->
                <div style="height: env(safe-area-inset-bottom); width: 100%;"></div>
            </div>
        `;
    } else {
        // Desktop Layout (Existing Windows 98 Style)
        modal.style.position = 'fixed';
        modal.style.top = '50%';
        modal.style.left = '50%';
        modal.style.transform = 'translate(-50%, -50%)';
        modal.style.width = '800px';
        modal.style.maxWidth = '95%';
        modal.style.height = 'auto';
        modal.style.maxHeight = '85vh';
        modal.style.overflow = 'hidden';
        modal.style.setProperty('display', 'flex', 'important');
        modal.style.flexDirection = 'column';
        modal.style.zIndex = 9999;
        modal.style.padding = '2px';
        modal.style.background = '#ffffff';
        modal.style.boxShadow = '0 0 20px rgba(0,0,0,0.5)';

        modal.innerHTML = `
            <div class="title-bar" style="background: linear-gradient(90deg, #808080, #c0c0c0);">
                <div class="title-bar-text" style="color: #e0e0e0;">${item.title}</div>
                <div class="title-bar-controls">
                    <button aria-label="Close"></button>
                </div>
            </div>
            <div class="window-body" style="flex: 1; overflow-y: auto; overflow-x: hidden; background: white; margin: 0; border: 8px solid #bdbdbdff; box-sizing: border-box; flex-direction: column;">
                <!-- Carousel Container -->
                <div id="carousel-${id}" style="padding: 15px; margin-bottom: 0; text-align: center; position: relative; width: 100%; box-sizing: border-box;">
                    
                    <div style="display: flex; align-items: center; justify-content: center; gap: 10px;">
                        <!-- Navigation Buttons (Left) -->
                        ${mediaList.length > 1 ? `
                            <button id="prev-btn-${id}" style="min-width: 80px; height: 30px; font-family: inherit; font-size: 14px; cursor: pointer; flex-shrink: 0; display: flex; align-items: center; justify-content: center; gap: 6px;">
                                <span style="font-size: 10px;">&#9668;</span> Prev
                            </button>
                        ` : ''}

                        <!-- Main Media View -->
                        <div id="media-view-${id}" style="position: relative; height: 350px; flex: 1; display: flex; align-items: center; justify-content: center; overflow: hidden; background: transparent;">
                            <!-- Media will be injected here -->
                        </div>

                        <!-- Navigation Buttons (Right) -->
                        ${mediaList.length > 1 ? `
                            <button id="next-btn-${id}" style="min-width: 80px; height: 30px; font-family: inherit; font-size: 14px; cursor: pointer; flex-shrink: 0; display: flex; align-items: center; justify-content: center; gap: 6px;">
                                Next <span style="font-size: 10px;">&#9658;</span>
                            </button>
                        ` : ''}
                    </div>

                    <!-- Thumbnails Strip -->
                    ${mediaList.length > 1 ? `
                        <div id="thumbnails-${id}" style="display: flex; gap: 10px; justify-content: center; margin-top: 10px; flex-wrap: wrap;">
                            <!-- Thumbnails will be injected here -->
                        </div>
                    ` : ''}

                </div>

                <div style="background: #e0e0e0; padding: 15px; flex: 1;">
                    <h2 style="margin-top: 0; font-size: 22px; text-align:left;">${item.title}</h2>
                    <p style="margin-bottom: 10px; color: #555; text-align:left;"><strong>Date:</strong> ${item.date}</p>
                    <div class="project-description" style="line-height: 1.5; font-size: 15px;  margin: 0 auto;">
                        ${descriptionHtml}
                    </div>
                </div>
            </div>
        `;
    }

    document.body.appendChild(modal);
    
    // Close button functionality
    if (isMobile) {
        document.getElementById(`close-btn-${id}`).onclick = () => modal.remove();
    } else {
        modal.querySelector('button[aria-label="Close"]').onclick = () => modal.remove();
    }
    
    // Logic for Carousel
    let currentIndex = 0;
    const mediaView = document.getElementById(`media-view-${id}`);
    const thumbContainer = document.getElementById(`thumbnails-${id}`);
    const prevBtn = document.getElementById(`prev-btn-${id}`);
    const nextBtn = document.getElementById(`next-btn-${id}`);

    function updateCarousel() {
        if (mediaList.length === 0) {
            mediaView.innerHTML = '<p style="color:white;">No media available</p>';
            return;
        }

        const item = mediaList[currentIndex];
        
        // Render Main Media
        if (item.type === 'video') {
            mediaView.innerHTML = `<video src="${item.src}" controls autoplay style="max-height:100%; max-width:100%; width:auto; height:auto; display:block; margin: 0 auto;"></video>`;
        } else {
            // Check mobile vs desktop for zoom interaction
            const cursorStyle = 'cursor: zoom-in;';
            const imgStyle = isMobile 
                ? 'max-height:100%; max-width:100%; width:auto; height:auto; display:block; margin: 0 auto; object-fit: contain;' 
                : 'max-height:100%; max-width:100%; width:auto; height:auto; border:none; display:block; margin: 0 auto; object-fit: contain;';
            
            mediaView.innerHTML = `<img src="${item.src}" class="zoomable-image" style="${imgStyle} ${cursorStyle}" alt="${item.caption || 'Project Image'}">`;
            
            const img = mediaView.querySelector('img');
            img.addEventListener('click', function() {
                // Create full-screen overlay
                const overlay = document.createElement('div');
                overlay.style.position = 'fixed';
                overlay.style.top = '0';
                overlay.style.left = '0';
                overlay.style.width = '100vw';
                overlay.style.height = '100vh';
                overlay.style.backgroundColor = 'rgba(0,0,0,0.95)';
                overlay.style.zIndex = '20000'; // Higher than mobile modal (10000)
                overlay.style.display = 'flex';
                overlay.style.alignItems = 'center';
                overlay.style.justifyContent = 'center';
                overlay.style.cursor = 'zoom-out';
                
                const fullImg = document.createElement('img');
                fullImg.src = this.src;
                fullImg.style.maxWidth = '100%';
                fullImg.style.maxHeight = '100%';
                fullImg.style.objectFit = 'contain';
                fullImg.style.boxShadow = '0 0 20px rgba(0,0,0,0.5)';
                
                overlay.appendChild(fullImg);
                document.body.appendChild(overlay);
                
                overlay.addEventListener('click', () => {
                    overlay.remove();
                });
            });
        }

        // Render Thumbnails (Both Desktop and Mobile)
        if (thumbContainer) {
            thumbContainer.innerHTML = mediaList.map((m, idx) => {
                const isActive = idx === currentIndex;
                // Adjust styles for mobile if needed
                const size = isMobile ? '50px' : '60px';
                const borderStyle = isActive ? 'border: 2px solid blue;' : 'border: 2px outset white;';
                
                if (m.type === 'video') {
                    return `
                        <div onclick="document.getElementById('modal-${id}').dispatchEvent(new CustomEvent('changeSlide', {detail: ${idx}}))" 
                             style="width: ${size}; height: ${size}; flex-shrink: 0; background: black; ${borderStyle} display: flex; align-items: center; justify-content: center; color: white; cursor: pointer;">
                            ▶
                        </div>
                    `;
                } else {
                    return `
                        <img src="${m.src}" 
                             onclick="document.getElementById('modal-${id}').dispatchEvent(new CustomEvent('changeSlide', {detail: ${idx}}))"
                             style="width: ${size}; height: ${size}; flex-shrink: 0; object-fit: cover; ${borderStyle} cursor: pointer;"
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

    // Mobile Swipe Support
    if (isMobile) {
        let touchStartX = 0;
        let touchEndX = 0;
        const mediaContainer = document.getElementById(`media-view-${id}`);
        
        if (mediaContainer) {
            mediaContainer.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
            }, {passive: true});

            mediaContainer.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].screenX;
                handleSwipe();
            }, {passive: true});
        }

        function handleSwipe() {
            const threshold = 50; // min distance for swipe
            if (touchEndX < touchStartX - threshold) {
                // Swiped Left -> Next
                if (mediaList.length > 1) {
                    currentIndex = (currentIndex + 1) % mediaList.length;
                    updateCarousel();
                }
            } else if (touchEndX > touchStartX + threshold) {
                // Swiped Right -> Prev
                if (mediaList.length > 1) {
                    currentIndex = (currentIndex - 1 + mediaList.length) % mediaList.length;
                    updateCarousel();
                }
            }
        }
    }

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

    // modal.querySelector('button[aria-label="Close"]').onclick = () => modal.remove();
    // makeDraggable(modal); // Disabled dragging for Read More modal
}

function openProjectModal(id) {
    console.log('openProjectModal called for:', id);
    const project = window.allProjects ? window.allProjects.find(p => p.id === id) : null;
    if (!project) {
        console.error('Project not found:', id);
        return;
    }
    
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

    renderModal(project, mediaList);
}

async function loadPictures() {
    const desktop = document.getElementById('desktop-area');
    if (!desktop) return;

    try {
        const response = await fetch('data/pictures.json?t=' + Date.now());
        if (!response.ok) throw new Error('Failed to load pictures');
        const data = await response.json();
        const items = Array.isArray(data.items) ? data.items : [];

        desktop.innerHTML = '';

        if (!items.length) {
            desktop.innerHTML = '<p style="color:white; padding:20px;">No pictures found.</p>';
            return;
        }

        items.forEach((item) => {
            const win = document.createElement('div');
            win.className = `window`;
            
            // Determine size based on type
            const type = item.type || 'small';
            const isLarge = type === 'large';
            const isMedium = type === 'medium';
            
            // Add specific class for sizing
            win.classList.add(`window-${type}`);
            
            /* Grid row spans are now handled in CSS for better responsiveness */

            // Common Text Content
            const titleDate = `
                <div style="flex-shrink:0; margin-bottom: 5px;">
                    <h3 style="margin:0;font-size:16px;">${item.title}</h3>
                    <p style="margin:2px 0;font-size:12px;"><strong>${item.date}</strong></p>
                </div>
            `;
            
            // Conditional summary style: Large items pack content at top; others fill space
            const summaryStyle = isLarge 
                ? 'margin:0; font-size:13px; line-height:1.3; padding-right:2px;' 
                : 'margin:0; font-size:13px; line-height:1.3; flex:1; overflow-y:auto; padding-right:2px;';

            const summary = item.summary ? 
                `<p style="${summaryStyle}">${item.summary}</p>` : 
                (isLarge ? '' : '<div style="flex:1;"></div>');
                
            const readMoreBtn = `<button class="read-more-btn" onclick="openPictureModal('${item.id}')" style="margin-top:5px; flex-shrink:0; align-self: flex-start;">Read More</button>`;

            // Media Generation
            let mediaEl = '';
            if (item.image) {
                const imgStyle = 'width:100%; height:100%; object-fit:cover; display:block;';
                mediaEl = `<img src="${item.image}" alt="${item.title || ''}" style="${imgStyle}">`;
            }

            let internalContent = '';

            if (isLarge) {
                internalContent = `
                    <div class="window-body" onclick="openPictureModal('${item.id}')" style="background-color:#fff; flex:1; display:flex; flex-direction:column; overflow-y:auto; overflow-x:hidden; padding:6px; gap:6px; margin:0; cursor: pointer;">
                        ${mediaEl ? `<div style="width:100%; aspect-ratio:1/1; flex-shrink:0; overflow:hidden; position:relative; background:black; border: 2px inset white; box-sizing:border-box;">${mediaEl}</div>` : ''}
                        <div style="flex:1; padding:0; display:flex; flex-direction:column; overflow:visible;">
                            ${titleDate}
                            ${summary}
                            ${readMoreBtn}
                        </div>
                    </div>
                `;
            } else if (isMedium) {
                // MEDIUM LAYOUT (Vertical Stack, Fixed Image Height) - COPIED FROM PROJECTS
                internalContent = `
                    <div class="window-body" onclick="openPictureModal('${item.id}')" style="background-color:#fff; flex:1; display:flex; flex-direction:column; overflow:hidden; padding:6px; gap:6px; margin:0; cursor: pointer;">
                        ${mediaEl ? `<div style="width:100%; height:200px; flex-shrink:0; border: 2px inset white;">${mediaEl}</div>` : ''}
                        <div style="flex:1; padding:0; display:flex; flex-direction:column; overflow:hidden;">
                            ${titleDate}
                            ${summary}
                            ${readMoreBtn}
                        </div>
                    </div>
                `;
            } else {
                // SHORT LAYOUT (Side-by-Side) for Small items - COPIED FROM PROJECTS
                internalContent = `
                    <div class="window-body" onclick="openPictureModal('${item.id}')" style="background-color:#fff; flex:1; display:flex; flex-direction:row; overflow:hidden; padding:6px; gap:6px; margin:0; cursor: pointer;">
                        ${mediaEl ? `<div style="width:40%; flex-shrink:0; aspect-ratio:1/1; border: 2px inset white;">${mediaEl}</div>` : ''}
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
                    <div class="title-bar-text">${item.title}</div>
                </div>
                ${internalContent}
            `;
            
            desktop.appendChild(win);
        });

        // Store pictures globally for the modal
        window.allPictures = items;

        // Dynamic Grid Layout (Masonry-like)
        const resizeGridItem = (item) => {
            const grid = document.getElementById("desktop-area");
            if (!grid) return;
            
            const rowHeight = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-auto-rows'));
            const rowGap = parseInt(window.getComputedStyle(grid).getPropertyValue('row-gap')) || 0;
            const marginBottom = parseInt(window.getComputedStyle(item).getPropertyValue('margin-bottom')) || 0;
            
            item.style.gridRowEnd = 'auto';
            
            const contentHeight = item.querySelector('.window-body').getBoundingClientRect().height + item.querySelector('.title-bar').getBoundingClientRect().height;
            
            let rowSpan;
            if (rowGap === 0) {
                 rowSpan = Math.ceil((contentHeight + marginBottom) / rowHeight);
            } else {
                 rowSpan = Math.ceil((contentHeight + rowGap) / (rowHeight + rowGap));
            }
            
            item.style.gridRowEnd = "span " + rowSpan;
        };

        const resizeAllGridItems = () => {
            const allItems = document.getElementsByClassName("window");
            for (let x = 0; x < allItems.length; x++) {
                resizeGridItem(allItems[x]);
            }
        };

        resizeAllGridItems();
        window.addEventListener("resize", resizeAllGridItems);
        
        // Also run after images load
        const images = desktop.querySelectorAll('img');
        images.forEach(img => {
             img.onload = resizeAllGridItems;
        });
        setTimeout(resizeAllGridItems, 100);

    } catch (e) {
        console.error(e);
        desktop.innerHTML = '<p style="color:white; padding:20px;">Error loading pictures.</p>';
    }
}

function openPictureModal(id) {
    const item = window.allPictures ? window.allPictures.find(p => p.id === id) : null;
    if (!item) return;
    
    // Check if modal already exists
    const existing = document.getElementById(`modal-${id}`);
    if (existing) {
        existing.style.display = 'block';
        bringToFront(existing);
        return;
    }

    // Collect all media items (Main Image + Gallery)
    const mediaList = [];
    if (item.image) {
        mediaList.push({
            type: 'image',
            src: item.image,
            caption: item.title || 'Main Image'
        });
    }
    if (item.gallery && Array.isArray(item.gallery)) {
        mediaList.push(...item.gallery);
    }

    renderModal(item, mediaList);
}
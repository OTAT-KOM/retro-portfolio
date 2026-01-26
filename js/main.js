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
        
        // Helper to check if date is valid
        const isValidDate = (d) => d && !isNaN(new Date(d).getTime());

        // Include events with missing dates in upcoming, sorted last
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
});

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
            // Check if content is markdown or plain text
            // Simple newline to <br> or <p> conversion if it's plain text from a simple textarea
            // But since we use markdown widget in CMS, it might be markdown.
            // For now, let's treat newlines as paragraphs
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

        // Summary
        if (data.summary_title) document.getElementById('about-title').innerText = data.summary_title;
        if (data.summary_text) document.getElementById('about-text').innerText = data.summary_text;
        if (data.summary_image) document.getElementById('about-image').src = data.summary_image;

        // Contact
        if (data.contact_email) document.getElementById('contact-email').value = data.contact_email;
        if (data.contact_phone) document.getElementById('contact-phone').value = data.contact_phone;

        // Socials
        const setBtn = (id, url) => {
            const btn = document.getElementById(id);
            if (btn && url) {
                btn.onclick = () => window.open(url, '_blank');
            } else if (btn) {
                btn.disabled = true;
            }
        };
        setBtn('btn-insta', data.instagram_url);
        setBtn('btn-twitter', data.twitter_url);
        setBtn('btn-tiktok', data.tiktok_url);

    } catch (e) {
        console.error('Error loading about:', e);
    }
}

function setupTabs() {
    const tabs = document.querySelectorAll('.tab-link');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active from all tabs
            tabs.forEach(t => t.removeAttribute('aria-selected'));
            // Add active to clicked
            tab.setAttribute('aria-selected', 'true');

            // Hide all content
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            // Show target content
            const targetId = tab.getAttribute('data-tab');
            const targetContent = document.getElementById('tab-content-' + targetId);
            if (targetContent) targetContent.classList.add('active');
        });
    });
}

async function loadProducts() {
    try {
        const response = await fetch('data/products.json?t=' + Date.now());
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        const items = Array.isArray(data.items) ? data.items : [];
        const grid = document.getElementById('products-grid');
        if (!grid) return;
        if (!items.length) {
            grid.innerHTML = '<p>No products yet.</p>';
            return;
        }
        grid.innerHTML = items.map(p => `
            <div class="window product-window">
                <div class="title-bar">
                    <div class="title-bar-text">?</div>
                    <div class="title-bar-controls">
                        <button aria-label="Minimize"></button>
                        <button aria-label="Maximize"></button>
                        <button aria-label="Close"></button>
                    </div>
                </div>
                <div class="window-body">
                    <div class="product-title">${p.title}</div>
                    <div class="product-image-container">
                        ${p.image ? `<img src="${p.image}" alt="${p.title}">` : ''}
                    </div>
                    <div class="product-details">
                        <div>
                            ${p.colors ? `<div>${p.colors}</div>` : ''}
                            ${p.price ? `<div class="product-price">${p.price}</div>` : ''}
                        </div>
                        ${p.buy_url ? `<a href="${p.buy_url}" class="buy-btn">${p.buy_text || 'Buy it'}</a>` : `<button class="buy-btn">${p.buy_text || 'Buy it'}</button>`}
                    </div>
                </div>
            </div>
        `).join('');
    } catch (e) {
        const grid = document.getElementById('products-grid');
        if (grid) grid.innerHTML = '<p>Error loading products.</p>';
    }
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

        // Render all images but hide them
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
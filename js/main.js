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
        const response = await fetch('data/events.json');
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
                            <div><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</div>
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
});

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

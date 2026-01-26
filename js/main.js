// Window Management
function openWindow(id) {
    const win = document.getElementById(id);
    if (win) {
        win.style.display = 'block'; // 98.css windows are block by default usually, but flex is fine too.
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

// Drag functionality
let isDragging = false;
let currentWindow = null;
let dragOffsetX = 0;
let dragOffsetY = 0;

// Update selector to .title-bar which is the new drag handle in 98.css
document.querySelectorAll('.title-bar').forEach(header => {
    header.addEventListener('mousedown', (e) => {
        // Prevent dragging if clicking controls
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

// Fetch Events
async function loadEvents() {
    try {
        const response = await fetch('data/events.json');
        if (!response.ok) {
             throw new Error('Network response was not ok');
        }
        const data = await response.json();
        const container = document.getElementById('events-list');
        
        if (!data.items || data.items.length === 0) {
            container.innerHTML = '<p>No events found.</p>';
            return;
        }

        container.innerHTML = data.items.map(event => `
            <div class="event-item">
                ${event.image ? `<img src="${event.image}" class="event-image" alt="${event.title}">` : ''}
                <h3 class="event-title">${event.title}</h3>
                <div class="event-details">
                    <div><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</div>
                    ${event.time ? `<div><strong>Time:</strong> ${event.time}</div>` : ''}
                    ${event.location ? `<div><strong>Location:</strong> ${event.location}</div>` : ''}
                    ${event.tickets ? `<div><strong>Tickets:</strong> ${event.tickets}</div>` : ''}
                </div>
                ${event.body ? `<button onclick="alert('${escapeHtml(event.body)}')">More details</button>` : ''}
            </div>
        `).join('');

    } catch (error) {
        console.error('Error loading events:', error);
        const container = document.getElementById('events-list');
        if (container) container.innerHTML = '<p>No events added yet or error loading.</p>';
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

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Only load events if the container exists
    if (document.getElementById('events-list')) {
        loadEvents();
    }
});

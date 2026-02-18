(function () {
    // --- Configuration & State ---
    const ADMIN_PASSWORD = "admin";
    let isAdmin = localStorage.getItem('pm_isAdmin') === 'true';
    let locations = [];
    let markers = {};
    let map;
    let isAddingLocation = false;
    let tempLatLng = null;
    let config = {
        serverUrl: '', // Base URL for assets/data
        containerId: ''
    };

    // --- Styles (Vanilla CSS replacement for Tailwind) ---
    const STYLES = `
        .pm-hidden { display: none !important; }
        .pm-flex { display: flex; }
        .pm-flex-col { display: flex; flex-direction: column; }
        .pm-items-center { align-items: center; }
        .pm-justify-center { justify-content: center; }
        .pm-justify-between { justify-content: space-between; }
        .pm-justify-end { justify-content: flex-end; }
        .pm-gap-2 { gap: 0.5rem; }
        .pm-gap-4 { gap: 1rem; }
        .pm-absolute { position: absolute; }
        .pm-fixed { position: fixed; }
        .pm-relative { position: relative; }
        .pm-inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
        .pm-bottom-4 { bottom: 1rem; }
        .pm-right-4 { right: 1rem; }
        .pm-bottom-6 { bottom: 1.5rem; }
        .pm-left-1_2 { left: 50%; }
        .pm-transform { transform: translateX(-50%); }
        .pm-z-50 { z-index: 50; }
        .pm-z-modal { z-index: 3000; }
        
        .pm-bg-white { background-color: white; }
        .pm-bg-gray-800 { background-color: #1f2937; }
        .pm-bg-black-60 { background-color: rgba(0, 0, 0, 0.6); }
        .pm-bg-blue-600 { background-color: #2563eb; }
        .pm-bg-red-600 { background-color: #dc2626; }
        .pm-bg-green-600 { background-color: #16a34a; }
        .pm-bg-purple-600 { background-color: #9333ea; }
        .pm-bg-gray-50 { background-color: #f9fafb; }
        
        .pm-text-white { color: white; }
        .pm-text-gray-800 { color: #1f2937; }
        .pm-text-gray-500 { color: #6b7280; }
        .pm-text-red-500 { color: #ef4444; }
        .pm-text-blue-600 { color: #2563eb; }
        .pm-text-green-600 { color: #16a34a; }
        .pm-text-purple-600 { color: #9333ea; }
        .pm-text-red-600 { color: #dc2626; }
        
        .pm-w-full { width: 100%; }
        .pm-h-full { height: 100%; }
        .pm-w-10 { width: 2.5rem; }
        .pm-h-10 { height: 2.5rem; }
        .pm-w-8 { width: 2rem; }
        .pm-h-8 { height: 2rem; }
        .pm-w-80 { width: 20rem; }
        .pm-w-96 { width: 24rem; }
        
        .pm-p-2 { padding: 0.5rem; }
        .pm-p-4 { padding: 1rem; }
        .pm-p-6 { padding: 1.5rem; }
        .pm-px-4 { padding-left: 1rem; padding-right: 1rem; }
        .pm-py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
        .pm-py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
        .pm-mb-2 { margin-bottom: 0.5rem; }
        .pm-mb-4 { margin-bottom: 1rem; }
        .pm-mr-2 { margin-right: 0.5rem; }
        .pm-ml-2 { margin-left: 0.5rem; }
        .pm-mt-2 { margin-top: 0.5rem; }
        
        .pm-rounded-full { border-radius: 9999px; }
        .pm-rounded-xl { border-radius: 0.75rem; }
        .pm-rounded-lg { border-radius: 0.5rem; }
        .pm-rounded { border-radius: 0.25rem; }
        
        .pm-shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
        .pm-shadow-2xl { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
        .pm-border { border: 1px solid #e5e7eb; }
        .pm-border-b { border-bottom: 1px solid #e5e7eb; }
        
        .pm-text-sm { font-size: 0.875rem; }
        .pm-text-xs { font-size: 0.75rem; }
        .pm-text-lg { font-size: 1.125rem; }
        .pm-text-xl { font-size: 1.25rem; }
        .pm-font-bold { font-weight: 700; }
        .pm-font-medium { font-weight: 500; }
        .pm-uppercase { text-transform: uppercase; }
        .pm-tracking-wider { letter-spacing: 0.05em; }
        
        .pm-cursor-pointer { cursor: pointer; }
        .pm-transition { transition: all 150ms ease-in-out; }
        .pm-hover-bg-gray-700:hover { background-color: #374151; }
        .pm-hover-bg-blue-700:hover { background-color: #1d4ed8; }
        .pm-hover-text-gray-700:hover { color: #374151; }
        
        .pm-backdrop-blur { backdrop-filter: blur(4px); }
        
        /* Map specific */
        .leaflet-popup-content-wrapper { border-radius: 0.5rem; padding: 0; }
        .leaflet-popup-content { margin: 0; width: 250px !important; }
        .custom-div-icon { background: transparent !important; border: none !important; }
        
        /* Input Reset */
        .pm-input { width: 100%; border: 1px solid #d1d5db; padding: 0.5rem; border-radius: 0.5rem; box-sizing: border-box; }
        .pm-btn { border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; }
    `;

    // --- Helpers ---
    function injectStyles() {
        const styleSheet = document.createElement("style");
        styleSheet.innerText = STYLES;
        document.head.appendChild(styleSheet);
    }

    function injectDependencies(callback) {
        // FontAwesome
        if (!document.querySelector('link[href*="font-awesome"]')) {
            const fa = document.createElement('link');
            fa.rel = 'stylesheet';
            fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
            document.head.appendChild(fa);
        }

        // Leaflet CSS
        if (!document.querySelector('link[href*="leaflet.css"]')) {
            const lcss = document.createElement('link');
            lcss.rel = 'stylesheet';
            lcss.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            document.head.appendChild(lcss);
        }

        // Leaflet JS
        if (typeof L === 'undefined') {
            const ljs = document.createElement('script');
            ljs.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            ljs.onload = callback;
            document.head.appendChild(ljs);
        } else {
            callback();
        }
    }

    function createUI() {
        const doc = document.body;

        // Login Button
        const loginBtn = document.createElement('button');
        loginBtn.id = 'pm-login-btn';
        loginBtn.className = 'pm-btn pm-fixed pm-bottom-4 pm-right-4 pm-bg-gray-800 pm-text-white pm-w-10 pm-h-10 pm-rounded-full pm-shadow-lg pm-hover-bg-gray-700 pm-transition pm-z-50';
        loginBtn.innerHTML = '<i class="fas fa-lock"></i>';
        loginBtn.onclick = () => document.getElementById('pm-login-modal').classList.remove('pm-hidden');
        doc.appendChild(loginBtn);

        // Admin Toolbar
        const toolbar = document.createElement('div');
        toolbar.id = 'pm-admin-toolbar';
        toolbar.className = 'pm-fixed pm-bottom-6 pm-left-1_2 pm-transform pm-bg-white pm-px-4 pm-py-2 pm-rounded-full pm-shadow-2xl pm-flex pm-gap-4 pm-items-center pm-z-50 pm-hidden pm-border';
        toolbar.innerHTML = `
            <span class="pm-text-xs pm-font-bold pm-text-gray-500 pm-uppercase pm-tracking-wider">Admin</span>
            <button id="pm-add-loc-btn" class="pm-btn pm-w-8 pm-h-8 pm-rounded-full pm-text-blue-600" title="Add Location"><i class="fas fa-map-marker-alt"></i></button>
            <button id="pm-manage-btn" class="pm-btn pm-w-8 pm-h-8 pm-rounded-full pm-text-green-600" title="Manage Data"><i class="fas fa-database"></i></button>
            <div class="pm-h-6 pm-w-px pm-bg-gray-200" style="width:1px; height:1.5rem; background:#e5e7eb;"></div>
            <button id="pm-logout-btn" class="pm-btn pm-w-8 pm-h-8 pm-rounded-full pm-text-red-600" title="Logout"><i class="fas fa-sign-out-alt"></i></button>
        `;
        doc.appendChild(toolbar);

        // Login Modal
        const loginModal = document.createElement('div');
        loginModal.id = 'pm-login-modal';
        loginModal.className = 'pm-fixed pm-inset-0 pm-bg-black-60 pm-backdrop-blur pm-flex pm-items-center pm-justify-center pm-z-modal pm-hidden';
        loginModal.innerHTML = `
            <div class="pm-bg-white pm-p-6 pm-rounded-xl pm-shadow-2xl pm-w-80">
                <h2 class="pm-text-lg pm-font-bold pm-mb-1 pm-text-gray-800">Admin Access</h2>
                <p class="pm-text-xs pm-text-gray-500 pm-mb-4">Enter password to edit map</p>
                <input type="password" id="pm-admin-pass" placeholder="Password" class="pm-input pm-mb-4">
                <div class="pm-flex pm-justify-end pm-gap-2">
                    <button class="pm-text-gray-500 pm-text-sm pm-p-2 pm-btn" onclick="document.getElementById('pm-login-modal').classList.add('pm-hidden')">Cancel</button>
                    <button id="pm-submit-login" class="pm-bg-blue-600 pm-text-white pm-px-4 pm-py-1 pm-rounded-lg pm-text-sm pm-font-medium pm-btn">Login</button>
                </div>
            </div>
        `;
        doc.appendChild(loginModal);

        // App Modal (Generic)
        const appModal = document.createElement('div');
        appModal.id = 'pm-app-modal';
        appModal.className = 'pm-fixed pm-inset-0 pm-bg-black-60 pm-backdrop-blur pm-flex pm-items-center pm-justify-center pm-z-modal pm-hidden';
        appModal.innerHTML = `
            <div class="pm-bg-white pm-p-6 pm-rounded-xl pm-shadow-2xl pm-w-96 pm-relative">
                <button class="pm-absolute pm-right-4 pm-text-gray-500 pm-btn" style="top:0.75rem;" onclick="document.getElementById('pm-app-modal').classList.add('pm-hidden')"><i class="fas fa-times"></i></button>
                <div id="pm-modal-content"></div>
            </div>
        `;
        doc.appendChild(appModal);

        // Wire up static events
        document.getElementById('pm-submit-login').onclick = handleLogin;
        document.getElementById('pm-logout-btn').onclick = logout;
        document.getElementById('pm-add-loc-btn').onclick = toggleAddLocationMode;
        document.getElementById('pm-manage-btn').onclick = openManageDataModal;
    }

    // --- Core Logic ---

    function updateAdminUI() {
        const loginBtn = document.getElementById('pm-login-btn');
        const toolbar = document.getElementById('pm-admin-toolbar');
        const loginModal = document.getElementById('pm-login-modal');

        // Check URL for edit-map param
        let showLoginParams = window.location.href.includes('edit-map');
        try { if (window.parent && window.parent.location.href.includes('edit-map')) showLoginParams = true; } catch (e) { }

        if (isAdmin) {
            loginBtn.classList.add('pm-hidden');
            toolbar.classList.remove('pm-hidden');
            loginModal.classList.add('pm-hidden');
        } else {
            toolbar.classList.add('pm-hidden');
            if (showLoginParams) loginBtn.classList.remove('pm-hidden');
            else loginBtn.classList.add('pm-hidden');
        }
    }

    function handleLogin() {
        const pass = document.getElementById('pm-admin-pass').value;
        if (pass === ADMIN_PASSWORD) {
            isAdmin = true;
            localStorage.setItem('pm_isAdmin', 'true');
            updateAdminUI();
            document.getElementById('pm-admin-pass').value = '';
        } else {
            alert('Invalid Password');
        }
    }

    function logout() {
        isAdmin = false;
        localStorage.removeItem('pm_isAdmin');
        updateAdminUI();
    }

    // --- Data ---
    async function loadData() {
        try {
            const res = await fetch(`${config.serverUrl}/locations.json`);
            if (!res.ok) throw new Error('Failed to load');
            locations = await res.json();
            if (!Array.isArray(locations)) locations = [];
            renderAllMarkers();
        } catch (e) {
            console.error(e);
            locations = [];
        }
    }

    async function saveData() {
        try {
            await fetch(`${config.serverUrl}/save-locations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(locations)
            });
            console.log("Saved");
        } catch (e) {
            alert("Failed to save. Is server running?");
        }
    }

    // --- Map Logic ---
    function initMap() {
        const mapContainer = document.getElementById(config.containerId);
        if (!mapContainer) return console.error("Map container not found");

        // Bounds
        const indiaBounds = L.latLngBounds(L.latLng(6.0, 68.0), L.latLng(37.5, 97.5));

        map = L.map(config.containerId, {
            maxBounds: indiaBounds,
            maxBoundsViscosity: 1.0,
            minZoom: 4,
            zoomControl: false,
            attributionControl: false
        }).setView([20.5937, 78.9629], 5);

        L.control.zoom({ position: 'topright' }).addTo(map);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

        // Load GeoJSONs
        Promise.all([
            fetch(`${config.serverUrl}/india-composite.geojson`).then(r => r.json()),
            fetch(`${config.serverUrl}/indian_states.json`).then(r => r.json())
        ]).then(([country, states]) => {
            // Mask
            const world = [[90, -180], [90, 180], [-90, 180], [-90, -180]];
            const holes = [];
            const toLatLng = c => c.map(p => [p[1], p[0]]);
            country.features.forEach(f => {
                if (f.geometry.type === 'Polygon') holes.push(toLatLng(f.geometry.coordinates[0]));
                else if (f.geometry.type === 'MultiPolygon') f.geometry.coordinates.forEach(p => holes.push(toLatLng(p[0])));
            });

            L.polygon([world, ...holes], { color: 'transparent', fillColor: '#ffffff', fillOpacity: 1, stroke: false }).addTo(map);
            L.polygon(holes, { color: '#000000', weight: 2, fillColor: '#67e8f9', fillOpacity: 0.4, stroke: true }).addTo(map);
            L.geoJSON(states, { style: { color: '#000000', weight: 1.5, opacity: 0.8, fillColor: 'transparent', fillOpacity: 0 } }).addTo(map);
        });

        // Event: Click map (for adding)
        map.on('click', (e) => {
            if (isAdmin && isAddingLocation) {
                openAddModal(e.latlng);
            }
        });

        loadData();
    }

    function renderAllMarkers() {
        locations.forEach(loc => renderMarker(loc));
    }

    function renderMarker(loc) {
        if (!loc.isActive && !isAdmin) {
            if (markers[loc.id]) { map.removeLayer(markers[loc.id]); delete markers[loc.id]; }
            return;
        }
        if (markers[loc.id]) map.removeLayer(markers[loc.id]);

        const count = loc.projects.length;
        const opacity = loc.isActive ? '' : 'opacity: 0.5; filter: grayscale(100%);';

        const icon = L.divIcon({
            className: 'custom-div-icon',
            html: `
                <div style="display:flex; flex-direction:column; align-items:center; ${opacity}">
                    <div style="position:relative; display:flex; justify-content:center; align-items:center;">
                        <i class="fas fa-map-marker-alt" style="font-size:30px; color:#dc2626; filter:drop-shadow(0 4px 3px rgb(0 0 0 / 0.07));"></i>
                        <div style="position:absolute; top:0; width:16px; height:16px; background:white; border-radius:50%; display:flex; justify-content:center; align-items:center;">
                             <span style="font-size:10px; font-weight:bold; color:#dc2626;">${count}</span>
                        </div>
                    </div>
                </div>
            `,
            iconSize: [30, 45],
            iconAnchor: [15, 45],
            popupAnchor: [0, -40]
        });

        const m = L.marker([loc.lat, loc.lng], { icon: icon }).addTo(map);

        // Popup Content
        const projectList = loc.projects.length > 0
            ? `<ul style="padding-left:1.25rem; margin-bottom:0.75rem;">
                ${loc.projects.map(p => `<li><strong>${p.projectName}</strong></li>`).join('')}
              </ul>`
            : `<p style="font-style:italic; color:#6b7280;">No projects.</p>`;

        const popupContent = `
            <div class="pm-p-4">
                <h3 class="pm-text-lg pm-font-bold pm-text-blue-600 pm-border-b pm-mb-2">
                    ${loc.location} ${!loc.isActive ? '<span class="pm-text-red-500 pm-text-xs">(Inactive)</span>' : ''}
                </h3>
                <h4 class="pm-text-xs pm-uppercase pm-font-bold pm-text-gray-500">Projects</h4>
                ${projectList}
            </div>
        `;

        m.bindPopup(popupContent);
        m.on('click', () => {
            if (isAdmin && !isAddingLocation) openEditModal(loc);
            else m.openPopup();
        });
        m.on('mouseover', () => { if (!isAdmin) m.openPopup(); });

        markers[loc.id] = m;
    }

    // --- Modals ---
    function openModal(html) {
        document.getElementById('pm-modal-content').innerHTML = html;
        document.getElementById('pm-app-modal').classList.remove('pm-hidden');
    }

    function toggleAddLocationMode() {
        isAddingLocation = !isAddingLocation;
        const btn = document.getElementById('pm-add-loc-btn');
        const mapDiv = document.getElementById(config.containerId);

        if (isAddingLocation) {
            btn.style.backgroundColor = '#dbeafe'; // blue-100
            mapDiv.style.cursor = 'crosshair';
        } else {
            btn.style.backgroundColor = '';
            mapDiv.style.cursor = '';
        }
    }

    function openAddModal(latlng) {
        tempLatLng = latlng;
        openModal(`
            <h2 class="pm-text-xl pm-font-bold pm-mb-4">Add Location</h2>
            <div class="pm-mb-4">
                <label class="pm-text-sm pm-font-bold">Location Name</label>
                <input type="text" id="pm-new-loc-name" class="pm-input">
            </div>
            <div class="pm-mb-4">
                 <label><input type="checkbox" id="pm-new-loc-active" checked> Is Active?</label>
            </div>
            <button id="pm-save-new-loc" class="pm-btn pm-bg-blue-600 pm-text-white pm-w-full pm-py-2 pm-rounded">Save</button>
        `);
        document.getElementById('pm-save-new-loc').onclick = () => {
            const name = document.getElementById('pm-new-loc-name').value;
            const active = document.getElementById('pm-new-loc-active').checked;
            if (name) {
                const newLoc = { id: 'loc_' + Date.now(), lat: tempLatLng.lat, lng: tempLatLng.lng, location: name, isActive: active, projects: [] };
                locations.push(newLoc);
                saveData();
                renderMarker(newLoc);
                toggleAddLocationMode();
                document.getElementById('pm-app-modal').classList.add('pm-hidden');
            }
        };
    }

    function openEditModal(loc) {
        window.currentLoc = loc;
        const renderProj = () => loc.projects.map((p, i) => `
            <div class="pm-flex pm-justify-between pm-bg-gray-50 pm-p-2 pm-mb-2">
                <span>${p.projectName}</span>
                <button onclick="window.pmDeleteProj('${loc.id}', ${i})" class="pm-text-red-500"><i class="fas fa-trash"></i></button>
            </div>
        `).join('');

        const getHtml = () => `
            <h2 class="pm-text-xl pm-font-bold pm-mb-2">Edit: ${loc.location}</h2>
            <div class="pm-mb-4 pm-border-b pm-py-2 pm-flex pm-justify-between">
                <label><input type="checkbox" id="pm-edit-active" ${loc.isActive ? 'checked' : ''}> Active</label>
                <div>
                     <button id="pm-update-status" class="pm-text-xs pm-bg-green-600 pm-text-white pm-px-2 pm-rounded">Update</button>
                     <button id="pm-delete-loc" class="pm-text-xs pm-bg-red-600 pm-text-white pm-px-2 pm-rounded">Delete</button>
                </div>
            </div>
            <div id="pm-proj-list">${renderProj()}</div>
            <div class="pm-flex pm-gap-2 pm-mt-2">
                <input id="pm-new-proj" class="pm-input" placeholder="New Project">
                <button id="pm-add-proj" class="pm-bg-blue-600 pm-text-white pm-px-4 pm-rounded"><i class="fas fa-plus"></i></button>
            </div>
        `;
        openModal(getHtml());

        // Bind events
        const bind = () => {
            document.getElementById('pm-update-status').onclick = () => {
                loc.isActive = document.getElementById('pm-edit-active').checked;
                saveData(); renderMarker(loc);
            };
            document.getElementById('pm-delete-loc').onclick = () => {
                if (confirm("Delete location?")) {
                    locations = locations.filter(l => l.id !== loc.id);
                    if (markers[loc.id]) map.removeLayer(markers[loc.id]);
                    saveData();
                    document.getElementById('pm-app-modal').classList.add('pm-hidden');
                }
            };
            document.getElementById('pm-add-proj').onclick = () => {
                const val = document.getElementById('pm-new-proj').value;
                if (val) {
                    loc.projects.push({ id: 'p_' + Date.now(), projectName: val });
                    saveData(); renderMarker(loc); openEditModal(loc);
                }
            };
        };
        bind();

        window.pmDeleteProj = (lid, idx) => {
            if (confirm("Delete Project?")) {
                loc.projects.splice(idx, 1);
                saveData(); renderMarker(loc); openEditModal(loc);
            }
        };
    }

    function openManageDataModal() {
        openModal(`
            <h2 class="pm-text-xl pm-font-bold pm-mb-4">Manage Data</h2>
            <button id="pm-dl-json" class="pm-btn pm-bg-green-600 pm-text-white pm-w-full pm-py-2 pm-mb-4 pm-rounded"><i class="fas fa-download pm-mr-2"></i> Download JSON</button>
            <p class="pm-font-bold">Import JSON</p>
            <input type="file" id="pm-import-json" accept=".json" class="pm-w-full">
        `);
        document.getElementById('pm-dl-json').onclick = () => {
            const s = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(locations));
            const a = document.createElement('a'); a.href = s; a.download = "map-data.json"; a.click();
        };
        document.getElementById('pm-import-json').onchange = (e) => {
            const f = e.target.files[0];
            if (!f) return;
            const r = new FileReader();
            r.onload = (ev) => {
                try {
                    const d = JSON.parse(ev.target.result);
                    if (Array.isArray(d)) {
                        if (confirm("Overwrite data?")) {
                            locations = d; saveData();
                            Object.values(markers).forEach(m => map.removeLayer(m));
                            markers = {}; renderAllMarkers();
                            document.getElementById('pm-app-modal').classList.add('pm-hidden');
                        }
                    }
                } catch (err) { alert("Invalid JSON"); }
            };
            r.readAsText(f);
        };
    }

    // --- Initialization ---
    window.initProjectMap = function (containerId, options = {}) {
        config.containerId = containerId;
        config.serverUrl = options.serverUrl || '';

        // Remove trailing slash
        if (config.serverUrl.endsWith('/')) config.serverUrl = config.serverUrl.slice(0, -1);

        injectStyles();
        injectDependencies(() => {
            createUI();
            updateAdminUI();
            initMap();
        });
    };

})();

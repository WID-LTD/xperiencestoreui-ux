/**
 * tracking.js - Live Order Tracking
 * Handles Leaflet map rendering, TomTom routing, and 17TRACK data display
 */

export const Tracking = {
    map: null,
    
    // Initialize tracking view
    init(trackingNumber) {
        if (!trackingNumber) {
            console.error('No tracking number provided');
            return;
        }

        this.fetchTrackingData(trackingNumber);
    },

    // Fetch data from backend API
    async fetchTrackingData(trackingNumber) {
        try {
            const container = document.getElementById('tracking-container');
            if (container) container.innerHTML = '<div class="flex justify-center p-10"><i data-lucide="loader-2" class="animate-spin w-8 h-8 text-blue-600"></i></div>';
            lucide.createIcons();

            const response = await fetch(window.apiUrl(`/api/tracking/${trackingNumber}`));
            const data = await response.json();

            if (data.success) {
                this.renderTrackingView(data);
            } else {
                this.renderError(data.message);
            }
        } catch (error) {
            console.error('Tracking fetch error:', error);
            this.renderError('Failed to load tracking information');
        }
    },

    // Render the main view
    renderTrackingView(data) {
        const container = document.getElementById('tracking-container');
        if (!container) return;

        // Calculate progress percentage
        const steps = ['Confirmed', 'Shipped', 'In Transit', 'Out for Delivery', 'Delivered'];
        const currentStepIndex = steps.indexOf(data.status) !== -1 ? steps.indexOf(data.status) : 1;
        const progress = Math.max(5, (currentStepIndex / (steps.length - 1)) * 100);

        container.innerHTML = `
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <!-- Status Column -->
                <div class="lg:col-span-1 space-y-6">
                    <div class="glass-card p-6 rounded-2xl">
                        <div class="flex items-center justify-between mb-4">
                            <div>
                                <h2 class="text-2xl font-bold text-slate-800">Order Status</h2>
                                <p class="text-sm text-slate-500">Tracking #${data.trackingNumber}</p>
                            </div>
                            <span class="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase">${data.status}</span>
                        </div>
                        
                        <!-- Progress Bar -->
                        <div class="relative h-2 bg-slate-100 rounded-full mb-8 overflow-hidden">
                            <div class="absolute top-0 left-0 h-full bg-blue-600 rounded-full transition-all duration-1000" style="width: ${progress}%"></div>
                        </div>

                        <!-- Events Timeline -->
                        <div class="space-y-6 relative pl-4 border-l-2 border-slate-100 ml-2">
                            ${data.events.map((event, index) => `
                                <div class="relative pl-6">
                                    <div class="absolute -left-[21px] top-0 w-4 h-4 rounded-full border-2 border-white ${index === 0 ? 'bg-blue-600 ring-4 ring-blue-100' : 'bg-slate-300'}"></div>
                                    <p class="font-bold text-slate-800 text-sm">${event.status}</p>
                                    <p class="text-xs text-slate-500">${event.location || ''}</p>
                                    <p class="text-xs text-slate-400 mt-1">${new Date(event.date).toLocaleString()}</p>
                                    <p class="text-sm text-slate-600 mt-1">${event.detail}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div class="glass-card p-6 rounded-2xl bg-blue-50 border-blue-100">
                        <h3 class="font-bold text-slate-800 mb-2">Estimated Delivery</h3>
                        <p class="text-2xl font-bold text-blue-600">${new Date(data.estimatedDelivery).toLocaleDateString()}</p>
                        <p class="text-xs text-slate-500 mt-1">By end of day</p>
                    </div>
                </div>

                <!-- Map Column -->
                <div class="lg:col-span-2">
                    <div id="tracking-map" class="w-full h-[500px] rounded-2xl overflow-hidden shadow-lg z-0 relative"></div>
                </div>
            </div>
        `;
        
        lucide.createIcons();
        this.initMap(data.route);
    },

    renderError(message) {
        const container = document.getElementById('tracking-container');
        if (container) {
            container.innerHTML = `
                <div class="glass-card p-8 rounded-2xl text-center">
                    <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i data-lucide="alert-triangle" class="w-8 h-8 text-red-600"></i>
                    </div>
                    <h3 class="text-xl font-bold text-slate-800 mb-2">Tracking Unavailable</h3>
                    <p class="text-slate-500 mb-6">${message}</p>
                    <button onclick="window.history.back()" class="bg-slate-100 px-6 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors">Go Back</button>
                </div>
            `;
            lucide.createIcons();
        }
    },

    // Initialize Leaflet Map
    initMap(routePoints) {
        if (!routePoints || routePoints.length === 0) return;

        // Coordinates: [lat, lng]
        const start = [routePoints[0].lat, routePoints[0].lng];
        const end = [routePoints[routePoints.length - 1].lat, routePoints[routePoints.length - 1].lng];
        const current = routePoints.length > 1 ? [routePoints[1].lat, routePoints[1].lng] : start;

        // Initialize map
        if (this.map) {
            this.map.remove(); // Clean up existing map instance
        }
        
        this.map = L.map('tracking-map').setView(current, 5);

        // Add Tile Layer (OpenStreetMap)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.map);

        // Custom Icons
        const warehouseIcon = L.divIcon({
            className: 'custom-div-icon',
            html: `<div style="background-color: #3b82f6; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
            iconSize: [12, 12],
            iconAnchor: [6, 6]
        });

        const truckIcon = L.divIcon({
            className: 'custom-div-icon',
            html: `<div style="background-color: #2563eb; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 17h4V5H2v12h3"/><path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5"/><path d="M14 17h1"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg></div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16]
        });

        const destIcon = L.divIcon({
            className: 'custom-div-icon',
            html: `<div style="background-color: #ef4444; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
            iconSize: [12, 12],
            iconAnchor: [6, 6]
        });

        // Add Markers
        L.marker(start, { icon: warehouseIcon }).addTo(this.map).bindPopup('Origin: ' + routePoints[0].name);
        L.marker(end, { icon: destIcon }).addTo(this.map).bindPopup('Destination: ' + routePoints[routePoints.length - 1].name);
        
        const truckMarker = L.marker(current, { icon: truckIcon, zIndexOffset: 1000 }).addTo(this.map).bindPopup('Current Location: ' + (routePoints[1]?.name || 'Unknown')).openPopup();

        // Draw Route (Polyline)
        // In a real scenario with TomTom API, fetching the route geometry would happen here
        // For now, we draw a straight line or dashed curve
        const latlngs = routePoints.map(p => [p.lat, p.lng]);
        const polyline = L.polyline(latlngs, {
            color: '#3b82f6',
            weight: 4,
            opacity: 0.7,
            dashArray: '10, 10', 
            lineCap: 'round'
        }).addTo(this.map);

        // Fit bounds to show the whole route
        this.map.fitBounds(polyline.getBounds(), { padding: [50, 50] });

        // If we had TomTom routing, we would fetch the actual road path here
        // this.fetchTomTomRoute(start, end);
    },

    // Placeholder for TomTom Routing (if needed later)
    async fetchTomTomRoute(start, end) {
        // const apiKey = 'TOMTOM_API_KEY';
        // const url = `https://api.tomtom.com/routing/1/calculateRoute/${start.join(',')}:${end.join(',')}/json?key=${apiKey}`;
        // ... fetch and draw GeoJSON layer
    }
};

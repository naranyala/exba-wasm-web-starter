import { ExbaComponent } from '@core/lifecycle/component';
import { styles as shellStyles } from '@shell/theme/styles';
import { t } from '@shell/theme/styles';
import L from 'leaflet';
import * as turf from '@turf/turf';

/**
 * A sophisticated map component integrating Leaflet.js and Turf.js.
 * 
 * Features:
 * - Interactive map rendering with Leaflet.
 * - Spatial analysis using Turf.js (distance calculation).
 * - Real-time marker placement and distance measurement.
 * - Scoped map styles and control integration.
 * 
 * @extends ExbaComponent
 */
export class LeafletTurfComponent extends ExbaComponent {
  static useShadow = true;

  private map: L.Map | null = null;
  private markers: L.Marker[] = [];
  private polyline: L.Polyline | null = null;

  static styles = {
    container: 'padding: 2rem; width: 100%; max-width: 900px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.5rem;',
    mapArea: `height: 500px; width: 100%; border: 1px solid ${t.zinc800}; border-radius: 1.5rem; background: ${t.zinc950}; overflow: hidden; z-index: 1;`,
    infoCard: `background: ${t.zinc900a}; border: 1px solid ${t.zinc800}; border-radius: 1.25rem; padding: 1.5rem; display: flex; flex-direction: column; gap: 0.75rem; backdrop-filter: blur(8px);`,
    title: `font-size: 0.75rem; font-weight: 800; color: ${t.zinc500}; text-transform: uppercase; letter-spacing: 0.1em;`,
    value: `font-size: 1.25rem; font-weight: 700; color: ${t.indigo300};`,
    instruction: `font-size: 0.875rem; color: ${t.zinc400};`,
    controls: 'display: flex; gap: 0.5rem; margin-bottom: 1rem;',
    btn: `background: ${t.zinc800}; border: 1px solid ${t.zinc700}; color: ${t.zinc300}; padding: 0.5rem 1rem; border-radius: 0.75rem; font-size: 0.8125rem; font-weight: 600; cursor: pointer; transition: all 0.2s; &:hover { background: ${t.indigo600a}; color: ${t.indigo300}; border-color: ${t.indigo500}; }`,
  };

  /**
   * Initializes the map and sets up event listeners on mount.
   */
  protected onMount() {
    this.setState({ distance: 0 });

    const mapEl = this.shadowRoot?.getElementById('map-container');
    if (!mapEl) return;

    // We need to inject Leaflet CSS manually into the shadow root
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    this.shadowRoot?.appendChild(link);

    link.onload = () => {
      this.map = L.map(mapEl).setView([51.505, -0.09], 13);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(this.map);

      this.map.on('click', (e: L.LeafletMouseEvent) => this.handleMapClick(e));
    };
  }

  /**
   * Handles map clicks by placing markers and calculating distance.
   */
  private handleMapClick(e: L.LeafletMouseEvent) {
    if (!this.map) return;

    if (this.markers.length >= 2) {
      this.clearMarkers();
    }

    const marker = L.marker(e.latlng).addTo(this.map);
    this.markers.push(marker);

    if (this.markers.length === 2) {
      this.calculateDistance();
    }
  }

  /**
   * Calculates the great-circle distance between two markers using Turf.js.
   */
  private calculateDistance() {
    if (this.markers.length < 2 || !this.map) return;

    const p1 = this.markers[0].getLatLng();
    const p2 = this.markers[1].getLatLng();

    const from = turf.point([p1.lng, p1.lat]);
    const to = turf.point([p2.lng, p2.lat]);
    const options: { units: 'kilometers' } = { units: 'kilometers' };

    const distance = turf.distance(from, to, options);
    this.setState({ distance });

    // Draw line between markers
    if (this.polyline) {
      this.polyline.remove();
    }
    this.polyline = L.polyline([p1, p2], { color: '#6366f1', weight: 4, opacity: 0.8, dashArray: '10, 10' }).addTo(this.map);
    this.map.fitBounds(this.polyline.getBounds(), { padding: [50, 50] });
  }

  /**
   * Clears all markers and polylines from the map.
   */
  private clearMarkers() {
    this.markers.forEach(m => m.remove());
    this.markers = [];
    if (this.polyline) {
      this.polyline.remove();
      this.polyline = null;
    }
    this.setState({ distance: 0 });
  }

  /**
   * Renders the map container and analysis dashboard.
   */
  render() {
    const dist = this.state.distance || 0;

    return `
      <div class="container">
        <h2 style="color: ${t.zinc100}; margin-bottom: 0.5rem; text-align: center;">Geospatial Analysis</h2>
        <p style="color: ${t.zinc500}; font-size: 0.875rem; text-align: center; margin-bottom: 1.5rem; margin-top: 0;">Leaflet.js Mapping + Turf.js Spatial Calculations</p>
        
        <div class="controls">
          <button class="btn" onclick="this.getRootNode().host.clearMarkers()">🗑️ Clear Map</button>
          <button class="btn" onclick="this.getRootNode().host.map.setView([51.505, -0.09], 13)">🎯 Reset View</button>
        </div>

        <div id="map-container" class="mapArea" data-persist></div>

        <div class="infoCard">
          <div class="title">Spatial Statistics</div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div class="value">${dist.toFixed(4)} km</div>
            <div class="instruction">${this.markers.length === 0 ? 'Click map to set start point' : this.markers.length === 1 ? 'Click map to set end point' : 'Markers set! Click again to restart.'}</div>
          </div>
        </div>
      </div>
    `;
  }
}


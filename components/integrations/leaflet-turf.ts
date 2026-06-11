import { ExbaComponent } from '@core/lifecycle/component';
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
  private extraLayers: L.LayerGroup = L.layerGroup();

  static styles = {
    container: 'padding: 2rem; width: 100%; max-width: 1200px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.5rem;',
    mapArea: `height: 800px; width: 100%; border: 1px solid ${t.zinc800}; border-radius: 1.5rem; background: ${t.zinc950}; overflow: hidden; z-index: 1;`,
    infoCard: `background: ${t.zinc900a}; border: 1px solid ${t.zinc800}; border-radius: 1.25rem; padding: 1.5rem; display: flex; flex-direction: column; gap: 0.75rem; backdrop-filter: blur(8px);`,
    title: `font-size: 0.75rem; font-weight: 800; color: ${t.zinc500}; text-transform: uppercase; letter-spacing: 0.1em;`,
    value: `font-size: 1.25rem; font-weight: 700; color: ${t.indigo300};`,
    instruction: `font-size: 0.875rem; color: ${t.zinc400};`,
    controls: 'display: flex; gap: 0.75rem; margin-bottom: 1rem; flex-wrap: wrap;',
    btn: `background: ${t.zinc800}; border: 1px solid ${t.zinc700}; color: ${t.zinc300}; padding: 0.75rem 1.25rem; border-radius: 0.75rem; font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 0.5rem; &:hover { background: ${t.indigo600a}; color: ${t.indigo300}; border-color: ${t.indigo500}; transform: translateY(-1px); }`,
    btnEmerald: `background: ${t.emerald600}22; border: 1px solid ${t.emerald600}55; color: ${t.emerald400}; &:hover { background: ${t.emerald600}44; border-color: ${t.emerald400}; }`,
    btnIndigo: `background: ${t.indigo600a}; border: 1px solid ${t.indigo500}55; color: ${t.indigo300}; &:hover { background: ${t.indigo600}44; border-color: ${t.indigo400}; }`,
    btnRed: `background: ${t.red600}22; border: 1px solid ${t.red600}55; color: #f87171; &:hover { background: ${t.red600}44; border-color: #f87171; }`,
  };

  /**
   * Initializes the map and sets up event listeners on mount.
   */
  protected onMount() {
    this.setState({ distance: 0, analysisText: 'Ready' });

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
      
      this.extraLayers.addTo(this.map);

      this.map.on('click', (e: L.LeafletMouseEvent) => this.handleMapClick(e));
    };

    // Bind public methods for buttons
    (this as any).clearMap = this.clearMarkers.bind(this);
    (this as any).resetView = () => this.map?.setView([51.505, -0.09], 13);
    (this as any).generateRandomPoints = this.generateRandomPoints.bind(this);
    (this as any).calculateConvexHull = this.calculateConvexHull.bind(this);
  }

  /**
   * Handles map clicks by placing markers and calculating distance.
   */
  private handleMapClick(e: L.LeafletMouseEvent) {
    if (!this.map) return;
    this.extraLayers.clearLayers();

    if (this.markers.length >= 2) {
      this.clearMarkers();
    }

    const marker = L.marker(e.latlng).addTo(this.map);
    this.markers.push(marker);
    this.setState({ analysisText: 'Point added' });

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
    this.setState({ distance, analysisText: 'Distance calculated' });

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
    this.extraLayers.clearLayers();
    this.setState({ distance: 0, analysisText: 'Map cleared' });
  }

  /**
   * Generates random points within the current map bounds.
   */
  private generateRandomPoints() {
    if (!this.map) return;
    this.clearMarkers();
    
    const bounds = this.map.getBounds();
    const bbox = [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()];
    
    // Generate 10 random points
    const points = turf.randomPoint(10, { bbox: bbox as any });
    
    points.features.forEach(feature => {
      const coords = feature.geometry.coordinates;
      const marker = L.circleMarker([coords[1], coords[0]], {
        color: '#34d399',
        fillColor: '#34d399',
        fillOpacity: 0.5,
        radius: 8
      });
      this.extraLayers.addLayer(marker);
    });
    
    this.setState({ distance: 0, analysisText: 'Generated 10 random points' });
  }

  /**
   * Calculates the convex hull of all current features (markers or random points)
   */
  private calculateConvexHull() {
    if (!this.map) return;
    
    const points: turf.Feature<turf.Point>[] = [];
    
    // Collect from standard markers
    this.markers.forEach(m => {
      const ll = m.getLatLng();
      points.push(turf.point([ll.lng, ll.lat]));
    });
    
    // Collect from extra layers (random points)
    this.extraLayers.eachLayer(layer => {
      if (layer instanceof L.CircleMarker) {
        const ll = layer.getLatLng();
        points.push(turf.point([ll.lng, ll.lat]));
      }
    });

    if (points.length < 3) {
      this.setState({ analysisText: 'Need at least 3 points for a Convex Hull!' });
      return;
    }

    const featureCollection = turf.featureCollection(points);
    const hull = turf.convex(featureCollection);

    if (hull) {
      const geojsonLayer = L.geoJSON(hull, {
        style: {
          color: '#818cf8',
          weight: 2,
          fillColor: '#6366f1',
          fillOpacity: 0.2
        }
      });
      this.extraLayers.addLayer(geojsonLayer);
      
      const center = turf.centerOfMass(hull);
      L.marker([center.geometry.coordinates[1], center.geometry.coordinates[0]], {
        icon: L.divIcon({
          className: 'custom-div-icon',
          html: '<div style="background-color: #818cf8; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>',
          iconSize: [12, 12]
        })
      }).addTo(this.extraLayers);

      this.setState({ analysisText: 'Convex Hull and Center of Mass calculated' });
    }
  }

  /**
   * Renders the map container and analysis dashboard.
   */
  render() {
    const dist = this.state.distance || 0;
    const analysisText = this.state.analysisText || '';

    return `
      <div class="container">
        <h2 style="color: ${t.zinc100}; margin-bottom: 0.5rem; text-align: center; font-size: 2rem;">Geospatial Analysis Workbench</h2>
        <p style="color: ${t.zinc400}; font-size: 1rem; text-align: center; margin-bottom: 2rem; margin-top: 0;">Interactive mapping with Leaflet.js and advanced spatial geometry via Turf.js</p>
        
        <div class="controls">
          <button class="btn btnRed" onclick="this.getRootNode().host.clearMap()">🗑️ Clear Map</button>
          <button class="btn" onclick="this.getRootNode().host.resetView()">🎯 Reset View</button>
          <div style="width: 1px; background: ${t.zinc800}; margin: 0 0.5rem;"></div>
          <button class="btn btnEmerald" onclick="this.getRootNode().host.generateRandomPoints()">🎲 Generate Random Points</button>
          <button class="btn btnIndigo" onclick="this.getRootNode().host.calculateConvexHull()">📐 Calculate Convex Hull</button>
        </div>

        <div id="map-container" class="mapArea" data-persist></div>

        <div class="infoCard">
          <div class="title">Analysis Results</div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div class="value">${dist > 0 ? `${dist.toFixed(4)} km` : analysisText}</div>
            <div class="instruction">${this.markers.length === 0 ? 'Click map to set start point' : this.markers.length === 1 ? 'Click map to set end point' : 'Markers set! Click again to restart.'}</div>
          </div>
        </div>
      </div>
    `;
  }
}


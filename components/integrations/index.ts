import { EXBA } from '@core/lifecycle/exba';
import { CytoscapeMindmap } from './cytoscape-mindmap';
import { VisMindmap } from './vis-mindmap';
import { LeafletTurfComponent } from './leaflet-turf';

/**
 * Registers all third-party library integration components.
 */
export function registerIntegrations() {
  EXBA.register('exba-cytoscape-mindmap', CytoscapeMindmap);
  EXBA.register('exba-vis-mindmap', VisMindmap);
  EXBA.register('exba-leaflet-turf', LeafletTurfComponent);
}

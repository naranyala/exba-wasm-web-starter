import { EXBA } from '@core/lifecycle/exba';
import { AudioDemo } from './audio-demo';
import { BatteryDemo } from './battery-demo';
import { CanvasDemo } from './canvas-demo';
import { ClipboardDemo } from './clipboard-demo';
import { EyeDropperDemo } from './eyedropper-demo';
import { FullscreenDemo } from './fullscreen-demo';
import { GeoDemo } from './geo-demo';
import { NetworkDemo } from './network-demo';
import { StorageDemo } from './storage-demo';
import { WakeLockDemo } from './wake-lock-demo';

/**
 * Registers all native browser API demonstration components.
 */
export function registerBrowserApiDemos() {
  EXBA.register('exba-audio-demo', AudioDemo);
  EXBA.register('exba-battery-demo', BatteryDemo);
  EXBA.register('exba-canvas-demo', CanvasDemo);
  EXBA.register('exba-clipboard-demo', ClipboardDemo);
  EXBA.register('exba-eyedropper-demo', EyeDropperDemo);
  EXBA.register('exba-fullscreen-demo', FullscreenDemo);
  EXBA.register('exba-geo-demo', GeoDemo);
  EXBA.register('exba-network-demo', NetworkDemo);
  EXBA.register('exba-storage-demo', StorageDemo);
  EXBA.register('exba-wake-lock-demo', WakeLockDemo);
}

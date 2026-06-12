import { EXBA } from '@core/lifecycle/exba';
import { HomeComponent } from './home';
import { WasmModal } from './modal';
import { StatusBar } from './status-bar';
import { TabBar } from './tab-bar';
import { ErrorOverlay } from './error-overlay';

/**
 * Registers internal framework shell components.
 */
export function registerInternal() {
  EXBA.register('exba-home', HomeComponent);
  EXBA.register('wasm-modal', WasmModal);
  EXBA.register('status-bar', StatusBar);
  EXBA.register('tab-bar', TabBar);
  EXBA.register('exba-error-overlay', ErrorOverlay);
}

export { HomeComponent, StatusBar, TabBar, WasmModal, ErrorOverlay };

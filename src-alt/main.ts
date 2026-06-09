import './style.css';
import { setup } from 'goober';
import init from '../public/wasm/wasm_logic.js';
import { fuzzySearch, startApp } from './app.js';

setup(null);

if (process.env.NODE_ENV !== 'test') {
  startApp();
}

export { fuzzySearch, startApp };

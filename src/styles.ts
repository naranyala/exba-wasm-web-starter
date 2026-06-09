import { css } from 'goober';

// ─── Design Tokens ─────────────────────────────────────────────
const t = {
  zinc50: '#fafafa',
  zinc100: '#f4f4f5',
  zinc200: '#e4e4e7',
  zinc300: '#d4d4d8',
  zinc400: '#a1a1aa',
  zinc500: '#71717a',
  zinc700: '#3f3f46',
  zinc800: '#27272a',
  zinc800a: 'rgba(39,39,42,0.5)',
  zinc900: '#18181b',
  zinc900a: 'rgba(24,24,27,0.92)',
  zinc950: '#09090b',
  indigo300: '#a5b4fc',
  indigo400: '#818cf8',
  indigo500: '#6366f1',
  indigo600: '#4f46e5',
  indigo600a: 'rgba(79,70,229,0.2)',
  indigo500a: 'rgba(99,102,241,0.15)',
  emerald400: '#34d399',
  emerald600: '#059669',
  red600: '#dc2626',
  white: '#fff',
};

const ease = '0.15s ease';

// ─── Base ──────────────────────────────────────────────────────
export const appBody = css`
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
  padding-top: 3rem;
  background: ${t.zinc900};
  color: ${t.zinc50};
  font-family: Inter, system-ui, -apple-system, sans-serif;
  line-height: 1.5;
  font-weight: 400;
  color-scheme: dark;
`;

export const appContainer = css`
  width: 100%;
  margin: 0;
  padding: 0;
`;

// ─── Layout ────────────────────────────────────────────────────
export const layoutShell = css`
  display: flex;
  height: calc(100vh - 3rem);
  background: ${t.zinc900};
  color: ${t.zinc100};
`;

export const sidebar = css`
  width: 16rem;
  flex-shrink: 0;
  border-right: 1px solid ${t.zinc800a};
  display: flex;
  flex-direction: column;
  background: ${t.zinc800a};
  padding-bottom: 2rem;
`;

export const sidebarHeader = css`
  padding: 1.25rem;
  font-size: 1.125rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  border-bottom: 1px solid ${t.zinc800a};
`;

export const sidebarSearch = css`
  padding: 0.75rem;
`;

export const menuGrid = css`
  flex: 1;
  overflow-y: auto;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
`;

export const mainContent = css`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding-bottom: 2rem;
`;

export const mainScroll = css`
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
`;

// ─── Menu Items ────────────────────────────────────────────────
export const menuItem = css`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.75rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background ${ease};
  &:hover {
    background: ${t.zinc800a};
  }
`;

export const menuItemIcon = css`
  font-size: 1rem;
  opacity: 0.7;
  transition: opacity ${ease};
  ${menuItem}:hover & {
    opacity: 1;
  }
`;

export const menuItemLabel = css`
  font-size: 0.875rem;
  color: ${t.zinc300};
  transition: color ${ease};
  ${menuItem}:hover & {
    color: ${t.zinc100};
  }
`;

// ─── Search Input ──────────────────────────────────────────────
export const searchInput = css`
  width: 100%;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid ${t.zinc700};
  background: ${t.zinc900a};
  color: ${t.zinc100};
  font-size: 0.875rem;
  font-family: inherit;
  outline: none;
  transition: border-color ${ease};
  &::placeholder {
    color: ${t.zinc500};
  }
  &:focus {
    border-color: ${t.indigo500};
  }
`;

// ─── Content Area ──────────────────────────────────────────────
export const viewHeading = css`
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 1rem;
  color: ${t.zinc200};
`;

export const executionLog = css`
  margin-top: 1rem;
  font-size: 0.875rem;
  font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
  color: ${t.indigo400};
  opacity: 0.5;
  transition: opacity ${ease};
  min-height: 1.5rem;
`;

export const executionLogActive = css`
  opacity: 1;
`;

// ─── Collapsible Sections ──────────────────────────────────────
export const sectionCard = css`
  border: 1px solid ${t.zinc800a};
  border-radius: 1rem;
  overflow: hidden;
  background: rgba(39, 39, 42, 0.25);
`;

export const sectionHeader = css`
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: background ${ease};
  &:hover {
    background: rgba(39, 39, 42, 0.3);
  }
`;

export const sectionTitle = css`
  font-size: 1.125rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
`;

export const sectionArrow = css`
  transition: transform 0.2s ease;
  color: ${t.zinc500};
  font-size: 0.75rem;
`;

export const sectionBody = css`
  padding: 1.5rem;
  border-top: 1px solid ${t.zinc800a};
`;

export const sectionBodyInner = css`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

// ─── Buttons ───────────────────────────────────────────────────
export const btn = css`
  padding: 0.5rem 1rem;
  font-size: 0.8125rem;
  font-family: inherit;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  color: ${t.white};
  transition: background ${ease};
`;

export const btnIndigo = css`
  background: ${t.indigo600};
  &:hover { background: ${t.indigo500}; }
`;

export const btnEmerald = css`
  background: ${t.emerald600};
  &:hover { background: ${t.emerald400}; }
`;

export const btnRed = css`
  background: ${t.red600};
  &:hover { background: #ef4444; }
`;

export const btnRow = css`
  display: flex;
  gap: 0.5rem;
`;

// ─── Greeting Panel ────────────────────────────────────────────
export const greetingPanel = css`
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  background: ${t.zinc800a};
  border-bottom: 1px solid ${t.zinc800a};
`;

export const greetingBox = css`
  font-size: 0.875rem;
  font-family: 'SF Mono', 'Fira Code', monospace;
  color: ${t.zinc400};
`;

export const stateCounter = css`
  font-size: 0.75rem;
  color: ${t.indigo300};
`;

// ─── Search (centered variant for view.ts) ─────────────────────
export const searchInputLg = css`
  width: 100%;
  max-width: 28rem;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border-radius: 0.75rem;
  border: 2px solid ${t.zinc700};
  background: ${t.zinc800};
  color: ${t.zinc100};
  font-family: inherit;
  outline: none;
  transition: border-color ${ease};
  &::placeholder {
    color: ${t.zinc500};
  }
  &:focus {
    border-color: ${t.indigo500};
  }
`;

export const searchCenter = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
`;

// ─── Code Examples ─────────────────────────────────────────────
export const codeCard = css`
  margin-bottom: 1rem;
  background: rgba(39, 39, 42, 0.25);
  border-radius: 0.75rem;
  border: 1px solid ${t.zinc800a};
  overflow: hidden;
`;

export const codeHeader = css`
  padding: 0.5rem 1rem;
  background: ${t.zinc800a};
  font-size: 0.75rem;
  font-family: 'SF Mono', 'Fira Code', monospace;
  color: ${t.zinc400};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const codeBody = css`
  padding: 1rem;
  overflow-x: auto;
  font-size: 0.875rem;
  font-family: 'SF Mono', 'Fira Code', monospace;
  color: ${t.indigo300};
  background: rgba(9, 9, 11, 0.5);
`;

// ─── Utilities ─────────────────────────────────────────────────
export const hidden = css`
  display: none;
`;

export const rotate180 = css`
  transform: rotate(180deg);
`;

// ─── Result Output ─────────────────────────────────────────────
export const resultText = css`
  margin-bottom: 0.5rem;
`;

export const resultCode = css`
  padding: 0.5rem;
  background: ${t.zinc950};
  border-radius: 0.25rem;
  font-size: 0.75rem;
  color: ${t.indigo300};
  font-family: 'SF Mono', 'Fira Code', monospace;
  overflow-x: auto;
`;

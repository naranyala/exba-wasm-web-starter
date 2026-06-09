import { css } from 'goober';

export const navBar = css`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 3rem;
  background: rgba(24, 24, 27, 0.92);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--zinc-700);
  display: flex;
  align-items: stretch;
  z-index: 100;
  @media (min-width: 640px) {
    height: 3.5rem;
  }
`;

export const homeButton = css`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  padding: 0 0.625rem;
  color: var(--zinc-100);
  cursor: pointer;
  font-weight: 500;
  font-size: 0.8125rem;
  white-space: nowrap;
  border: none;
  border-right: 1px solid var(--zinc-700);
  background: transparent;
  transition: background var(--transition);
  &:hover { background: var(--zinc-800); }
  &:active { background: var(--zinc-700); }
  @media (min-width: 640px) {
    padding: 0 1rem;
    font-size: 0.875rem;
    gap: 0.375rem;
  }
`;

export const appContainer = css`
  min-height: 100vh;
  background: var(--zinc-900);
  color: var(--zinc-100);
  padding-top: 3.5rem;
  padding-bottom: 2rem;
  @media (min-width: 640px) {
    padding-top: 5rem;
    padding-bottom: 2.5rem;
  }
`;

export const contentWrapper = css`
  width: 100%;
  max-width: 64rem;
  margin: 0 auto;
  padding: 1rem;
  @media (min-width: 640px) {
    padding: 1rem 2rem;
  }
  @media (min-width: 1024px) {
    padding: 1rem 4rem;
  }
`;

export const searchInput = css`
  width: 100%;
  max-width: 28rem;
  padding: 0.75rem 1rem;
  font-size: 0.9375rem;
  border-radius: var(--radius-lg);
  border: 1px solid var(--zinc-700);
  background: var(--zinc-800);
  color: var(--zinc-100);
  outline: none;
  transition: all var(--transition);
  &::placeholder { color: var(--zinc-400); }
  &:focus {
    border-color: var(--indigo-500);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
  }
`;

export const sectionContainer = css`
  border: 1px solid var(--zinc-700);
  border-radius: var(--radius-xl);
  overflow: hidden;
  background: rgba(39, 39, 42, 0.4);
  box-shadow: var(--shadow-lg);
`;

export const menuGrid = css`
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 0.5rem;
  padding: 0.5rem;
  @media (min-width: 640px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.625rem;
    padding: 0.75rem;
  }
  @media (min-width: 900px) {
    grid-template-columns: repeat(4, 1fr);
  }
  @media (min-width: 1200px) {
    grid-template-columns: repeat(5, 1fr);
    gap: 0.75rem;
    padding: 1rem;
  }
`;

export const menuItem = css`
  padding: 0.75rem;
  min-height: 4rem;
  background: var(--zinc-800);
  border: 1px solid var(--zinc-700);
  border-radius: var(--radius-lg);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  font-size: 0.8125rem;
  font-weight: 500;
  transition: all var(--transition);
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  &:hover {
    background: var(--zinc-700);
    border-color: var(--indigo-500);
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0,0,0,0.3);
  }
  &:active { transform: scale(0.97); }
  div:first-child { font-size: 1.5rem; }
  @media (min-width: 640px) {
    aspect-ratio: 1;
    min-height: 0;
    padding: 0.625rem;
    font-size: 0.75rem;
    div:first-child { font-size: 1.25rem; }
  }
  @media (min-width: 1200px) {
    padding: 0.75rem;
    font-size: 0.8125rem;
    div:first-child { font-size: 1.375rem; }
  }
`;

export const statusBar = css`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1.75rem;
  background: rgba(24, 24, 27, 0.92);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-top: 1px solid var(--zinc-700);
  color: var(--zinc-400);
  font-size: 0.625rem;
  display: flex;
  align-items: center;
  padding: 0 0.5rem;
  z-index: 100;
  font-family: 'SF Mono', 'Fira Code', monospace;
  cursor: pointer;
  transition: background var(--transition);
  &:hover { background: rgba(39, 39, 42, 0.95); }
  @media (min-width: 640px) {
    height: 2rem;
    font-size: 0.75rem;
    padding: 0 0.75rem;
  }
`;

export const modalBackdrop = css`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  padding: 1rem;
`;

export const modalContent = css`
  background: var(--zinc-900);
  border: 1px solid var(--zinc-700);
  border-radius: var(--radius-lg);
  width: 100%;
  max-width: 44rem;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  color: var(--zinc-100);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
  @media (min-width: 640px) {
    border-radius: var(--radius-xl);
    padding: 1.5rem;
    max-height: 85vh;
  }
`;

export const crudButton = css`
  padding: 0.5rem 0.75rem;
  font-size: 0.75rem;
  cursor: pointer;
  border-radius: var(--radius-sm);
  border: 1px solid var(--zinc-700);
  background: var(--zinc-800);
  color: var(--zinc-400);
  transition: all var(--transition);
  min-height: 2.25rem;
  &:hover { background: var(--zinc-700); color: var(--zinc-100); }
  @media (min-width: 640px) {
    padding: 0.375rem 0.625rem;
    min-height: auto;
  }
`;

export const addButton = css`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
  cursor: pointer;
  border-radius: var(--radius-md);
  border: 1px solid var(--indigo-500);
  background: var(--indigo-500);
  color: white;
  font-weight: 500;
  transition: all var(--transition);
  min-height: 2.5rem;
  &:hover { background: var(--indigo-600); border-color: var(--indigo-600); }
  &:active { transform: scale(0.97); }
  @media (min-width: 640px) {
    padding: 0.5rem 1rem;
    min-height: auto;
  }
`;

export const splitPanel = css`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-height: 0;
  @media (min-width: 768px) {
    flex-direction: row;
  }
`;

export const tableContainer = css`
  flex: 1;
  min-width: 0;
  overflow: auto;
  border: 1px solid var(--zinc-700);
  border-radius: var(--radius-lg);
  background: var(--zinc-900);
`;

export const formPanel = css`
  width: 100%;
  flex-shrink: 0;
  padding: 1.25rem;
  background: var(--zinc-800);
  border: 1px solid var(--zinc-700);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  overflow-y: auto;
  max-height: none;
  @media (min-width: 768px) {
    width: 22rem;
    max-height: 70vh;
  }
`;

export const formField = css`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  label { font-size: 0.75rem; color: var(--zinc-400); font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; }
  input {
    padding: 0.5rem 0.625rem;
    background: var(--zinc-900);
    border: 1px solid var(--zinc-700);
    color: var(--zinc-100);
    border-radius: var(--radius-sm);
    font-size: 0.875rem;
    outline: none;
    transition: border-color var(--transition);
    &:focus { border-color: var(--indigo-500); }
  }
`;

export const formActions = css`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

export const searchWrapper = css`
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
  @media (min-width: 640px) {
    margin-bottom: 1.25rem;
  }
`;

export const homeHeader = css`
  text-align: center;
  margin-bottom: 0.75rem;
  h1 {
    font-size: 1.125rem;
    font-weight: 700;
    margin: 0 0 0.125rem;
    background: linear-gradient(135deg, var(--zinc-100), var(--indigo-500));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  p {
    margin: 0;
    color: var(--zinc-400);
    font-size: 0.8125rem;
  }
  @media (min-width: 640px) {
    margin-bottom: 1rem;
    h1 { font-size: 1.25rem; }
  }
`;

export const sectionHeading = css`
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--zinc-400);
  margin: 1rem 0 0.375rem;
  @media (min-width: 640px) {
    margin: 1.25rem 0 0.5rem;
    font-size: 0.75rem;
  }
`;

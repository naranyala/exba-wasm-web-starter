import { css } from 'goober';
import { ExbaComponent } from '../../core/component';

const greeting = css`
  font-family: system-ui, sans-serif;
  padding: 1rem 1.5rem;
  background: rgba(39, 39, 42, 0.5);
  color: #a5b4fc;
  border-radius: 0.75rem;
  border: 1px solid rgba(39, 39, 42, 0.5);
  display: inline-block;
  font-size: 0.875rem;
`;

const highlight = css`
  color: #818cf8;
  font-weight: 600;
`;

export class ExbaGreeting extends ExbaComponent {
  static get observedAttributes() {
    return ['name'];
  }

  render() {
    const name = this.getAttribute('name') || 'Guest';
    return `
      <div class="${greeting}">
        Hello, <span class="${highlight}">${name}</span>! Welcome to EXBA Framework.
      </div>
    `;
  }
}

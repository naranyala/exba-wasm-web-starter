import { BaexComponent } from '../baex';

export class BaexGreeting extends BaexComponent {
  static get observedAttributes() {
    return ['name'];
  }

  render() {
    const name = this.getAttribute('name') || 'Guest';
    return `
      <style>
        .greeting {
          font-family: system-ui, sans-serif;
          padding: 1rem;
          background: #2d2d2d;
          color: #a5b4fc;
          border-radius: 0.5rem;
          border: 1px solid #444;
          display: inline-block;
        }
        .highlight {
          color: #818cf8;
          font-weight: bold;
        }
      </style>
      <div class="greeting">
        Hello, <span class="highlight">${name}</span>! Welcome to BAEX Framework.
      </div>
    `;
  }
}

import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/dom';
import './tab-bar.js';

describe('tab-bar component', () => {
  it('should render', () => {
    document.body.innerHTML = '<tab-bar id="test-tab-bar" data-testid="test-tab-bar"></tab-bar>';
    const tabBar = screen.getByTestId('test-tab-bar'); 
    expect(tabBar).toBeDefined();
  });
});

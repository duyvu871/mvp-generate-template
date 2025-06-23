import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { displayWelcome } from './ascii.js';

describe('ASCII Utils', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe('displayWelcome', () => {
    it('should display welcome message with ASCII art', () => {
      displayWelcome();

      expect(consoleSpy).toHaveBeenCalledTimes(2);
      
      // Check that ASCII art is displayed
      const firstCall = consoleSpy.mock.calls[0][0];
      expect(firstCall).toContain('███');
      expect(firstCall).toContain('MVP');
      expect(firstCall).toContain('GEN');

      // Check that welcome text is displayed
      const secondCall = consoleSpy.mock.calls[1][0];
      expect(secondCall).toContain('Project Template Generator');
      expect(secondCall).toContain('🚀');
    });

    it('should display colored output', () => {
      displayWelcome();

      const firstCall = consoleSpy.mock.calls[0][0];
      const secondCall = consoleSpy.mock.calls[1][0];

      // Check for ANSI color codes (chalk adds these)
      expect(firstCall).toMatch(/\u001b\[\d+m/); // ANSI color codes
      expect(secondCall).toMatch(/\u001b\[\d+m/);
    });
  });
}); 
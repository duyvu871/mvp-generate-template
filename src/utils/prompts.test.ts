import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import inquirer from 'inquirer';

import {
  determineTemplate,
  confirmTypeScript,
  confirmESBuild,
} from './prompts.js';

// Mock inquirer
vi.mock('inquirer', () => ({
  default: {
    prompt: vi.fn(),
  },
}));

describe('Prompts Utils', () => {
  const mockPrompt = inquirer.prompt as unknown as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('determineTemplate', () => {
    it('should return selected template', async () => {
      mockPrompt.mockResolvedValue({ template: 'express-hbs' });

      const result = await determineTemplate();

      expect(result).toBe('express-hbs');
      expect(mockPrompt).toHaveBeenCalledWith([
        {
          type: 'list',
          name: 'template',
          message: 'Select a project template:',
          choices: expect.arrayContaining([
            expect.objectContaining({
              name: expect.stringContaining('Express + Handlebars'),
              value: 'express-hbs',
            }),
          ]),
        },
      ]);
    });

    it('should include all available templates', async () => {
      mockPrompt.mockResolvedValue({ template: 'basic-node' });

      await determineTemplate();

      const promptCall = mockPrompt.mock.calls[0][0][0];
      expect(promptCall.choices).toHaveLength(4);
      expect(promptCall.choices.map((choice: any) => choice.value)).toEqual([
        'express-hbs',
        'express-api',
        'node-cli',
        'basic-node',
      ]);
    });
  });

  describe('confirmTypeScript', () => {
    it('should return true when user confirms TypeScript', async () => {
      mockPrompt.mockResolvedValue({ useTypeScript: true });

      const result = await confirmTypeScript();

      expect(result).toBe(true);
      expect(mockPrompt).toHaveBeenCalledWith([
        {
          type: 'confirm',
          name: 'useTypeScript',
          message: 'Add TypeScript support?',
          default: true,
        },
      ]);
    });

    it('should return false when user declines TypeScript', async () => {
      mockPrompt.mockResolvedValue({ useTypeScript: false });

      const result = await confirmTypeScript();

      expect(result).toBe(false);
    });
  });

  describe('confirmESBuild', () => {
    it('should return true when user confirms ESBuild', async () => {
      mockPrompt.mockResolvedValue({ useESBuild: true });

      const result = await confirmESBuild();

      expect(result).toBe(true);
      expect(mockPrompt).toHaveBeenCalledWith([
        {
          type: 'confirm',
          name: 'useESBuild',
          message: 'Add ESBuild for fast compilation?',
          default: false,
        },
      ]);
    });

    it('should return false when user declines ESBuild', async () => {
      mockPrompt.mockResolvedValue({ useESBuild: false });

      const result = await confirmESBuild();

      expect(result).toBe(false);
    });

    it('should default to false for ESBuild', async () => {
      mockPrompt.mockResolvedValue({ useESBuild: false });

      await confirmESBuild();

      const promptCall = mockPrompt.mock.calls[0][0][0];
      expect(promptCall.default).toBe(false);
    });
  });
}); 
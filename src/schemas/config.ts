import { z } from 'zod';

// Schema for template configuration options
export const TemplateOptionSchema = z.enum(['ts', 'esbuild', 'nextjs', 'react', 'vue', 'docker', 'mongodb', 'postgresql']);

// Schema for individual template configuration
export const TemplateConfigSchema = z.object({
  path: z.string().min(1, 'Template path cannot be empty'),
  name: z.string().min(1, 'Template name cannot be empty'),
  description: z.string().optional(),
  options: z.array(TemplateOptionSchema).default([]),
  category: z.string().optional(),
  priority: z.number().int().min(0).optional().default(0),
  deprecated: z.boolean().optional().default(false),
  experimental: z.boolean().optional().default(false)
});

// Schema for templates configuration (JSON config)
export const TemplatesConfigSchema = z.object({
  version: z.string().default('1.0.0'),
  templates: z.array(TemplateConfigSchema),
  defaultOptions: z.object({
    typescript: z.boolean().optional().default(true),
    esbuild: z.boolean().optional().default(true),
    npmInstall: z.boolean().optional().default(true)
  }).optional()
});

// Schema for prompt step configuration
export const PromptStepSchema = z.object({
  type: z.enum(['list', 'confirm', 'input', 'checkbox', 'password']),
  name: z.string().min(1),
  message: z.string().min(1),
  choices: z.array(z.object({
    name: z.string(),
    value: z.any(),
    description: z.string().optional()
  })).optional(),
  default: z.any().optional(),
  validate: z.string().optional(), // Function name for validation
  when: z.string().optional(), // Condition function name
  filter: z.string().optional(), // Filter function name
  required: z.boolean().optional().default(false),
  // Display configuration for choices
  pageSize: z.number().optional(),
  loop: z.boolean().optional(),
  // Template specific display options
  templateDisplay: z.object({
    showDescription: z.boolean().optional().default(true),
    showCategory: z.boolean().optional().default(false),
    showOptions: z.boolean().optional().default(true),
    maxWidth: z.number().optional().default(80),
    separator: z.string().optional().default(' - ')
  }).optional()
});

// Schema for workflow configuration (YAML config)
export const WorkflowConfigSchema = z.object({
  version: z.string().default('1.0.0'),
  name: z.string().min(1),
  description: z.string().optional(),
  steps: z.array(PromptStepSchema),
  postProcess: z.object({
    updatePackageJson: z.boolean().optional().default(true),
    installDependencies: z.boolean().optional().default(false),
    customScripts: z.array(z.string()).optional().default([])
  }).optional()
});

// Schema for combined configuration
export const ConfigSchema = z.object({
  workflow: WorkflowConfigSchema.optional(),
  templates: TemplatesConfigSchema.optional()
});

// Type exports for use in the application
export type TemplateOption = z.infer<typeof TemplateOptionSchema>;
export type TemplateConfig = z.infer<typeof TemplateConfigSchema>;
export type TemplatesConfig = z.infer<typeof TemplatesConfigSchema>;
export type PromptStep = z.infer<typeof PromptStepSchema>;
export type WorkflowConfig = z.infer<typeof WorkflowConfigSchema>;
export type Config = z.infer<typeof ConfigSchema>; 
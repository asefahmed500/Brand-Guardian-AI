
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-compliance-score.ts';
import '@/ai/flows/offer-brand-fixes.ts';
import '@/ai/flows/analyze-brand-assets.ts';
import '@/ai/flows/apply-brand-fixes.ts';
import '@/ai/flows/generate-brand-templates.ts';
import '@/ai/flows/tag-brand-asset.ts';
import '@/ai/flows/send-password-reset-email.ts';
import '@/ai/flows/brand-assistant.ts';
import '@/ai/flows/detect-guideline-conflicts.ts';
import '@/ai/flows/highlight-design-differences.ts';
import '@/ai/flows/extract-colors-from-image.ts';
import '@/ai/flows/generate-layout-suggestion.ts';
import '@/ai/flows/prompt-to-design.ts';
import '@/ai/flows/enhance-sketch.ts';
import '@/ai/flows/colorize-sketch.ts';

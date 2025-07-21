
'use server';

/**
 * @fileOverview An AI agent that detects potential conflicts in brand guidelines.
 *
 * - detectGuidelineConflicts - A function that analyzes a brand fingerprint for issues.
 * - DetectGuidelineConflictsInput - The input type for the function.
 * - DetectGuidelineConflictsOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const DetectGuidelineConflictsInputSchema = z.object({
  brandFingerprint: z.string().describe('A JSON string representing the brand fingerprint to be analyzed.'),
});
export type DetectGuidelineConflictsInput = z.infer<typeof DetectGuidelineConflictsInputSchema>;


const ConflictSchema = z.object({
    type: z.enum(['warning', 'critical']).describe('The severity of the conflict.'),
    description: z.string().describe('A clear, user-friendly description of the detected conflict or issue.'),
});

const DetectGuidelineConflictsOutputSchema = z.object({
  conflicts: z.array(ConflictSchema).describe('A list of potential conflicts found in the brand guidelines.'),
});
export type DetectGuidelineConflictsOutput = z.infer<typeof DetectGuidelineConflictsOutputSchema>;


export async function detectGuidelineConflicts(
  input: DetectGuidelineConflictsInput
): Promise<DetectGuidelineConflictsOutput> {
  return detectGuidelineConflictsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectGuidelineConflictsPrompt',
  input: { schema: DetectGuidelineConflictsInputSchema },
  output: { schema: DetectGuidelineConflictsOutputSchema },
  prompt: `You are an expert design systems consultant. Your task is to analyze a set of brand guidelines (a "brand fingerprint") and identify potential issues, contradictions, or violations of design best practices.

Analyze the provided Brand Fingerprint for the following types of conflicts:
1.  **Color Contrast**: Check if any primary or secondary colors have poor contrast against each other, which could lead to accessibility issues (WCAG AA standard). Flag any problematic pairs.
2.  **Typographic Contradictions**: Look for conflicting statements in the typography description. For example, if it says "use a minimalist, clean sans-serif" but also mentions "ornate, decorative headlines."
3.  **Vague or Unactionable Rules**: Identify descriptions that are too subjective to be useful for a designer or AI, such as "make it look 'cool'" or "use a 'nice' layout." Suggest making it more specific.
4.  **Excessive Complexity**: Warn if the guidelines are overly complex, for example, listing too many primary colors (more than 3-4) or having a very convoluted typography system that might be hard to maintain.

For each issue you find, create a conflict object with a 'type' ('warning' for subjective/minor issues, 'critical' for accessibility or direct contradictions) and a 'description'. If no conflicts are found, return an empty array.

Brand Fingerprint to Analyze:
{{{brandFingerprint}}}

Provide the output in the specified JSON format.
`,
});

const detectGuidelineConflictsFlow = ai.defineFlow(
  {
    name: 'detectGuidelineConflictsFlow',
    inputSchema: DetectGuidelineConflictsInputSchema,
    outputSchema: DetectGuidelineConflictsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);

// src/ai/flows/generate-compliance-score.ts
'use server';

/**
 * @fileOverview A brand compliance scoring AI agent.
 *
 * - generateComplianceScore - A function that handles the brand compliance scoring process.
 * - GenerateComplianceScoreInput - The input type for the generateComplianceScore function.
 * - GenerateComplianceScoreOutput - The return type for the generateComplianceScore function.
 */

import {ai} from '@/ai/genkit';
import { extractMimeType } from '@/lib/utils';
import {z} from 'genkit';

const GenerateComplianceScoreInputSchema = z.object({
  designDataUri: z
    .string()
    .describe(
      "A data URI of the design, including MIME type and Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  brandFingerprint: z.string().describe('A JSON string representing the brand fingerprint.'),
  designContext: z.string().describe('The context of the design (e.g., "Social Media Post", "Business Presentation").'),
});
export type GenerateComplianceScoreInput = z.infer<typeof GenerateComplianceScoreInputSchema>;

const GenerateComplianceScoreOutputSchema = z.object({
  complianceScore: z.number().describe('The compliance score of the design, from 0 to 100.'),
  feedback: z.string().describe('Feedback on the design, explaining the score.'),
});
export type GenerateComplianceScoreOutput = z.infer<typeof GenerateComplianceScoreOutputSchema>;

export async function generateComplianceScore(input: GenerateComplianceScoreInput): Promise<GenerateComplianceScoreOutput> {
  return generateComplianceScoreFlow(input);
}

const generateComplianceScoreFlow = ai.defineFlow(
  {
    name: 'generateComplianceScoreFlow',
    inputSchema: GenerateComplianceScoreInputSchema,
    outputSchema: GenerateComplianceScoreOutputSchema,
  },
  async input => {
    const {output} = await ai.generate({
      model: 'googleai/gemini-1.5-pro',
      prompt: [
        {
          text: `You are an AI brand compliance assistant with expertise in color theory, typography, and design composition. You will receive a design, a brand fingerprint, and the design's context.

Your task is to analyze the design and compare it to the brand fingerprint, adjusting your strictness based on the provided context.

Context: ${input.designContext}
- If the context is "Business Presentation" or "Marketing Flyer", be very strict. Adherence to the brand fingerprint is critical.
- If the context is "Social Media Post", allow for more creative freedom. The design can be more playful as long as it doesn't directly clash with the brand identity.

Your analysis must be sophisticated. Do not just check for exact hex code matches or font names. Instead, consider the following:
- Color Relationships: Are the colors used in the design harmonious with the brand's primary and secondary colors? Do they complement or clash with the brand palette? Consider the context when evaluating.
- Near-Miss Colors: Detect if any colors are very close to the official brand colors but not an exact match.
- Typography Compliance: Check if the typography style, hierarchy (headings, body text), and font pairings align with the brand fingerprint's description of its typographic voice.
- Layout & Composition: Analyze the design's spacing, alignment, and visual balance. Check if the logo placement and overall aesthetic (e.g., minimalist, energetic) align with the brand fingerprint.

Based on this comprehensive, context-aware analysis, return a compliance score from 0 to 100. Provide detailed feedback explaining the score, specifically mentioning color harmony, typography alignment, layout, and how the design context influenced your evaluation.

Brand Fingerprint: ${input.brandFingerprint}
Design: `,
        },
        {
          media: {
            url: input.designDataUri,
            contentType: extractMimeType(input.designDataUri),
          },
        },
      ],
      output: {
        format: 'json',
        schema: GenerateComplianceScoreOutputSchema,
      },
    });

    return output!;
  }
);

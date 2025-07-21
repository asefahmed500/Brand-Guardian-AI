
'use server';

/**
 * @fileOverview An AI agent that applies brand compliance fixes to a design.
 *
 * - applyBrandFixes - A function that generates a new design with fixes applied.
 * - ApplyBrandFixesInput - The input type for the applyBrandFixes function.
 * - ApplyBrandFixesOutput - The return type for the applyBrandFixes function.
 */

import { ai } from '@/ai/genkit';
import { extractMimeType } from '@/lib/utils';
import { z } from 'genkit';

const ApplyBrandFixesInputSchema = z.object({
  designDataUri: z
    .string()
    .describe(
      "A data URI of the design to be fixed, including MIME type and Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  brandGuidelines: z.string().describe('The brand guidelines to adhere to.'),
  fixes: z
    .array(z.string())
    .describe('A list of specific fixes to apply to the design.'),
});
export type ApplyBrandFixesInput = z.infer<typeof ApplyBrandFixesInputSchema>;

const ApplyBrandFixesOutputSchema = z.object({
  fixedDesignDataUri: z
    .string()
    .describe(
      "The new, fixed design as a data URI, including MIME type and Base64 encoding."
    ),
});
export type ApplyBrandFixesOutput = z.infer<typeof ApplyBrandFixesOutputSchema>;

export async function applyBrandFixes(
  input: ApplyBrandFixesInput
): Promise<ApplyBrandFixesOutput> {
  return applyBrandFixesFlow(input);
}

const applyBrandFixesFlow = ai.defineFlow(
  {
    name: 'applyBrandFixesFlow',
    inputSchema: ApplyBrandFixesInputSchema,
    outputSchema: ApplyBrandFixesOutputSchema,
  },
  async (input) => {
    const { media } = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      prompt: [
        { media: { url: input.designDataUri, contentType: extractMimeType(input.designDataUri) } },
        {
          text: `You are an expert graphic designer tasked with fixing brand compliance issues in a design.
          
You will receive an image of the original design, the brand guidelines, and a specific list of fixes to apply.

Your task is to generate a NEW version of the design that incorporates ALL of the requested fixes while preserving the original design's composition and intent as much as possible.

Brand Guidelines:
${input.brandGuidelines}

Apply the following specific fixes:
${input.fixes.map((fix) => `- ${fix}`).join('\n')}

Generate the new, corrected image.`,
        },
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media?.url) {
      throw new Error('Image generation failed.');
    }

    return {
      fixedDesignDataUri: media.url,
    };
  }
);

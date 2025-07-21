
'use server';

/**
 * @fileOverview An AI agent that enhances a user's sketch into a polished design.
 *
 * - enhanceSketch - A function that converts a sketch to a brand-compliant design.
 * - EnhanceSketchInput - The input type for the function.
 * - EnhanceSketchOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { extractMimeType } from '@/lib/utils';
import { z } from 'genkit';

const EnhanceSketchInputSchema = z.object({
  sketchDataUri: z
    .string()
    .describe(
      "A data URI of the user's sketch, including MIME type and Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  brandFingerprint: z.string().describe('A JSON string representing the brand fingerprint to adhere to.'),
  prompt: z.string().optional().describe('An optional user prompt providing additional context or instructions for the enhancement.'),
});
export type EnhanceSketchInput = z.infer<typeof EnhanceSketchInputSchema>;

const EnhanceSketchOutputSchema = z.object({
  enhancedDesignDataUri: z
    .string()
    .describe(
      "The new, polished design as a data URI, including MIME type and Base64 encoding."
    ),
});
export type EnhanceSketchOutput = z.infer<typeof EnhanceSketchOutputSchema>;

export async function enhanceSketch(
  input: EnhanceSketchInput
): Promise<EnhanceSketchOutput> {
  return enhanceSketchFlow(input);
}

const enhanceSketchFlow = ai.defineFlow(
  {
    name: 'enhanceSketchFlow',
    inputSchema: EnhanceSketchInputSchema,
    outputSchema: EnhanceSketchOutputSchema,
  },
  async (input) => {
    const { media } = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      prompt: [
        { media: { url: input.sketchDataUri, contentType: extractMimeType(input.sketchDataUri) } },
        {
          text: `You are an expert graphic designer who transforms rough sketches into polished, professional, brand-compliant designs.

Your task is to interpret the provided user sketch and regenerate it as a high-quality design. Adhere strictly to the provided Brand Guidelines for all colors, typography, spacing, and overall aesthetic. Clean up messy lines, formalize shapes, and arrange the elements in a visually appealing composition.

${input.prompt ? `The user has provided this additional context: "${input.prompt}"` : ''}

Brand Guidelines:
${input.brandFingerprint}

Generate the new, enhanced design.`,
        },
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media?.url) {
      throw new Error('Image generation failed during sketch enhancement.');
    }

    return {
      enhancedDesignDataUri: media.url,
    };
  }
);

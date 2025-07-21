
'use server';

/**
 * @fileOverview An AI agent that compares two designs and highlights their differences.
 *
 * - highlightDesignDifferences - A function that generates an image highlighting differences.
 * - HighlightDesignDifferencesInput - The input type for the function.
 * - HighlightDesignDifferencesOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { extractMimeType } from '@/lib/utils';
import { z } from 'genkit';

const HighlightDesignDifferencesInputSchema = z.object({
  originalDesignDataUri: z
    .string()
    .describe(
      "The original design as a data URI, including MIME type and Base64 encoding."
    ),
  fixedDesignDataUri: z
    .string()
    .describe(
      "The fixed/new design as a data URI, including MIME type and Base64 encoding."
    ),
});
export type HighlightDesignDifferencesInput = z.infer<typeof HighlightDesignDifferencesInputSchema>;


const HighlightDesignDifferencesOutputSchema = z.object({
  highlightedDesignDataUri: z
    .string()
    .describe(
      "A new image based on the 'fixed' design, but with visual callouts (e.g., circles, arrows, bright outlines) highlighting the specific areas that were changed from the original. The image as a data URI."
    ),
});
export type HighlightDesignDifferencesOutput = z.infer<typeof HighlightDesignDifferencesOutputSchema>;


export async function highlightDesignDifferences(
  input: HighlightDesignDifferencesInput
): Promise<HighlightDesignDifferencesOutput> {
  return highlightDesignDifferencesFlow(input);
}

const highlightDesignDifferencesFlow = ai.defineFlow(
  {
    name: 'highlightDesignDifferencesFlow',
    inputSchema: HighlightDesignDifferencesInputSchema,
    outputSchema: HighlightDesignDifferencesOutputSchema,
  },
  async (input) => {
    const { media } = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      prompt: [
        { text: 'Original Design:' },
        { media: { url: input.originalDesignDataUri, contentType: extractMimeType(input.originalDesignDataUri) } },
        { text: 'Fixed Design:' },
        { media: { url: input.fixedDesignDataUri, contentType: extractMimeType(input.fixedDesignDataUri) } },
        {
          text: `You are a design analysis expert. Your task is to compare the "Original Design" with the "Fixed Design".
          
Generate a NEW image that is a copy of the "Fixed Design", but add clear visual annotations (like red circles, arrows, or outlines) to highlight every single area that has changed from the original. Make the highlights very obvious. For example, if a color changed, circle the element that changed color. If a font changed, draw a box around the text.
`,
        },
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media?.url) {
      throw new Error('Image generation failed for highlighting differences.');
    }

    return {
      highlightedDesignDataUri: media.url,
    };
  }
);

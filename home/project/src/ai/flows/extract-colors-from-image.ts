
'use server';

/**
 * @fileOverview An AI agent that extracts a color palette from an image.
 *
 * - extractColorsFromImage - Extracts colors and checks compliance.
 * - ExtractColorsFromImageInput - Input schema for the flow.
 * - ExtractColorsFromImageOutput - Output schema for the flow.
 */

import { ai } from '@/ai/genkit';
import { extractMimeType } from '@/lib/utils';
import { z } from 'genkit';

const ExtractColorsFromImageInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "The image to analyze, as a data URI that must include a MIME type and use Base64 encoding."
    ),
  brandFingerprint: z.string().describe('A JSON string representing the brand fingerprint to check against.'),
});
export type ExtractColorsFromImageInput = z.infer<typeof ExtractColorsFromImageInputSchema>;


const ExtractColorsFromImageOutputSchema = z.object({
    extractedColors: z.array(z.string().regex(/^#[0-9a-fA-F]{6}$/)).describe('Up to 5 dominant colors from the image as hex codes.'),
    complianceFeedback: z.string().describe('A brief analysis of how well the extracted colors harmonize with the provided brand fingerprint.'),
});
export type ExtractColorsFromImageOutput = z.infer<typeof ExtractColorsFromImageOutputSchema>;


export async function extractColorsFromImage(
  input: ExtractColorsFromImageInput
): Promise<ExtractColorsFromImageOutput> {
  return extractColorsFromImageFlow(input);
}

const extractColorsFromImageFlow = ai.defineFlow(
  {
    name: 'extractColorsFromImageFlow',
    inputSchema: ExtractColorsFromImageInputSchema,
    outputSchema: ExtractColorsFromImageOutputSchema,
  },
  async (input) => {
    const { output } = await ai.generate({
      model: 'googleai/gemini-1.5-pro',
      prompt: [
        {
          text: `You are a design assistant specializing in color theory. Your task is to analyze an image, extract its most dominant colors, and evaluate how they fit with a given brand identity.

1.  Analyze the provided image and identify up to five of its most prominent and representative colors. Return them as an array of hex codes.
2.  Compare this extracted color palette to the provided brand fingerprint.
3.  Provide concise feedback on the color harmony. For example, "These colors are a great match for the brand's earthy tones," or "This palette is very bright and might clash with the brand's more muted, professional aesthetic."

Image to Analyze: `,
        },
        { media: { url: input.imageDataUri, contentType: extractMimeType(input.imageDataUri) } },
        { text: `Brand Fingerprint: ${input.brandFingerprint}` },
      ],
      output: {
        format: 'json',
        schema: ExtractColorsFromImageOutputSchema,
      },
    });

    return output!;
  }
);

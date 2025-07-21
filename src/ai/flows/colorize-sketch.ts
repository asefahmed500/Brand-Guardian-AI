
'use server';

/**
 * @fileOverview An AI agent that colorizes a sketch based on brand guidelines.
 *
 * - colorizeSketch - A function that applies brand colors to a sketch.
 * - ColorizeSketchInput - The input type for the function.
 * - ColorizeSketchOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { extractMimeType } from '@/lib/utils';
import { z } from 'genkit';

const ColorizeSketchInputSchema = z.object({
  sketchDataUri: z
    .string()
    .describe(
      "A data URI of the user's sketch, including MIME type and Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  brandFingerprint: z.string().describe('A JSON string representing the brand fingerprint containing color palettes.'),
});
export type ColorizeSketchInput = z.infer<typeof ColorizeSketchInputSchema>;

const ColorizeSketchOutputSchema = z.object({
  colorizedSketchDataUri: z
    .string()
    .describe(
      "The new, colorized sketch as a data URI, including MIME type and Base64 encoding."
    ),
});
export type ColorizeSketchOutput = z.infer<typeof ColorizeSketchOutputSchema>;

export async function colorizeSketch(
  input: ColorizeSketchInput
): Promise<ColorizeSketchOutput> {
  return colorizeSketchFlow(input);
}

const colorizeSketchFlow = ai.defineFlow(
  {
    name: 'colorizeSketchFlow',
    inputSchema: ColorizeSketchInputSchema,
    outputSchema: ColorizeSketchOutputSchema,
  },
  async (input) => {
    const { media } = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      prompt: [
        { media: { url: input.sketchDataUri, contentType: extractMimeType(input.sketchDataUri) } },
        {
          text: `You are an expert graphic designer specializing in color theory. Your task is to colorize the provided black and white sketch.

You must strictly use the colors available in the provided brand guidelines. Apply the primary and secondary colors intelligently to create a visually appealing, on-brand image. The final image should be fully colored.

Brand Guidelines:
${input.brandFingerprint}

Generate the new, colorized version of the sketch.`,
        },
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media?.url) {
      throw new Error('Image generation failed during colorization.');
    }

    return {
      colorizedSketchDataUri: media.url,
    };
  }
);

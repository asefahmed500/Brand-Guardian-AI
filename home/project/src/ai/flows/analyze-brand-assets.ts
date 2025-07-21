
'use server';

/**
 * @fileOverview A brand asset analysis AI agent.
 *
 * - analyzeBrandAssets - A function that handles the brand asset analysis process.
 * - AnalyzeBrandAssetsInput - The input type for the analyzeBrandAssets function.
 * - AnalyzeBrandAssetsOutput - The return type for the analyzeBrandAssets function.
 */

import {ai} from '@/ai/genkit';
import { extractMimeType } from '@/lib/utils';
import {z} from 'genkit';

const AnalyzeBrandAssetsInputSchema = z.object({
  logoDataUri: z
    .string()
    .describe(
      "The company logo, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  brandDescription: z.string().describe('The description of the brand.'),
});
export type AnalyzeBrandAssetsInput = z.infer<typeof AnalyzeBrandAssetsInputSchema>;

const AnalyzeBrandAssetsOutputSchema = z.object({
  primaryColors: z.array(z.string().regex(/^#[0-9a-fA-F]{6}$/)).describe('The primary colors of the brand as an array of hex codes.'),
  secondaryColors: z.array(z.string().regex(/^#[0-9a-fA-F]{6}$/)).describe('The secondary colors of the brand as an array of hex codes.'),
  typographyStyle: z.string().describe('A detailed description of the brand\'s typography, including font styles, hierarchy (e.g., bold headlines, clean body text), and overall personality (e.g., modern, elegant).'),
  logoPlacementPreferences: z.string().describe('A description of the preferred logo placement, considering spacing and context (e.g., "Top-left corner with ample clear space").'),
  overallDesignAesthetic: z.string().describe('A description of the overall design aesthetic, including layout preferences, spacing, and visual balance (e.g., "Clean, minimalist layouts with generous white space").'),
});
export type AnalyzeBrandAssetsOutput = z.infer<typeof AnalyzeBrandAssetsOutputSchema>;

export async function analyzeBrandAssets(input: AnalyzeBrandAssetsInput): Promise<AnalyzeBrandAssetsOutput> {
  return analyzeBrandAssetsFlow(input);
}

const analyzeBrandAssetsFlow = ai.defineFlow(
  {
    name: 'analyzeBrandAssetsFlow',
    inputSchema: AnalyzeBrandAssetsInputSchema,
    outputSchema: AnalyzeBrandAssetsOutputSchema,
  },
  async (input) => {
    const { output } = await ai.generate({
      prompt: `You are an expert brand analyst. Your task is to analyze the provided brand assets (logo and description) and extract the key elements of its visual identity.

Analyze the logo's colors and the brand description to determine the brand's color palette.
- Identify the primary colors. These are the most dominant and frequently used colors.
- Identify the secondary colors. These are accent colors or complementary colors.
- Return colors as an array of hex codes (e.g., ["#FFFFFF", "#000000"]).

From the logo and description, infer the brand's typography style. Be specific about the hierarchy and voice (e.g., "Uses a bold, modern sans-serif for headlines and a clean, readable serif for body text to convey a professional yet approachable feel.").

Analyze the assets and description to define the brand's layout and composition preferences. Describe preferred logo placement (e.g., "Top-left corner with ample clear space around it"). Describe the overall design aesthetic, including preferences for spacing and visual balance (e.g., "Prefers clean, minimalist layouts with generous white space and a strong grid alignment.").

Use the following as the primary source of information about the brand.

Description: ${input.brandDescription}
Logo: `,
      model: 'googleai/gemini-1.5-pro',
      input: [
        {
          media: {
            url: input.logoDataUri,
            contentType: extractMimeType(input.logoDataUri),
          },
        },
      ],
      output: {
        format: 'json',
        schema: AnalyzeBrandAssetsOutputSchema,
      },
    });

    return output!;
  }
);

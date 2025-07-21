
'use server';

/**
 * @fileOverview An AI agent that analyzes and tags brand assets.
 *
 * - tagBrandAsset - A function that handles the asset tagging process.
 * - TagBrandAssetInput - The input type for the tagBrandAsset function.
 * - TagBrandAssetOutput - The return type for the tagBrandAsset function.
 */

import {ai} from '@/ai/genkit';
import { extractMimeType } from '@/lib/utils';
import {z} from 'genkit';

const TagBrandAssetInputSchema = z.object({
  assetDataUri: z
    .string()
    .describe(
      "The asset image, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
    assetName: z.string().describe('The user-provided name for the asset.'),
});
export type TagBrandAssetInput = z.infer<typeof TagBrandAssetInputSchema>;

const TagBrandAssetOutputSchema = z.object({
  type: z.enum(['icon', 'image', 'logo']).describe('The type of asset.'),
  tags: z.array(z.string()).describe('A list of relevant search tags for the asset (e.g., "blue", "abstract", "social media"). Generate between 3 and 5 tags.'),
  aiSummary: z.string().describe('A one-sentence AI-generated summary of the asset\'s content and potential use case.'),
});
export type TagBrandAssetOutput = z.infer<typeof TagBrandAssetOutputSchema>;

export async function tagBrandAsset(input: TagBrandAssetInput): Promise<TagBrandAssetOutput> {
  return tagBrandAssetFlow(input);
}

const tagBrandAssetFlow = ai.defineFlow(
  {
    name: 'tagBrandAssetFlow',
    inputSchema: TagBrandAssetInputSchema,
    outputSchema: TagBrandAssetOutputSchema,
  },
  async (input) => {
    const { output } = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      prompt: [
        {
          text: `You are an expert brand librarian. Your task is to analyze the provided asset and categorize it.

Asset Name: ${input.assetName}
Asset Image: `,
        },
        {
          media: {
            url: input.assetDataUri,
            contentType: extractMimeType(input.assetDataUri),
          },
        },
        {
          text: `Based on the image and its name, determine if it's an 'icon', 'logo', or a general 'image'.

Generate a list of 3-5 relevant search tags for the asset. Consider colors, style, and subject matter.

Finally, write a concise one-sentence summary describing the asset and its likely best use case.

Provide the output in a structured JSON format.`,
        },
      ],
      output: {
        format: 'json',
        schema: TagBrandAssetOutputSchema,
      },
    });

    return output!;
  }
);

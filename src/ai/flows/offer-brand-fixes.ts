
'use server';

/**
 * @fileOverview An AI agent that offers one-click fixes for brand inconsistencies in designs.
 *
 * - offerBrandFixes - A function that suggests fixes for brand inconsistencies.
 * - OfferBrandFixesInput - The input type for the offerBrandFixes function.
 * - OfferBrandFixesOutput - The return type for the offerBrandFixes function.
 */

import {ai} from '@/ai/genkit';
import { extractMimeType } from '@/lib/utils';
import {z} from 'genkit';

const OfferBrandFixesInputSchema = z.object({
  designDataUri: z
    .string()
    .describe(
      "A data URI of the design to be analyzed, including MIME type and Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  brandGuidelines: z.string().describe('The brand guidelines to adhere to.'),
  designContext: z.string().describe('The context of the design (e.g., "Social Media Post", "Business Presentation").'),
});
export type OfferBrandFixesInput = z.infer<typeof OfferBrandFixesInputSchema>;

const FixSuggestionSchema = z.object({
  description: z.string().describe('A user-friendly description of the fix (e.g., "Change background to a brand color").'),
  type: z.enum(['color', 'typography', 'layout']).describe('The category of the fix.'),
  details: z.object({
    action: z.string().describe('The SDK action to perform, e.g., "updateElement"'),
    targetElement: z.string().describe('A descriptive identifier for the target element, e.g., "headlineText" or "mainBackground".'),
    property: z.string().describe('The property to change, e.g., "fillColor" or "fontWeight".'),
    newValue: z.string().describe('The new value for the property, e.g., "#4285F4" or "bold".'),
  }).describe('An object containing the specific, machine-readable parameters for the fix.'),
});

const OfferBrandFixesOutputSchema = z.object({
  fixes: z
    .array(FixSuggestionSchema)
    .describe('A list of suggested, structured fixes for brand inconsistencies.'),
});
export type OfferBrandFixesOutput = z.infer<typeof OfferBrandFixesOutputSchema>;

export async function offerBrandFixes(input: OfferBrandFixesInput): Promise<OfferBrandFixesOutput> {
  return offerBrandFixesFlow(input);
}

const offerBrandFixesFlow = ai.defineFlow(
  {
    name: 'offerBrandFixesFlow',
    inputSchema: OfferBrandFixesInputSchema,
    outputSchema: OfferBrandFixesOutputSchema,
  },
  async (input) => {
    const { output } = await ai.generate({
      model: 'googleai/gemini-1.5-pro',
      prompt: [
        {
          text: `You are an AI-powered brand compliance assistant that integrates with a design tool.

You will receive a design, brand guidelines, and the design's context. Your task is to identify brand inconsistencies and suggest specific, actionable fixes in a structured format that a machine can parse and execute via an SDK.

Context: ${input.designContext}
- If the context is "Business Presentation", your suggestions should be very strict to ensure full compliance.
- If the context is "Social Media Post", your suggestions can be more flexible, focusing on major clashes.

For each suggested fix, provide a structured object with 'description', 'type', and 'details'.
- The 'description' is user-friendly (e.g., "Change headline to a bolder font.").
- The 'type' is one of 'color', 'typography', 'or 'layout'.
- The 'details' object MUST contain the information needed to perform the fix. It must have 'action', 'targetElement', 'property', and 'newValue'.
  - For a color fix: { "action": "updateElement", "targetElement": "background", "property": "fillColor", "newValue": "#BRANDCOLOR" }
  - For a typography fix: { "action": "updateElement", "targetElement": "headline", "property": "fontWeight", "newValue": "bold" }
  - For a layout fix: { "action": "updateElement", "targetElement": "logo", "property": "marginTop", "newValue": "20px" }
Assume the design has identifiable elements like 'headline', 'body', 'logo', 'background'.

Brand Guidelines: ${input.brandGuidelines}
Design Context: ${input.designContext}
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
        schema: OfferBrandFixesOutputSchema,
      },
    });

    return output!;
  }
);

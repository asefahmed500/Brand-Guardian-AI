
'use server';

/**
 * @fileOverview An AI agent that generates brand-specific design templates.
 *
 * - generateBrandTemplates - A function that generates a set of design templates.
 * - GenerateBrandTemplatesInput - The input type for the generateBrandTemplates function.
 * - GenerateBrandTemplatesOutput - The return type for the generateBrandTemplates function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateBrandTemplatesInputSchema = z.object({
  brandGuidelines: z.string().describe('The brand guidelines to adhere to.'),
  templateCount: z.number().min(1).max(5).default(3).describe('The number of templates to generate.'),
});
export type GenerateBrandTemplatesInput = z.infer<typeof GenerateBrandTemplatesInputSchema>;

const TemplateSchema = z.object({
  templateName: z.string().describe('A descriptive name for the template, e.g., "Product Spotlight Instagram Post" or "Quarterly Business Review Title Slide".'),
  imageDataUri: z.string().describe("The generated template image as a data URI, including MIME type and Base64 encoding."),
});

const GenerateBrandTemplatesOutputSchema = z.object({
  templates: z.array(TemplateSchema).describe('A list of generated design templates.'),
});
export type GenerateBrandTemplatesOutput = z.infer<typeof GenerateBrandTemplatesOutputSchema>;


export async function generateBrandTemplates(
  input: GenerateBrandTemplatesInput
): Promise<GenerateBrandTemplatesOutput> {
  return generateBrandTemplatesFlow(input);
}

const generateBrandTemplatesFlow = ai.defineFlow(
  {
    name: 'generateBrandTemplatesFlow',
    inputSchema: GenerateBrandTemplatesInputSchema,
    outputSchema: GenerateBrandTemplatesOutputSchema,
  },
  async (input) => {
    // Generate N templates in parallel
    const templatePromises = Array.from({ length: input.templateCount }).map(async () => {
        const { media, text } = await ai.generate({
            model: 'googleai/gemini-1.5-pro',
            prompt: `You are a professional graphic designer creating a set of branded templates for a client.
      
Your task is to generate ONE professional and visually appealing design template based on the provided brand guidelines. The template should be versatile and ready for a user to add their own text or images. Include placeholder shapes or areas where text and images would go.

IMPORTANT: DO NOT include any actual text (like "Headline" or "Lorem Ipsum") in the image itself. Use placeholder shapes (like solid-colored rectangles or circles) instead.

Brand Guidelines:
${input.brandGuidelines}
            
First, generate the image. Second, after the image is generated, provide a short, descriptive name for the template you created (e.g., "Product Spotlight Instagram Post," "Minimalist Presentation Slide," "Corporate Flyer Layout"). Output only the name.`,
            config: {
                responseModalities: ['TEXT', 'IMAGE'],
            },
        });

        if (!media?.url) {
            throw new Error('Image generation failed for a template.');
        }

        return {
            templateName: text() ?? 'Untitled Template',
            imageDataUri: media.url,
        };
    });

    const templates = await Promise.all(templatePromises);

    return {
      templates,
    };
  }
);

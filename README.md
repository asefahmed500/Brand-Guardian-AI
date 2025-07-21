
# Brand Guardian AI

**Brand Guardian AI** is a full-stack web application designed to help organizations maintain brand consistency across all their creative assets. It leverages generative AI to analyze brand identity, score designs for compliance in real-time, and provide intelligent tools to streamline the creative workflow.

The application features a seamless integration with **Adobe Express** via a native add-on, allowing designers to get instant feedback and apply one-click fixes without leaving their design environment.

## Core Features

- **AI Brand Fingerprinting**: Upload a logo and provide a description to have AI automatically analyze and create a "brand fingerprint," defining your primary/secondary colors, typography style, logo placement rules, and overall design aesthetic.
- **Real-Time Compliance Scoring**: Upload any design (e.g., a social media post, flyer) and receive an instant 0-100 compliance score based on your brand fingerprint. The AI provides detailed, context-aware feedback explaining the score.
- **One-Click AI Fixes**: For non-compliant designs, the AI suggests specific, actionable fixes. A single click on "Instant Brandify" generates a new, corrected version of the design that aligns with brand guidelines.
- **Adobe Express Integration**: A native panel in Adobe Express provides real-time compliance scoring and one-click fixes directly within the design tool.
- **Creative AI Studio**: A suite of generative tools to spark creativity:
    - **Prompt-to-Design**: Generate a complete, brand-compliant design from a simple text prompt.
    - **Layout Composer**: Provide a headline, body text, and an image prompt, and the AI will generate a structured, on-brand layout.
    - **Color Moodboard**: Upload an inspirational image to extract a color palette and see how it harmonizes with your brand.
- **AI Sketchpad**: A digital canvas where users can draw rough ideas and use AI to either colorize the sketch with brand colors or enhance it into a polished, professional design.
- **Role-Based Permissions**: The application supports a three-tiered user system to manage access and responsibilities effectively.

## User Roles & Permissions

The application defines three distinct roles, each with specific capabilities tailored to their function within a creative team.

### 1. Standard User (Designer)

This role is for the creators and designers on the team. Their focus is on creating and analyzing designs while adhering to brand guidelines.

**Key Permissions:**
- Create and manage their own projects.
- Analyze their designs for brand compliance.
- Use all AI creative tools (Template Generator, Creative Studio, AI Sketchpad).
- View brand guidelines and assets for projects they are a part of.
- Manage their own analyzed designs, including adding notes and tags.
- Request peer feedback or manager approval for their work.

### 2. Brand Manager

This role is for team leads or brand stewards responsible for defining and maintaining the brand's identity.

**Key Permissions:**
- **All Standard User permissions.**
- **Edit Brand Guidelines**: Modify the core brand fingerprint, including colors, typography, and aesthetic rules for any project.
- **Manage Brand Assets**: Upload, tag, and set permissions for shared brand assets like logos and icons.
- **Review Designs**: Approve or reject designs submitted by users, providing feedback to guide them.
- **Team Oversight**: View all designs submitted within a project and monitor overall compliance metrics.
- Post announcements for all project members.

### 3. Admin

This role is for the system administrator who has complete control over the application and its users.

**Key Permissions:**
- **All Brand Manager permissions.**
- **User Management**: View all users, edit their roles, and manage their subscription plans.
- **System Configuration**: Access a dashboard to manage global settings, API integrations, and system-wide rules (feature in development).
- **Financial Monitoring**: View subscription analytics and revenue data (feature in development).
- **Delete Projects**: Permanently delete any project and its associated data.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Renders an HTML email template dynamically by replacing placeholders.
 * E.g., renderEmailTemplate('forgotPassword', { name: 'John', resetUrl: '...' })
 * will load forgotPassword.html and replace {{name}} and {{resetUrl}} with their values.
 */
export const renderEmailTemplate = (templateName: string, data: Record<string, any>): string => {
  try {
    const templatePath = path.join(__dirname, `../resources/email/template/${templateName}.html`);
    let htmlContent = fs.readFileSync(templatePath, 'utf8');

    // Replace all placeholders dynamically
    for (const [key, value] of Object.entries(data)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      htmlContent = htmlContent.replace(regex, String(value));
    }

    return htmlContent;
  } catch (error: any) {
    console.error(`[Email Templates] Error loading email template "${templateName}":`, error);
    
    // Provide a simple generic fallback if the file cannot be loaded
    return `
      <div style="font-family: sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #eee;">
        <h2>Notification</h2>
        ${Object.entries(data)
          .map(([key, value]) => `<p><strong>${key}:</strong> ${value}</p>`)
          .join('')}
      </div>
    `;
  }
};

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function extractTitleFromContent(content: string): string {
  if (!content || content.trim() === '') {
    return 'Untitled Document';
  }

  // Split content into lines and find the first non-empty line
  const lines = content.split('\n');
  const firstLine = lines.find(line => line.trim() !== '');
  
  if (!firstLine) {
    return 'Untitled Document';
  }

  // Remove markdown formatting (headers, bold, italic, etc.)
  let title = firstLine
    .replace(/^#+\s*/, '') // Remove markdown headers (# ## ###)
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold **text**
    .replace(/\*(.*?)\*/g, '$1') // Remove italic *text*
    .replace(/`(.*?)`/g, '$1') // Remove inline code `text`
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links [text](url)
    .trim();

  // Limit title length
  if (title.length > 50) {
    title = title.substring(0, 47) + '...';
  }

  return title || 'Untitled Document';
}

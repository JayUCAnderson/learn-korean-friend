
import type { ParsedContent } from '@/types/learning';

export const parseMarkdownContent = (content: string): ParsedContent => {
  const result: ParsedContent = {};
  const sections = content.split(/(?=###)/);
  
  sections.forEach(section => {
    const lines = section.trim().split('\n');
    const header = lines[0].replace('###', '').trim().toLowerCase();
    const content = lines.slice(1).join('\n').trim();

    if (header.includes('vocabulary')) {
      const vocabLines = content.split('\n').filter(Boolean);
      result.vocabulary = vocabLines
        .filter(line => line.includes('-') || line.includes('('))
        .map(line => {
          const [korean, english] = line.split(/[-()]/).map(part => part.trim());
          return {
            korean: korean.replace(/\d+\.\s*/, ''), // Remove numbering if present
            english: english?.replace(/[()]/g, '').trim() || ''
          };
        })
        .filter(item => item.korean && item.english); // Filter out any malformed entries
    }
  });
  
  return result;
};

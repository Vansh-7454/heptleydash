/**
 * Utility functions for clean, readable typography and data formatting
 * across the Heptley Business Portal.
 */

export interface ParsedClient {
  primary: string;
  secondary?: string;
}

/**
 * Parses client string like "Customer Demo 03 (Gamma Financial Services)"
 * into a clear primary company title and a secondary contact/account subtitle.
 */
export function parseClientDisplay(rawName?: string): ParsedClient {
  if (!rawName || !rawName.trim()) {
    return { primary: 'Direct Client' };
  }

  const trimmed = rawName.trim();
  if (trimmed.toLowerCase() === 'direct client') {
    return { primary: 'Direct Client' };
  }

  // Match pattern: "Name (Company)" or "Contact (Organization)"
  const match = trimmed.match(/^(.+?)\s*\((.+?)\)$/);
  if (match) {
    const part1 = match[1].trim();
    const part2 = match[2].trim();

    // If part1 looks like a contact person or account code (e.g. "Customer Demo 03", "John Doe"),
    // and part2 looks like a business name (e.g. "Gamma Financial Services"), prioritize business as primary.
    const isPart1DemoOrContact = /^(customer\s*demo|user|client\s*demo|poc)/i.test(part1);
    if (isPart1DemoOrContact) {
      return { primary: part2, secondary: part1 };
    }

    // Default: first is organization, parentheses is contact/clarification
    return { primary: part1, secondary: part2 };
  }

  return { primary: trimmed };
}

/**
 * Format date nicely (e.g. "Sep 21, 2027")
 */
export function formatDateDisplay(dateInput?: string | Date | null): string {
  if (!dateInput) return '—';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '—';
  }
}

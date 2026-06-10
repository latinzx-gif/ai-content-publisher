export function normalizeTextValue(value?: string | null): string {
  if (typeof value !== 'string') {
    return '';
  }

  const trimmed = value.trim();

  if (trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed);

      const extractText = (obj: unknown): string | null => {
        if (!obj || typeof obj !== 'object') return null;
        const record = obj as Record<string, unknown>;

        const priorityFields = [
          'body', 'reason', 'request', 'concept', 'summary',
          'message', 'output_text', 'description', 'text', 'detail',
        ];

        for (const field of priorityFields) {
          const fieldValue = record[field];
          if (typeof fieldValue === 'string') return fieldValue;
        }

        if (record.imageDirection) {
          const nested = extractText(record.imageDirection);
          if (nested) return nested;
        }

        if (record.error && typeof record.error === 'object') {
          const nested = extractText(record.error);
          if (nested) return nested;
        }

        return null;
      };

      const result = extractText(parsed);
      if (result) return result;
    } catch {
      const fields = ['reason', 'concept', 'body', 'request', 'message', 'summary'];
      for (const field of fields) {
        const regex = new RegExp(`"${field}"\\s*:\\s*"([^"]+)"`);
        const match = trimmed.match(regex);
        if (match && match[1]) return match[1];
      }
    }
  }

  return trimmed;
}

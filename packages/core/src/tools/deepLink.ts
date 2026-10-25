export interface ParsedToolDeepLink {
  toolId: string;
  parameters: Record<string, unknown>;
  autorun: boolean;
}

export function parseToolDeepLink(searchQuery: string): ParsedToolDeepLink | null {
  if (!searchQuery || !searchQuery.includes('tool=')) return null;

  const queryString = searchQuery.includes('?') ? searchQuery.split('?')[1] : searchQuery;
  const urlParams = new URLSearchParams(queryString);
  const toolId = urlParams.get('tool');
  if (!toolId) return null;

  const autorun = urlParams.get('autorun') === 'true';
  const parameters: Record<string, unknown> = {};

  urlParams.forEach((val, key) => {
    if (key !== 'tool' && key !== 'autorun') {
      if (val === 'true') parameters[key] = true;
      else if (val === 'false') parameters[key] = false;
      else if (!isNaN(Number(val)) && val.trim() !== '') parameters[key] = Number(val);
      else parameters[key] = val;
    }
  });

  return { toolId, parameters, autorun };
}

export function buildToolDeepLink(
  toolId: string,
  params: Record<string, unknown>,
  autorun = false,
  baseUrl = window.location.origin + window.location.pathname
): string {
  const searchParams = new URLSearchParams();
  searchParams.set('tool', toolId);

  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined && val !== null && val !== '') {
      searchParams.set(key, String(val));
    }
  }

  if (autorun) {
    searchParams.set('autorun', 'true');
  }

  return `${baseUrl}?${searchParams.toString()}`;
}

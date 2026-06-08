import { fetchPublicJson } from '@/lib/public-data-client';

export interface Option {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface PublicOptionsData {
  expansionOptions: string[];
  formatOptions: Option[];
  formatSpeedOptions?: Option[];
  cardDataDefaults?: {
    expansion?: string;
    event_type?: string;
  };
  speedDefaults?: {
    recentExpansionCount?: number;
    expansions?: string[];
    event_types?: string[];
  };
  userGroupOptions: Option[];
  deckColorOptions: Option[];
  rarityLabels: Record<string, string>;
  colorOptions: Option[];
  rarityOptions: Option[];
}

export async function loadPublicOptions(): Promise<PublicOptionsData> {
  return fetchPublicJson<PublicOptionsData>('options.json');
}

export function toExpansionOptions(expansions: string[]): Option[] {
  return expansions.map((value) => ({ label: value, value }));
}

export function createFormatLabels(options: Option[]): Record<string, string> {
  return Object.fromEntries(options.map((option) => [option.value, option.label]));
}

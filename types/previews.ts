export interface PreviewCard {
  id: string;
  name: string;
  zhs_name: string;
  mana_cost: string;
  type: string;
  zhs_type: string;
  text: string;
  zhs_text: string;
  artist: string;
  image_url_en: string;
  image_url_zh: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'mythic';
  spellbook?: string[];
  related?: string[];
  pow_tough?: string;
}

export interface PreviewSet {
  code: string;
  name: string;
  logo_code: string;
  release_date: string;
  cards: PreviewCard[];
  description: string;
} 
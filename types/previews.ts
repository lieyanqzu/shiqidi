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
  name2?: string;
  zhs_name2?: string;
  mana_cost2?: string;
  type2?: string;
  zhs_type2?: string;
  text2?: string;
  zhs_text2?: string;
  backface?: PreviewCard;
}

export interface PreviewSet {
  code: string;
  name: string;
  logo_code: string;
  release_date: string;
  cards: PreviewCard[];
  description: string;
  total_cards?: number;
} 
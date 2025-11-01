const SCRYFALL_HOST = 'cards.scryfall.io';

export type ScryfallVariant = 'art_crop' | 'normal' | 'large';

export const buildScryfallImageUrl = (id: string, variant: ScryfallVariant = 'normal') => {
  return `https://${SCRYFALL_HOST}/${variant}/front/${id.slice(0, 1)}/${id.slice(1, 2)}/${id}.jpg`;
};

export const replaceVariantInUrl = (url?: string | null, variant: ScryfallVariant = 'normal') => {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    if (parsed.hostname !== SCRYFALL_HOST) {
      return null;
    }

    const segments = parsed.pathname.split('/');
    // 期望路径格式：/size/face/id
    if (segments.length >= 3) {
      segments[1] = variant;
      parsed.pathname = segments.join('/');
      return parsed.toString();
    }
  } catch (error) {
    console.error('Failed to replace Scryfall image variant', error);
  }

  return null;
};

export const getCardArtCropUrl = (cardUrl?: string | null, scryfallId?: string | null) => {
  const fromUrl = replaceVariantInUrl(cardUrl, 'art_crop');
  if (fromUrl) return fromUrl;

  if (scryfallId) {
    return buildScryfallImageUrl(scryfallId, 'art_crop');
  }

  return cardUrl ?? null;
};

export const getCardFullImageUrl = (
  cardUrl?: string | null,
  scryfallId?: string | null,
  variant: Exclude<ScryfallVariant, 'art_crop'> = 'large'
) => {
  if (cardUrl) return cardUrl;
  if (scryfallId) {
    return buildScryfallImageUrl(scryfallId, variant);
  }
  return null;
};


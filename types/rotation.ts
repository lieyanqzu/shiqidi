export interface Set {
  name: string | null;
  code: string | null;
  enter_date: string | null;
  exit_date: string | null;
  codename: string | null;
  block: string | null;
  rough_enter_date: string | null;
  rough_exit_date: string | null;
  digital_name?: string | null;
  digital_code?: string | null;
  universes_beyond?: boolean;
}

export interface Ban {
  card_name: string;
  card_image_url: string;
  set_code: string;
  reason: string;
  announcement_url: string;
} 
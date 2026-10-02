export interface SanityImage {
  _type: 'image';
  asset: {
    _ref: string;
    _type: 'reference';
  };
  alt?: string;
  caption?: string;
  hotspot?: {
    x: number;
    y: number;
    height: number;
    width: number;
  };
}

export interface SanityFile {
  _type: 'file';
  asset: {
    _ref: string;
    _type: 'reference';
    url?: string;
  };
}

export interface SiteSettings {
  propertyName: string;
  tagline: string;
  logo?: SanityImage;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  googleMapsUrl?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  defaultSeoTitle?: string;
  defaultSeoDescription?: string;
  defaultOgImage?: SanityImage;
}

export interface NavItem {
  _key: string;
  label: string;
  url: string;
  openInNewTab?: boolean;
  visible?: boolean;
  order?: number;
}

export interface RoomCMS {
  _id: string;
  name: string;
  slug: { current: string };
  shortDescription: string;
  description?: string;
  featured?: boolean;
  heroImage: SanityImage | string;
  gallery?: (SanityImage | string)[];
  capacity: number;
  beds: string;
  bathrooms: string;
  amenities: string[];
  highlights?: string[];
  basePrice: number;
  ctaLabel?: string;
  seoTitle?: string;
  seoDescription?: string;
}

export interface ExperienceCMS {
  _id: string;
  title: string;
  slug: { current: string };
  category: 'Coastal' | 'Adventure' | 'Cultural' | 'Wellness' | 'Dining';
  shortDescription: string;
  description?: string;
  heroImage: SanityImage | string;
  gallery?: (SanityImage | string)[];
  video?: SanityFile;
  duration: string;
  location: string;
  featured?: boolean;
  ctaText?: string;
}

export interface TestimonialCMS {
  _id: string;
  quote: string;
  guestName: string;
  guestLocation: string;
  source: 'Google' | 'TripAdvisor' | 'Direct Guest' | 'Airbnb';
  guestImage?: string | SanityImage;
  featured?: boolean;
  order?: number;
}

export interface GalleryItemCMS {
  _id: string;
  title: string;
  media: SanityImage | string;
  type: 'image' | 'video';
  video?: SanityFile;
  caption?: string;
  category: 'Architectural' | 'Rooms' | 'Varkala' | 'Dining' | 'Slow Living';
  featured?: boolean;
  size?: 'standard' | 'large' | 'tall' | 'wide';
}

export interface PromotionCMS {
  _id: string;
  title: string;
  description: string;
  image?: SanityImage;
  video?: SanityFile;
  ctaLabel: string;
  ctaUrl: string;
  validFrom: string;
  validUntil: string;
  enabled: boolean;
}

export interface SectionBase {
  _key: string;
  _type: string;
  enabled?: boolean;
  order?: number;
  anchorId?: string;
  theme?: 'dark' | 'light' | 'sand';
}

export interface HeroSectionData extends SectionBase {
  _type: 'heroSection';
  eyebrow?: string;
  heading: string;
  subtitle?: string;
  desktopVideo?: SanityFile | string;
  mobileVideo?: SanityFile | string;
  posterImage?: SanityImage | string;
  primaryCtaText?: string;
  secondaryCtaText?: string;
}

export interface BookingBarSectionData extends SectionBase {
  _type: 'bookingBarSection';
  title?: string;
  subtext?: string;
}

export interface EditorialSectionData extends SectionBase {
  _type: 'editorialSection';
  eyebrow?: string;
  title: string;
  bodyParagraphs: string[];
  image?: SanityImage | string;
  imageCaption?: string;
  quote?: string;
}

export interface RoomShowcaseSectionData extends SectionBase {
  _type: 'roomShowcaseSection';
  eyebrow?: string;
  title: string;
  subtitle?: string;
}

export interface StoryScene {
  _key: string;
  title: string;
  subtitle: string;
  description: string;
  media: SanityImage | string;
  mediaType: 'image' | 'video';
  durationSeconds?: number;
}

export interface StoryScrollerSectionData extends SectionBase {
  _type: 'storyScrollerSection';
  eyebrow?: string;
  title?: string;
  scenes: StoryScene[];
}

export interface ExperienceGridSectionData extends SectionBase {
  _type: 'experienceGridSection';
  eyebrow?: string;
  title: string;
  subtitle?: string;
}

export interface TimelineItem {
  _key: string;
  time: string;
  title: string;
  description: string;
  iconName?: string;
}

export interface DayTimelineSectionData extends SectionBase {
  _type: 'dayTimelineSection';
  eyebrow?: string;
  title: string;
  subtitle?: string;
  items: TimelineItem[];
}

export interface GallerySectionData extends SectionBase {
  _type: 'gallerySection';
  eyebrow?: string;
  title: string;
  subtitle?: string;
}

export interface TestimonialsSectionData extends SectionBase {
  _type: 'testimonialsSection';
  eyebrow?: string;
  title: string;
}

export interface LocationSectionData extends SectionBase {
  _type: 'locationSection';
  eyebrow?: string;
  title: string;
  description: string;
  address: string;
  mapUrl: string;
  landmarks: { name: string; distance: string; description?: string }[];
}

export interface PromotionSectionData extends SectionBase {
  _type: 'promotionSection';
  promotionRef?: PromotionCMS;
}

export interface FinalCtaSectionData extends SectionBase {
  _type: 'finalCtaSection';
  eyebrow?: string;
  heading: string;
  subtitle?: string;
  buttonText?: string;
  backgroundImage?: SanityImage | string;
}

export type HomeSection =
  | HeroSectionData
  | BookingBarSectionData
  | EditorialSectionData
  | RoomShowcaseSectionData
  | StoryScrollerSectionData
  | ExperienceGridSectionData
  | DayTimelineSectionData
  | GallerySectionData
  | TestimonialsSectionData
  | LocationSectionData
  | PromotionSectionData
  | FinalCtaSectionData;

import { fetchSanityQuery } from "./client";
import {
  SiteSettings,
  NavItem,
  RoomCMS,
  ExperienceCMS,
  TestimonialCMS,
  GalleryItemCMS,
  PromotionCMS,
  HomeSection,
  RoomsPageData,
  ExperiencesPageData,
  AboutPageData,
  ContactPageData,
} from "./types";
import {
  MOCK_SITE_SETTINGS,
  MOCK_NAVIGATION,
  MOCK_ROOMS,
  MOCK_EXPERIENCES,
  MOCK_TESTIMONIALS,
  MOCK_GALLERY,
  MOCK_PROMOTION,
  MOCK_HOME_SECTIONS,
  MOCK_ROOMS_PAGE,
  MOCK_EXPERIENCES_PAGE,
  MOCK_ABOUT_PAGE,
  MOCK_CONTACT_PAGE,
} from "../mock-data";

export async function getSiteSettings(): Promise<SiteSettings> {
  const query = `*[_type == "siteSettings"][0]`;
  const result = await fetchSanityQuery<SiteSettings>(query);
  return result || MOCK_SITE_SETTINGS;
}

export async function getNavigation(): Promise<NavItem[]> {
  const query = `*[_type == "navigation"] | order(order asc)`;
  const result = await fetchSanityQuery<NavItem[]>(query);
  return result && result.length > 0 ? result : MOCK_NAVIGATION;
}

export async function getHomePageSections(): Promise<HomeSection[]> {
  const query = `*[_type == "homePage"][0].sections[enabled == true] | order(order asc)`;
  const result = await fetchSanityQuery<HomeSection[]>(query);
  return result && result.length > 0 ? result : MOCK_HOME_SECTIONS;
}

export async function getRooms(): Promise<RoomCMS[]> {
  const query = `*[_type == "room"] | order(_createdAt asc)`;
  const result = await fetchSanityQuery<RoomCMS[]>(query);
  return result && result.length > 0 ? result : MOCK_ROOMS;
}

export async function getRoomBySlug(slug: string): Promise<RoomCMS | null> {
  const query = `*[_type == "room" && slug.current == $slug][0]`;
  const result = await fetchSanityQuery<RoomCMS>(query, { slug });
  if (result) return result;
  return MOCK_ROOMS.find((r) => r.slug.current === slug) || null;
}

export async function getExperiences(): Promise<ExperienceCMS[]> {
  const query = `*[_type == "experience"] | order(_createdAt asc)`;
  const result = await fetchSanityQuery<ExperienceCMS[]>(query);
  return result && result.length > 0 ? result : MOCK_EXPERIENCES;
}

export async function getExperienceBySlug(slug: string): Promise<ExperienceCMS | null> {
  const query = `*[_type == "experience" && slug.current == $slug][0]`;
  const result = await fetchSanityQuery<ExperienceCMS>(query, { slug });
  if (result) return result;
  return MOCK_EXPERIENCES.find((e) => e.slug.current === slug) || null;
}

export async function getTestimonials(): Promise<TestimonialCMS[]> {
  const query = `*[_type == "testimonial" && featured == true] | order(order asc)`;
  const result = await fetchSanityQuery<TestimonialCMS[]>(query);
  return result && result.length > 0 ? result : MOCK_TESTIMONIALS;
}

export async function getGalleryItems(): Promise<GalleryItemCMS[]> {
  const query = `*[_type == "galleryItem"] | order(_createdAt desc)`;
  const result = await fetchSanityQuery<GalleryItemCMS[]>(query);
  return result && result.length > 0 ? result : MOCK_GALLERY;
}

export async function getActivePromotion(): Promise<PromotionCMS | null> {
  const today = new Date().toISOString().split("T")[0];
  const query = `*[_type == "promotion" && enabled == true && validFrom <= $today && validUntil >= $today][0]`;
  const result = await fetchSanityQuery<PromotionCMS>(query, { today });
  return result;
}

export async function getRoomsPageData(): Promise<RoomsPageData> {
  const query = `*[_type == "roomsPage"][0]`;
  const result = await fetchSanityQuery<RoomsPageData>(query);
  return result || MOCK_ROOMS_PAGE;
}

export async function getExperiencesPageData(): Promise<ExperiencesPageData> {
  const query = `*[_type == "experiencesPage"][0]`;
  const result = await fetchSanityQuery<ExperiencesPageData>(query);
  return result || MOCK_EXPERIENCES_PAGE;
}

export async function getAboutPageData(): Promise<AboutPageData> {
  const query = `*[_type == "aboutPage"][0]`;
  const result = await fetchSanityQuery<AboutPageData>(query);
  return result || MOCK_ABOUT_PAGE;
}

export async function getContactPageData(): Promise<ContactPageData> {
  const query = `*[_type == "contactPage"][0]`;
  const result = await fetchSanityQuery<ContactPageData>(query);
  return result || MOCK_CONTACT_PAGE;
}

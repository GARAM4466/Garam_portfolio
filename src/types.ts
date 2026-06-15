// Allowed thumbnail aspect ratios (admin-selectable per project)
export type ThumbnailRatio = "1:1" | "4:3" | "16:9" | "21:9" | "9:16" | "3:4";

export interface Project {
  id: string;
  title: string;
  client: string;
  role: string;
  youtubeId: string; // optional — leave empty to show mainImage instead
  mainImage?: string; // shown in the modal hero area when there is no youtubeId
  thumbnail: string; // /public/assets/work/[project-name]/thumbnail.jpg
  thumbnailRatio?: ThumbnailRatio; // grid card aspect ratio (default "16:9")
  stills: string[]; // /public/assets/work/[project-name]/stills/*.jpg
  tags: string[]; // e.g., ["DI", "모션그래픽", "홍보영상"]
  date: string; // YYYY-MM-DD
}

export interface SiteData {
  landingYoutubeId: string;
  reelTitle: string;
  reelYoutubeId: string;
  aboutText: string;
  aboutPhoto: string;
  contactText: string;
  contact: {
    email: string;
    kakaoLink: string;
  };
}

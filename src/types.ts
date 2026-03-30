export interface Project {
  id: string;
  title: string;
  client: string;
  role: string;
  youtubeId: string;
  thumbnail: string; // /public/assets/work/[project-name]/thumbnail.jpg
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

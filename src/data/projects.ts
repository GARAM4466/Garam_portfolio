import { Project, SiteData } from "../types";

import projectsData from "./projects.json";
import siteDataJson from "./siteData.json";

export const siteData: SiteData = siteDataJson as SiteData;

export const projects: Project[] = projectsData as Project[];

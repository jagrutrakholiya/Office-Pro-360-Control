// Control Panel Marketing CMS API Client
import api from './api';

const API_BASE = '/marketing';

// Helper to get auth headers
function getAuthHeaders() {
  const token = localStorage.getItem('cp_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ==================== PAGE CONTENT ADMIN ====================

export interface PageContent {
  _id?: string;
  pageName: string;
  sections: Array<{
    type: string;
    heading?: string;
    subheading?: string;
    content?: any;
    [key: string]: any;
  }>;
  seo: {
    title: string;
    description: string;
    keywords: string[];
    ogImage?: string;
  };
  status: "draft" | "published";
  lastModifiedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export const pageContentAPI = {
  // List all pages
  list: async () => {
    const response = await api.get(`${API_BASE}/admin/pages`, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  // Get single page
  get: async (id: string) => {
    const response = await api.get(`${API_BASE}/admin/pages/${id}`, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  // Create page
  create: async (data: Omit<PageContent, '_id' | 'createdAt' | 'updatedAt'>) => {
    const response = await api.post(`${API_BASE}/admin/pages`, data, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  // Update page
  update: async (id: string, data: Partial<PageContent>) => {
    const response = await api.put(`${API_BASE}/admin/pages/${id}`, data, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  // Delete page
  delete: async (id: string) => {
    const response = await api.delete(`${API_BASE}/admin/pages/${id}`, {
      headers: getAuthHeaders()
    });
    return response.data;
  },
};

// ==================== CASE STUDIES ADMIN ====================

export interface CaseStudy {
  _id?: string;
  title: string;
  slug?: string;
  company: {
    name: string;
    logo: string;
    size?: string;
    website?: string;
  };
  industry: string;
  challenge: string;
  solution: string;
  results: string;
  metrics: Array<{
    label: string;
    value: string;
  }>;
  testimonial?: {
    quote: string;
    author: string;
    position: string;
  };
  image?: string;
  featured: boolean;
  status: "draft" | "published" | "archived";
  publishedAt?: string;
}

export const caseStudyAPI = {
  list: async (filters?: { status?: string; industry?: string }) => {
    const response = await api.get(`${API_BASE}/admin/case-studies`, {
      params: filters,
      headers: getAuthHeaders()
    });
    return response.data;
  },

  create: async (data: Omit<CaseStudy, '_id' | 'slug'>) => {
    const response = await api.post(`${API_BASE}/admin/case-studies`, data, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  update: async (id: string, data: Partial<CaseStudy>) => {
    const response = await api.put(`${API_BASE}/admin/case-studies/${id}`, data, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`${API_BASE}/admin/case-studies/${id}`, {
      headers: getAuthHeaders()
    });
    return response.data;
  },
};

// ==================== TEAM MEMBERS ADMIN ====================

export interface TeamMember {
  _id?: string;
  name: string;
  role: string;
  bio: string;
  image: string;
  department: string;
  social?: {
    email?: string;
    linkedin?: string;
    twitter?: string;
  };
  order: number;
  featured: boolean;
  status: "active" | "inactive";
}

export const teamAPI = {
  list: async () => {
    const response = await api.get(`${API_BASE}/admin/team`, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  create: async (data: Omit<TeamMember, '_id'>) => {
    const response = await api.post(`${API_BASE}/admin/team`, data, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  update: async (id: string, data: Partial<TeamMember>) => {
    const response = await api.put(`${API_BASE}/admin/team/${id}`, data, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`${API_BASE}/admin/team/${id}`, {
      headers: getAuthHeaders()
    });
    return response.data;
  },
};

// ==================== JOB OPENINGS ADMIN ====================

export interface JobOpening {
  _id?: string;
  title: string;
  slug?: string;
  department: string;
  location: string;
  type: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  niceToHave?: string[];
  benefits?: string[];
  salaryRange?: {
    min: number;
    max: number;
    currency: string;
  };
  applicationCount?: number;
  featured: boolean;
  status: "open" | "closed" | "draft";
  postedAt?: string;
  closesAt?: string;
}

export const careerAPI = {
  list: async (filters?: { status?: string; department?: string }) => {
    const response = await api.get(`${API_BASE}/admin/careers`, {
      params: filters,
      headers: getAuthHeaders()
    });
    return response.data;
  },

  create: async (data: Omit<JobOpening, '_id' | 'slug'>) => {
    const response = await api.post(`${API_BASE}/admin/careers`, data, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  update: async (id: string, data: Partial<JobOpening>) => {
    const response = await api.put(`${API_BASE}/admin/careers/${id}`, data, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`${API_BASE}/admin/careers/${id}`, {
      headers: getAuthHeaders()
    });
    return response.data;
  },
};

// ==================== TUTORIALS ADMIN ====================

export interface Tutorial {
  _id?: string;
  title: string;
  slug?: string;
  excerpt: string;
  content: string;
  category: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  duration: number;
  image?: string;
  videoUrl?: string;
  steps: Array<{
    stepNumber: number;
    title: string;
    content: string;
    image?: string;
  }>;
  tags: string[];
  featured: boolean;
  status: "draft" | "published" | "archived";
  views?: number;
  helpful?: number;
}

export const tutorialAPI = {
  list: async () => {
    const response = await api.get(`${API_BASE}/admin/tutorials`, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  create: async (data: Omit<Tutorial, '_id' | 'slug'>) => {
    const response = await api.post(`${API_BASE}/admin/tutorials`, data, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  update: async (id: string, data: Partial<Tutorial>) => {
    const response = await api.put(`${API_BASE}/admin/tutorials/${id}`, data, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`${API_BASE}/admin/tutorials/${id}`, {
      headers: getAuthHeaders()
    });
    return response.data;
  },
};

// ==================== WHITEPAPERS ADMIN ====================

export interface Whitepaper {
  _id?: string;
  title: string;
  slug?: string;
  description: string;
  category: string;
  coverImage: string;
  icon?: string;
  fileUrl: string;
  pages: number;
  authors: string[];
  publishDate: string;
  downloads?: number;
  gated: boolean;
  featured: boolean;
  status: "draft" | "published" | "archived";
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
}

export const whitepaperAPI = {
  list: async () => {
    const response = await api.get(`${API_BASE}/admin/whitepapers`, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  create: async (data: Omit<Whitepaper, '_id' | 'slug'>) => {
    const response = await api.post(`${API_BASE}/admin/whitepapers`, data, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  update: async (id: string, data: Partial<Whitepaper>) => {
    const response = await api.put(`${API_BASE}/admin/whitepapers/${id}`, data, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`${API_BASE}/admin/whitepapers/${id}`, {
      headers: getAuthHeaders()
    });
    return response.data;
  },
};

// ==================== WEBINARS ADMIN ====================

export interface Webinar {
  _id?: string;
  title: string;
  slug?: string;
  description: string;
  type: "upcoming" | "recorded";
  category: string;
  date: string;
  time: string;
  timezone: string;
  duration: number;
  speakers: Array<{
    name: string;
    title: string;
    bio: string;
    image: string;
  }>;
  image: string;
  registrationUrl?: string;
  recordingUrl?: string;
  resources?: Array<{
    title: string;
    url: string;
  }>;
  registered?: number;
  views?: number;
  featured: boolean;
  status: "draft" | "published" | "archived";
}

export const webinarAPI = {
  list: async () => {
    const response = await api.get(`${API_BASE}/admin/webinars`, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  create: async (data: Omit<Webinar, '_id' | 'slug'>) => {
    const response = await api.post(`${API_BASE}/admin/webinars`, data, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  update: async (id: string, data: Partial<Webinar>) => {
    const response = await api.put(`${API_BASE}/admin/webinars/${id}`, data, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`${API_BASE}/admin/webinars/${id}`, {
      headers: getAuthHeaders()
    });
    return response.data;
  },
};

// ==================== SOLUTIONS ADMIN ====================

export interface SolutionFeature {
  icon?: string;
  title: string;
  description: string;
  color?: string;
}

export interface SolutionMetric {
  value: string;
  label: string;
}

export interface Solution {
  _id?: string;
  slug: string;
  name: string;
  hero: {
    badge?: string;
    icon?: string;
    title?: string;
    titleHighlight?: string;
    description?: string;
    primaryCta?: { text: string; link: string };
    secondaryCta?: { text: string; link: string };
  };
  featuresTitle?: string;
  featuresDescription?: string;
  features: SolutionFeature[];
  metrics: SolutionMetric[];
  seo: { title: string; description: string; keywords: string[] };
  status: "draft" | "published" | "archived";
  order: number;
  featured: boolean;
}

export const solutionAPI = {
  list: async () => {
    const response = await api.get(`${API_BASE}/admin/solutions`, { headers: getAuthHeaders() });
    return response.data as Solution[];
  },
  create: async (data: Omit<Solution, "_id">) => {
    const response = await api.post(`${API_BASE}/admin/solutions`, data, { headers: getAuthHeaders() });
    return response.data as Solution;
  },
  update: async (id: string, data: Partial<Solution>) => {
    const response = await api.put(`${API_BASE}/admin/solutions/${id}`, data, { headers: getAuthHeaders() });
    return response.data as Solution;
  },
  delete: async (id: string) => {
    const response = await api.delete(`${API_BASE}/admin/solutions/${id}`, { headers: getAuthHeaders() });
    return response.data;
  },
};

// ==================== INDUSTRIES ADMIN ====================

export interface IndustryBenefit {
  icon?: string;
  title: string;
  description: string;
  color?: string;
}

export interface IndustryStat {
  value: string;
  label: string;
}

export interface Industry {
  _id?: string;
  slug: string;
  name: string;
  hero: {
    badge?: string;
    icon?: string;
    title?: string;
    titleHighlight?: string;
    description?: string;
    primaryCta?: { text: string; link: string };
    secondaryCta?: { text: string; link: string };
  };
  benefitsTitle?: string;
  benefitsDescription?: string;
  benefits: IndustryBenefit[];
  stats: IndustryStat[];
  seo: { title: string; description: string; keywords: string[] };
  status: "draft" | "published" | "archived";
  order: number;
  featured: boolean;
}

export const industryAPI = {
  list: async () => {
    const response = await api.get(`${API_BASE}/admin/industries`, { headers: getAuthHeaders() });
    return response.data as Industry[];
  },
  create: async (data: Omit<Industry, "_id">) => {
    const response = await api.post(`${API_BASE}/admin/industries`, data, { headers: getAuthHeaders() });
    return response.data as Industry;
  },
  update: async (id: string, data: Partial<Industry>) => {
    const response = await api.put(`${API_BASE}/admin/industries/${id}`, data, { headers: getAuthHeaders() });
    return response.data as Industry;
  },
  delete: async (id: string) => {
    const response = await api.delete(`${API_BASE}/admin/industries/${id}`, { headers: getAuthHeaders() });
    return response.data;
  },
};

// ==================== USE CASES ADMIN ====================

export interface UseCaseStep {
  title: string;
  description: string;
}

export interface UseCase {
  _id?: string;
  slug: string;
  title: string;
  category: string;
  icon?: string;
  color?: string;
  summary?: string;
  problem?: string;
  solution?: string;
  outcome?: string;
  steps: UseCaseStep[];
  image?: string;
  seo: { title: string; description: string; keywords: string[] };
  status: "draft" | "published" | "archived";
  order: number;
  featured: boolean;
}

export const useCaseAPI = {
  list: async (filters?: { status?: string; category?: string }) => {
    const response = await api.get(`${API_BASE}/admin/use-cases`, {
      params: filters,
      headers: getAuthHeaders(),
    });
    return response.data as UseCase[];
  },
  create: async (data: Omit<UseCase, "_id">) => {
    const response = await api.post(`${API_BASE}/admin/use-cases`, data, { headers: getAuthHeaders() });
    return response.data as UseCase;
  },
  update: async (id: string, data: Partial<UseCase>) => {
    const response = await api.put(`${API_BASE}/admin/use-cases/${id}`, data, { headers: getAuthHeaders() });
    return response.data as UseCase;
  },
  delete: async (id: string) => {
    const response = await api.delete(`${API_BASE}/admin/use-cases/${id}`, { headers: getAuthHeaders() });
    return response.data;
  },
};

// ==================== HELP ARTICLES ADMIN ====================

export interface HelpArticle {
  _id?: string;
  slug: string;
  title: string;
  category: string;
  icon?: string;
  excerpt?: string;
  content?: string;
  tags: string[];
  views?: number;
  helpful?: number;
  notHelpful?: number;
  seo: { title: string; description: string; keywords: string[] };
  status: "draft" | "published" | "archived";
  order: number;
  featured: boolean;
}

export const helpArticleAPI = {
  list: async (filters?: { status?: string; category?: string }) => {
    const response = await api.get(`${API_BASE}/admin/help-articles`, {
      params: filters,
      headers: getAuthHeaders(),
    });
    return response.data as HelpArticle[];
  },
  create: async (data: Omit<HelpArticle, "_id">) => {
    const response = await api.post(`${API_BASE}/admin/help-articles`, data, { headers: getAuthHeaders() });
    return response.data as HelpArticle;
  },
  update: async (id: string, data: Partial<HelpArticle>) => {
    const response = await api.put(`${API_BASE}/admin/help-articles/${id}`, data, { headers: getAuthHeaders() });
    return response.data as HelpArticle;
  },
  delete: async (id: string) => {
    const response = await api.delete(`${API_BASE}/admin/help-articles/${id}`, { headers: getAuthHeaders() });
    return response.data;
  },
};

// ==================== MARKETING STATS ADMIN ====================

export interface MarketingStats {
  _id: string;
  users: { total: number; active: number };
  companies: { total: number; active: number };
  projects: { total: number; completed: number };
  tasks: { total: number; completed: number };
  satisfaction: number;
  uptime: number;
  responseTime: number;
  updatedAt: string;
}

export const statsAPI = {
  get: async () => {
    const response = await api.get(`${API_BASE}/admin/stats`, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  update: async (data: Partial<MarketingStats>) => {
    const response = await api.put(`${API_BASE}/admin/stats`, data, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  refresh: async () => {
    const response = await api.post(`${API_BASE}/admin/stats/refresh`, {}, {
      headers: getAuthHeaders()
    });
    return response.data;
  },
};

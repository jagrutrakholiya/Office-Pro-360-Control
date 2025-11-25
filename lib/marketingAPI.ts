// Control Panel Marketing CMS API Client
import api from './api';

const API_BASE = '/marketing';

// Helper to get auth headers
function getAuthHeaders() {
  const token = localStorage.getItem('token');
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

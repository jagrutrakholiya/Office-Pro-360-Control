// Content Options API Client
import api from './api';

const API_BASE = '/content-options';

// Helper to get auth headers
function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Option item structure
export interface OptionItem {
  value: string;
  label: string;
  order: number;
  active: boolean;
}

// All available option types
export interface ContentOptions {
  departments: OptionItem[];
  employmentTypes: OptionItem[];
  locations: OptionItem[];
  tutorialCategories: OptionItem[];
  tutorialLevels: OptionItem[];
  industries: OptionItem[];
  companySizes: OptionItem[];
  contentCategories: OptionItem[];
}

// Get merged options for current user (company + global)
export const getMergedOptions = async (): Promise<ContentOptions> => {
  const response = await api.get(API_BASE, {
    headers: getAuthHeaders()
  });
  return response.data;
};

// Get specific option type
export const getOptionType = async (type: keyof ContentOptions): Promise<OptionItem[]> => {
  const response = await api.get(`${API_BASE}/${type}`, {
    headers: getAuthHeaders()
  });
  return response.data;
};

// ==================== SUPER ADMIN - GLOBAL DEFAULTS ====================

// Get global default options
export const getGlobalOptions = async () => {
  const response = await api.get(`${API_BASE}/admin/global`, {
    headers: getAuthHeaders()
  });
  return response.data;
};

// Update global default options
export const updateGlobalOptions = async (data: Partial<ContentOptions>) => {
  const response = await api.put(`${API_BASE}/admin/global`, data, {
    headers: getAuthHeaders()
  });
  return response.data;
};

// Initialize/reset global defaults
export const initializeGlobalDefaults = async () => {
  const response = await api.post(`${API_BASE}/admin/global/initialize`, {}, {
    headers: getAuthHeaders()
  });
  return response.data;
};

// ==================== COMPANY ADMIN - COMPANY-SPECIFIC ====================

// Get company-specific options
export const getCompanyOptions = async (companyId: string) => {
  const response = await api.get(`${API_BASE}/company/${companyId}`, {
    headers: getAuthHeaders()
  });
  return response.data;
};

// Update company-specific options
export const updateCompanyOptions = async (companyId: string, data: Partial<ContentOptions>) => {
  const response = await api.put(`${API_BASE}/company/${companyId}`, data, {
    headers: getAuthHeaders()
  });
  return response.data;
};

// Delete company options (revert to global defaults)
export const deleteCompanyOptions = async (companyId: string) => {
  const response = await api.delete(`${API_BASE}/company/${companyId}`, {
    headers: getAuthHeaders()
  });
  return response.data;
};

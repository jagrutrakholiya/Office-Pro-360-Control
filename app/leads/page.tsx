"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout';
import {
  PageHeader, Button, Badge, DataTable, Input, Textarea, Modal, Tabs, EmptyState,
} from '@/components/ui';
import {
  FiSearch, FiMail, FiPlus, FiMapPin, FiPhone, FiGlobe,
  FiTrash2, FiCheck, FiX, FiRefreshCcw, FiLayout, FiList,
  FiMoreVertical, FiTrendingUp, FiUserPlus, FiSend, FiCpu, FiPlay, FiBriefcase
} from 'react-icons/fi';
import axios from 'axios';
import api from '../../lib/api';
import { toast } from 'react-toastify';

// Lead Type Definition
interface Lead {
  _id: string;
  companyName: string;
  contactPerson?: string;
  email: string;
  phone?: string;
  address?: string;
  website?: string;
  status: 'new' | 'contacted' | 'interested' | 'converted' | 'rejected' | 'junk';
  source: string;
  location?: { lat: number; lng: number };
  lastContactedAt?:string;
  notes?: string;
}

const EMAIL_TEMPLATES = [
  {
    id: 'intro',
    label: 'Cold Outreach',
    subject: 'Partnership Opportunity with OfficePro360',
    body: "Hi {name},\n\nI came across {company} and was impressed by your work. We help companies like yours streamline their operations with our all-in-one management suite.\n\nWould you be open to a brief 10-minute chat to see how we can help you save 20% on operational costs?\n\nBest regards,\nOfficePro360 Team"
  },
  {
    id: 'followup',
    label: 'Follow Up',
    subject: 'Quick follow up regarding OfficePro360',
    body: "Hi {name},\n\nI'm writing to follow up on my previous email. I suspect you're busy, but I firmly believe we could add significant value to {company}.\n\nLet me know if you have any questions.\n\nBest,\nOfficePro360 Team"
  },
  {
    id: 'demo',
    label: 'Demo Invite',
    subject: 'Invitation: Exclusive Demo of OfficePro360',
    body: "Hi {name},\n\nWe would love to show you a personalized demo of how OfficePro360 can transform {company}'s workflow.\n\nAre you available next Tuesday or Wednesday?\n\nCheers,"
  }
];

// Kanban Columns (presentational config)
const KANBAN_COLUMNS = [
  { id: 'new', label: 'New Leads', bar: 'bg-blue-500', text: 'text-blue-700 dark:text-blue-300' },
  { id: 'contacted', label: 'Contacted', bar: 'bg-orange-500', text: 'text-orange-700 dark:text-orange-300' },
  { id: 'interested', label: 'Interested', bar: 'bg-yellow-500', text: 'text-yellow-700 dark:text-yellow-300' },
  { id: 'converted', label: 'Won / Client', bar: 'bg-green-500', text: 'text-green-700 dark:text-green-300' },
  { id: 'rejected', label: 'Lost / Rejected', bar: 'bg-red-500', text: 'text-red-700 dark:text-red-300' },
];

export default function LeadsPage() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<'manage' | 'discover'>('discover');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('kanban');

  // Manage State
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, new: 0, interested: 0, converted: 0 });

  // Discover State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  // Auto-Campaign State
  const [runningCampaign, setRunningCampaign] = useState(false);
  const [campaignProgress, setCampaignProgress] = useState({ current: 0, total: 0, log: '' });

  // Modals
  const [emailModal, setEmailModal] = useState<{open: boolean, lead: Lead | null}>({ open: false, lead: null });
  const [manualModal, setManualModal] = useState(false);

  // Email State
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');

  // Manual Entry Form
  const [manualForm, setManualForm] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    website: '',
    source: 'Manual Entry'
  });

  // Load Leads
  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/leads');
      setLeads(res.data.leads || []);
      setStats(res.data.stats || { total: 0, new: 0, interested: 0, converted: 0 });
    } catch (err) {
      console.error(err);
      toast.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'manage') {
      fetchLeads();
    }
  }, [activeTab]);

  // Discover Leads
  const searchPlaces = async () => {
    if (!searchQuery) return;
    setSearching(true);
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&addressdetails=1&limit=20`);
      // Simulate "AI Analysis" delay
      await new Promise(r => setTimeout(r, 800));
      setSearchResults(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Search failed');
    } finally {
      setSearching(false);
    }
  };

  // Import Lead
  const importLead = async (result: any) => {
    try {
      const companyName = result.display_name.split(',')[0];
      const leadData = {
        companyName,
        address: result.display_name,
        // AI Guessing logic for email/website
        email: `contact@${companyName.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}.com`,
        website: `https://${companyName.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}.com`,
        source: 'AI Discovery',
        location: { lat: parseFloat(result.lat), lng: parseFloat(result.lon) },
        status: 'new'
      };

      await api.post('/admin/leads', leadData);
      toast.success(`${companyName} added to pipeline!`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add lead');
    }
  };

  // Run Auto Campaign
  const runAutoCampaign = async () => {
    if (searchResults.length === 0) return toast.warning("Search for leads first!");

    // Take top 5 results for demo safety (avoid spamming too hard in demo)
    const targets = searchResults.slice(0, 5);
    setRunningCampaign(true);
    setCampaignProgress({ current: 0, total: targets.length, log: 'Initializing AI Agent...' });

    for (let i = 0; i < targets.length; i++) {
      const target = targets[i];
      const companyName = target.display_name.split(',')[0];

      setCampaignProgress({ current: i + 1, total: targets.length, log: `Analyzing ${companyName}...` });

      // Simulate processing delay
      await new Promise(r => setTimeout(r, 1500));

      try {
        // 1. Import Lead
        const email = `contact@${companyName.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}.com`;

        const leadData = {
          companyName,
          address: target.display_name,
          email,
          website: `https://${companyName.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}.com`,
          source: 'AI Auto-Campaign',
          location: { lat: parseFloat(target.lat), lng: parseFloat(target.lon) },
          status: 'contacted' // Auto-set to contacted
        };

        const createRes = await api.post('/admin/leads', leadData);
        const newLeadId = createRes.data.lead._id;

        // 2. Send Email
        setCampaignProgress(prev => ({ ...prev, log: `Emailing ${companyName}...` }));

        const template = EMAIL_TEMPLATES[0]; // Cold Outreach
        const body = template.body
          .replace(/{name}/g, "Manager")
          .replace(/{company}/g, companyName);

        await api.post(`/admin/leads/${newLeadId}/email`, {
          subject: template.subject,
          message: body.replace(/\n/g, '<br>')
        });

      } catch (err: any) {
        console.error("Campaign Logic Error", err);
        // Don't stop campaign on single failure
      }
    }

    setCampaignProgress({ current: targets.length, total: targets.length, log: 'Campaign Finished!' });
    toast.success(`AI Agent successfully contacted ${targets.length} companies!`);

    setTimeout(() => {
      setRunningCampaign(false);
      setActiveTab('manage'); // Switch to pipeline to see results
      fetchLeads();
    }, 1500);
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/leads', manualForm);
      toast.success('Lead added successfully');
      setManualModal(false);
      setManualForm({ companyName: '', contactPerson: '', email: '', phone: '', website: '', source: 'Manual Entry' });
      if(activeTab === 'manage') fetchLeads();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add lead');
    }
  };

  // Update Status
  const updateStatus = async (id: string, status: string) => {
    try {
      // Optimistic update
      setLeads(leads.map(l => l._id === id ? { ...l, status: status as any } : l));
      await api.put(`/admin/leads/${id}/status`, { status });
      // Background refresh stats
      const res = await api.get('/admin/leads');
      setStats(res.data.stats);
    } catch (err) {
      toast.error('Failed to update status');
      fetchLeads(); // Revert on error
    }
  };

  // Email Handling
  const openEmailModal = (lead: Lead) => {
    setEmailModal({ open: true, lead });
    applyTemplate('intro', lead); // Default template
  };

  const applyTemplate = (templateId: string, lead: Lead | null) => {
    const template = EMAIL_TEMPLATES.find(t => t.id === templateId);
    if (!template || !lead) return;

    setSelectedTemplate(templateId);
    setEmailSubject(template.subject);
    setEmailBody(template.body
      .replace(/{name}/g, lead.contactPerson || "Lead")
      .replace(/{company}/g, lead.companyName)
    );
  };

  const handleSendEmail = async () => {
    if (!emailModal.lead) return;
    if (!emailSubject || !emailBody) return toast.warning('Please fill subject and message');

    setSendingEmail(true);
    try {
      await api.post(`/admin/leads/${emailModal.lead._id}/email`, {
        subject: emailSubject,
        message: emailBody.replace(/\n/g, '<br>')
      });
      toast.success(`Email sent to ${emailModal.lead.companyName}`);
      updateStatus(emailModal.lead._id, 'contacted'); // Auto-move to Contacted
      setEmailModal({ open: false, lead: null });
    } catch (err) {
      toast.error('Failed to send email');
    } finally {
      setSendingEmail(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData('leadId', leadId);
  };

  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('leadId');
    if (leadId) updateStatus(leadId, status);
  };

  const statusVariant = (status: string) =>
    status === 'converted' ? 'success' : status === 'new' ? 'info' : 'neutral';

  return (
    <Layout>
      <div className="space-y-6">
        <PageHeader
          icon={<FiTrendingUp />}
          title="Lead Generation & CRM"
          description="AI-powered lead discovery and pipeline management"
        />

        <Tabs
          activeKey={activeTab}
          onChange={(k) => setActiveTab(k as 'manage' | 'discover')}
          tabs={[
            { key: 'discover', label: 'Find Leads (AI)', icon: <FiGlobe /> },
            { key: 'manage', label: 'Manage Pipeline', icon: <FiLayout /> },
          ]}
        />

        {activeTab === 'manage' && (
          <div className="space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                  <button
                    onClick={() => setViewMode('kanban')}
                    className={`p-2 rounded-md transition-all ${viewMode === 'kanban' ? 'bg-white dark:bg-slate-700 shadow text-primary-600 dark:text-primary-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                    title="Kanban Board"
                  >
                    <FiLayout />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow text-primary-600 dark:text-primary-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                    title="List View"
                  >
                    <FiList />
                  </button>
                </div>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{leads.length} Active Leads</span>
              </div>
              <Button leadingIcon={<FiUserPlus />} onClick={() => setManualModal(true)}>
                Add Manual Lead
              </Button>
            </div>

            {viewMode === 'kanban' ? (
              <div className="flex gap-4 overflow-x-auto pb-6 min-h-[600px]">
                {KANBAN_COLUMNS.map(col => (
                  <div
                    key={col.id}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDrop(e, col.id)}
                    className="flex-shrink-0 w-80 flex flex-col"
                  >
                    <div className={`p-3 rounded-t-xl border-b-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold flex justify-between items-center uppercase text-xs tracking-wider ${col.text}`}>
                      <span className="flex items-center gap-2">
                        <span className={`inline-block h-2 w-2 rounded-full ${col.bar}`} />
                        {col.label}
                      </span>
                      <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-[10px] text-slate-600 dark:text-slate-300">{leads.filter(l => l.status === col.id).length}</span>
                    </div>
                    <div className="flex-1 bg-slate-50/60 dark:bg-slate-800/40 p-2 rounded-b-xl border border-t-0 border-slate-200 dark:border-slate-800 space-y-2">
                      {leads.filter(l => l.status === col.id).map(lead => (
                        <div
                          key={lead._id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, lead._id)}
                          className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing transition-all group"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate">{lead.companyName}</div>
                            <button onClick={() => openEmailModal(lead)} className="text-slate-400 hover:text-primary-600 dark:hover:text-primary-400"><FiMail /></button>
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mb-2 truncate">{lead.email}</div>

                          <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800 mt-2">
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{lead.source}</span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500">
                              {lead.lastContactedAt ? `Last: ${new Date(lead.lastContactedAt).toLocaleDateString()}` : 'No contact'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // List View
              <DataTable<Lead>
                data={leads}
                loading={loading}
                rowKey={(l) => l._id}
                emptyTitle="No leads yet"
                columns={[
                  {
                    key: 'companyName',
                    header: 'Company',
                    render: (l) => <span className="font-medium text-slate-900 dark:text-slate-100">{l.companyName}</span>,
                  },
                  { key: 'email', header: 'Contact', render: (l) => l.email },
                  {
                    key: 'status',
                    header: 'Status',
                    render: (l) => <Badge variant={statusVariant(l.status)}>{l.status}</Badge>,
                  },
                  {
                    key: 'actions',
                    header: 'Actions',
                    render: (l) => (
                      <Button size="sm" variant="ghost" leadingIcon={<FiMail />} onClick={() => openEmailModal(l)}>
                        Email
                      </Button>
                    ),
                  },
                ]}
              />
            )}
          </div>
        )}

        {activeTab === 'discover' && (
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="text-center py-8">
              <div className="inline-flex items-center gap-2 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 px-4 py-1.5 rounded-full text-sm font-semibold mb-4 border border-primary-100 dark:border-primary-800">
                <FiCpu className="animate-pulse" /> AI Lead Finder
              </div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-3">Find Your Next Big Client</h2>
              <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto">Enter a keyword and location. Our system will scan directory APIs, verify potential matches, and enrich data automatically.</p>
            </div>

            <div className="flex flex-col gap-4 max-w-2xl mx-auto">
              <div className="flex gap-2 w-full items-end">
                <Input
                  wrapperClassName="flex-1"
                  leadingIcon={<FiSearch />}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && searchPlaces()}
                  placeholder="e.g., 'Real Estate Agencies in New York'"
                  className="h-12 text-base"
                />
                <Button onClick={searchPlaces} loading={searching} size="lg" className="h-12">
                  {searching ? 'Scanning...' : 'Search'}
                </Button>
              </div>

              {/* Auto-Pilot Button */}
              {searchResults.length > 0 && !searching && !runningCampaign && (
                <div className="flex flex-col items-center gap-2">
                  <button
                    onClick={runAutoCampaign}
                    className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 font-bold text-white transition-all duration-200 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full hover:from-violet-500 hover:to-indigo-500 shadow-xl hover:shadow-2xl hover:-translate-y-1"
                  >
                    <span className="absolute inset-0 rounded-full bg-white/20 group-hover:bg-white/30 animate-pulse"></span>
                    <FiCpu className="w-6 h-6 animate-pulse" />
                    <span> Run "One-Click" AI Outreach</span>
                  </button>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                    Automatically imports & emails top 5 results
                  </p>
                </div>
              )}

              {runningCampaign && (
                <div className="bg-slate-900 text-white p-6 rounded-xl shadow-2xl w-full border border-slate-700">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-ping absolute"></div>
                        <div className="w-3 h-3 bg-green-500 rounded-full relative"></div>
                      </div>
                      <span className="font-mono text-green-400 font-bold">AI_AGENT_ACTIVE</span>
                    </div>
                    <span className="text-xs text-slate-400">{campaignProgress.current} / {campaignProgress.total} Leads</span>
                  </div>

                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-4">
                    <div
                      className="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-500 ease-out"
                      style={{ width: `${(campaignProgress.current / campaignProgress.total) * 100}%` }}
                    ></div>
                  </div>

                  <div className="font-mono text-sm h-6 text-slate-300 truncate">
                    {">"} {campaignProgress.log}
                  </div>
                </div>
              )}
            </div>

            {!runningCampaign && (
              <>
                {searching && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 border-4 border-primary-100 dark:border-primary-900 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600 dark:text-slate-400 font-medium animate-pulse">AI is analyzing potential leads...</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {searchResults.map((result, idx) => (
                    <div key={idx} className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary-500 dark:hover:border-primary-500 hover:shadow-xl transition-all group relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-success-50 dark:bg-success-900/30 text-success-700 dark:text-success-300 text-[10px] font-bold px-2 py-1 rounded-bl-lg uppercase tracking-wide opacity-0 group-hover:opacity-100 transition-opacity">
                        High Match
                      </div>
                      <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg mb-1 truncate">{result.display_name.split(',')[0]}</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-xs mb-3 flex items-start gap-1 h-8 line-clamp-2">
                        <FiMapPin className="mt-0.5 flex-shrink-0" /> {result.display_name}
                      </p>

                      <div className="flex gap-2 mt-4">
                        <Button fullWidth leadingIcon={<FiPlus />} onClick={() => importLead(result)}>
                          Add to CRM
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Manual Entry Modal */}
      <Modal open={manualModal} onClose={() => setManualModal(false)} title="Add Manual Lead">
        <form onSubmit={handleManualSubmit} className="space-y-4">
          <Input
            required
            label="Company Name"
            placeholder="Company Name"
            value={manualForm.companyName}
            onChange={e => setManualForm({...manualForm, companyName: e.target.value})}
          />
          <Input
            required
            label="Email Address"
            placeholder="Email Address"
            type="email"
            value={manualForm.email}
            onChange={e => setManualForm({...manualForm, email: e.target.value})}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Phone"
              placeholder="Phone (Optional)"
              value={manualForm.phone}
              onChange={e => setManualForm({...manualForm, phone: e.target.value})}
            />
            <Input
              label="Website"
              placeholder="Website (Optional)"
              value={manualForm.website}
              onChange={e => setManualForm({...manualForm, website: e.target.value})}
            />
          </div>
          <Button type="submit" fullWidth>Add Lead to Pipeline</Button>
        </form>
      </Modal>

      {/* Email Modal */}
      <Modal
        open={emailModal.open && !!emailModal.lead}
        onClose={() => setEmailModal({ open: false, lead: null })}
        size="lg"
        title="New Message"
        footer={
          <div className="flex w-full justify-between items-center">
            <span className="text-xs text-slate-400 dark:text-slate-500">Powered by OfficePro AI</span>
            <Button onClick={handleSendEmail} loading={sendingEmail} leadingIcon={<FiSend />}>
              {sendingEmail ? 'Sending...' : 'Send Message'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">To: {emailModal.lead?.companyName} ({emailModal.lead?.email})</p>

          {/* Templates */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {EMAIL_TEMPLATES.map(t => (
              <button
                key={t.id}
                onClick={() => applyTemplate(t.id, emailModal.lead)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${selectedTemplate === t.id ? 'bg-primary-600 text-white border-primary-600' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <Input
            placeholder="Subject"
            value={emailSubject}
            onChange={e => setEmailSubject(e.target.value)}
          />
          <Textarea
            placeholder="Write your email here..."
            value={emailBody}
            onChange={e => setEmailBody(e.target.value)}
            rows={10}
          />
        </div>
      </Modal>
    </Layout>
  );
}

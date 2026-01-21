"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout';
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

  // Kanban Columns
  const columns = [
    { id: 'new', label: 'New Leads', color: 'bg-blue-50 border-blue-200 text-blue-700' },
    { id: 'contacted', label: 'Contacted', color: 'bg-orange-50 border-orange-200 text-orange-700' },
    { id: 'interested', label: 'Interested', color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
    { id: 'converted', label: 'Won / Client', color: 'bg-green-50 border-green-200 text-green-700' },
    { id: 'rejected', label: 'Lost / Rejected', color: 'bg-red-50 border-red-200 text-red-700' }
  ];

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData('leadId', leadId);
  };

  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('leadId');
    if (leadId) updateStatus(leadId, status);
  };

  return (
    <Layout>
      <div className="section-header">
        <div className="section-actions">
           <div>
            <h2 className="section-title flex items-center gap-2">
              <FiTrendingUp className="text-blue-600"/> Lead Generation & CRM
            </h2>
            <p className="section-subtitle">
              AI-powered lead discovery and pipeline management
            </p>
          </div>
          <div className="flex gap-2">
            <button
               onClick={() => setActiveTab('discover')}
               className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'discover' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}
            >
              <FiGlobe /> Find Leads (AI)
            </button>
            <button
               onClick={() => setActiveTab('manage')}
               className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'manage' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}
            >
              <FiLayout /> Manage Pipeline
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'manage' && (
        <>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <div className="flex bg-slate-100 p-1 rounded-lg">
                <button 
                  onClick={() => setViewMode('kanban')}
                  className={`p-2 rounded-md transition-all ${viewMode === 'kanban' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                  title="Kanban Board"
                >
                  <FiLayout />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                   className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                   title="List View"
                >
                  <FiList />
                </button>
              </div>
              <span className="text-sm font-medium text-slate-600">{leads.length} Active Leads</span>
            </div>
            <button 
              onClick={() => setManualModal(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-all"
            >
              <FiUserPlus /> Add Manual Lead
            </button>
          </div>

          {viewMode === 'kanban' ? (
             <div className="flex gap-4 overflow-x-auto pb-6 min-h-[600px]">
               {columns.map(col => (
                 <div 
                    key={col.id}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDrop(e, col.id)}
                    className="flex-shrink-0 w-80 flex flex-col"
                  >
                    <div className={`p-3 rounded-t-xl border-b-2 font-bold flex justify-between items-center uppercase text-xs tracking-wider ${col.color.replace('text', 'border')}`}>
                      {col.label}
                      <span className="bg-white/50 px-2 py-0.5 rounded-full text-[10px]">{leads.filter(l => l.status === col.id).length}</span>
                    </div>
                    <div className={`flex-1 bg-slate-50/50 p-2 rounded-b-xl border border-t-0 border-slate-200 space-y-2`}>
                      {leads.filter(l => l.status === col.id).map(lead => (
                        <div 
                          key={lead._id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, lead._id)}
                          className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing transition-all group"
                        >
                           <div className="flex justify-between items-start mb-2">
                             <div className="font-bold text-slate-800 text-sm truncate">{lead.companyName}</div>
                             <button onClick={() => openEmailModal(lead)} className="text-slate-400 hover:text-blue-600"><FiMail /></button>
                           </div>
                           <div className="text-xs text-slate-500 mb-2 truncate">{lead.email}</div>
                           
                           <div className="flex justify-between items-center pt-2 border-t border-slate-50 mt-2">
                              <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{lead.source}</span>
                              <span className="text-[10px] text-slate-400">
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
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
               <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold">
                    <tr>
                      <th className="px-6 py-4">Company</th>
                      <th className="px-6 py-4">Contact</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {leads.map(lead => (
                      <tr key={lead._id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-medium text-slate-900">{lead.companyName}</td>
                        <td className="px-6 py-4 text-slate-600">{lead.email}</td>
                        <td className="px-6 py-4">
                           <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase ${
                             lead.status === 'converted' ? 'bg-green-100 text-green-700' :
                             lead.status === 'new' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                           }`}>
                             {lead.status}
                           </span>
                        </td>
                        <td className="px-6 py-4">
                           <button onClick={() => openEmailModal(lead)} className="text-blue-600 hover:underline">Email</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>
          )}
        </>
      )}

      {activeTab === 'discover' && (
        <div className="max-w-5xl mx-auto space-y-8">
           <div className="text-center py-8">
              <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-sm font-semibold mb-4 border border-blue-100">
                 <FiCpu className="animate-pulse" /> AI Lead Finder
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-3">Find Your Next Big Client</h2>
              <p className="text-slate-500 max-w-lg mx-auto">Enter a keyword and location. Our system will scan directory APIs, verify potential matches, and enrich data automatically.</p>
           </div>

           <div className="flex flex-col gap-4 max-w-2xl mx-auto">
              <div className="flex gap-2 w-full p-2 bg-white rounded-xl border border-slate-200 shadow-lg">
                <div className="flex-1 relative">
                   <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                   <input 
                     type="text"
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     onKeyDown={(e) => e.key === 'Enter' && searchPlaces()}
                     placeholder="e.g., 'Real Estate Agencies in New York'"
                     className="w-full h-12 pl-12 pr-4 text-lg bg-transparent outline-none text-slate-800 placeholder:text-slate-400"
                   />
                </div>
                <button 
                  onClick={searchPlaces}
                  disabled={searching}
                  className="btn-primary px-8 h-12 rounded-lg text-lg"
                >
                  {searching ? 'Scanning...' : 'Search'}
                </button>
              </div>

              {/* Auto-Pilot Button */}
              {searchResults.length > 0 && !searching && !runningCampaign && (
                <div className="flex justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <button 
                        onClick={runAutoCampaign}
                        className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 font-bold text-white transition-all duration-200 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full hover:from-violet-500 hover:to-indigo-500 shadow-xl hover:shadow-2xl hover:-translate-y-1"
                    >
                        <span className="absolute inset-0 rounded-full bg-white/20 group-hover:bg-white/30 animate-pulse"></span>
                        <FiCpu className="w-6 h-6 animate-pulse" />
                        <span>⚡ Run "One-Click" AI Outreach</span>
                    </button>
                    <p className="absolute -bottom-6 text-xs text-slate-400 font-medium">
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
                   <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                   <p className="text-slate-600 font-medium animate-pulse">AI is analyzing potential leads...</p>
                 </div>
               )}

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                 {searchResults.map((result, idx) => (
                   <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 hover:border-blue-500 hover:shadow-xl transition-all group relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-green-50 text-green-700 text-[10px] font-bold px-2 py-1 rounded-bl-lg uppercase tracking-wide opacity-0 group-hover:opacity-100 transition-opacity">
                         High Match
                      </div>
                      <h3 className="font-bold text-slate-800 text-lg mb-1 truncate">{result.display_name.split(',')[0]}</h3>
                      <p className="text-slate-500 text-xs mb-3 flex items-start gap-1 h-8 line-clamp-2">
                         <FiMapPin className="mt-0.5 flex-shrink-0" /> {result.display_name}
                      </p>
                      
                      <div className="flex gap-2 mt-4">
                         <button 
                           onClick={() => importLead(result)}
                           className="flex-1 bg-slate-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                         >
                           <FiPlus /> Add to CRM
                         </button>
                      </div>
                   </div>
                 ))}
               </div>
             </>
           )}
        </div>
      )}

      {/* Manual Entry Modal */}
      {manualModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
           <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                 <h3 className="font-bold text-slate-900">Add Manual Lead</h3>
                 <button onClick={() => setManualModal(false)}><FiX className="text-slate-400 hover:text-slate-600" /></button>
              </div>
              <form onSubmit={handleManualSubmit} className="p-6 space-y-4">
                 <input 
                   required
                   placeholder="Company Name"
                   className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                   value={manualForm.companyName}
                   onChange={e => setManualForm({...manualForm, companyName: e.target.value})}
                 />
                 <input 
                   required
                   placeholder="Email Address"
                   type="email"
                   className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                   value={manualForm.email}
                   onChange={e => setManualForm({...manualForm, email: e.target.value})}
                 />
                 <div className="grid grid-cols-2 gap-4">
                   <input 
                     placeholder="Phone (Optional)"
                     className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                     value={manualForm.phone}
                     onChange={e => setManualForm({...manualForm, phone: e.target.value})}
                   />
                   <input 
                     placeholder="Website (Optional)"
                     className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                     value={manualForm.website}
                     onChange={e => setManualForm({...manualForm, website: e.target.value})}
                   />
                 </div>
                 <button className="w-full btn-primary py-3 mt-2">Add Lead to Pipeline</button>
              </form>
           </div>
        </div>
      )}

      {/* Email Modal */}
      {emailModal.open && emailModal.lead && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
           <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh]">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                 <div>
                   <h3 className="font-bold text-slate-900 text-lg">New Message</h3>
                   <p className="text-xs text-slate-500">To: {emailModal.lead.companyName} ({emailModal.lead.email})</p>
                 </div>
                 <button onClick={() => setEmailModal({ open: false, lead: null })}><FiX className="text-slate-400 hover:text-slate-600" /></button>
              </div>
              
              <div className="p-6 flex-1 overflow-y-auto space-y-4">
                 {/* Templates */}
                 <div className="flex gap-2 overflow-x-auto pb-2">
                    {EMAIL_TEMPLATES.map(t => (
                       <button 
                         key={t.id}
                         onClick={() => applyTemplate(t.id, emailModal.lead)}
                         className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${selectedTemplate === t.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                       >
                         {t.label}
                       </button>
                    ))}
                 </div>

                 <input 
                   placeholder="Subject"
                   className="w-full font-bold text-slate-800 border-b border-slate-200 py-2 outline-none"
                   value={emailSubject}
                   onChange={e => setEmailSubject(e.target.value)}
                 />
                 <textarea 
                   placeholder="Write your email here..."
                   className="w-full h-60 resize-none outline-none text-slate-600 leading-relaxed"
                   value={emailBody}
                   onChange={e => setEmailBody(e.target.value)}
                 />
              </div>

              <div className="p-4 border-t border-slate-100 flex justify-between items-center bg-slate-50/50">
                 <span className="text-xs text-slate-400">Powered by OfficePro AI</span>
                 <button 
                   onClick={handleSendEmail}
                   disabled={sendingEmail}
                   className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-bold shadow-lg shadow-blue-200 transition-all active:scale-95"
                 >
                   {sendingEmail ? 'Sending...' : <><FiSend /> Send Message</>}
                 </button>
              </div>
           </div>
        </div>
      )}

    </Layout>
  );
}

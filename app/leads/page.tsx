"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout';
import { FiSearch, FiMail, FiPlus, FiMapPin, FiPhone, FiGlobe, FiTrash2, FiCheck, FiX, FiRefreshCcw } from 'react-icons/fi';
import axios from 'axios';
import api from '../../lib/api';

// Lead Type Definition
interface Lead {
  _id: string;
  companyName: string;
  email: string;
  phone?: string;
  address?: string;
  website?: string;
  status: 'new' | 'contacted' | 'interested' | 'converted' | 'rejected' | 'junk';
  source: string;
  location?: { lat: number; lng: number };
  lastContactedAt?:string;
}

export default function LeadsPage() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<'manage' | 'discover'>('discover');
  
  // Manage State
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, new: 0, interested: 0, converted: 0 });
  
  // Discover State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  
  // Email Modal State
  const [emailModal, setEmailModal] = useState<{open: boolean, leadId: string | null, email: string}>({ open: false, leadId: null, email: '' });
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  // Load Leads
  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/leads');
      setLeads(res.data.leads || []);
      setStats(res.data.stats || { total: 0, new: 0, interested: 0, converted: 0 });
    } catch (err) {
      console.error(err);
      // alert('Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'manage') {
      fetchLeads();
    }
  }, [activeTab]);

  // Discover Leads (Using Nominatim Basic Search for Demo)
  const searchPlaces = async () => {
    if (!searchQuery) return;
    setSearching(true);
    try {
      // Searching against OpenStreetMap Nominatim for demo
      const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&addressdetails=1&limit=20`);
      setSearchResults(res.data);
    } catch (err) {
      console.error(err);
      alert('Search failed');
    } finally {
      setSearching(false);
    }
  };

  // Import Lead
  const importLead = async (result: any) => {
    try {
      // Guessing details from OSM result
      const leadData = {
        companyName: result.display_name.split(',')[0],
        address: result.display_name,
        email: `contact@${result.display_name.split(',')[0].replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}.com`, // Cleaner placeholder
        website: `https://${result.display_name.split(',')[0].replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}.com`,
        source: 'Map Search',
        location: { lat: parseFloat(result.lat), lng: parseFloat(result.lon) }
      };

      await api.post('/admin/leads', leadData);
      
      alert('Lead added!');
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to add lead');
    }
  };

  // Update Status
  const updateStatus = async (id: string, status: string) => {
    try {
      await api.put(`/admin/leads/${id}/status`, { status });
      fetchLeads();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  // Send Email
  const handleSendEmail = async () => {
    if (!emailSubject || !emailBody) return alert('Please fill subject and message');
    setSendingEmail(true);
    try {
      await api.post(`/admin/leads/${emailModal.leadId}/email`, {
        subject: emailSubject,
        message: emailBody.replace(/\n/g, '<br>')
      });
      alert('Email sent successfully!');
      setEmailModal({ open: false, leadId: null, email: '' });
      fetchLeads(); // Update stats/contacted date
    } catch (err) {
      console.error(err);
      alert('Failed to send email');
    } finally {
      setSendingEmail(false);
    }
  };

  const getStatusBadge = (status: string) => {
      switch(status) {
          case 'new': return 'badge badge-active text-blue-600 bg-blue-50 border-blue-200';
          case 'interested': return 'badge badge-warning text-yellow-600 bg-yellow-50 border-yellow-200';
          case 'converted': return 'badge badge-success text-green-600 bg-green-50 border-green-200';
          case 'rejected': return 'badge badge-suspended text-red-600 bg-red-50 border-red-200';
          default: return 'badge badge-pending';
      }
  };

  return (
    <Layout>
      <div className="section-header">
        <div className="section-actions">
          <div>
            <h2 className="section-title">Lead Generation & CRM</h2>
            <p className="section-subtitle">
              Discover, track, and engage with potential clients using map-based tools.
            </p>
          </div>
          <div className="flex gap-2">
             <button
                onClick={() => setActiveTab('discover')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors border ${activeTab === 'discover' ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}
              >
                Find New Leads
              </button>
              <button
                onClick={() => setActiveTab('manage')}
               className={`px-4 py-2 rounded-lg font-medium transition-colors border ${activeTab === 'manage' ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}
              >
                Manage Leads
              </button>
          </div>
        </div>
      </div>

      {activeTab === 'manage' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-slate-500 text-xs uppercase font-bold tracking-wider mb-1">Total Leads</div>
              <div className="text-2xl font-bold text-slate-800">{stats.total}</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-blue-500 text-xs uppercase font-bold tracking-wider mb-1">New</div>
              <div className="text-2xl font-bold text-slate-800">{stats.new}</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-yellow-500 text-xs uppercase font-bold tracking-wider mb-1">Interested</div>
              <div className="text-2xl font-bold text-slate-800">{stats.interested}</div>
            </div>
             <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-green-500 text-xs uppercase font-bold tracking-wider mb-1">Converted</div>
              <div className="text-2xl font-bold text-slate-800">{stats.converted}</div>
            </div>
        </div>
      )}

      {activeTab === 'manage' ? (
        <section className="table-wrapper">
             <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                    <h3 className="text-lg font-bold text-slate-900">My Leads</h3>
                    <span className="badge badge-pending">{leads.length} total</span>
                </div>
                 <button onClick={fetchLeads} className="btn-secondary-small"><FiRefreshCcw /></button>
            </div>
            
            {loading ? (
                 <div className="p-12 flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                 </div>
            ) : leads.length === 0 ? (
                <div className="p-12 text-center text-slate-500">
                    <FiSearch className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="text-lg">No leads found.</p>
                    <p className="text-sm">Switch to "Find New Leads" tab to start searching.</p>
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="w-full">
                        <thead className="table-header">
                            <tr>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Company</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Contact Info</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Last Activity</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {leads.map(lead => (
                                <tr key={lead._id} className="table-row">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                                                {lead.companyName.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                 <div className="text-sm font-semibold text-slate-900">{lead.companyName}</div>
                                                 <div className="text-xs text-slate-500">{lead.source}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                         <select 
                                            value={lead.status}
                                            onChange={(e) => updateStatus(lead._id, e.target.value)}
                                            className={`select-small text-xs font-medium uppercase border-none focus:ring-0 cursor-pointer ${
                                                lead.status === 'new' ? 'text-blue-600 bg-blue-50' :
                                                lead.status === 'interested' ? 'text-yellow-600 bg-yellow-50' :
                                                lead.status === 'converted' ? 'text-green-600 bg-green-50' :
                                                lead.status === 'rejected' ? 'text-red-600 bg-red-50' : 'text-slate-600 bg-slate-100'
                                            }`}
                                        >
                                            <option value="new">New</option>
                                            <option value="contacted">Contacted</option>
                                            <option value="interested">Interested</option>
                                            <option value="converted">Converted</option>
                                            <option value="rejected">Rejected</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-slate-700">{lead.email}</div>
                                        {lead.phone && <div className="text-xs text-slate-500">{lead.phone}</div>}
                                    </td>
                                    <td className="px-6 py-4">
                                         <span className="text-sm text-slate-500">
                                            {lead.lastContactedAt ? new Date(lead.lastContactedAt).toLocaleDateString() : 'Never'}
                                         </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button 
                                          onClick={() => setEmailModal({ open: true, leadId: lead._id, email: lead.email })}
                                          className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                        >
                                            <FiMail />
                                            Email
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
      ) : (
          <div className="space-y-6">
             <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                 <div className="flex-1 relative w-full">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && searchPlaces()}
                      placeholder="Search for companies (e.g., 'IT Companies in London' or 'Law firms in Dubai')"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-3 text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400"
                    />
                 </div>
                 <button 
                    onClick={searchPlaces} 
                    disabled={searching}
                    className="btn-primary w-full md:w-auto"
                 >
                    {searching ? 'Scanning...' : 'Search Maps'}
                 </button>
             </div>

             {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map((result, idx) => (
                <div key={idx} className="bg-white rounded-xl border border-slate-200 p-5 hover:border-blue-500 hover:shadow-md transition-all group">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-slate-900 text-lg line-clamp-1">{result.display_name.split(',')[0]}</h3>
                    <div className="bg-slate-100 text-xs px-2 py-1 rounded text-slate-500 uppercase tracking-wide font-medium">{result.type}</div>
                  </div>
                  <p className="text-slate-500 text-sm mb-4 line-clamp-3 h-12">
                    {result.display_name}
                  </p>
                  
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-100">
                    <div className="text-xs text-slate-400 flex items-center gap-1">
                      <FiMapPin /> {parseFloat(result.lat).toFixed(2)}, {parseFloat(result.lon).toFixed(2)}
                    </div>
                    <button 
                      onClick={() => importLead(result)}
                      className="flex items-center gap-2 bg-slate-50 hover:bg-green-50 text-slate-600 hover:text-green-600 border border-slate-200 hover:border-green-200 px-3 py-1.5 rounded-lg text-sm transition-all font-medium"
                    >
                      <FiPlus /> Add to CRM
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {searchResults.length === 0 && !searching && (
              <div className="text-center py-20 text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                <FiGlobe className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="font-medium text-slate-600">Explore the world for new opportunities</p>
                <p className="text-sm mt-1">Enter a query to find businesses instantly.</p>
              </div>
            )}
          </div>
      )}

      {/* Email Modal */}
        {emailModal.open && (
           <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-100">
               <div className="flex justify-between items-center mb-6">
                   <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                       <FiMail className="text-blue-500"/> Compose Email
                   </h2>
                   <button onClick={() => setEmailModal({ open: false, leadId: null, email: '' })} className="text-slate-400 hover:text-slate-600"><FiX size={20}/></button>
               </div>
              
               <div className="bg-slate-50 p-3 rounded-lg mb-4 text-sm text-slate-600 border border-slate-200">
                   <span className="font-semibold text-slate-700">To:</span> {emailModal.email}
               </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                  <input 
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="e.g., Partnership Opportunity"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                  <textarea 
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 h-40 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all resize-none"
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    placeholder="Write your message here..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                <button 
                  onClick={() => setEmailModal({ open: false, leadId: null, email: '' })}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSendEmail}
                  disabled={sendingEmail}
                  className="btn-primary"
                >
                  {sendingEmail ? 'Sending...' : 'Send Email'}
                </button>
              </div>
            </div>
          </div>
        )}
    </Layout>
  );
}

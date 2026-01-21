"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FiSearch, FiMail, FiPlus, FiMapPin, FiPhone, FiGlobe, FiTrash2, FiCheck, FiX, FiRefreshCcw } from 'react-icons/fi';
import axios from 'axios';

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
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/leads`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLeads(res.data.leads);
      setStats(res.data.stats);
    } catch (err) {
      console.error(err);
      alert('Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && activeTab === 'manage') {
      fetchLeads();
    }
  }, [token, activeTab]);

  // Discover Leads (Using Nominatim Basic Search for Demo)
  // Ideally this would be backend proxied to avoid CORS or using a proper Places API
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
        // OSM doesn't give email/phone usually, so we'll leave them specific or blank
        // For demo, we'll ask user or just add placeholder
        email: `contact@${result.display_name.split(',')[0].replace(/\s+/g, '').toLowerCase()}.com`, // Placeholder logic
        website: `https://${result.display_name.split(',')[0].replace(/\s+/g, '').toLowerCase()}.com`,
        source: 'Map Search',
        location: { lat: parseFloat(result.lat), lng: parseFloat(result.lon) }
      };

      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/leads`, leadData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('Lead added!');
      // Mark as added visually if needed
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to add lead');
    }
  };

  // Update Status
  const updateStatus = async (id: string, status: string) => {
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/leads/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
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
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/leads/${emailModal.leadId}/email`, {
        subject: emailSubject,
        message: emailBody.replace(/\n/g, '<br>')
      }, {
        headers: { Authorization: `Bearer ${token}` }
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

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Lead Generation & CRM
            </h1>
            <p className="text-slate-400 mt-1">Discover usage, track leads, and engage directly.</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setActiveTab('manage')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'manage' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
            >
              Manage Leads
            </button>
            <button 
              onClick={() => setActiveTab('discover')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'discover' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
            >
              Find New Leads
            </button>
          </div>
        </div>

        {/* Stats Cards (Only in Manage View) */}
        {activeTab === 'manage' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
              <div className="text-slate-400 text-sm mb-1">Total Leads</div>
              <div className="text-2xl font-bold text-white">{stats.total}</div>
            </div>
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
              <div className="text-slate-400 text-sm mb-1">New</div>
              <div className="text-2xl font-bold text-blue-400">{stats.new}</div>
            </div>
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
              <div className="text-slate-400 text-sm mb-1">Interested</div>
              <div className="text-2xl font-bold text-yellow-400">{stats.interested}</div>
            </div>
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
              <div className="text-slate-400 text-sm mb-1">Converted</div>
              <div className="text-2xl font-bold text-green-400">{stats.converted}</div>
            </div>
          </div>
        )}

        {/* Content Area */}
        {activeTab === 'manage' ? (
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-slate-400">Loading leads...</div>
            ) : leads.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-4xl mb-4">📭</div>
                <h3 className="text-xl font-bold text-white mb-2">No leads yet</h3>
                <p className="text-slate-400 mb-6">Go to "Find New Leads" to start prospecting.</p>
                <button onClick={() => setActiveTab('discover')} className="px-4 py-2 bg-blue-600 rounded-lg">Find Leads</button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-900/50 text-slate-400 uppercase text-xs">
                    <tr>
                      <th className="p-4">Company</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Contact</th>
                      <th className="p-4">Last Contact</th>
                      <th className="p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {leads.map(lead => (
                      <tr key={lead._id} className="hover:bg-slate-700/50">
                        <td className="p-4">
                          <div className="font-bold text-white">{lead.companyName}</div>
                          <div className="text-xs text-slate-400">{lead.source}</div>
                        </td>
                        <td className="p-4">
                          <select 
                            value={lead.status}
                            onChange={(e) => updateStatus(lead._id, e.target.value)}
                            className={`bg-slate-900 border border-slate-600 rounded px-2 py-1 text-xs font-bold uppercase
                              ${lead.status === 'new' ? 'text-blue-400' : ''}
                              ${lead.status === 'interested' ? 'text-yellow-400' : ''}
                              ${lead.status === 'converted' ? 'text-green-400' : ''}
                              ${lead.status === 'rejected' ? 'text-red-400' : ''}
                            `}
                          >
                            <option value="new">New</option>
                            <option value="contacted">Contacted</option>
                            <option value="interested">Interested</option>
                            <option value="converted">Converted</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </td>
                        <td className="p-4">
                          <div className="text-sm text-slate-300">{lead.email}</div>
                          {lead.phone && <div className="text-xs text-slate-500">{lead.phone}</div>}
                        </td>
                        <td className="p-4 text-sm text-slate-400">
                          {lead.lastContactedAt ? new Date(lead.lastContactedAt).toLocaleDateString() : 'Never'}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <button 
                              onClick={() => setEmailModal({ open: true, leadId: lead._id, email: lead.email })}
                              className="p-2 bg-blue-600/20 text-blue-400 rounded hover:bg-blue-600/40"
                              title="Send Email"
                            >
                              <FiMail />
                            </button>
                            {/* Add delete button later if needed */}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex gap-4">
              <div className="flex-1 relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && searchPlaces()}
                  placeholder="Search for companies (e.g., 'Software companies in New York')"
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <button 
                onClick={searchPlaces} 
                disabled={searching}
                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-bold disabled:opacity-50"
              >
                {searching ? 'Searching...' : 'Search Maps'}
              </button>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map((result, idx) => (
                <div key={idx} className="bg-slate-800 rounded-xl border border-slate-700 p-5 hover:border-blue-500 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-white text-lg line-clamp-1">{result.display_name.split(',')[0]}</h3>
                    <div className="bg-slate-700 text-xs px-2 py-1 rounded text-slate-300">{result.type}</div>
                  </div>
                  <p className="text-slate-400 text-sm mb-4 line-clamp-3 h-12">
                    {result.display_name}
                  </p>
                  
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-700">
                    <div className="text-xs text-slate-500 flex items-center gap-1">
                      <FiMapPin /> {parseFloat(result.lat).toFixed(2)}, {parseFloat(result.lon).toFixed(2)}
                    </div>
                    <button 
                      onClick={() => importLead(result)}
                      className="flex items-center gap-2 bg-slate-700 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm transition-colors"
                    >
                      <FiPlus /> Add Lead
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {searchResults.length === 0 && !searching && (
              <div className="text-center py-20 text-slate-500">
                <FiGlobe className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p>Enter a search term to find companies across the globe.</p>
              </div>
            )}
          </div>
        )}

        {/* Email Modal */}
        {emailModal.open && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-xl max-w-lg w-full p-6 border border-slate-700">
              <h2 className="text-xl font-bold text-white mb-4">Send Email</h2>
              <p className="text-slate-400 text-sm mb-4">To: {emailModal.email}</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Subject</label>
                  <input 
                    className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="e.g., Partnership Opportunity"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Message</label>
                  <textarea 
                    className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white h-32"
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    placeholder="Write your message here..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button 
                  onClick={() => setEmailModal({ open: false, leadId: null, email: '' })}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSendEmail}
                  disabled={sendingEmail}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
                >
                  {sendingEmail ? 'Sending...' : <><FiMail /> Send Email</>}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '../../../components/Layout'
import api from '../../../lib/api'
import { PageHeader, Card, Button, Input, Select } from '@/components/ui'

type Plan = { _id: string; name: string; code: string }
type Service = { key: string; label: string; description: string }

const SERVICE_CATEGORIES = {
 'Core Features': ['tasks', 'calendar', 'attendance', 'performance', 'timesheet'],
 'Management': ['users', 'teams', 'projects', 'sprints', 'reports', 'analytics'],
 'HR & Payroll': ['leave', 'payroll', 'roles', 'statuses', 'holidays', 'overtime', 'onboarding', 'offboarding', 'expenses', 'invoices'],
 'Office Management': ['offices', 'shifts', 'documents'],
 'Communication': ['chat', 'messages', 'announcements', 'polls', 'slack_integration', 'whatsapp_integration'],
 'AI': ['ai_assistant'],
 'Admin': ['api_access', 'settings']
}

export default function NewCompanyPage() {
 const router = useRouter()
 const [availableServices, setAvailableServices] = useState<Service[]>([])
 const [form, setForm] = useState({ 
 name: '', 
 code: '',
 domain: '', // Custom login domain for this company
 plan: 'starter', 
 adminEmail: '', 
 adminPassword: '', 
 autoGenPass: true,
 showPassword: false,
 services: {} as Record<string, boolean>,
 createBranch: false,
 branch: {
 name: '',
 code: '',
 address: {
 street: '',
 city: '',
 state: '',
 zipCode: '',
 country: 'India'
 },
 contact: {
 phone: '',
 email: ''
 },
 defaultOfficeHours: {
 startTime: '09:00',
 endTime: '18:00',
 breakDuration: 60
 },
 workingDays: [1, 2, 3, 4, 5]
 }
 })
 const [plans, setPlans] = useState<Plan[]>([])
 const [plansLoading, setPlansLoading] = useState<boolean>(false)
 const [plansError, setPlansError] = useState<string>("")
 const [loading, setLoading] = useState(false)
 const [error, setError] = useState<string>('')
 const [success, setSuccess] = useState(false)

 async function loadPlans() {
 setPlansLoading(true)
 setPlansError("")
 try {
 const res = await api.get('/admin/plans')
 const fetched = res.data.plans || []
 setPlans(fetched)
 // Ensure form.plan matches a real plan code; default to first available
 if (fetched.length > 0) {
 const codes = new Set(fetched.map((p: Plan) => p.code))
 if (!codes.has(form.plan)) {
 setForm(prev => ({ ...prev, plan: fetched[0].code }))
 }
 }
 } catch (err: any) {
 console.error('Failed to load plans', err)
 setPlansError('Failed to load plans. You can still proceed, but plan options may be limited.')
 setPlans([])
 } finally {
 setPlansLoading(false)
 }
 }

 useEffect(() => { 
 loadPlans()
 api.get('/public/services').then(({ data }) => {
 const services = data?.services || []
 setAvailableServices(services)
 // Auto-select all services by default
 const allEnabled = Object.fromEntries(services.map((s: Service) => [s.key, true]))
 setForm(prev => ({ ...prev, services: allEnabled }))
 }).catch(() => {
 setAvailableServices([])
 })
 }, [])

 const getServicesByCategory = () => {
 const categorized: Record<string, Service[]> = {}
 
 availableServices.forEach(svc => {
 for (const [category, keys] of Object.entries(SERVICE_CATEGORIES)) {
 if (keys.includes(svc.key)) {
 if (!categorized[category]) categorized[category] = []
 categorized[category].push(svc)
 return
 }
 }
 // If no category matches, put in "Other"
 if (!categorized['Other']) categorized['Other'] = []
 categorized['Other'].push(svc)
 })
 
 return categorized
 }

 const toggleService = (key: string) => {
 setForm({ ...form, services: { ...form.services, [key]: !form.services[key] } })
 }

 const submit = async (e: React.FormEvent) => {
 e.preventDefault()
 setLoading(true)
 setError('')
 setSuccess(false)
 
 try {
 const payload: any = {
 name: form.name,
 code: form.code,
 domain: form.domain || undefined, // Include domain if provided
 plan: form.plan,
 admin: { email: form.adminEmail },
 features: Object.fromEntries(Object.entries(form.services).filter(([_, v]) => v))
 }
 
 if (!form.autoGenPass && form.adminPassword) {
 payload.admin.password = form.adminPassword
 }

 // Add branch if enabled and required fields are filled
 if (form.createBranch && form.branch.name && form.branch.code) {
 payload.branch = {
 name: form.branch.name,
 code: form.branch.code,
 address: form.branch.address,
 contact: form.branch.contact,
 defaultOfficeHours: form.branch.defaultOfficeHours,
 workingDays: form.branch.workingDays
 }
 }
 
 await api.post('/admin/companies', payload)
 setSuccess(true)
 setTimeout(() => {
 router.push('/companies')
 }, 1500)
 } catch (err: any) {
 console.error('Company creation error:', err)
 
 // Extract all error information
 let errorMessage = 'Failed to create company'
 let errorDetails: string[] = []
 
 if (err?.response?.data) {
 const errorData = err.response.data
 
 // Primary error message
 if (errorData.message) {
 errorMessage = errorData.message
 }
 
 // Additional error details
 if (errorData.error) {
 errorDetails.push(`Error: ${errorData.error}`)
 }
 
 // Validation errors (structured display)
 if (errorData.errors && typeof errorData.errors === 'object') {
 const validationErrors = Object.entries(errorData.errors)
 .map(([field, message]: [string, any]) => `• ${field}: ${message}`)
 errorDetails.push(...validationErrors)
 }
 
 // Array of errors
 if (Array.isArray(errorData.errors)) {
 errorDetails.push(...errorData.errors.map((e: string) => `• ${e}`))
 }
 
 // Network/request errors
 if (err.response?.status === 400) {
 errorMessage = 'Invalid request. Please check your input.'
 } else if (err.response?.status === 409) {
 errorMessage = 'Conflict: ' + (errorData.message || errorData.error || 'Resource already exists')
 } else if (err.response?.status === 401) {
 errorMessage = 'Unauthorized. Please log in again.'
 } else if (err.response?.status === 500) {
 errorMessage = 'Server error. Please try again later.'
 }
 
 // Add status code if available
 if (err.response?.status) {
 errorDetails.push(`Status: ${err.response.status}`)
 }
 } else if (err?.message) {
 errorMessage = err.message
 errorDetails.push('Network error or connection failed')
 } else if (err?.code === 'NETWORK_ERROR' || err?.code === 'ERR_NETWORK') {
 errorMessage = 'Network error: Unable to connect to server'
 errorDetails.push('Please check your internet connection and try again')
 }
 
 // Combine message and details
 const fullErrorMessage = errorDetails.length > 0 
 ? `${errorMessage}\n\nDetails:\n${errorDetails.join('\n')}`
 : errorMessage
 
 setError(fullErrorMessage)
 } finally {
 setLoading(false)
 }
 }

 const categorizedServices = getServicesByCategory()
 const selectedCount = Object.values(form.services).filter(Boolean).length

 return (
 <Layout>
 <div className="space-y-6">
 <PageHeader
 title="Create New Company"
 description="Add a new company and configure its features"
 breadcrumbs={[{ label: 'Companies', href: '/companies' }, { label: 'New' }]}
 actions={
 <Button variant="secondary" onClick={() => router.push('/companies')}>
 ← Back to Companies
 </Button>
 }
 />

 <Card>
 <form onSubmit={submit} className="space-y-6">
 {/* Basic Info */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <Input
 label="Company Name *"
 placeholder="e.g. Acme Corporation"
 value={form.name}
 onChange={e => setForm({ ...form, name: e.target.value })}
 required
 />
 <Input
 label="Company Code *"
 placeholder="e.g. acme"
 value={form.code}
 onChange={e => setForm({ ...form, code: e.target.value.toLowerCase().trim() })}
 required
 helperText="Unique identifier (lowercase, no spaces)"
 />
 </div>

 <Input
 label={<>Custom Login Domain <span className="ml-1 text-xs font-normal text-slate-500 dark:text-slate-400">(Optional)</span></>}
 placeholder="e.g. acme.employee.com or acme.yourdomain.com"
 value={form.domain}
 onChange={e => setForm({ ...form, domain: e.target.value.toLowerCase().trim() })}
 type="text"
 helperText="Custom subdomain for employee login portal. If set, all emails will include this domain instead of the default login URL."
 />

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <Select
 label="Plan"
 value={form.plan}
 onChange={e => setForm({ ...form, plan: e.target.value })}
 disabled={plansLoading}
 error={plansError || undefined}
 >
 {plansLoading && (
 <option value="">Loading plans...</option>
 )}
 {!plansLoading && plans.length > 0 &&
 plans.map(p => (
 <option key={p._id} value={p.code}>{p.name}</option>
 ))}
 {!plansLoading && plans.length === 0 && (
 <option value={form.plan}>{form.plan || 'No plans available'}</option>
 )}
 </Select>
 <Input
 label="Admin Email *"
 type="email"
 placeholder="admin@company.com"
 value={form.adminEmail}
 onChange={e => setForm({ ...form, adminEmail: e.target.value })}
 required
 />
 </div>

 {/* Password */}
 <div className="space-y-3">
 <label className="flex items-center gap-2 text-sm">
 <input
 type="checkbox"
 checked={form.autoGenPass}
 onChange={e => setForm({ ...form, autoGenPass: e.target.checked })}
 className="w-4 h-4"
 />
 <span className="text-slate-700 dark:text-slate-300">Auto-generate password and email to admin</span>
 </label>
 {!form.autoGenPass && (
 <div>
 <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Admin Password *</label>
 <div className="relative">
 <input
 type={form.showPassword ? 'text' : 'password'}
 placeholder="Enter password"
 value={form.adminPassword}
 onChange={e => setForm({ ...form, adminPassword: e.target.value })}
 className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500"
 required
 />
 <button
 type="button"
 onClick={() => setForm({ ...form, showPassword: !form.showPassword })}
 className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
 aria-label={form.showPassword ? 'Hide password' : 'Show password'}
 >
 {form.showPassword ? (
 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m13.42 13.42l-3.29-3.29M3 3l18 18" />
 </svg>
 ) : (
 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
 </svg>
 )}
 </button>
 </div>
 </div>
 )}
 </div>

 {/* Branch/Office Section */}
 <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
 <div className="flex items-center gap-2 mb-4">
 <input
 type="checkbox"
 checked={form.createBranch}
 onChange={e => setForm({ ...form, createBranch: e.target.checked })}
 className="w-4 h-4"
 id="createBranch"
 />
 <label htmlFor="createBranch" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
 Create Branch/Office for this company
 </label>
 </div>

 {form.createBranch && (
 <div className="sm:ml-6 space-y-4 p-4 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-800/40">
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <Input
 label="Branch Name *"
 placeholder="e.g. Head Office"
 value={form.branch.name}
 onChange={e => setForm({ ...form, branch: { ...form.branch, name: e.target.value } })}
 required={form.createBranch}
 />
 <Input
 label="Branch Code *"
 placeholder="e.g. HO"
 value={form.branch.code}
 onChange={e => setForm({ ...form, branch: { ...form.branch, code: e.target.value.toUpperCase().trim() } })}
 required={form.createBranch}
 helperText="Unique code (uppercase)"
 />
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <Input
 label="Street Address"
 placeholder="Street address"
 value={form.branch.address.street}
 onChange={e => setForm({ ...form, branch: { ...form.branch, address: { ...form.branch.address, street: e.target.value } } })}
 />
 <Input
 label="City"
 placeholder="City"
 value={form.branch.address.city}
 onChange={e => setForm({ ...form, branch: { ...form.branch, address: { ...form.branch.address, city: e.target.value } } })}
 />
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
 <Input
 label="State"
 placeholder="State"
 value={form.branch.address.state}
 onChange={e => setForm({ ...form, branch: { ...form.branch, address: { ...form.branch.address, state: e.target.value } } })}
 />
 <Input
 label="Zip Code"
 placeholder="Zip Code"
 value={form.branch.address.zipCode}
 onChange={e => setForm({ ...form, branch: { ...form.branch, address: { ...form.branch.address, zipCode: e.target.value } } })}
 />
 <Input
 label="Country"
 placeholder="Country"
 value={form.branch.address.country}
 onChange={e => setForm({ ...form, branch: { ...form.branch, address: { ...form.branch.address, country: e.target.value } } })}
 />
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <Input
 label="Phone"
 type="tel"
 placeholder="Phone number"
 value={form.branch.contact.phone}
 onChange={e => setForm({ ...form, branch: { ...form.branch, contact: { ...form.branch.contact, phone: e.target.value } } })}
 />
 <Input
 label="Email"
 type="email"
 placeholder="office@company.com"
 value={form.branch.contact.email}
 onChange={e => setForm({ ...form, branch: { ...form.branch, contact: { ...form.branch.contact, email: e.target.value } } })}
 />
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
 <Input
 label="Start Time"
 type="time"
 value={form.branch.defaultOfficeHours.startTime}
 onChange={e => setForm({ ...form, branch: { ...form.branch, defaultOfficeHours: { ...form.branch.defaultOfficeHours, startTime: e.target.value } } })}
 />
 <Input
 label="End Time"
 type="time"
 value={form.branch.defaultOfficeHours.endTime}
 onChange={e => setForm({ ...form, branch: { ...form.branch, defaultOfficeHours: { ...form.branch.defaultOfficeHours, endTime: e.target.value } } })}
 />
 <Input
 label="Break Duration (minutes)"
 type="number"
 min="0"
 value={form.branch.defaultOfficeHours.breakDuration}
 onChange={e => setForm({ ...form, branch: { ...form.branch, defaultOfficeHours: { ...form.branch.defaultOfficeHours, breakDuration: parseInt(e.target.value) || 60 } } })}
 />
 </div>
 </div>
 )}
 </div>

 {/* Services by Category */}
 <div>
 <div className="flex items-center justify-between mb-3">
 <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
 Services / Features
 <span className="ml-2 text-xs font-normal text-slate-500 dark:text-slate-400">
 ({selectedCount} selected)
 </span>
 </label>
 <Button
 type="button"
 variant="ghost"
 size="sm"
 onClick={() => {
 const allEnabled = Object.fromEntries(availableServices.map(s => [s.key, true]))
 setForm({ ...form, services: allEnabled })
 }}
 >
 Select All
 </Button>
 </div>

 <div className="space-y-4 p-4 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-800/40 max-h-96 overflow-y-auto">
 {Object.entries(categorizedServices).map(([category, services]) => (
 <div key={category} className="space-y-2">
 <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-1">
 {category}
 </h4>
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
 {services.map(svc => (
 <label
 key={svc.key}
 className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-white dark:hover:bg-slate-800 p-2 rounded-lg transition-colors"
 >
 <input
 type="checkbox"
 checked={!!form.services[svc.key]}
 onChange={() => toggleService(svc.key)}
 className="w-4 h-4"
 />
 <span className="font-medium">{svc.label || svc.key}</span>
 </label>
 ))}
 </div>
 </div>
 ))}
 </div>
 <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
 Select features to enable for this company. These control what appears in the sidebar.
 </p>
 </div>

 {/* Messages */}
 {error && (
 <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
 <div className="flex items-start gap-3">
 <svg className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 <div className="flex-1 min-w-0">
 <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">Error Creating Company</h4>
 <div className="text-red-700 dark:text-red-300 text-sm whitespace-pre-wrap break-words font-mono bg-red-100 dark:bg-red-900/40 p-3 rounded border border-red-200 dark:border-red-700 overflow-x-auto">
 {error}
 </div>
 <p className="mt-2 text-xs text-red-600 dark:text-red-400">
 Please review the error details above and correct any issues before trying again.
 </p>
 </div>
 <button
 type="button"
 onClick={() => setError('')}
 className="text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors flex-shrink-0"
 aria-label="Close error"
 >
 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
 </svg>
 </button>
 </div>
 </div>
 )}
 
 {success && (
 <div className="p-3 bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-lg text-success-700 dark:text-success-300 text-sm">
 Company created successfully! Redirecting...
 </div>
 )}

 {/* Submit */}
 <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
 <Button
 type="submit"
 disabled={loading || success}
 loading={loading}
 >
 {loading ? 'Creating...' : success ? 'Created!' : 'Create Company'}
 </Button>
 <Button
 type="button"
 variant="secondary"
 onClick={() => router.push('/companies')}
 >
 Cancel
 </Button>
 </div>
 </form>
 </Card>
 </div>
 </Layout>
 )
}


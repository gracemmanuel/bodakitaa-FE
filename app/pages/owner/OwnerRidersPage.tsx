import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Users, Search, Plus, Filter, Phone, Star, ChevronRight, Activity, 
  X, Shield, FileText, CheckCircle2, AlertCircle, Upload, Lock, UserPlus,
  Eye, Ban, UserCheck, Download, ExternalLink, MapPin, User, Mail
} from 'lucide-react';
import { useQuery, useMutation } from '@apollo/client/react';
import { GET_MY_RIDERS } from '../../api/queries';
import { REGISTER_RIDER, TOGGLE_RIDER_SUSPENSION } from '../../api/mutations';
import { graphqlClient } from '../../api';
import gsap from 'gsap';
import CombinedNav from '../../components/CombinedNav';

const API_BASE_URL = 'http://localhost:8000/api';

const FileInput = ({ label, onChange, currentFile }: { label: string; onChange: (file: File) => void; currentFile?: string }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
    <div className="relative group">
      <input 
        type="file" 
        onChange={(e) => e.target.files?.[0] && onChange(e.target.files[0])}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      />
      <div className="flex items-center gap-4 px-6 py-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-dashed border-slate-200 dark:border-white/10 group-hover:border-primary-light transition-all duration-300">
        <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 flex items-center justify-center shadow-sm text-slate-400 group-hover:text-primary-light transition-colors">
          <Upload size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-600 dark:text-slate-300 truncate">
            {currentFile ? 'Document Uploaded' : 'Choose file or drag & drop'}
          </p>
          <p className="text-[10px] font-medium text-slate-400">PDF, JPG or PNG (Max 5MB)</p>
        </div>
        {currentFile && (
          <a href={`http://localhost:8000/media/${currentFile}`} target="_blank" rel="noreferrer" className="z-20 p-2 hover:bg-primary-light/10 rounded-lg text-primary-light">
             <ExternalLink size={16} />
          </a>
        )}
      </div>
    </div>
  </div>
);

const InputField = ({ label, type = 'text', value, onChange, placeholder, icon: Icon }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
    <div className="relative">
      {Icon && (
        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400">
          <Icon size={18} />
        </div>
      )}
      <input 
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full ${Icon ? 'pl-14' : 'px-6'} py-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold placeholder:text-slate-400 focus:outline-none focus:border-primary-light transition-all duration-300`}
      />
    </div>
  </div>
);

// --- MODAL: RIDER DETAILS & COMPLETION ---
const RiderDetailsModal = ({ rider, onClose, onUpdate }: { rider: any; onClose: () => void; onUpdate: () => void }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'docs'>('info');
  const [files, setFiles] = useState<any>({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [toggleSuspension] = useMutation(TOGGLE_RIDER_SUSPENSION, {
    onCompleted: (data) => {
      if (data.toggleRiderSuspension.success) {
        alert(data.toggleRiderSuspension.message);
        onUpdate();
      }
    }
  });

  const handleUpdateDocs = async () => {
    if (Object.keys(files).length === 0) return;
    setIsUpdating(true);
    try {
      const fileData = new FormData();
      Object.entries(files).forEach(([key, file]: any) => fileData.append(key, file));
      
      const res = await fetch(`${API_BASE_URL}/rider-upload/${rider.id}/`, {
        method: 'PATCH',
        headers: { 'Authorization': `JWT ${localStorage.getItem('token')}` },
        body: fileData
      });

      if (res.ok) {
        alert("Documents updated successfully!");
        onUpdate();
        onClose();
      } else {
        const err = await res.json();
        alert("Update failed: " + JSON.stringify(err));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border border-white/20 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-8 bg-gradient-to-br from-slate-50 to-white dark:from-white/5 dark:to-transparent border-b border-slate-100 dark:border-white/5">
          <div className="flex justify-between items-start">
            <div className="flex gap-6">
              <div className="w-20 h-20 rounded-3xl bg-primary-light/10 flex items-center justify-center text-primary-light">
                <User size={40} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{rider.fullName}</h2>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Rider ID: {rider.id}</span>
                  <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${rider.isSuspended ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                    {rider.isSuspended ? 'Suspended' : 'Active'}
                  </div>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-3 hover:bg-slate-100 dark:hover:bg-white/10 rounded-2xl transition-colors">
              <X size={24} className="text-slate-400" />
            </button>
          </div>

          <div className="flex gap-4 mt-8">
            <button 
              onClick={() => setActiveTab('info')}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'info' ? 'bg-primary-light text-white shadow-lg shadow-primary-light/30' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'}`}
            >
              General Info
            </button>
            <button 
              onClick={() => setActiveTab('docs')}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'docs' ? 'bg-primary-light text-white shadow-lg shadow-primary-light/30' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'}`}
            >
              Documents & Compliance
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {activeTab === 'info' ? (
            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-6">
                 <div className="p-6 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Phone Number</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{rider.phone}</p>
                 </div>
                 <div className="p-6 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">NIDA Number</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{rider.nidaNumber || 'N/A'}</p>
                 </div>
                 <div className="p-6 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Guarantor Name</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{rider.guarantorName || 'N/A'}</p>
                 </div>
                 <div className="p-6 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Guarantor Phone</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{rider.guarantorPhone || 'N/A'}</p>
                 </div>
              </div>

              <div className="p-8 rounded-[2rem] bg-amber-500/5 border border-amber-500/10">
                <h4 className="text-sm font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Shield size={18} /> Administrative Actions
                </h4>
                <div className="flex gap-4">
                  <button 
                    onClick={() => toggleSuspension({ variables: { riderId: parseInt(rider.id) } })}
                    className={`flex-1 py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-3 ${rider.isSuspended ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-red-500 text-white shadow-lg shadow-red-500/20'}`}
                  >
                    {rider.isSuspended ? <UserCheck size={20} /> : <Ban size={20} />}
                    {rider.isSuspended ? 'Reactivate Rider' : 'Suspend Rider'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <FileInput label="Driving License" onChange={f => setFiles({...files, license_file: f})} currentFile={rider.licenseFile} />
                <FileInput label="NIDA Front" onChange={f => setFiles({...files, id_card_front: f})} currentFile={rider.idCardFront} />
                <FileInput label="NIDA Back" onChange={f => setFiles({...files, id_card_back: f})} currentFile={rider.idCardBack} />
                <FileInput label="Local Authority Letter" onChange={f => setFiles({...files, local_authority_letter: f})} currentFile={rider.localAuthorityLetter} />
                <FileInput label="Guarantor ID Front" onChange={f => setFiles({...files, guarantor_id_front: f})} currentFile={rider.guarantorIdFront} />
                <FileInput label="Guarantor ID Back" onChange={f => setFiles({...files, guarantor_id_back: f})} currentFile={rider.guarantorIdBack} />
              </div>
              
              <button 
                onClick={handleUpdateDocs}
                disabled={isUpdating || Object.keys(files).length === 0}
                className="w-full py-5 bg-primary-light text-white rounded-3xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary-light/30 disabled:opacity-50 transition-all active:scale-[0.98]"
              >
                {isUpdating ? 'Uploading Documents...' : 'Update Documents'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- MODAL: STEPWISE REGISTRATION ---
const StepwiseFormModal = ({ isOpen, onClose, onSuccess }: any) => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    licenseNumber: '',
    nidaNumber: '',
    guarantorName: '',
    guarantorPhone: '',
  });
  const [files, setFiles] = useState<any>({});

  const nextStep = () => setStep(s => Math.min(s + 1, 3));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleRegister = async () => {
    setIsLoading(true);
    try {
      const result = await graphqlClient(REGISTER_RIDER, formData);
      if (result.registerRider.success) {
        const riderId = result.registerRider.user.id;
        if (Object.keys(files).length > 0) {
          const fileData = new FormData();
          Object.entries(files).forEach(([key, file]: any) => fileData.append(key, file));
          
          const uploadResponse = await fetch(`${API_BASE_URL}/rider-upload/${riderId}/`, {
            method: 'PATCH',
            headers: { 'Authorization': `JWT ${localStorage.getItem('token')}` },
            body: fileData
          });

          if (!uploadResponse.ok) {
            const errData = await uploadResponse.json();
            console.error("Upload failed:", errData);
            alert("Rider registered, but document upload failed. Please update them later.");
          }
        }
        onSuccess();
      } else {
        alert(result.registerRider.message);
      }
    } catch (err) {
      console.error(err);
      alert("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border border-white/20 overflow-hidden">
        
        {/* Header & Stepper */}
        <div className="p-8 bg-gradient-to-br from-primary-light/10 to-transparent">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary-light flex items-center justify-center text-white shadow-lg shadow-primary-light/30">
                <UserPlus size={20} />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">Rider Onboarding</h3>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-xl transition-colors"><X size={20} /></button>
          </div>

          <div className="flex items-center justify-between px-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black transition-all duration-500 ${step >= s ? 'bg-primary-light text-white shadow-lg shadow-primary-light/20 scale-110' : 'bg-slate-200 dark:bg-white/10 text-slate-400'}`}>
                  {step > s ? <CheckCircle2 size={20} /> : s}
                </div>
                {s < 3 && <div className={`w-16 h-1 mx-2 rounded-full transition-all duration-500 ${step > s ? 'bg-primary-light' : 'bg-slate-200 dark:bg-white/10'}`} />}
              </div>
            ))}
          </div>
        </div>

        {/* Form Body */}
        <div className="p-10 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <InputField label="Full Name" placeholder="John Doe" value={formData.fullName} onChange={(v:any) => setFormData({...formData, fullName: v})} icon={User} />
               <InputField label="Phone Number" placeholder="+255..." value={formData.phone} onChange={(v:any) => setFormData({...formData, phone: v})} icon={Phone} />
               <InputField label="Email (Optional)" placeholder="john@example.com" value={formData.email} onChange={(v:any) => setFormData({...formData, email: v})} icon={Mail} />
               <InputField label="Secure Password" type="password" placeholder="••••••••" value={formData.password} onChange={(v:any) => setFormData({...formData, password: v})} icon={Lock} />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <InputField label="NIDA Number" placeholder="YYYYMMDD-XXXXX-XXXXX-X" value={formData.nidaNumber} onChange={(v:any) => setFormData({...formData, nidaNumber: v})} icon={Shield} />
               <div className="grid grid-cols-1 gap-6">
                 <FileInput label="Driving License (Scan)" onChange={f => setFiles({...files, license_file: f})} />
                 <div className="grid grid-cols-2 gap-4">
                    <FileInput label="NIDA Front" onChange={f => setFiles({...files, id_card_front: f})} />
                    <FileInput label="NIDA Back" onChange={f => setFiles({...files, id_card_back: f})} />
                 </div>
               </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="grid grid-cols-2 gap-4">
                  <InputField label="Guarantor Name" placeholder="Relative or Leader" value={formData.guarantorName} onChange={(v:any) => setFormData({...formData, guarantorName: v})} icon={User} />
                  <InputField label="Guarantor Phone" placeholder="+255..." value={formData.guarantorPhone} onChange={(v:any) => setFormData({...formData, guarantorPhone: v})} icon={Phone} />
               </div>
               <FileInput label="Local Authority Letter" onChange={f => setFiles({...files, local_authority_letter: f})} />
               <div className="grid grid-cols-2 gap-4">
                  <FileInput label="Guarantor ID Front" onChange={f => setFiles({...files, guarantor_id_front: f})} />
                  <FileInput label="Guarantor ID Back" onChange={f => setFiles({...files, guarantor_id_back: f})} />
               </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-slate-100 dark:border-white/5 flex gap-4">
          {step > 1 && (
            <button onClick={prevStep} className="px-8 py-4 rounded-2xl font-black text-slate-500 hover:bg-slate-100 transition-colors uppercase tracking-widest text-xs">Back</button>
          )}
          {step < 3 ? (
            <button onClick={nextStep} className="flex-1 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-[0.98]">Next Step</button>
          ) : (
            <button 
              onClick={handleRegister} 
              disabled={isLoading}
              className="flex-1 py-4 bg-primary-light text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary-light/30 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : 'Complete Onboarding'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const OwnerRidersPage = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [selectedRider, setSelectedRider] = useState<any>(null);

  const { data, loading, refetch } = useQuery(GET_MY_RIDERS);
  const riders = data?.myRiders || [];

  const filteredRiders = riders.filter((r: any) => 
    r.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.phone.includes(searchTerm)
  );

  return (
    <CombinedNav role="owner">
      <div className="p-8 space-y-10 animate-in fade-in duration-700">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-4">
              <Users size={40} className="text-primary-light" />
              Riders Workforce
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 font-bold flex items-center gap-2">
              <Shield size={16} className="text-emerald-500" />
              Manage and monitor your professional driver pool
            </p>
          </div>
          <button 
            onClick={() => setIsRegisterOpen(true)}
            className="flex items-center gap-3 bg-primary-light text-white px-8 py-5 rounded-[2rem] font-black shadow-2xl shadow-primary-light/40 hover:translate-y-[-4px] transition-all duration-500 group"
          >
            <UserPlus size={24} className="group-hover:rotate-12 transition-transform" />
            Onboard New Rider
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Total Pool', value: riders.length, icon: Users, color: 'primary-light' },
            { label: 'Fully Verified', value: riders.filter((r:any) => r.isFullyRegistered).length, icon: CheckCircle2, color: 'emerald-500' },
            { label: 'Pending Docs', value: riders.filter((r:any) => !r.isFullyRegistered).length, icon: AlertCircle, color: 'amber-500' },
            { label: 'Suspended', value: riders.filter((r:any) => r.isSuspended).length, icon: Ban, color: 'red-500' },
          ].map((stat, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden group">
              <div className={`absolute top-0 right-0 w-24 h-24 bg-${stat.color} opacity-[0.03] rounded-full translate-x-8 -translate-y-8 group-hover:scale-150 transition-transform duration-700`} />
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">{stat.value}</h3>
                </div>
                <div className={`p-4 rounded-2xl bg-slate-50 dark:bg-white/5 text-${stat.color}`}>
                  <stat.icon size={24} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-white/5 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
          {/* Toolbar */}
          <div className="p-8 border-b border-slate-50 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder="Search by name or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-16 pr-8 py-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[2rem] text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-primary-light transition-all"
              />
            </div>
            <div className="flex gap-4">
              <button className="flex items-center gap-2 px-6 py-4 rounded-2xl border border-slate-200 dark:border-white/10 font-black text-xs uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                <Filter size={18} />
                Filter
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-white/5">
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Rider Details</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Compliance Status</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Rating</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-primary-light border-t-transparent rounded-full animate-spin" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading Workforce...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredRiders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center">
                      <p className="text-slate-400 font-bold">No riders found. Start by onboarding your first driver.</p>
                    </td>
                  </tr>
                ) : (
                  filteredRiders.map((rider: any) => (
                    <tr key={rider.id} className={`group hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors ${rider.isSuspended ? 'opacity-60' : ''}`}>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${rider.isSuspended ? 'bg-red-500/10 text-red-500' : 'bg-primary-light/10 text-primary-light'}`}>
                            {rider.fullName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-black text-slate-900 dark:text-white flex items-center gap-2">
                              {rider.fullName}
                              {rider.isSuspended && <Ban size={14} className="text-red-500" />}
                            </p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Joined {new Date().toLocaleDateString()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-400">
                          <Phone size={14} className="text-slate-300" />
                          {rider.phone}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        {rider.isFullyRegistered ? (
                          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                            <CheckCircle2 size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Verified & Eligible</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                            <AlertCircle size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Pending Documents</span>
                          </div>
                        )}
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-1.5 bg-amber-500/10 px-3 py-1.5 rounded-lg w-max border border-amber-500/20">
                          <Star size={14} className="text-amber-500 fill-amber-500" />
                          <span className="text-sm font-black text-amber-700 dark:text-amber-500">
                            {(Number(rider.rating) || 0).toFixed(1)}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button 
                          onClick={() => setSelectedRider(rider)}
                          className="p-3 text-slate-400 hover:text-primary-light hover:bg-primary-light/10 rounded-2xl transition-all border border-transparent hover:border-primary-light/20"
                        >
                          <Eye size={24} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <StepwiseFormModal 
          isOpen={isRegisterOpen} 
          onClose={() => setIsRegisterOpen(false)} 
          onSuccess={() => { setIsRegisterOpen(false); refetch(); }} 
        />

        {selectedRider && (
          <RiderDetailsModal 
            rider={selectedRider} 
            onClose={() => setSelectedRider(null)} 
            onUpdate={() => { refetch(); }} 
          />
        )}
      </div>
    </CombinedNav>
  );
};

export default OwnerRidersPage;

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Bike, Users, Search, Plus, Filter, MoreHorizontal, Wrench, 
  ChevronRight, X, ArrowLeft, FileText, Shield, Activity, 
  CheckCircle2, AlertCircle, Calendar, CreditCard, HardDrive, Upload
} from 'lucide-react';
import CombinedNav from '../../components/CombinedNav';
import { graphqlClient } from '../../api';
import { GET_MY_FLEET, GET_MY_RIDERS } from '../../api/queries';
import { UPDATE_VEHICLE_DETAILS, CREATE_RIDER_CONTRACT } from '../../api/mutations';

interface RiderContract {
  id: string;
  rider: { fullName: string };
  startDate: string;
  expirationDate: string;
  isActive: boolean;
}

interface BikeData {
  id: string;
  make: string;
  modelName: string;
  plateNumber: string;
  year: number;
  status: string;
  todayEarnings: number;
  targetEarnings: number;
  maintenanceStatus: string;
  chassisNumber: string;
  engineNumber: string;
  engineCapacityCc: number;
  tinNumber: string;
  logbookControlNumber: string;
  insuranceStickerNumber: string;
  latraLicenseNumber: string;
  isTbsInspected: boolean;
  insurancePolicyNumber: string;
  insuranceExpiry: string;
  logbook: string;
  insuranceDoc: string;
  ownershipTransferDoc: string;
  commercialRegistrationDoc: string;
  localAuthorityPermits: string;
  transportGroupDetails: string;
  assignedRider: { id: string; fullName: string } | null;
  contracts: RiderContract[];
}

const API_BASE_URL = 'http://localhost:8000/api';

const OwnerFleetPage: React.FC = () => {
  const { t } = useTranslation();
  const [bikes, setBikes] = useState<BikeData[]>([]);
  const [riders, setRiders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedBike, setSelectedBike] = useState<BikeData | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isContractOpen, setIsContractOpen] = useState(false);

  const fetchFleet = async () => {
    try {
      const data = await graphqlClient(GET_MY_FLEET);
      if (data && data.myFleet) setBikes(data.myFleet);
      
      const ridersData = await graphqlClient(GET_MY_RIDERS);
      if (ridersData && ridersData.myRiders) setRiders(ridersData.myRiders);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFleet();
  }, []);

  const filteredBikes = bikes.filter(b => 
    b.plateNumber.toLowerCase().includes(search.toLowerCase()) || 
    b.modelName.toLowerCase().includes(search.toLowerCase())
  );

  if (selectedBike) {
    return (
      <CombinedNav role="owner">
        <div className="max-w-5xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <button 
            onClick={() => setSelectedBike(null)}
            className="flex items-center gap-2 text-slate-500 hover:text-primary-light transition-colors font-bold"
          >
            <ArrowLeft size={20} /> Back to Fleet
          </button>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-3xl bg-primary-light/10 text-primary-light flex items-center justify-center transition-transform hover:rotate-6">
                <Bike size={40} />
              </div>
              <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{selectedBike.plateNumber}</h1>
                <p className="text-lg text-slate-500 font-bold">{selectedBike.make} {selectedBike.modelName} • {selectedBike.year}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setIsFormOpen(true)}
                className="px-6 py-3 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 font-black text-slate-900 dark:text-white hover:bg-slate-50 transition-all flex items-center gap-2"
              >
                <FileText size={18} /> Update Details
              </button>
              <button 
                onClick={() => setIsContractOpen(true)}
                className="px-6 py-3 rounded-2xl bg-primary-light text-white font-black shadow-lg shadow-primary-light/30 hover:scale-105 transition-all flex items-center gap-2"
              >
                <Users size={18} /> Manage Contract
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-8 shadow-sm">
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <Activity className="text-primary-light" /> Vehicle Specification
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <DetailItem label="TIN Number" value={selectedBike.tinNumber} icon={CreditCard} />
                    <DetailItem label="Logbook Control" value={selectedBike.logbookControlNumber} icon={FileText} />
                    <DetailItem label="Logbook File" value={selectedBike.logbook} icon={FileText} isFile={true} />
                    <DetailItem label="Chassis Number" value={selectedBike.chassisNumber} icon={HardDrive} />
                    <DetailItem label="Engine Number" value={selectedBike.engineNumber} icon={Activity} />
                  </div>
                  <div className="space-y-4">
                    <DetailItem label="Insurance Policy" value={selectedBike.insurancePolicyNumber} icon={Shield} />
                    <DetailItem label="Sticker Number" value={selectedBike.insuranceStickerNumber} icon={Shield} />
                    <DetailItem label="LATRA License" value={selectedBike.latraLicenseNumber} icon={CheckCircle2} />
                    <DetailItem label="Insurance Doc" value={selectedBike.insuranceDoc} icon={FileText} isFile={true} />
                    <DetailItem label="TBS Status" value={selectedBike.isTbsInspected ? "Inspected" : "Not Inspected"} icon={CheckCircle2} color={selectedBike.isTbsInspected ? "text-green-500" : "text-red-500"} />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-8 shadow-sm">
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <Users className="text-primary-light" /> Active Assignment
                </h3>
                {selectedBike.assignedRider ? (
                  <div className="flex items-center justify-between p-6 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-primary-light text-white flex items-center justify-center text-xl font-black">
                        {selectedBike.assignedRider.fullName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-lg font-black text-slate-900 dark:text-white">{selectedBike.assignedRider.fullName}</p>
                        <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">Active Rider</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl">
                    <Users size={40} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500 font-bold">No rider assigned.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-br from-primary-dark to-primary-light rounded-3xl p-8 text-white shadow-xl shadow-primary-light/20 h-max">
                <p className="text-xs font-bold uppercase tracking-[0.2em] mb-2 opacity-80">Quick Status</p>
                <div className="flex items-center gap-3 mb-6">
                  <Activity size={32} className="animate-pulse" />
                  <h4 className="text-2xl font-black uppercase tracking-tight">{selectedBike.status}</h4>
                </div>
              </div>
            </div>
          </div>
        </div>

        <StepwiseFormModal 
          isOpen={isFormOpen} 
          onClose={() => setIsFormOpen(false)} 
          bike={selectedBike}
          onSuccess={() => { fetchFleet(); setSelectedBike(null); }}
        />

        <ContractModal 
          isOpen={isContractOpen} 
          onClose={() => setIsContractOpen(false)} 
          bike={selectedBike}
          riders={riders}
          onSuccess={() => { fetchFleet(); setSelectedBike(null); }}
        />
      </CombinedNav>
    );
  }

  return (
    <CombinedNav role="owner">
      <div className="max-w-7xl mx-auto space-y-8 pb-12">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Fleet Garage</h1>
        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 dark:bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Plate Number</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Model</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                {bikes.map(bike => (
                  <tr key={bike.id} onClick={() => setSelectedBike(bike)} className="hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer transition-all">
                    <td className="px-6 py-5 font-black text-slate-900 dark:text-white uppercase">{bike.plateNumber}</td>
                    <td className="px-6 py-5 text-slate-500 font-bold uppercase text-xs">{bike.make} {bike.modelName}</td>
                    <td className="px-6 py-5">
                      <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-600 text-[10px] font-black uppercase">{bike.status}</span>
                    </td>
                    <td className="px-6 py-5 text-right"><ChevronRight className="ml-auto text-slate-300" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </CombinedNav>
  );
};

const DetailItem: React.FC<{ label: string; value: string | number | undefined; icon: any; color?: string; isFile?: boolean }> = ({ label, value, icon: Icon, color, isFile }) => (
  <div className="flex items-start gap-4 transition-all hover:translate-x-1">
    <div className={`p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 ${color || 'text-slate-400'}`}>
      <Icon size={20} />
    </div>
    <div className="flex-1">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <div className="flex items-center justify-between">
        <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">{(!isFile && (value || 'N/A')) || (isFile && value ? 'Uploaded' : 'Missing')}</p>
        {isFile && value && (
          <a href={value as string} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black text-primary-light hover:underline uppercase">View</a>
        )}
      </div>
    </div>
  </div>
);

const StepwiseFormModal: React.FC<{ isOpen: boolean; onClose: () => void; bike: BikeData; onSuccess: () => void }> = ({ isOpen, onClose, bike, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    tinNumber: bike?.tinNumber || '',
    logbookControlNumber: bike?.logbookControlNumber || '',
    chassisNumber: bike?.chassisNumber || '',
    engineNumber: bike?.engineNumber || '',
    engineCapacityCc: bike?.engineCapacityCc || 150,
    insurancePolicyNumber: bike?.insurancePolicyNumber || '',
    insuranceStickerNumber: bike?.insuranceStickerNumber || '',
    latraLicenseNumber: bike?.latraLicenseNumber || '',
    insuranceExpiry: bike?.insuranceExpiry || '',
    isTbsInspected: bike?.isTbsInspected || false,
    transportGroupDetails: bike?.transportGroupDetails || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<Record<string, File>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (bike) {
      setFormData({
        tinNumber: bike.tinNumber || '',
        logbookControlNumber: bike.logbookControlNumber || '',
        chassisNumber: bike.chassisNumber || '',
        engineNumber: bike.engineNumber || '',
        engineCapacityCc: bike.engineCapacityCc || 150,
        insurancePolicyNumber: bike.insurancePolicyNumber || '',
        insuranceStickerNumber: bike.insuranceStickerNumber || '',
        latraLicenseNumber: bike.latraLicenseNumber || '',
        insuranceExpiry: bike.insuranceExpiry || '',
        isTbsInspected: bike.isTbsInspected || false,
        transportGroupDetails: bike.transportGroupDetails || '',
      });
    }
  }, [bike]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (formData.tinNumber && !/^\d{9}$/.test(formData.tinNumber.replace(/-/g, ''))) newErrors.tinNumber = 'TIN must be 9 digits';
    if (formData.chassisNumber && !/^[A-HJ-NPR-Z0-9]{17}$/.test(formData.chassisNumber.toUpperCase())) newErrors.chassisNumber = 'Invalid VIN (17 alphanumeric, no I,O,Q)';
    if (formData.logbookControlNumber && !/^\d{12,14}$/.test(formData.logbookControlNumber)) newErrors.logbookControlNumber = 'Must be 12 or 14 digits';
    if (formData.insuranceStickerNumber && !/^\d{7,8}$/.test(formData.insuranceStickerNumber)) newErrors.insuranceStickerNumber = 'Must be 7-8 digits';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsLoading(true);
    try {
      const result = await graphqlClient(UPDATE_VEHICLE_DETAILS, {
        vehicleId: parseInt(bike.id),
        ...formData,
        engineCapacityCc: parseInt(formData.engineCapacityCc as any)
      });
      if (Object.keys(files).length > 0) {
        const fileData = new FormData();
        Object.entries(files).forEach(([key, file]) => fileData.append(key, file));
        const uploadResponse = await fetch(`${API_BASE_URL}/fleet-docs/${bike.id}/upload-docs/`, {
          method: 'POST',
          headers: { 'Authorization': `JWT ${localStorage.getItem('token')}` },
          body: fileData
        });
        
        if (!uploadResponse.ok) {
           const errData = await uploadResponse.json();
           console.error("Vehicle upload failed:", errData);
           alert("Compliance data updated, but document upload failed.");
        }
      }
      if (result.updateVehicleDetails.success) { onSuccess(); onClose(); }
    } catch (err) { console.error(err); } finally { setIsLoading(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border border-white/5">
        <div className="p-8 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-black/20">
          <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Compliance Setup</h3>
          <button onClick={onClose} className="p-3 bg-slate-200 dark:bg-white/10 rounded-full text-slate-500 hover:text-slate-900 transition-all"><X size={24} /></button>
        </div>
        <div className="p-10">
          <div className="flex gap-2 mb-10">
            {[1, 2, 3].map(i => (
              <div key={i} className={`h-2 flex-1 rounded-full transition-all duration-500 ${step >= i ? 'bg-primary-light' : 'bg-slate-200 dark:bg-white/10'}`} />
            ))}
          </div>
          {step === 1 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <h4 className="text-xl font-black text-slate-900 dark:text-white">Legal Ownership & Tax</h4>
              <InputField 
                label="TIN Number" 
                value={formData.tinNumber} 
                onChange={v => setFormData({...formData, tinNumber: v})} 
                placeholder="123-456-789" 
                error={errors.tinNumber}
                helpText="9-digit TRA Taxpayer ID. Example: 123-456-789"
              />
              <InputField 
                label="Logbook Control Number" 
                value={formData.logbookControlNumber} 
                onChange={v => setFormData({...formData, logbookControlNumber: v})} 
                placeholder="991234567890" 
                error={errors.logbookControlNumber}
                helpText="12 or 14-digit GePG number found on your TRA payment slip. Example: 991234567890"
              />
              <FileInput label="TRA Logbook File" onChange={f => setFiles({...files, logbook: f})} />
            </div>
          )}
          {step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <h4 className="text-xl font-black text-slate-900 dark:text-white">Technical Particulars</h4>
              <InputField 
                label="Chassis Number (VIN)" 
                value={formData.chassisNumber} 
                onChange={v => setFormData({...formData, chassisNumber: v})} 
                placeholder="17 characters" 
                error={errors.chassisNumber}
                helpText="17-character alphanumeric string stamped on the frame. ISO standard (No I, O, or Q). Example: 1HFSC59A*HA******"
              />
              <InputField 
                label="Engine Number" 
                value={formData.engineNumber} 
                onChange={v => setFormData({...formData, engineNumber: v})} 
                placeholder="MC41E-1023456"
                helpText="Manufacturer's alphanumeric code on the engine block. Example: MC41E-1023456"
              />
              <InputField label="Engine Capacity (cc)" type="number" value={formData.engineCapacityCc} onChange={v => setFormData({...formData, engineCapacityCc: v})} />
            </div>
          )}
          {step === 3 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <h4 className="text-xl font-black text-slate-900 dark:text-white">Compliance & Roadworthiness</h4>
              <div className="grid grid-cols-2 gap-4">
                <InputField 
                  label="Insurance Policy" 
                  value={formData.insurancePolicyNumber} 
                  onChange={v => setFormData({...formData, insurancePolicyNumber: v})} 
                  placeholder="NIC/MOT/..." 
                  helpText="Firm code + sequential policy ID. Example: NIC/MOT/2026/004567"
                />
                <InputField 
                  label="Sticker Number" 
                  value={formData.insuranceStickerNumber} 
                  onChange={v => setFormData({...formData, insuranceStickerNumber: v})} 
                  placeholder="7-8 digits" 
                  error={errors.insuranceStickerNumber}
                  helpText="7-8 digit numeric barcode reference string from the sticker. Example: SN-7890123"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <InputField 
                  label="LATRA License" 
                  value={formData.latraLicenseNumber} 
                  onChange={v => setFormData({...formData, latraLicenseNumber: v})} 
                  placeholder="LATRA/MC/..." 
                  helpText="Authority MC prefix with regional code and year. Example: LATRA/MC/DOM/2026/8892"
                />
                <InputField label="Expiration Date" type="date" value={formData.insuranceExpiry} onChange={v => setFormData({...formData, insuranceExpiry: v})} />
              </div>
              <FileInput label="Insurance Doc" onChange={f => setFiles({...files, insurance_doc: f})} />
            </div>
          )}
          <div className="flex gap-4 mt-12">
            {step > 1 && <button onClick={() => setStep(step - 1)} className="flex-1 py-4 font-black rounded-2xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors">Previous</button>}
            {step < 3 ? (
              <button onClick={() => setStep(step + 1)} className="flex-[2] py-4 bg-primary-light text-white font-black rounded-2xl shadow-lg shadow-primary-light/30 hover:scale-[1.02] transition-all">Next</button>
            ) : (
              <button onClick={handleSubmit} disabled={isLoading} className="flex-[2] py-4 bg-green-500 text-white font-black rounded-2xl shadow-lg shadow-green-500/30 hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50 transition-all">
                {isLoading ? 'Saving...' : <><CheckCircle2 size={20} /> Complete Documentation</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ContractModal: React.FC<{ isOpen: boolean; onClose: () => void; bike: BikeData; riders: any[]; onSuccess: () => void }> = ({ isOpen, onClose, bike, riders, onSuccess }) => {
  const [selectedRider, setSelectedRider] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [expiryDate, setExpiryDate] = useState('');
  const [contractFile, setContractFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const handleAssign = async () => {
    setIsLoading(true);
    try {
      const result = await graphqlClient(CREATE_RIDER_CONTRACT, {
        vehicleId: parseInt(bike.id), riderId: parseInt(selectedRider), startDate, expirationDate: expiryDate
      });
      const contractId = result.createRiderContract.contract.id;
      if (contractFile) {
        const fileData = new FormData();
        fileData.append('contract_doc', contractFile);
        const uploadResponse = await fetch(`${API_BASE_URL}/fleet-docs/${contractId}/upload-contract/`, {
          method: 'POST',
          headers: { 'Authorization': `JWT ${localStorage.getItem('token')}` },
          body: fileData
        });
        if (!uploadResponse.ok) {
          alert("Contract created, but file upload failed.");
        }
      }
      if (result.createRiderContract.success) { onSuccess(); onClose(); }
    } catch (err) { console.error(err); } finally { setIsLoading(false); }
  };
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border border-white/5">
        <div className="p-8 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-black/20">
          <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Rider Assignment</h3>
          <button onClick={onClose} className="p-3 bg-slate-200 dark:bg-white/10 rounded-full text-slate-500 transition-all"><X size={24} /></button>
        </div>
        <div className="p-10 space-y-6">
          <div className="space-y-1">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Select Eligible Rider</label>
            <select value={selectedRider} onChange={e => setSelectedRider(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-primary-light cursor-pointer">
              <option value="">Choose a fully verified rider...</option>
              {riders.filter(r => r.isFullyRegistered).map(r => <option key={r.id} value={r.id}>{r.fullName}</option>)}
            </select>
            {riders.filter(r => !r.isFullyRegistered).length > 0 && (
              <p className="text-[10px] font-bold text-amber-500 mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> {riders.filter(r => !r.isFullyRegistered).length} riders are hidden due to incomplete documentation.
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Start Date" type="date" value={startDate} onChange={setStartDate} />
            <InputField label="Expiration Date" type="date" value={expiryDate} onChange={setExpiryDate} />
          </div>
          <FileInput label="Contract Document" onChange={setContractFile} />
          <button onClick={handleAssign} disabled={isLoading || !selectedRider || !expiryDate} className="w-full py-5 bg-primary-light text-white font-black rounded-2xl shadow-xl shadow-primary-light/30 disabled:opacity-50 transition-all hover:shadow-primary-light/50">
            {isLoading ? 'Processing...' : 'Create Contract & Assign'}
          </button>
        </div>
      </div>
    </div>
  );
};

const InputField: React.FC<{ 
  label: string; 
  value: any; 
  onChange: (v: any) => void; 
  type?: string; 
  placeholder?: string; 
  error?: string;
  helpText?: string;
}> = ({ label, value, onChange, type = 'text', placeholder, error, helpText }) => {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="space-y-1 relative">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
        {helpText && (
          <button 
            type="button"
            onClick={() => setShowHelp(!showHelp)}
            className="text-primary-light hover:scale-110 transition-transform"
          >
            <AlertCircle size={14} />
          </button>
        )}
      </div>
      
      {showHelp && (
        <div className="absolute z-20 bottom-full left-0 mb-2 w-full p-4 bg-slate-900 text-white rounded-2xl text-[10px] font-bold shadow-xl border border-white/10 animate-in fade-in slide-in-from-bottom-2">
          <p className="mb-1 text-primary-light uppercase tracking-widest">Guide & Example</p>
          <p className="opacity-80 leading-relaxed">{helpText}</p>
          <div className="absolute top-full left-4 w-2 h-2 bg-slate-900 rotate-45 -mt-1"></div>
        </div>
      )}

      <input 
        type={type} 
        value={value} 
        onChange={e => onChange(e.target.value)} 
        placeholder={placeholder} 
        className={`w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-white/5 border ${error ? 'border-red-500' : 'border-slate-200 dark:border-white/10'} text-slate-900 dark:text-white font-bold focus:outline-none focus:border-primary-light transition-all`} 
      />
      {error && <p className="text-[10px] font-bold text-red-500 mt-1">{error}</p>}
    </div>
  );
};

const FileInput: React.FC<{ label: string; onChange: (f: File) => void }> = ({ label, onChange }) => {
  const [fileName, setFileName] = useState('');
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
      <div className="relative group">
        <input type="file" onChange={e => { if (e.target.files?.[0]) { setFileName(e.target.files[0].name); onChange(e.target.files[0]); } }} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
        <div className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-dashed border-slate-200 dark:border-white/10 flex items-center justify-between group-hover:border-primary-light transition-all">
          <span className="text-sm font-bold text-slate-500 truncate mr-4">{fileName || 'Upload document...'}</span>
          <Upload size={18} className="text-slate-400 group-hover:text-primary-light" />
        </div>
      </div>
    </div>
  );
};

export default OwnerFleetPage;

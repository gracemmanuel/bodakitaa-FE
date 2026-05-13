import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Bike, Users, Search, Plus, Filter, MoreHorizontal, Wrench, 
  ChevronRight, X, ArrowLeft, FileText, Shield, Activity, 
  CheckCircle2, AlertCircle, Calendar, CreditCard, Tool, HardDrive, Upload
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

const API_BASE_URL = 'http://localhost:8000/api'; // Adjust based on environment

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
              {/* Detailed Specs */}
              <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-8 shadow-sm">
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <Activity className="text-primary-light" /> Vehicle Specification
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <DetailItem label="TIN Number" value={selectedBike.tinNumber} icon={CreditCard} />
                    <DetailItem label="Logbook" value={selectedBike.logbook} icon={FileText} isFile={true} />
                    <DetailItem label="Ownership Doc" value={selectedBike.ownershipTransferDoc} icon={FileText} isFile={true} />
                    <DetailItem label="Chassis Number" value={selectedBike.chassisNumber} icon={HardDrive} />
                    <DetailItem label="Engine Number" value={selectedBike.engineNumber} icon={Activity} />
                    <DetailItem label="Engine Capacity" value={`${selectedBike.engineCapacityCc}cc`} icon={Activity} />
                  </div>
                  <div className="space-y-4">
                    <DetailItem label="Insurance Policy" value={selectedBike.insurancePolicyNumber} icon={Shield} />
                    <DetailItem label="Insurance Doc" value={selectedBike.insuranceDoc} icon={FileText} isFile={true} />
                    <DetailItem label="TBS Status" value={selectedBike.isTbsInspected ? "Inspected" : "Not Inspected"} icon={CheckCircle2} color={selectedBike.isTbsInspected ? "text-green-500" : "text-red-500"} />
                    <DetailItem label="Commercial Doc" value={selectedBike.commercialRegistrationDoc} icon={FileText} isFile={true} />
                    <DetailItem label="Local Permits" value={selectedBike.localAuthorityPermits} icon={FileText} isFile={true} />
                    <DetailItem label="Transport Group" value={selectedBike.transportGroupDetails} icon={Users} />
                  </div>
                </div>
              </div>

              {/* Assignment & Contract */}
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
                    <div className="text-right">
                      {selectedBike.contracts?.find(c => c.isActive) && (
                        <>
                          <p className="text-xs font-bold text-slate-400 uppercase">Contract Expiry</p>
                          <p className="text-lg font-black text-primary-light">{selectedBike.contracts.find(c => c.isActive)?.expirationDate}</p>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl">
                    <Users size={40} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500 font-bold">No rider assigned to this vehicle.</p>
                    <button 
                      onClick={() => setIsContractOpen(true)}
                      className="mt-4 text-primary-light font-black hover:underline"
                    >
                      + Assign Now
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-br from-primary-dark to-primary-light rounded-3xl p-8 text-white shadow-xl shadow-primary-light/20">
                <p className="text-xs font-bold uppercase tracking-[0.2em] mb-2 opacity-80">Quick Status</p>
                <div className="flex items-center gap-3 mb-6">
                  <Activity size={32} className="animate-pulse" />
                  <h4 className="text-2xl font-black uppercase tracking-tight">{selectedBike.status}</h4>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-white/20">
                    <span className="text-sm font-bold opacity-80">Maintenance</span>
                    <span className="text-sm font-black uppercase">{selectedBike.maintenanceStatus}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm font-bold opacity-80">Today's Rev</span>
                    <span className="text-xl font-black">TZS {selectedBike.todayEarnings?.toLocaleString()}</span>
                  </div>
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
      <div className="max-w-7xl mx-auto space-y-8 w-full pb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
              Fleet Garage
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2 font-medium">
              Real-time management and compliance tracking for your motorcycles.
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden flex flex-col relative min-h-[400px] shadow-xl">
          <div className="p-6 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-transparent">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                <div className="relative flex-1 lg:flex-none">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search by plate or model..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 pr-4 py-2 bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:border-primary-light w-full lg:w-64 transition-colors font-bold" 
                  />
                </div>
                <button className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 flex items-center gap-2 text-sm font-bold bg-white dark:bg-black/50 hover:bg-slate-50 dark:hover:bg-white/5 whitespace-nowrap transition-all">
                  <Filter size={16} /> Filter
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto custom-scrollbar flex-1">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead className="bg-slate-50 dark:bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Vehicle Details</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Assigned Rider</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Compliance</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="p-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-primary-light border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-slate-500 font-black uppercase tracking-widest">Syncing Fleet...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredBikes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-20 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-30">
                        <Bike size={64} />
                        <p className="text-slate-500 font-black uppercase tracking-widest">Empty Garage</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredBikes.map((bike) => (
                    <tr key={bike.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-all group cursor-pointer" onClick={() => setSelectedBike(bike)}>
                      <td className="px-6 py-5">
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 text-slate-400 dark:text-slate-500 transition-transform group-hover:scale-110">
                            <Bike size={28} />
                          </div>
                          <div>
                            <p className="font-black text-slate-900 dark:text-white text-lg uppercase tracking-tight">{bike.plateNumber}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">{bike.modelName} • {bike.year}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        {bike.assignedRider ? (
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary-light/20 text-primary-light flex items-center justify-center font-black text-sm">
                              {bike.assignedRider.fullName.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-900 dark:text-white">{bike.assignedRider.fullName}</p>
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Assignment</p>
                            </div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 text-[10px] font-black text-slate-500 uppercase">
                            <AlertCircle size={12} /> Unassigned
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-5">
                         <div className="flex gap-2">
                           {bike.tinNumber ? <Shield size={16} className="text-green-500" /> : <Shield size={16} className="text-slate-300" />}
                           {bike.isTbsInspected ? <CheckCircle2 size={16} className="text-green-500" /> : <CheckCircle2 size={16} className="text-slate-300" />}
                           {bike.insurancePolicyNumber ? <FileText size={16} className="text-green-500" /> : <FileText size={16} className="text-slate-300" />}
                         </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${bike.status.toLowerCase() === 'active' ? 'bg-green-500/10 text-green-700 dark:text-green-400' :
                            bike.status.toLowerCase() === 'maintenance' ? 'bg-red-500/10 text-red-700 dark:text-red-400' :
                              'bg-slate-100 dark:bg-white/10 text-slate-500'
                          }`}>
                          {bike.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button className="p-3 text-slate-400 hover:text-primary-light hover:bg-primary-light/10 rounded-2xl transition-all">
                          <ChevronRight size={24} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <StepwiseFormModal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        bike={selectedBike!}
        onSuccess={() => { fetchFleet(); setSelectedBike(null); }}
      />

      <ContractModal 
        isOpen={isContractOpen} 
        onClose={() => setIsContractOpen(false)} 
        bike={selectedBike!}
        riders={riders}
        onSuccess={() => { fetchFleet(); setSelectedBike(null); }}
      />
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
        <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">{(!isFile && value) || (isFile && value ? 'Uploaded' : 'N/A')}</p>
        {isFile && value && (
          <a 
            href={value as string} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[10px] font-black text-primary-light hover:underline uppercase"
          >
            View Doc
          </a>
        )}
      </div>
    </div>
  </div>
);

const StepwiseFormModal: React.FC<{ isOpen: boolean; onClose: () => void; bike: BikeData; onSuccess: () => void }> = ({ isOpen, onClose, bike, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    tinNumber: bike?.tinNumber || '',
    chassisNumber: bike?.chassisNumber || '',
    engineNumber: bike?.engineNumber || '',
    engineCapacityCc: bike?.engineCapacityCc || 150,
    insurancePolicyNumber: bike?.insurancePolicyNumber || '',
    insuranceExpiry: bike?.insuranceExpiry || '',
    isTbsInspected: bike?.isTbsInspected || false,
    transportGroupDetails: bike?.transportGroupDetails || '',
  });
  const [files, setFiles] = useState<Record<string, File>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (bike) {
      setFormData({
        tinNumber: bike.tinNumber || '',
        chassisNumber: bike.chassisNumber || '',
        engineNumber: bike.engineNumber || '',
        engineCapacityCc: bike.engineCapacityCc || 150,
        insurancePolicyNumber: bike.insurancePolicyNumber || '',
        insuranceExpiry: bike.insuranceExpiry || '',
        isTbsInspected: bike.isTbsInspected || false,
        transportGroupDetails: bike.transportGroupDetails || '',
      });
    }
  }, [bike]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // 1. Update GraphQL Fields
      const result = await graphqlClient(UPDATE_VEHICLE_DETAILS, {
        vehicleId: parseInt(bike.id),
        ...formData,
        engineCapacityCc: parseInt(formData.engineCapacityCc as any)
      });
      
      // 2. Upload Files via REST if any
      if (Object.keys(files).length > 0) {
        const fileData = new FormData();
        Object.entries(files).forEach(([key, file]) => {
          fileData.append(key, file);
        });
        
        await fetch(`${API_BASE_URL}/fleet-docs/${bike.id}/upload-docs/`, {
          method: 'POST',
          headers: {
            'Authorization': `Token ${localStorage.getItem('token')}`
          },
          body: fileData
        });
      }

      if (result.updateVehicleDetails.success) {
        onSuccess();
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border border-white/5">
        <div className="p-8 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-black/20">
          <div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Compliance Setup</h3>
            <p className="text-sm text-slate-500 font-bold">Step {step} of 3</p>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-200 dark:bg-white/10 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all">
            <X size={24} />
          </button>
        </div>

        <div className="p-10">
          <div className="flex gap-2 mb-10">
            {[1, 2, 3].map(i => (
              <div key={i} className={`h-2 flex-1 rounded-full transition-all duration-500 ${step >= i ? 'bg-primary-light' : 'bg-slate-200 dark:bg-white/10'}`} />
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <h4 className="text-xl font-black text-slate-900 dark:text-white mb-6">Legal Ownership & Tax</h4>
              <InputField label="TIN Number" value={formData.tinNumber} onChange={v => setFormData({...formData, tinNumber: v})} placeholder="9 digits TRA TIN" />
              <FileInput label="TRA Logbook (Registration Card)" onChange={f => setFiles({...files, logbook: f})} />
              <FileInput label="Proof of Ownership Transfer" onChange={f => setFiles({...files, ownership_transfer_doc: f})} />
              <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 text-sm font-bold flex gap-3">
                <AlertCircle className="flex-shrink-0" />
                <p>Ensure your TIN matches the TRA Taxpayer Portal for verified documentation.</p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <h4 className="text-xl font-black text-slate-900 dark:text-white mb-6">Technical Particulars</h4>
              <InputField label="Chassis Number (VIN)" value={formData.chassisNumber} onChange={v => setFormData({...formData, chassisNumber: v})} placeholder="VIN Stamped on frame" />
              <InputField label="Engine Number" value={formData.engineNumber} onChange={v => setFormData({...formData, engineNumber: v})} placeholder="Engine block ID" />
              <InputField label="Engine Capacity (cc)" type="number" value={formData.engineCapacityCc} onChange={v => setFormData({...formData, engineCapacityCc: v})} />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <h4 className="text-xl font-black text-slate-900 dark:text-white mb-6">Compliance & Roadworthiness</h4>
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Insurance Number" value={formData.insurancePolicyNumber} onChange={v => setFormData({...formData, insurancePolicyNumber: v})} />
                <InputField label="Expiration Date" type="date" value={formData.insuranceExpiry} onChange={v => setFormData({...formData, insuranceExpiry: v})} />
              </div>
              <FileInput label="Insurance Certificate Document" onChange={f => setFiles({...files, insurance_doc: f})} />
              <div className="flex items-center justify-between p-6 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 transition-colors hover:bg-slate-100 dark:hover:bg-white/10">
                <div>
                  <p className="font-black text-slate-900 dark:text-white">TBS Roadworthiness</p>
                  <p className="text-sm text-slate-500 font-bold">Is the vehicle inspected by TBS?</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={formData.isTbsInspected} 
                  onChange={e => setFormData({...formData, isTbsInspected: e.target.checked})}
                  className="w-8 h-8 rounded-xl accent-primary-light cursor-pointer"
                />
              </div>
              <InputField label="Commercial Group Details" value={formData.transportGroupDetails} onChange={v => setFormData({...formData, transportGroupDetails: v})} placeholder="Local bodaboda group name" />
              <FileInput label="Commercial Use Verification / Permits" onChange={f => setFiles({...files, commercial_registration_doc: f})} />
            </div>
          )}

          <div className="flex gap-4 mt-12">
            {step > 1 && (
              <button onClick={() => setStep(step - 1)} className="flex-1 py-4 font-black rounded-2xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-50 transition-colors">
                Previous
              </button>
            )}
            {step < 3 ? (
              <button onClick={() => setStep(step + 1)} className="flex-[2] py-4 bg-primary-light text-white font-black rounded-2xl shadow-lg shadow-primary-light/30 hover:shadow-primary-light/50 transition-all">
                Continue to Step {step + 1}
              </button>
            ) : (
              <button 
                onClick={handleSubmit} 
                disabled={isLoading}
                className="flex-[2] py-4 bg-green-500 text-white font-black rounded-2xl shadow-lg shadow-green-500/30 hover:shadow-green-500/50 flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
              >
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

  if (!isOpen) return null;

  const handleAssign = async () => {
    setIsLoading(true);
    try {
      // 1. Create Contract in GraphQL
      const result = await graphqlClient(CREATE_RIDER_CONTRACT, {
        vehicleId: parseInt(bike.id),
        riderId: parseInt(selectedRider),
        startDate,
        expirationDate: expiryDate
      });
      
      const contractId = result.createRiderContract.contract.id;

      // 2. Upload Contract Document via REST
      if (contractFile) {
        const fileData = new FormData();
        fileData.append('contract_doc', contractFile);
        
        await fetch(`${API_BASE_URL}/fleet-docs/${contractId}/upload-contract/`, {
          method: 'POST',
          headers: {
            'Authorization': `Token ${localStorage.getItem('token')}`
          },
          body: fileData
        });
      }

      if (result.createRiderContract.success) {
        onSuccess();
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border border-white/5">
        <div className="p-8 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-black/20">
          <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Rider Assignment</h3>
          <button onClick={onClose} className="p-3 bg-slate-200 dark:bg-white/10 rounded-full text-slate-500 transition-all">
            <X size={24} />
          </button>
        </div>
        <div className="p-10 space-y-6">
          <div className="space-y-1">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Select Rider</label>
            <select 
              value={selectedRider} 
              onChange={e => setSelectedRider(e.target.value)}
              className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-primary-light cursor-pointer"
            >
              <option value="">Choose a registered rider...</option>
              {riders.map(r => (
                <option key={r.id} value={r.id}>{r.fullName}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Start Date" type="date" value={startDate} onChange={setStartDate} />
            <InputField label="Expiration Date" type="date" value={expiryDate} onChange={setExpiryDate} />
          </div>
          <FileInput label="Contract Document (PDF/Image)" onChange={setContractFile} />
          <div className="p-6 rounded-2xl bg-primary-light/10 border border-primary-light/20">
            <p className="text-xs font-black text-primary-light uppercase mb-2">Contract Notice</p>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-bold">Assigning a rider will deactivate any previous active contract for this vehicle.</p>
          </div>
          <button 
            onClick={handleAssign}
            disabled={isLoading || !selectedRider || !expiryDate}
            className="w-full py-5 bg-primary-light text-white font-black rounded-2xl shadow-xl shadow-primary-light/30 disabled:opacity-50 transition-all hover:shadow-primary-light/50"
          >
            {isLoading ? 'Processing...' : 'Create Contract & Assign'}
          </button>
        </div>
      </div>
    </div>
  );
};

const InputField: React.FC<{ label: string; value: any; onChange: (v: any) => void; type?: string; placeholder?: string }> = ({ label, value, onChange, type = 'text', placeholder }) => (
  <div className="space-y-1">
    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{label}</label>
    <input 
      type={type} 
      value={value} 
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-primary-light transition-all" 
    />
  </div>
);

const FileInput: React.FC<{ label: string; onChange: (f: File) => void }> = ({ label, onChange }) => {
  const [fileName, setFileName] = useState('');
  
  return (
    <div className="space-y-1">
      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{label}</label>
      <div className="relative group">
        <input 
          type="file" 
          onChange={e => {
            if (e.target.files?.[0]) {
              setFileName(e.target.files[0].name);
              onChange(e.target.files[0]);
            }
          }}
          className="absolute inset-0 opacity-0 cursor-pointer z-10" 
        />
        <div className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-dashed border-slate-200 dark:border-white/10 flex items-center justify-between group-hover:border-primary-light transition-all">
          <span className="text-sm font-bold text-slate-500 truncate mr-4">
            {fileName || 'Upload document...'}
          </span>
          <Upload size={18} className="text-slate-400 group-hover:text-primary-light" />
        </div>
      </div>
    </div>
  );
};

export default OwnerFleetPage;

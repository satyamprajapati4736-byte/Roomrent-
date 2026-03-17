import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Home, 
  CreditCard, 
  TrendingUp, 
  Plus, 
  LogOut, 
  Edit2, 
  Trash2, 
  MessageCircle, 
  Download,
  Search,
  CheckCircle,
  XCircle,
  Menu,
  X,
  History,
  RotateCcw,
  Settings,
  ArrowLeft,
  Mail,
  Lock,
  UserPlus,
  LogIn,
  AlertTriangle,
  Clock,
  Phone
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  onAuthStateChanged, 
  signOut,
  User
} from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  onSnapshot, 
  orderBy,
  serverTimestamp,
  getDocs
} from 'firebase/firestore';
import { auth, db, googleProvider } from './firebase';

// --- Types ---
interface Tenant {
  id: string;
  room_number: string;
  name: string;
  phone: string;
  monthly_rent: number;
  electricity_units: number;
  electricity_rate: number;
  payment_status: 'Paid' | 'Pending';
  due_day: number;
  owner_id: string;
  created_at: any;
}

interface UserSettings {
  whatsapp_template: string;
  reminder_days_before: number;
}

interface Analytics {
  total_rooms: number;
  total_tenants: number;
  pending_payments: number;
  total_revenue: number;
}

// --- Components ---

const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className={`absolute bottom-6 left-6 right-6 z-[100] px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border ${
        type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-red-500/10 border-red-500/20 text-red-500'
      }`}
    >
      {type === 'success' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
      <span className="text-xs font-medium">{message}</span>
    </motion.div>
  );
};

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void;
  title: string;
  message: string;
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-[110] flex items-center justify-center p-6 bg-[#0F172A]/90 backdrop-blur-xl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="glass rounded-[3rem] w-full max-w-sm overflow-hidden shadow-2xl border border-white/10"
      >
        <div className="p-10 text-center">
          <div className="w-20 h-20 bg-status-overdue/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
            <AlertTriangle className="text-status-overdue w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-text-primary mb-4 tracking-tight">{title}</h2>
          <p className="text-sm text-text-secondary leading-relaxed font-medium">{message}</p>
        </div>
        <div className="p-8 bg-white/5 flex gap-4">
          <button 
            onClick={onClose}
            className="btn-secondary flex-1 py-4"
          >
            Cancel
          </button>
          <button 
            onClick={() => { onConfirm(); onClose(); }}
            className="flex-1 bg-status-overdue hover:bg-red-600 text-white text-sm font-black uppercase tracking-widest py-4 rounded-2xl transition-all shadow-xl shadow-status-overdue/30 active:scale-95"
          >
            Confirm
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0F172A] to-[#1E293B] p-6">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md glass rounded-[3rem] p-10 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-secondary to-accent"></div>
        
        <div className="flex flex-col items-center mb-12">
          <motion.div 
            whileHover={{ rotate: 10, scale: 1.1 }}
            className="w-24 h-24 bg-gradient-to-tr from-primary to-secondary rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl shadow-primary/40"
          >
            <Home className="text-white w-12 h-12" />
          </motion.div>
          <h1 className="text-4xl font-black text-text-primary tracking-tighter">RentPro</h1>
          <p className="text-text-secondary text-sm mt-3 font-semibold uppercase tracking-[0.2em] opacity-80">
            {isSignUp ? 'Join the Elite' : 'Premium Management'}
          </p>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-6">
          <div className="space-y-2.5">
            <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] ml-1">Email Address</label>
            <div className="relative group">
              <Mail className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-all duration-300" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-5 text-text-primary focus:outline-none focus:border-primary focus:bg-white/10 transition-all placeholder:text-text-secondary/20"
                placeholder="landlord@rentpro.com"
                required
              />
            </div>
          </div>
          <div className="space-y-2.5">
            <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] ml-1">Secure Password</label>
            <div className="relative group">
              <Lock className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-all duration-300" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-5 text-text-primary focus:outline-none focus:border-primary focus:bg-white/10 transition-all placeholder:text-text-secondary/20"
                placeholder="••••••••"
                required
              />
            </div>
          </div>
          
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-status-overdue/10 border border-status-overdue/20 text-status-overdue text-[10px] p-4 rounded-2xl text-center font-black uppercase tracking-widest"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-5 text-lg"
          >
            {loading ? (
              <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
            ) : isSignUp ? (
              <><UserPlus className="w-5 h-5" /> Create Account</>
            ) : (
              <><LogIn className="w-5 h-5" /> Sign In</>
            )}
          </button>
        </form>

        <div className="mt-10 flex items-center gap-6">
          <div className="flex-1 h-px bg-white/5"></div>
          <span className="text-text-secondary text-[9px] uppercase font-black tracking-[0.3em] opacity-40">Or Connect With</span>
          <div className="flex-1 h-px bg-white/5"></div>
        </div>

        <button 
          onClick={handleGoogleLogin}
          className="btn-secondary w-full mt-10 py-5 group"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6 group-hover:scale-110 transition-transform" alt="Google" />
          <span className="font-black tracking-tight">Google Account</span>
        </button>

        <p className="mt-12 text-center text-text-secondary text-xs font-bold tracking-wide">
          {isSignUp ? 'Already a member?' : "New to the platform?"}{' '}
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-primary font-black hover:text-secondary transition-colors underline underline-offset-4"
          >
            {isSignUp ? 'Sign In' : 'Register Now'}
          </button>
        </p>
      </motion.div>
    </div>
  );
};

const TenantModal = ({ 
  isOpen, 
  onClose, 
  tenant,
  userId
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  tenant?: Tenant;
  userId: string;
}) => {
  const [formData, setFormData] = useState({
    room_number: '',
    name: '',
    phone: '',
    monthly_rent: 0,
    electricity_units: 0,
    electricity_rate: 0,
    due_day: 1,
    payment_status: 'Pending' as 'Paid' | 'Pending'
  });

  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (tenant) {
      setFormData({
        room_number: tenant.room_number,
        name: tenant.name,
        phone: tenant.phone,
        monthly_rent: tenant.monthly_rent,
        electricity_units: tenant.electricity_units,
        electricity_rate: tenant.electricity_rate,
        due_day: tenant.due_day || 1,
        payment_status: tenant.payment_status
      });
    } else {
      setFormData({
        room_number: '',
        name: '',
        phone: '',
        monthly_rent: 0,
        electricity_units: 0,
        electricity_rate: 0,
        due_day: 1,
        payment_status: 'Pending'
      });
    }
  }, [tenant, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (tenant) {
        const docRef = doc(db, 'tenants', tenant.id);
        const oldStatus = tenant.payment_status;
        await updateDoc(docRef, {
          ...formData,
          updated_at: serverTimestamp()
        });

        if (oldStatus === 'Pending' && formData.payment_status === 'Paid') {
          const total = formData.monthly_rent + (formData.electricity_units * formData.electricity_rate);
          await addDoc(collection(db, 'payment_history'), {
            tenant_id: tenant.id,
            amount: total,
            payment_date: serverTimestamp(),
            owner_id: userId
          });
        }
        setToast({ message: 'Tenant updated successfully', type: 'success' });
      } else {
        const docRef = await addDoc(collection(db, 'tenants'), {
          ...formData,
          owner_id: userId,
          created_at: serverTimestamp()
        });

        if (formData.payment_status === 'Paid') {
          const total = formData.monthly_rent + (formData.electricity_units * formData.electricity_rate);
          await addDoc(collection(db, 'payment_history'), {
            tenant_id: docRef.id,
            amount: total,
            payment_date: serverTimestamp(),
            owner_id: userId
          });
        }
        setToast({ message: 'Tenant added successfully', type: 'success' });
      }
      onClose();
    } catch (err) {
      console.error(err);
      setToast({ message: 'Error saving tenant data', type: 'error' });
    }
  };

  if (!isOpen) return null;

  const electricityBill = formData.electricity_units * formData.electricity_rate;
  const totalAmount = formData.monthly_rent + electricityBill;

  return (
    <>
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>
      <div className="absolute inset-0 z-[120] flex items-center justify-center p-6 bg-[#0F172A]/80 backdrop-blur-md">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="glass rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl"
        >
          <div className="p-8 border-b border-white/5 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-black text-text-primary tracking-tight">{tenant ? 'Edit Tenant' : 'Add New Tenant'}</h2>
              <p className="text-text-secondary text-[10px] font-bold uppercase tracking-widest mt-1">Property Management</p>
            </div>
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-white/10 transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto max-h-[70vh]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest ml-1">Room Number</label>
                <input 
                  type="text" 
                  value={formData.room_number}
                  onChange={(e) => setFormData({...formData, room_number: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm text-text-primary focus:outline-none focus:border-primary transition-all"
                  placeholder="e.g. 101"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest ml-1">Full Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm text-text-primary focus:outline-none focus:border-primary transition-all"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest ml-1">Phone Number</label>
                <input 
                  type="tel" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm text-text-primary focus:outline-none focus:border-primary transition-all"
                  placeholder="+91 00000 00000"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest ml-1">Monthly Rent (₹)</label>
                <input 
                  type="number" 
                  value={formData.monthly_rent}
                  onChange={(e) => setFormData({...formData, monthly_rent: Number(e.target.value)})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm text-text-primary focus:outline-none focus:border-primary transition-all"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest ml-1">Electricity Units</label>
                <input 
                  type="number" 
                  value={formData.electricity_units}
                  onChange={(e) => setFormData({...formData, electricity_units: Number(e.target.value)})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm text-text-primary focus:outline-none focus:border-primary transition-all"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest ml-1">Rate per Unit (₹)</label>
                <input 
                  type="number" 
                  value={formData.electricity_rate}
                  onChange={(e) => setFormData({...formData, electricity_rate: Number(e.target.value)})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm text-text-primary focus:outline-none focus:border-primary transition-all"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest ml-1">Rent Due Day</label>
                <input 
                  type="number" 
                  value={formData.due_day}
                  onChange={(e) => setFormData({...formData, due_day: Number(e.target.value)})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm text-text-primary focus:outline-none focus:border-primary transition-all"
                  min="1"
                  max="31"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest ml-1">Payment Status</label>
                <select 
                  value={formData.payment_status}
                  onChange={(e) => setFormData({...formData, payment_status: e.target.value as 'Paid' | 'Pending'})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm text-text-primary focus:outline-none focus:border-primary transition-all appearance-none"
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 rounded-3xl p-6 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-primary font-bold uppercase tracking-widest mb-1">Total Amount Due</p>
                <p className="text-3xl font-black text-text-primary tracking-tight">₹{totalAmount.toLocaleString()}</p>
              </div>
              <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center">
                <CreditCard className="w-7 h-7 text-primary" />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button 
                type="button"
                onClick={onClose}
                className="btn-secondary flex-1 py-4"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="btn-primary flex-1 py-4"
              >
                {tenant ? 'Update Tenant' : 'Create Tenant'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </>
  );
};

const HistoryModal = ({ 
  isOpen, 
  onClose, 
  tenant 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  tenant?: Tenant;
}) => {
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (tenant && isOpen) {
      const q = query(
        collection(db, 'payment_history'), 
        where('tenant_id', '==', tenant.id),
        orderBy('payment_date', 'desc')
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setHistory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
      return () => unsubscribe();
    }
  }, [tenant, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-[130] flex items-center justify-center p-6 bg-[#0F172A]/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl"
      >
        <div className="p-8 border-b border-white/5 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-text-primary tracking-tight">Payment History</h2>
            <p className="text-text-secondary text-[10px] mt-1 uppercase tracking-widest font-bold">{tenant?.name} • Room {tenant?.room_number}</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-white/10 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 max-h-[50vh] overflow-y-auto">
          {history.length === 0 ? (
            <div className="text-center py-16 text-text-secondary">
              <History className="w-16 h-16 mx-auto mb-4 opacity-10" />
              <p className="text-sm font-medium">No transaction history found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((item) => (
                <div key={item.id} className="bg-white/5 border border-white/5 rounded-3xl p-5 flex justify-between items-center group hover:bg-white/10 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-status-paid/10 rounded-2xl flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-status-paid" />
                    </div>
                    <div>
                      <p className="text-lg font-black text-text-primary tracking-tight">₹{item.amount.toLocaleString()}</p>
                      <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest mt-0.5">
                        {item.payment_date?.toDate ? item.payment_date.toDate().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Processing...'}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="bg-status-paid/10 text-status-paid px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">
                      Verified
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-white/5">
          <button 
            onClick={onClose}
            className="btn-secondary w-full py-4"
          >
            Close History
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [analytics, setAnalytics] = useState<Analytics>({
    total_rooms: 0,
    total_tenants: 0,
    pending_payments: 0,
    total_revenue: 0
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState<string | null>(null);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | undefined>();
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const [userSettings, setUserSettings] = useState<UserSettings>({
    whatsapp_template: 'Hello {name}, your rent payment for Room {room} is pending. Total amount: ₹{amount}. Please pay as soon as possible.',
    reminder_days_before: 3
  });

  const [activeView, setActiveView] = useState<'dashboard' | 'tenants' | 'payments' | 'settings'>('dashboard');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const q = query(collection(db, 'settings'), where('owner_id', '==', user.uid));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          setUserSettings(snapshot.docs[0].data() as UserSettings);
        }
      });
      return () => unsubscribe();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      const q = query(
        collection(db, 'tenants'), 
        where('owner_id', '==', user.uid),
        orderBy('room_number', 'asc')
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const tenantsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tenant));
        setTenants(tenantsData);

        setAnalytics(prev => ({
          ...prev,
          total_rooms: new Set(tenantsData.map(t => t.room_number)).size,
          total_tenants: tenantsData.length,
          pending_payments: tenantsData.filter(t => t.payment_status === 'Pending').length
        }));
      });
      return () => unsubscribe();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      const q = query(
        collection(db, 'payment_history'),
        where('owner_id', '==', user.uid)
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const total = snapshot.docs.reduce((acc, doc) => acc + (doc.data().amount || 0), 0);
        setAnalytics(prev => ({ ...prev, total_revenue: total }));
      });
      return () => unsubscribe();
    }
  }, [user]);

  const handleMarkAsPaid = async (tenant: Tenant) => {
    try {
      const total = tenant.monthly_rent + (tenant.electricity_units * tenant.electricity_rate);
      const docRef = doc(db, 'tenants', tenant.id);
      
      await updateDoc(docRef, {
        payment_status: 'Paid',
        updated_at: serverTimestamp()
      });

      await addDoc(collection(db, 'payment_history'), {
        tenant_id: tenant.id,
        amount: total,
        payment_date: serverTimestamp(),
        owner_id: user?.uid
      });

      setToast({ message: 'Payment recorded successfully', type: 'success' });
    } catch (err) {
      console.error(err);
      setToast({ message: 'Error recording payment', type: 'error' });
    }
  };

  const handleResetMonth = async () => {
    try {
      const batch = tenants.map(tenant => {
        const docRef = doc(db, 'tenants', tenant.id);
        return updateDoc(docRef, {
          payment_status: 'Pending',
          electricity_units: 0,
          updated_at: serverTimestamp()
        });
      });
      
      await Promise.all(batch);
      setIsResetConfirmOpen(false);
      setToast({ message: 'All tenants reset for the new month', type: 'success' });
    } catch (err) {
      console.error(err);
      setToast({ message: 'Error resetting month', type: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'tenants', id));
      setToast({ message: 'Tenant deleted successfully', type: 'success' });
    } catch (err) {
      console.error(err);
      setToast({ message: 'Error deleting tenant', type: 'error' });
    }
  };

  const sendWhatsApp = (tenant: Tenant) => {
    const total = tenant.monthly_rent + (tenant.electricity_units * tenant.electricity_rate);
    const dueDate = new Date();
    dueDate.setDate(tenant.due_day || 1);
    const dueDateStr = dueDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long' });

    let message = userSettings.whatsapp_template;
    message = message.replace(/{name}/g, tenant.name);
    message = message.replace(/{room}/g, tenant.room_number);
    message = message.replace(/{amount}/g, total.toString());
    message = message.replace(/{due_date}/g, dueDateStr);

    window.open(`https://wa.me/${tenant.phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const exportToExcel = () => {
    const data = tenants.map(t => ({
      'Room': t.room_number,
      'Name': t.name,
      'Phone': t.phone,
      'Rent': t.monthly_rent,
      'Due Day': t.due_day || 1,
      'Elec Units': t.electricity_units,
      'Elec Rate': t.electricity_rate,
      'Elec Bill': t.electricity_units * t.electricity_rate,
      'Total': t.monthly_rent + (t.electricity_units * t.electricity_rate),
      'Status': t.payment_status
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Tenants');
    XLSX.writeFile(wb, 'Tenants_Report.xlsx');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const filteredTenants = tenants.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.room_number.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-[#050505] font-sans flex flex-col">
      <div className="flex-1 relative overflow-hidden flex flex-col">
        {!user ? (
          <Login />
        ) : (
          <div className="flex-1 flex flex-col h-full relative overflow-hidden">

              {/* Sidebar Drawer */}
              <AnimatePresence>
                {isSidebarOpen && (
                  <>
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setIsSidebarOpen(false)}
                      className="absolute inset-0 bg-black/60 backdrop-blur-sm z-[60]"
                    />
                    <motion.aside 
                      initial={{ x: '-100%' }}
                      animate={{ x: 0 }}
                      exit={{ x: '-100%' }}
                      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                      className="absolute inset-y-0 left-0 w-64 bg-[#141414] border-r border-white/5 z-[70] flex flex-col shadow-2xl"
                    >
                      <div className="p-6 flex items-center gap-3 border-b border-white/5">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                          <Home className="w-6 h-6" />
                        </div>
                        <span className="font-bold text-lg">RoomRent Pro</span>
                      </div>

                      <nav className="flex-1 px-4 py-6 space-y-2">
                        <button 
                          onClick={() => { setActiveView('dashboard'); setIsSidebarOpen(false); }}
                          className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl font-medium transition-all ${activeView === 'dashboard' ? 'bg-indigo-600/10 text-indigo-400' : 'text-zinc-500 hover:bg-white/5 hover:text-white'}`}
                        >
                          <TrendingUp className="w-5 h-5" />
                          <span>Dashboard</span>
                        </button>
                        <button 
                          onClick={() => { setActiveView('tenants'); setIsSidebarOpen(false); }}
                          className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl font-medium transition-all ${activeView === 'tenants' ? 'bg-indigo-600/10 text-indigo-400' : 'text-zinc-500 hover:bg-white/5 hover:text-white'}`}
                        >
                          <Users className="w-5 h-5" />
                          <span>Tenants</span>
                        </button>
                        <button 
                          onClick={() => { setActiveView('payments'); setIsSidebarOpen(false); }}
                          className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl font-medium transition-all ${activeView === 'payments' ? 'bg-indigo-600/10 text-indigo-400' : 'text-zinc-500 hover:bg-white/5 hover:text-white'}`}
                        >
                          <CreditCard className="w-5 h-5" />
                          <span>Payments</span>
                        </button>
                        <button 
                          onClick={() => { setIsResetConfirmOpen(true); setIsSidebarOpen(false); }}
                          className="w-full flex items-center gap-4 px-4 py-3 text-amber-500 hover:bg-amber-500/10 rounded-xl transition-all font-medium"
                        >
                          <RotateCcw className="w-5 h-5" />
                          <span>Reset Month</span>
                        </button>
                        <button 
                          onClick={() => { setActiveView('settings'); setIsSidebarOpen(false); }}
                          className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl font-medium transition-all ${activeView === 'settings' ? 'bg-indigo-600/10 text-indigo-400' : 'text-zinc-500 hover:bg-white/5 hover:text-white'}`}
                        >
                          <Settings className="w-5 h-5" />
                          <span>Settings</span>
                        </button>
                      </nav>

                      <div className="p-4 border-t border-white/5 bg-white/[0.02]">
                        <div className="mb-4 px-4 flex items-center gap-3">
                          <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}`} className="w-8 h-8 rounded-full border border-white/10" alt="User" />
                          <div className="truncate">
                            <p className="text-xs font-bold truncate">{user.displayName || user.email?.split('@')[0]}</p>
                            <p className="text-[10px] text-zinc-500 truncate">{user.email}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => signOut(auth)}
                          className="w-full flex items-center gap-4 px-4 py-3 text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                        >
                          <LogOut className="w-5 h-5" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </motion.aside>
                  </>
                )}
              </AnimatePresence>

              {/* Main Content Area */}
              <main className="flex-1 flex flex-col overflow-hidden">
                {activeView === 'payments' ? (
                  <PaymentsView 
                    user={user} 
                    tenants={tenants} 
                    onBack={() => setActiveView('dashboard')} 
                    onOpenMenu={() => setIsSidebarOpen(true)}
                  />
                ) : activeView === 'settings' ? (
                  <SettingsView 
                    user={user} 
                    onBack={() => setActiveView('dashboard')} 
                    onOpenMenu={() => setIsSidebarOpen(true)}
                  />
                ) : (
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-[#0F172A]/80 backdrop-blur-xl sticky top-0 z-50 shrink-0">
                      <div className="flex items-center gap-6">
                        <button onClick={() => setIsSidebarOpen(true)} className="w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-2xl transition-all group">
                          <Menu className="w-6 h-6 text-text-secondary group-hover:text-text-primary" />
                        </button>
                        <div>
                          <h2 className="text-xl font-black text-text-primary tracking-tight">
                            {activeView === 'dashboard' ? 'Overview' : 'Tenants'}
                          </h2>
                          <div className="flex items-center gap-2 mt-0.5">
                            <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
                            <span className="text-[9px] text-text-secondary font-bold uppercase tracking-widest">Live Sync</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={exportToExcel}
                          className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 text-text-primary text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all border border-white/5"
                        >
                          <Download className="w-4 h-4" />
                          Export
                        </button>
                        <button 
                          onClick={() => { setSelectedTenant(undefined); setIsModalOpen(true); }}
                          className="btn-primary w-12 h-12 rounded-2xl flex items-center justify-center"
                        >
                          <Plus className="w-6 h-6" />
                        </button>
                      </div>
                    </header>

                    <div className="flex-1 overflow-y-auto p-8 space-y-10 pb-32 max-w-6xl mx-auto w-full">
                      {/* Search & Stats Header */}
                      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div className="space-y-4 flex-1 max-w-xl">
                          <h3 className="text-text-secondary text-[10px] font-black uppercase tracking-[0.3em] ml-1">Search Property</h3>
                          <div className="relative group">
                            <Search className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors" />
                            <input 
                              type="text" 
                              placeholder="Search by name, room or phone..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded-[2rem] pl-14 pr-6 py-4 text-sm text-text-primary focus:outline-none focus:border-primary focus:bg-white/10 transition-all shadow-inner"
                            />
                          </div>
                        </div>

                        {activeView === 'dashboard' && (
                          <div className="text-right hidden md:block">
                            <p className="text-3xl font-black text-text-primary tracking-tighter">
                              {currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                            </p>
                            <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest mt-1">
                              {currentTime.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                            </p>
                          </div>
                        )}
                      </div>

                      {activeView === 'dashboard' && (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                          <StatCard icon={<Home className="w-6 h-6" />} label="Total Rooms" value={analytics.total_rooms} color="primary" trend="+2 this month" />
                          <StatCard icon={<Users className="w-6 h-6" />} label="Active Tenants" value={analytics.total_tenants} color="secondary" trend="94% occupancy" />
                          <StatCard icon={<Clock className="w-6 h-6" />} label="Pending" value={analytics.pending_payments} color="accent" trend="Action required" />
                          <StatCard icon={<TrendingUp className="w-6 h-6" />} label="Revenue" value={`₹${analytics.total_revenue.toLocaleString()}`} color="primary" trend="+12% vs last month" />
                        </div>
                      )}

                      {/* Tenant List Section */}
                      <div className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                          <div>
                            <h2 className="text-2xl font-black text-text-primary tracking-tight">Tenant Directory</h2>
                            <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest mt-1">Manage your residents</p>
                          </div>
                          <div className="flex gap-2 p-1.5 bg-white/5 rounded-2xl border border-white/5">
                            {['All', 'Paid', 'Pending'].map((f) => (
                              <button
                                key={f}
                                onClick={() => {}} // Filter logic handled by filteredTenants
                                className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                                  (f === 'All') // Temporary simple active state
                                    ? 'bg-primary text-white shadow-lg shadow-primary/25' 
                                    : 'text-text-secondary hover:text-text-primary'
                                }`}
                              >
                                {f}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <AnimatePresence mode="popLayout">
                            {filteredTenants.map((tenant) => (
                              <TenantCard 
                                key={tenant.id}
                                tenant={tenant}
                                onEdit={(t) => { setSelectedTenant(t); setIsModalOpen(true); }}
                                onDelete={(id) => { setTenantToDelete(id); setIsConfirmOpen(true); }}
                                onHistory={(t) => { setSelectedTenant(t); setIsHistoryOpen(true); }}
                                onMarkAsPaid={handleMarkAsPaid}
                                onWhatsApp={sendWhatsApp}
                                userSettings={userSettings}
                              />
                            ))}
                          </AnimatePresence>
                          
                          {filteredTenants.length === 0 && (
                            <div className="col-span-full py-24 text-center glass rounded-[3rem] border-dashed border-white/10">
                              <Users className="w-20 h-20 mx-auto mb-6 text-text-secondary opacity-10" />
                              <p className="text-text-secondary font-medium">No tenants found in your directory.</p>
                              <button 
                                onClick={() => { setSelectedTenant(undefined); setIsModalOpen(true); }}
                                className="mt-6 text-primary text-sm font-bold hover:underline"
                              >
                                Add your first tenant
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </main>

              <TenantModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                tenant={selectedTenant}
                userId={user?.uid || ''}
              />

              <HistoryModal 
                isOpen={isHistoryOpen} 
                onClose={() => setIsHistoryOpen(false)} 
                tenant={selectedTenant}
              />

              <ConfirmModal 
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={() => tenantToDelete && handleDelete(tenantToDelete)}
                title="Delete Tenant"
                message="Are you sure you want to delete this tenant? This action cannot be undone."
              />

              <ConfirmModal 
                isOpen={isResetConfirmOpen}
                onClose={() => setIsResetConfirmOpen(false)}
                onConfirm={handleResetMonth}
                title="Reset for New Month"
                message="This will set all tenants to 'Pending' and reset electricity units to 0. Use this at the start of a new month. Current payment history will NOT be affected."
              />

              <AnimatePresence>
                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    );
}

const TenantCard = ({ 
  tenant, 
  onEdit, 
  onDelete, 
  onHistory,
  onMarkAsPaid,
  onWhatsApp,
  userSettings
}: { 
  tenant: Tenant; 
  onEdit: (t: Tenant) => void; 
  onDelete: (id: string) => void;
  onHistory: (t: Tenant) => void;
  onMarkAsPaid: (t: Tenant) => void;
  onWhatsApp: (t: Tenant) => void;
  userSettings: UserSettings;
  key?: any;
}) => {
  const electricityBill = tenant.electricity_units * tenant.electricity_rate;
  const totalAmount = tenant.monthly_rent + electricityBill;
  
  const statusColor = tenant.payment_status === 'Paid' ? 'bg-status-paid/10 text-status-paid' : 'bg-status-pending/10 text-status-pending';
  const statusPulse = tenant.payment_status === 'Pending' ? 'animate-pulse-slow' : '';

  const today = new Date().getDate();
  const dueDay = tenant.due_day || 1;
  const daysUntilDue = dueDay - today;
  const isNearDue = tenant.payment_status === 'Pending' && daysUntilDue >= 0 && daysUntilDue <= userSettings.reminder_days_before;

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="glass rounded-[2rem] p-6 flex flex-col gap-6 group transition-all duration-300"
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-primary font-black text-xl shadow-inner">
            {tenant.room_number}
          </div>
          <div>
            <h3 className="text-lg font-black text-text-primary tracking-tight group-hover:text-primary transition-colors">{tenant.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Phone className="w-3 h-3 text-text-secondary" />
              <p className="text-xs text-text-secondary font-medium">{tenant.phone}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${statusColor} ${statusPulse}`}>
            {tenant.payment_status}
          </div>
          {isNearDue && (
            <div className="flex items-center gap-1 text-status-pending animate-bounce">
              <AlertTriangle className="w-3 h-3" />
              <span className="text-[8px] font-black uppercase tracking-widest">Due Soon</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
          <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1">Monthly Rent</p>
          <p className="text-lg font-black text-text-primary tracking-tight">₹{tenant.monthly_rent.toLocaleString()}</p>
        </div>
        <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
          <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1">Electricity</p>
          <p className="text-lg font-black text-text-primary tracking-tight">₹{electricityBill.toLocaleString()}</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <div>
          <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-0.5">Total Payable</p>
          <p className="text-2xl font-black text-primary tracking-tight">₹{totalAmount.toLocaleString()}</p>
        </div>
        <div className="flex gap-2">
          {tenant.payment_status === 'Pending' && (
            <button 
              onClick={() => onMarkAsPaid(tenant)}
              className="w-10 h-10 rounded-xl bg-status-paid/10 text-status-paid hover:bg-status-paid hover:text-white transition-all"
              title="Mark as Paid"
            >
              <CheckCircle className="w-5 h-5" />
            </button>
          )}
          <button 
            onClick={() => onWhatsApp(tenant)}
            className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all"
            title="WhatsApp"
          >
            <MessageCircle className="w-5 h-5" />
          </button>
          <button 
            onClick={() => onHistory(tenant)}
            className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-text-secondary hover:text-primary hover:bg-primary/10 transition-all"
            title="History"
          >
            <History className="w-5 h-5" />
          </button>
          <button 
            onClick={() => onEdit(tenant)}
            className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-text-secondary hover:text-accent hover:bg-accent/10 transition-all"
            title="Edit"
          >
            <Edit2 className="w-5 h-5" />
          </button>
          <button 
            onClick={() => onDelete(tenant.id)}
            className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-text-secondary hover:text-status-overdue hover:bg-status-overdue/10 transition-all"
            title="Delete"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

function StatCard({ icon, label, value, color, trend }: { icon: React.ReactNode, label: string, value: string | number, color: string, trend?: string }) {
  const colorVariants: Record<string, { bg: string, text: string, iconBg: string }> = {
    primary: { 
      bg: 'from-primary/20 to-secondary/20', 
      text: 'text-primary', 
      iconBg: 'bg-gradient-to-br from-primary to-secondary' 
    },
    secondary: { 
      bg: 'from-secondary/20 to-indigo-400/20', 
      text: 'text-secondary', 
      iconBg: 'bg-gradient-to-br from-secondary to-indigo-400' 
    },
    accent: { 
      bg: 'from-accent/20 to-emerald-400/20', 
      text: 'text-accent', 
      iconBg: 'bg-gradient-to-br from-accent to-emerald-400' 
    },
    indigo: { 
      bg: 'from-primary/20 to-secondary/20', 
      text: 'text-primary', 
      iconBg: 'bg-gradient-to-br from-primary to-secondary' 
    },
    emerald: { 
      bg: 'from-status-paid/20 to-accent/20', 
      text: 'text-status-paid', 
      iconBg: 'bg-gradient-to-br from-status-paid to-accent' 
    },
    amber: { 
      bg: 'from-status-pending/20 to-orange-400/20', 
      text: 'text-status-pending', 
      iconBg: 'bg-gradient-to-br from-status-pending to-orange-400' 
    },
    rose: { 
      bg: 'from-status-overdue/20 to-pink-500/20', 
      text: 'text-status-overdue', 
      iconBg: 'bg-gradient-to-br from-status-overdue to-pink-500' 
    },
  };

  const variant = colorVariants[color] || colorVariants.primary;

  return (
    <motion.div 
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`p-6 glass rounded-[2rem] flex flex-col gap-4 relative overflow-hidden group transition-all duration-300`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${variant.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      
      <div className="relative z-10 flex flex-col gap-4">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg ${variant.iconBg}`}>
          {React.cloneElement(icon as React.ReactElement, { className: 'w-7 h-7' })}
        </div>
        <div>
          <p className="text-[10px] text-text-secondary font-bold uppercase tracking-[0.15em] mb-1">{label}</p>
          <p className="text-2xl font-black text-text-primary tracking-tight">{value}</p>
          {trend && (
            <p className="text-[8px] font-black text-primary uppercase tracking-widest mt-2">{trend}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const SettingsView = ({ user, onBack, onOpenMenu }: { user: User, onBack: () => void, onOpenMenu: () => void }) => {
  const [settings, setSettings] = useState<UserSettings>({
    whatsapp_template: 'Hello {name}, your rent payment for Room {room} is pending. Total amount: ₹{amount}. Please pay as soon as possible.',
    reminder_days_before: 3
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'settings'), where('owner_id', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data() as UserSettings;
        setSettings(data);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const q = query(collection(db, 'settings'), where('owner_id', '==', user.uid));
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        await addDoc(collection(db, 'settings'), { ...settings, owner_id: user.uid });
      } else {
        await updateDoc(doc(db, 'settings', snapshot.docs[0].id), { ...settings });
      }
      setToast({ message: 'Settings saved successfully', type: 'success' });
    } catch (err) {
      console.error(err);
      setToast({ message: 'Error saving settings', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex-1 flex items-center justify-center"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-[#0F172A]/80 backdrop-blur-xl sticky top-0 z-50 shrink-0">
        <div className="flex items-center gap-6">
          <button 
            onClick={onBack}
            className="w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-2xl transition-all text-text-secondary hover:text-text-primary"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-black text-text-primary tracking-tight">Settings</h1>
            <p className="text-text-secondary text-[10px] mt-0.5 uppercase tracking-widest font-bold">Preferences & Configuration</p>
          </div>
        </div>
        <button 
          onClick={onOpenMenu}
          className="w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-2xl transition-all text-text-secondary hover:text-text-primary"
        >
          <Menu className="w-6 h-6" />
        </button>
      </header>
      <div className="flex-1 overflow-y-auto p-8 space-y-10 pb-32 max-w-2xl mx-auto w-full">
        <form onSubmit={handleSave} className="space-y-10">
          <div className="space-y-8">
            <div className="space-y-4">
              <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest ml-1">WhatsApp Message Template</label>
              <div className="relative group">
                <textarea 
                  value={settings.whatsapp_template}
                  onChange={(e) => setSettings({ ...settings, whatsapp_template: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-3xl px-6 py-5 text-sm text-text-primary focus:outline-none focus:border-primary focus:bg-white/10 transition-all min-h-[160px] leading-relaxed"
                  placeholder="Message template..."
                />
                <div className="absolute bottom-4 right-4 bg-primary/20 text-primary px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">
                  Dynamic Template
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {['{name}', '{room}', '{amount}', '{due_date}'].map(tag => (
                  <span key={tag} className="px-3 py-1 bg-white/5 border border-white/5 rounded-full text-[9px] font-bold text-primary">{tag}</span>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest ml-1">Reminder Threshold (Days)</label>
              <input 
                type="number" 
                value={settings.reminder_days_before}
                onChange={(e) => setSettings({ ...settings, reminder_days_before: parseInt(e.target.value) || 0 })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-text-primary focus:outline-none focus:border-primary focus:bg-white/10 transition-all"
                min="0"
                max="30"
              />
              <p className="text-[10px] text-text-secondary leading-relaxed ml-1">
                Tenants will be highlighted with a warning icon when they are within this many days of their due date.
              </p>
            </div>
          </div>
          <button 
            type="submit"
            disabled={saving}
            className="btn-primary w-full py-5 text-base"
          >
            {saving ? 'Saving Preferences...' : 'Save All Changes'}
          </button>
        </form>
        <AnimatePresence>
          {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </AnimatePresence>
      </div>
    </div>
  );
};

const PaymentsView = ({ user, tenants, onBack, onOpenMenu }: { user: User, tenants: Tenant[], onBack: () => void, onOpenMenu: () => void }) => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'payment_history'),
      where('owner_id', '==', user.uid),
      orderBy('payment_date', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPayments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const getTenantName = (id: string) => tenants.find(t => t.id === id)?.name || 'Unknown Tenant';
  const getRoomNumber = (id: string) => tenants.find(t => t.id === id)?.room_number || '?';

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-[#0F172A]/80 backdrop-blur-xl sticky top-0 z-50 shrink-0">
        <div className="flex items-center gap-6">
          <button 
            onClick={onBack}
            className="w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-2xl transition-all text-text-secondary hover:text-text-primary"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-black text-text-primary tracking-tight">Payments</h1>
            <p className="text-text-secondary text-[10px] mt-0.5 uppercase tracking-widest font-bold">Transaction History</p>
          </div>
        </div>
        <button 
          onClick={onOpenMenu}
          className="w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-2xl transition-all text-text-secondary hover:text-text-primary"
        >
          <Menu className="w-6 h-6" />
        </button>
      </header>
      <div className="flex-1 overflow-y-auto p-8 space-y-6 pb-32 max-w-4xl mx-auto w-full">
        {payments.length === 0 ? (
          <div className="text-center py-24 glass rounded-[3rem] border-dashed border-white/10">
            <CreditCard className="w-20 h-20 mx-auto mb-6 text-text-secondary opacity-10" />
            <p className="text-text-secondary font-medium">No payments recorded yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {payments.map((payment) => (
              <div key={payment.id} className="glass rounded-[2rem] p-6 flex justify-between items-center group hover:bg-white/10 transition-all duration-300">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-status-paid/10 text-status-paid rounded-2xl flex items-center justify-center shadow-inner">
                    <CreditCard className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-xl font-black text-text-primary tracking-tight">₹{payment.amount.toLocaleString()}</p>
                    <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest mt-1">
                      Room {getRoomNumber(payment.tenant_id)} • {getTenantName(payment.tenant_id)}
                    </p>
                    <p className="text-[9px] text-primary font-bold mt-1 uppercase tracking-wider">
                      {payment.payment_date?.toDate ? payment.payment_date.toDate().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Processing...'}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="bg-status-paid/10 text-status-paid px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest">
                    Verified
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

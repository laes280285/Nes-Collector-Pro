
import React, { useState } from 'react';
import { User, UserRole, AccountStatus } from '../types';
import { Mail, Lock, User as UserIcon, Check, ShieldAlert, CheckCircle2, XCircle, ArrowRight, Award, Clock, Send } from 'lucide-react';
import { db, auth } from '../services/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, updateDoc, doc, setDoc, getDoc } from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  onAuthStateChanged
} from 'firebase/auth';

interface AuthProps {
  onLogin: (user: User) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'pending_approval'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showResendModal, setShowResendModal] = useState(false);
  const [pendingUser, setPendingUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const passValid = (p: string) => {
    return p.length >= 8 && /[A-Z]/.test(p) && /[a-z]/.test(p) && /[0-9]/.test(p) && /[^A-Za-z0-9]/.test(p);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (!passValid(password)) {
        setError('Contraseña débil: requiere 8 caracteres, Mayús, Minús, Número y Símbolo.');
        setLoading(false);
        return;
      }
      
      if (password !== confirmPassword) {
        setError('Las contraseñas no coinciden.');
        setLoading(false);
        return;
      }

      // 1. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const fbUser = userCredential.user;

      // 2. Create profile in Firestore
      await setDoc(doc(db, 'users', fbUser.uid), {
        id: fbUser.uid,
        name,
        email: email.toLowerCase(),
        role: 'standard',
        status: 'pending',
        dateJoined: Date.now(),
        verified: false,
        createdAt: serverTimestamp()
      });
      
      setMode('pending_approval');
    } catch (err: any) {
      console.error("REGISTER error:", err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Este correo ya está en uso.');
      } else {
        setError(`Error al registrar: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const fbUser = userCredential.user;

      // Fetch user profile from Firestore
      const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        
        if (userData.status === 'pending') {
          setError('Tu solicitud está en revisión. El administrador te enviará un correo cuando seas aprobado.');
          setLoading(false);
          return;
        }
        
        if (userData.status !== 'active') {
          setError(`Cuenta ${userData.status}. Contacta a soporte.`);
          setLoading(false);
          return;
        }

        onLogin(userData);
      } else {
        setError('No se encontró el perfil de usuario.');
      }
    } catch (err: any) {
      console.error("LOGIN error:", err);
      setError('Correo o contraseña incorrectos.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendRequest = async () => {
    if (!pendingUser) return;
    
    try {
      await updateDoc(doc(db, 'userRequests', pendingUser.id), {
        updatedAt: serverTimestamp()
      });
      
      setShowResendModal(false);
      setMode('pending_approval');
    } catch (err: any) {
      console.error("RESEND error:", err);
      setError(`Error al reenviar: ${err.message}`);
      setShowResendModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col justify-center p-6 animate-fadeIn font-['Saira']">
      <div className="max-w-md w-full mx-auto bg-white rounded-[40px] shadow-2xl p-8 space-y-8 animate-slideUp overflow-hidden relative border border-white/10">
        <div className="text-center">
           <img src="https://lh3.googleusercontent.com/d/1RFXYtZ9Pls3jJg4pGo80svjKfTayESwl" className="h-24 w-auto mx-auto mb-4 object-contain drop-shadow-2xl" />
           <h2 className="text-3xl font-black uppercase pro-font text-gray-900 tracking-tighter leading-none">
             NINTENDO COLLECTOR
           </h2>
           <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.3em] mt-1">SISTEMA DE GESTIÓN DE LEGADO</p>
        </div>

        {mode === 'login' && (
          <div className="space-y-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-sm focus:ring-2 ring-red-100 transition-all" required />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Contraseña" className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-sm focus:ring-2 ring-red-100 transition-all" required />
              </div>
              
              <div className="flex items-center gap-3 px-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      checked={rememberMe} 
                      onChange={e => setRememberMe(e.target.checked)} 
                      className="sr-only"
                    />
                    <div className={`w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center ${rememberMe ? 'bg-red-600 border-red-600 shadow-lg shadow-red-200' : 'bg-gray-50 border-gray-200'}`}>
                      {rememberMe && <Check size={14} className="text-white" strokeWidth={4} />}
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-gray-900 transition-colors">Mantener sesión iniciada</span>
                </label>
              </div>

              {error && <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 animate-fadeIn shadow-sm">
                <ShieldAlert size={18} className="flex-shrink-0" />
                <p className="text-[10px] font-black uppercase leading-tight">{error}</p>
              </div>}
              <button type="submit" disabled={loading} className="w-full py-5 bg-red-600 text-white rounded-[32px] font-black uppercase shadow-[0_15px_30px_-5px_rgba(220,38,38,0.4)] pro-font text-xl active:scale-95 transition-all disabled:opacity-50">
                {loading ? 'ACCEDIENDO...' : 'ACCEDER AL ESTANTE'}
              </button>
            </form>
            <button type="button" onClick={() => { setMode('register'); setError(''); }} className="w-full text-xs font-black text-gray-400 uppercase pro-font text-center hover:text-gray-900 tracking-widest">¿No tienes cuenta? Solicita acceso</button>
          </div>
        )}

        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="text-center mb-2">
              <h3 className="text-lg font-black uppercase pro-font text-gray-800">Solicitud de Registro</h3>
              <p className="text-[9px] font-bold text-gray-400 uppercase">Tu cuenta será validada manualmente</p>
            </div>
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Nombre completo" className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-sm" required />
            </div>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email de registro" className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-sm" required />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Crear contraseña" className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-sm" required />
            </div>
            <div className="relative">
              <Check className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirmar contraseña" className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-sm" required />
            </div>
            {error && <p className="text-[10px] text-red-500 font-black uppercase text-center">{error}</p>}
            <button type="submit" disabled={loading} className="w-full py-5 bg-gray-950 text-white rounded-[32px] font-black uppercase shadow-xl pro-font text-xl active:scale-95 transition-all disabled:opacity-50">
              {loading ? 'ENVIANDO...' : 'ENVIAR SOLICITUD'}
            </button>
            <button type="button" onClick={() => setMode('login')} className="w-full text-xs font-black text-gray-400 uppercase pro-font text-center">Regresar al login</button>
          </form>
        )}
        
        {mode === 'pending_approval' && (
          <div className="text-center space-y-6 py-4 animate-fadeIn">
             <div className="w-24 h-24 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto animate-pulse shadow-inner">
               <Clock size={48} />
             </div>
             <div className="space-y-3">
               <h3 className="text-2xl font-black uppercase pro-font tracking-tight text-orange-600">Petición Recibida</h3>
               <p className="text-[11px] font-bold text-gray-500 uppercase px-6 text-center leading-relaxed">
                 Gracias, coleccionista. Tu solicitud para <span className="text-orange-600 font-black">{email}</span> ha sido enviada con éxito.
                 <br/><br/>
                 Un administrador revisará tu perfil. Si eres aceptado, recibirás un correo electrónico para activar el <span className="text-red-600">Modo Estándar</span>.
               </p>
             </div>
             <button onClick={() => setMode('login')} className="w-full py-5 bg-gray-900 text-white rounded-[32px] font-black uppercase pro-font text-xl shadow-2xl">ENTENDIDO</button>
          </div>
        )}
      </div>

      {/* MODAL DE REENVÍO DE SOLICITUD */}
      {showResendModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[500] flex items-center justify-center p-6 animate-fadeIn">
          <div className="bg-white p-10 rounded-[45px] w-full max-w-sm text-center space-y-8 animate-slideUp">
            <div className="w-20 h-20 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Send size={40} />
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-black pro-font uppercase tracking-tight">SOLICITUD EXISTENTE</h3>
              <p className="text-[11px] font-bold text-gray-400 uppercase leading-relaxed px-4">
                Ya tienes una solicitud pendiente con este correo. ¿Deseas reenviarla para notificar al administrador?
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <button 
                onClick={handleResendRequest}
                className="w-full py-5 bg-orange-500 text-white rounded-3xl font-black uppercase pro-font text-xl shadow-xl active:scale-95 transition-all"
              >
                REENVIAR SOLICITUD
              </button>
              <button 
                onClick={() => setShowResendModal(false)}
                className="w-full py-5 bg-gray-100 text-gray-400 rounded-3xl font-black uppercase pro-font text-lg active:scale-95 transition-all"
              >
                CANCELAR Y ESPERAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

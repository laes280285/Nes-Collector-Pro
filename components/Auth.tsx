import React, { useState } from 'react';
import { User, UserRole, AccountStatus } from '../types';
import { Mail, Lock, User as UserIcon, Check, ShieldAlert, CheckCircle2, XCircle, ArrowRight, Award } from 'lucide-react';

interface AuthProps {
  onLogin: (user: User) => void;
  users: User[];
  setUsers: (users: User[]) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin, users, setUsers }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'confirm' | 'success'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const passValid = (p: string) => {
    return p.length >= 8 && /[A-Z]/.test(p) && /[a-z]/.test(p) && /[0-9]/.test(p) && /[^A-Za-z0-9]/.test(p);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passValid(password)) return;
    if (password !== confirmPassword) { setError('Las contraseñas no coinciden'); return; }
    
    const newUser: User = {
      id: crypto.randomUUID(),
      name,
      email,
      password,
      role: 'standard',
      status: 'active',
      dateJoined: Date.now(),
      verified: false
    };
    
    // Simulate Admin notification
    console.info("Simulating email to Admin: New user registered:", { name, email, role: 'standard' });
    
    setUsers([...users, newUser]);
    setMode('confirm');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Admin override
    if (email === 'unforgivenwalker@gmail.com' && password === '13@Ngeles') {
      onLogin({
        id: 'admin-id',
        name: 'Administrator',
        email: 'unforgivenwalker@gmail.com',
        role: 'admin',
        status: 'active',
        dateJoined: Date.now(),
        verified: true
      });
      return;
    }

    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      if (!user.verified) { setError('Debes verificar tu cuenta primero.'); return; }
      if (user.status !== 'active') { setError(`Tu cuenta está ${user.status === 'paused' ? 'Pausada' : 'Detenida'}. Contacta a soporte.`); return; }
      onLogin(user);
    } else {
      setError('Credenciales incorrectas');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center p-6 animate-fadeIn">
      <div className="max-w-md w-full mx-auto bg-white rounded-[40px] shadow-2xl p-8 space-y-8 animate-slideUp overflow-hidden">
        <div className="text-center">
           <img src="logo.png" className="w-20 mx-auto mb-4" />
           <h2 className="text-3xl font-black uppercase pro-font text-gray-900 tracking-tight leading-none">
             {mode === 'login' && 'BIENVENIDO'}
             {mode === 'register' && 'REGISTRO'}
             {mode === 'confirm' && 'VERIFICACIÓN'}
             {mode === 'success' && '¡ACEPTADO!'}
           </h2>
        </div>

        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Correo Electrónico" className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold" required />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Contraseña" className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold" required />
            </div>
            {error && <p className="text-[10px] text-red-500 font-black uppercase text-center bg-red-50 p-3 rounded-xl border border-red-100">{error}</p>}
            <button type="submit" className="w-full py-5 bg-red-600 text-white rounded-[32px] font-black uppercase shadow-xl pro-font text-xl active:scale-95 transition-all">INGRESAR</button>
            <button type="button" onClick={() => { setMode('register'); setError(''); }} className="w-full text-xs font-black text-gray-400 uppercase pro-font">O Regístrate aquí</button>
          </form>
        )}

        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Nombre Completo" className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold" required />
            </div>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Correo Electrónico" className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold" required />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Contraseña" className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold" required />
              <div className={`absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white transition-all ${passValid(password) ? 'bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.6)]' : 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.4)]'}`}></div>
            </div>
            <div className="relative">
              <Check className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirmar Contraseña" className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold" required />
            </div>
            
            <div className="bg-gray-50 p-4 rounded-[24px] border border-gray-100 space-y-2">
               <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 pro-font">Seguridad</p>
               <div className="flex items-center gap-2">
                 <div className={`w-2 h-2 rounded-full ${password.length >= 8 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                 <p className={`text-[10px] font-bold uppercase ${password.length >= 8 ? 'text-green-600' : 'text-gray-400'}`}>8+ Caracteres</p>
               </div>
               <div className="flex items-center gap-2">
                 <div className={`w-2 h-2 rounded-full ${/[A-Z]/.test(password) && /[a-z]/.test(password) ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                 <p className={`text-[10px] font-bold uppercase ${/[A-Z]/.test(password) && /[a-z]/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>Mayús. y Minús.</p>
               </div>
               <div className="flex items-center gap-2">
                 <div className={`w-2 h-2 rounded-full ${/[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password) ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                 <p className={`text-[10px] font-bold uppercase ${/[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>Número y Símbolo</p>
               </div>
            </div>

            {error && <p className="text-xs text-red-500 font-bold uppercase text-center">{error}</p>}
            <button type="submit" disabled={!passValid(password)} className="w-full py-5 bg-red-600 text-white rounded-[32px] font-black uppercase shadow-xl pro-font text-xl disabled:opacity-30 active:scale-95 transition-all">REGISTRARME</button>
            <button type="button" onClick={() => setMode('login')} className="w-full text-xs font-black text-gray-400 uppercase pro-font">Ya tengo cuenta</button>
          </form>
        )}

        {mode === 'confirm' && (
          <div className="text-center space-y-6">
             <div className="w-24 h-24 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto animate-pulse shadow-inner">
               <Mail size={48} />
             </div>
             <div>
               <h3 className="text-xl font-black uppercase pro-font tracking-tight">Verifica tu Bandeja</h3>
               <p className="text-xs font-bold text-gray-500 uppercase leading-relaxed mt-2">
                 Hemos enviado una invitación a <span className="text-blue-500 font-black">{email}</span>.
               </p>
             </div>
             <button 
               onClick={() => {
                 setUsers(prev => prev.map(u => u.email === email ? { ...u, verified: true } : u));
                 setMode('success');
               }} 
               className="w-full py-4 bg-blue-600 text-white rounded-[24px] font-black uppercase pro-font shadow-lg shadow-blue-100 flex items-center justify-center gap-2 group transition-all"
             >
               ABRIR ENLACE DE CORREO
               <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
             </button>
          </div>
        )}

        {mode === 'success' && (
          <div className="text-center space-y-8 animate-fadeIn">
             <div className="relative">
               <div className="absolute inset-0 bg-green-100 blur-[40px] opacity-40 rounded-full"></div>
               <div className="w-32 h-32 bg-white text-green-500 rounded-full flex items-center justify-center mx-auto shadow-2xl relative border-4 border-green-50">
                 <Award size={64} strokeWidth={2.5} />
               </div>
             </div>
             
             <div className="p-6 bg-green-50 rounded-[32px] border border-green-100 shadow-inner">
               <h3 className="text-2xl font-black uppercase pro-font text-green-600 leading-none">
                 Felicidades tu registro ha sido aceptado
               </h3>
               <p className="text-[10px] font-black text-green-400 mt-3 uppercase tracking-widest pro-font leading-relaxed">
                 Tu cuenta ha sido verificada con éxito. Ya puedes acceder a la librería global.
               </p>
             </div>

             <button 
               onClick={() => setMode('login')} 
               className="w-full py-5 bg-gray-900 text-white rounded-[32px] font-black uppercase pro-font text-xl shadow-2xl active:scale-95 transition-all"
             >
               VOLVER AL LOGIN
             </button>
          </div>
        )}
      </div>
    </div>
  );
};
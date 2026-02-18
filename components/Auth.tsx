
import React, { useState } from 'react';
import { User, UserRole, AccountStatus } from '../types';
import { Mail, Lock, User as UserIcon, Check, ShieldAlert, CheckCircle2, XCircle, ArrowRight, Award, Clock, Send } from 'lucide-react';

interface AuthProps {
  onLogin: (user: User) => void;
  users: User[];
  setUsers: (users: User[]) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin, users, setUsers }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'pending_approval'>('login');
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
    setError('');
    
    if (users.find(u => u.email === email)) {
      setError('Este correo ya está registrado o tiene una solicitud pendiente.');
      return;
    }
    
    if (!passValid(password)) {
      setError('Contraseña débil: requiere 8 caracteres, Mayús, Minús, Número y Símbolo.');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    
    const newUser: User = {
      id: crypto.randomUUID(),
      name,
      email,
      password,
      role: 'standard',
      status: 'pending', // Solicitud pendiente de aprobación por el admin
      dateJoined: Date.now(),
      verified: false
    };
    
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('nintendo_users_v1', JSON.stringify(updatedUsers));
    setMode('pending_approval');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Admin Master Account
    if (email === 'unforgivenwalker@gmail.com' && password === '13@Ngeles') {
      onLogin({
        id: 'admin-id',
        name: 'Super Admin',
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
      if (user.status === 'pending') {
        setError('Tu solicitud está en revisión. El administrador te enviará un correo cuando seas aprobado.');
        return;
      }
      if (user.status !== 'active') {
        setError(`Cuenta ${user.status}. Contacta a soporte.`);
        return;
      }
      onLogin(user);
    } else {
      setError('Correo o contraseña incorrectos.');
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
              {error && <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 animate-fadeIn shadow-sm">
                <ShieldAlert size={18} className="flex-shrink-0" />
                <p className="text-[10px] font-black uppercase leading-tight">{error}</p>
              </div>}
              <button type="submit" className="w-full py-5 bg-red-600 text-white rounded-[32px] font-black uppercase shadow-[0_15px_30px_-5px_rgba(220,38,38,0.4)] pro-font text-xl active:scale-95 transition-all">ACCEDER AL ESTANTE</button>
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
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email para verificación" className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-sm" required />
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
            <button type="submit" className="w-full py-5 bg-gray-950 text-white rounded-[32px] font-black uppercase shadow-xl pro-font text-xl active:scale-95 transition-all">ENVIAR SOLICITUD</button>
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
    </div>
  );
};

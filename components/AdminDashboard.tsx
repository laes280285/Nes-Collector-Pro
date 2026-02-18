
import React, { useState } from 'react';
import { User, BlacklistedUser, UserRole, AccountStatus } from '../types';
import { 
  Users, ShieldCheck, TrendingUp, Mail, ShieldAlert, 
  Trash2, UserCheck, Lock, Unlock, MoreVertical, Search, Slash,
  Cloud, RefreshCw, Shield, Clock, CheckCircle, Send, Star, Library, XCircle
} from 'lucide-react';

interface AdminDashboardProps {
  users: User[];
  setUsers: (users: User[]) => void;
  blacklist: BlacklistedUser[];
  setBlacklist: (blacklist: BlacklistedUser[]) => void;
  collection: any[];
  onBackupNow?: () => void;
  isSyncing?: boolean;
  driveLinked?: boolean;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  users, setUsers, blacklist, setBlacklist, onBackupNow, isSyncing, driveLinked
}) => {
  const [adminTab, setAdminTab] = useState<'requests' | 'users' | 'blacklist' | 'system'>('requests');
  const [searchTerm, setSearchTerm] = useState('');

  const handleApprove = (user: User) => {
    setUsers(users.map(u => u.id === user.id ? { ...u, status: 'active', verified: true, role: 'standard' } : u));
    alert(`¡Solicitud de ${user.name} Aprobada!\n\nSe ha enviado un correo a ${user.email} informándole sobre su activación estándar y los pasos para subir a Modo Pro (VIP).`);
  };

  const handleUpdateRole = (userId: string, newRole: UserRole) => {
    setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    if(newRole === 'vip') {
        alert("Usuario ascendido a Modo PRO. Ahora tiene acceso a todas las funciones financieras y de respaldo.");
    }
  };

  const handleUpdateStatus = (userId: string, newStatus: AccountStatus) => {
    setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
  };

  const handleBlacklist = (user: User) => {
    const reason = prompt("Motivo del baneo:");
    if (!reason) return;

    const blacklisted: BlacklistedUser = {
      ...user,
      deletionReason: reason,
      deletedAt: Date.now()
    };
    
    setBlacklist([...blacklist, blacklisted]);
    setUsers(users.filter(u => u.id !== user.id));
  };

  const pendingRequests = users.filter(u => u.status === 'pending');
  const activeUsers = users.filter(u => u.status !== 'pending');

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-[32px] shadow-sm border border-gray-100 text-center">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Nuevas</p>
          <p className="text-2xl font-black pro-font text-orange-500">{pendingRequests.length}</p>
        </div>
        <div className="bg-white p-4 rounded-[32px] shadow-sm border border-gray-100 text-center">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Totales</p>
          <p className="text-2xl font-black pro-font text-blue-500">{activeUsers.length}</p>
        </div>
        <div className="bg-white p-4 rounded-[32px] shadow-sm border border-gray-100 text-center">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Baneados</p>
          <p className="text-2xl font-black pro-font text-red-500">{blacklist.length}</p>
        </div>
      </div>

      <div className="flex bg-gray-200/50 p-1.5 rounded-[24px] overflow-x-auto no-scrollbar">
        <button onClick={() => setAdminTab('requests')} className={`flex-1 min-w-[110px] py-3.5 rounded-2xl font-black uppercase text-[10px] transition-all flex items-center justify-center gap-2 ${adminTab === 'requests' ? 'bg-white shadow-md text-gray-900' : 'text-gray-400'}`}>
          <Clock size={14}/> Solicitudes
        </button>
        <button onClick={() => setAdminTab('users')} className={`flex-1 min-w-[110px] py-3.5 rounded-2xl font-black uppercase text-[10px] transition-all flex items-center justify-center gap-2 ${adminTab === 'users' ? 'bg-white shadow-md text-gray-900' : 'text-gray-400'}`}>
          <Users size={14}/> Usuarios
        </button>
        <button onClick={() => setAdminTab('blacklist')} className={`flex-1 min-w-[110px] py-3.5 rounded-2xl font-black uppercase text-[10px] transition-all flex items-center justify-center gap-2 ${adminTab === 'blacklist' ? 'bg-white shadow-md text-gray-900' : 'text-gray-400'}`}>
          <Slash size={14}/> Blacklist
        </button>
      </div>

      {adminTab === 'requests' && (
        <div className="space-y-4">
          {pendingRequests.length === 0 ? (
            <div className="py-20 text-center opacity-20">
              <ShieldCheck size={64} className="mx-auto mb-4" />
              <p className="font-black uppercase pro-font text-xl tracking-widest">Todo al día, jefe</p>
            </div>
          ) : (
            pendingRequests.map(user => (
              <div key={user.id} className="bg-white p-6 rounded-[35px] shadow-sm border border-orange-100 flex items-center justify-between group">
                <div>
                   <h4 className="font-black uppercase text-lg text-gray-900 pro-font tracking-tight leading-none mb-1">{user.name}</h4>
                   <p className="text-[10px] font-bold text-orange-500 tracking-wider uppercase">{user.email}</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => handleBlacklist(user)} className="bg-gray-100 text-gray-400 p-4 rounded-3xl hover:bg-red-50 hover:text-red-600 transition-colors">
                        <XCircle size={20} />
                    </button>
                    <button 
                    onClick={() => handleApprove(user)}
                    className="bg-green-600 text-white p-4 rounded-3xl shadow-[0_10px_20px_-5px_rgba(22,163,74,0.4)] hover:scale-105 active:scale-95 transition-all"
                    >
                    <CheckCircle size={20} />
                    </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {adminTab === 'users' && (
        <div className="space-y-5">
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
            <input type="text" placeholder="Buscar coleccionista..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-14 pr-6 py-5 bg-white border border-gray-100 rounded-[28px] outline-none font-bold text-sm shadow-sm" />
          </div>
          <div className="space-y-4">
            {activeUsers.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase())).map(user => (
              <div key={user.id} className="bg-white p-6 rounded-[40px] shadow-sm border border-gray-100 space-y-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-3xl flex items-center justify-center font-black text-xl pro-font ${user.role === 'vip' ? 'gold-glow' : 'bg-gray-100 text-gray-400'}`}>
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-black uppercase text-xl text-gray-900 pro-font leading-none mb-1">{user.name}</h4>
                      <div className="flex items-center gap-1.5">
                          {user.role === 'vip' ? <Star size={10} className="text-yellow-500 fill-yellow-500" /> : <Library size={10} className="text-gray-400" />}
                          <p className="text-[10px] font-black text-gray-400 tracking-widest uppercase">{user.role}</p>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => handleBlacklist(user)} className="p-3 text-red-200 hover:text-red-500 transition-colors"><Trash2 size={20}/></button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                   <button onClick={() => handleUpdateRole(user.id, 'standard')} className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${user.role === 'standard' ? 'bg-gray-950 text-white shadow-xl' : 'bg-gray-50 text-gray-400'}`}>Estándar</button>
                   <button onClick={() => handleUpdateRole(user.id, 'vip')} className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${user.role === 'vip' ? 'gold-glow shadow-xl' : 'bg-gray-50 text-gray-400'}`}>
                     <Star size={14} className={user.role === 'vip' ? 'fill-current' : ''} /> Modo PRO
                   </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {adminTab === 'blacklist' && (
        <div className="space-y-4">
          {blacklist.length === 0 ? (
             <p className="text-center py-20 text-gray-300 font-black uppercase pro-font text-lg tracking-widest">Sin criminales en la lista</p>
          ) : (
            blacklist.map(bUser => (
              <div key={bUser.id} className="bg-white p-6 rounded-[32px] shadow-sm border border-red-50 flex items-center justify-between">
                <div>
                   <h4 className="font-black uppercase text-lg text-gray-900 pro-font">{bUser.name}</h4>
                   <p className="text-[10px] text-red-500 font-black uppercase tracking-tighter">Baneado por: {bUser.deletionReason}</p>
                </div>
                <button 
                  onClick={() => {
                      if(confirm("¿Reincorporar a este usuario?")) {
                          setUsers([...users, { ...bUser, status: 'active' } as User]);
                          setBlacklist(blacklist.filter(b => b.id !== bUser.id));
                      }
                  }}
                  className="p-4 bg-gray-50 text-gray-400 rounded-2xl hover:bg-green-50 hover:text-green-600 transition-colors"
                >
                    <Unlock size={20} />
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

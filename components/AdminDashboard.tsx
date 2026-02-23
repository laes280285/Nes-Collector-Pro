
import React, { useState, useEffect } from 'react';
import { User, BlacklistedUser, UserRole, AccountStatus } from '../types';
import { db } from '../services/firebase';
import { collection as fsCollection, doc, updateDoc, deleteDoc, onSnapshot, query, orderBy, setDoc } from 'firebase/firestore';
import { 
  Users, ShieldCheck, TrendingUp, Mail, ShieldAlert, 
  Trash2, UserCheck, Lock, Unlock, MoreVertical, Search, Slash,
  Cloud, RefreshCw, Shield, Clock, CheckCircle, Send, Star, Library, XCircle
} from 'lucide-react';

interface AdminDashboardProps {
}

export const AdminDashboard: React.FC<AdminDashboardProps> = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [blacklist, setBlacklist] = useState<BlacklistedUser[]>([]);
  const [adminTab, setAdminTab] = useState<'requests' | 'users' | 'blacklist' | 'system'>('requests');
  const [userFilter, setUserFilter] = useState<'all' | 'standard' | 'vip'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Subscribe to all users
    const q = query(fsCollection(db, 'users'), orderBy('dateJoined', 'desc'));
    const unsubscribeUsers = onSnapshot(q, (snapshot) => {
      const usersList = snapshot.docs.map(doc => doc.data() as User);
      setUsers(usersList);
    });

    // Subscribe to blacklist
    const qBlacklist = query(fsCollection(db, 'blacklist'), orderBy('deletedAt', 'desc'));
    const unsubscribeBlacklist = onSnapshot(qBlacklist, (snapshot) => {
      const blacklistList = snapshot.docs.map(doc => doc.data() as BlacklistedUser);
      setBlacklist(blacklistList);
    });

    return () => {
      unsubscribeUsers();
      unsubscribeBlacklist();
    };
  }, []);

  const handleApprove = async (user: User, role: UserRole) => {
    try {
      await updateDoc(doc(db, 'users', user.id), {
        status: 'active',
        verified: true,
        role
      });
      alert(`¡Solicitud de ${user.name} Aprobada como ${role.toUpperCase()}!\n\nSe ha enviado un correo formal de bienvenida a ${user.email} informándole sobre su acceso a la aplicación.`);
    } catch (err) {
      console.error("Approve error:", err);
    }
  };

  const handleDeleteRequest = async (userId: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar esta solicitud de acceso?")) {
      try {
        await deleteDoc(doc(db, 'users', userId));
      } catch (err) {
        console.error("Delete request error:", err);
      }
    }
  };

  const handleUpdateRole = async (userId: string, newRole: UserRole) => {
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      if(newRole === 'vip') {
          alert("Usuario ascendido a Modo PRO. Ahora tiene acceso a todas las funciones financieras y de respaldo.");
      }
    } catch (err) {
      console.error("Update role error:", err);
    }
  };

  const handleBlacklist = async (user: User) => {
    const reason = prompt("Motivo del baneo:");
    if (!reason) return;

    const blacklisted: BlacklistedUser = {
      ...user,
      deletionReason: reason,
      deletedAt: Date.now()
    };
    
    try {
      await setDoc(doc(db, 'blacklist', user.id), blacklisted);
      await deleteDoc(doc(db, 'users', user.id));
    } catch (err) {
      console.error("Blacklist error:", err);
    }
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
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Solicitudes Pendientes</h3>
            <button 
              onClick={() => {
                const btn = document.getElementById('refresh-requests-btn');
                if (btn) btn.classList.add('animate-spin');
                setTimeout(() => {
                  if (btn) btn.classList.remove('animate-spin');
                }, 1000);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-500 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all active:scale-95"
            >
              <RefreshCw id="refresh-requests-btn" size={12} /> Refrescar Lista
            </button>
          </div>
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
                    <button onClick={() => handleDeleteRequest(user.id)} className="bg-gray-100 text-gray-400 p-4 rounded-3xl hover:bg-red-50 hover:text-red-600 transition-colors" title="Eliminar solicitud">
                        <Trash2 size={20} />
                    </button>
                    <button onClick={() => handleBlacklist(user)} className="bg-gray-100 text-gray-400 p-4 rounded-3xl hover:bg-orange-50 hover:text-orange-600 transition-colors" title="Banear usuario">
                        <Slash size={20} />
                    </button>
                    <div className="flex flex-col gap-1">
                      <button 
                        onClick={() => handleApprove(user, 'standard')}
                        className="bg-gray-900 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase shadow-md hover:scale-105 active:scale-95 transition-all"
                      >
                        Aprobar Estándar
                      </button>
                      <button 
                        onClick={() => handleApprove(user, 'vip')}
                        className="gold-glow text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-1"
                      >
                        <Star size={10} fill="currentColor" /> Aprobar VIP
                      </button>
                    </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {adminTab === 'users' && (
        <div className="space-y-5">
          <div className="flex gap-2 mb-2 overflow-x-auto no-scrollbar pb-1">
            <button onClick={() => setUserFilter('all')} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${userFilter === 'all' ? 'bg-gray-900 text-white shadow-md' : 'bg-gray-100 text-gray-400'}`}>Todos</button>
            <button onClick={() => setUserFilter('standard')} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${userFilter === 'standard' ? 'bg-gray-900 text-white shadow-md' : 'bg-gray-100 text-gray-400'}`}>Estándar</button>
            <button onClick={() => setUserFilter('vip')} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${userFilter === 'vip' ? 'gold-glow text-white shadow-md' : 'bg-gray-100 text-gray-400'}`}>VIP / PRO</button>
          </div>
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
            <input type="text" placeholder="Buscar coleccionista..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-14 pr-6 py-5 bg-white border border-gray-100 rounded-[28px] outline-none font-bold text-sm shadow-sm" />
          </div>
          <div className="space-y-4">
            {activeUsers
              .filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()))
              .filter(u => userFilter === 'all' ? true : u.role === userFilter)
              .map(user => (
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
                  onClick={async () => {
                      if(confirm("¿Reincorporar a este usuario?")) {
                          try {
                            await setDoc(doc(db, 'users', bUser.id), { ...bUser, status: 'active' });
                            await deleteDoc(doc(db, 'blacklist', bUser.id));
                          } catch (err) {
                            console.error("Unblacklist error:", err);
                          }
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

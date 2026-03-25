import React, { useState, useEffect, useContext } from 'react';
import { db, collection, query, onSnapshot, doc, updateDoc } from '../firebase';
import { AuthContext } from './Auth';
import { UserProfile } from '../types';
import { Check, X, Shield, User as UserIcon, Mail, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export const AdminDashboard: React.FC = () => {
  const { user: currentUser } = useContext(AuthContext);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') return;

    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => doc.data() as UserProfile);
      setUsers(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const SUPER_ADMIN_EMAIL = "dongloadmoney@gmail.com";

  const toggleApproval = async (userToUpdate: UserProfile) => {
    if (userToUpdate.email === SUPER_ADMIN_EMAIL) return;
    try {
      await updateDoc(doc(db, 'users', userToUpdate.uid), {
        approved: !userToUpdate.approved
      });
    } catch (error) {
      console.error('Error updating user approval:', error);
    }
  };

  const toggleRole = async (userToUpdate: UserProfile) => {
    if (userToUpdate.email === SUPER_ADMIN_EMAIL) return;
    try {
      await updateDoc(doc(db, 'users', userToUpdate.uid), {
        role: userToUpdate.role === 'admin' ? 'user' : 'admin'
      });
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  if (currentUser?.role !== 'admin') {
    return <div className="p-10 text-center text-[#A04040]">Bạn không có quyền truy cập trang này.</div>;
  }

  if (loading) return <div className="animate-pulse text-[#5A5A40] italic">Đang tải danh sách người dùng...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-serif text-[#1A1A1A]">Quản lý người dùng</h2>
        <div className="bg-[#5A5A40]/10 px-4 py-2 rounded-full flex items-center gap-2 text-[#5A5A40]">
          <Shield size={18} />
          <span className="text-sm font-medium">Chế độ Quản trị viên</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {users.map((user) => {
          const isSuperAdmin = user.email === SUPER_ADMIN_EMAIL;
          const isSelf = user.uid === currentUser.uid;
          const canModify = !isSuperAdmin && !isSelf;

          return (
            <div key={user.uid} className="bg-white p-6 rounded-[24px] border border-[#E5E5E0] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || ''} className="w-12 h-12 rounded-full border border-[#E5E5E0]" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#F5F5F0] flex items-center justify-center text-[#5A5A40]">
                    <UserIcon size={24} />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-medium text-[#1A1A1A]">{user.displayName || 'Người dùng mới'}</h3>
                    {isSuperAdmin && (
                      <span className="bg-[#5A5A40] text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        Super Admin
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-[#5A5A40]">
                    <span className="flex items-center gap-1"><Mail size={14} /> {user.email}</span>
                    <span className="flex items-center gap-1"><Calendar size={14} /> {format(new Date(user.createdAt), 'dd/MM/yyyy')}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end mr-4">
                  <span className={`text-xs font-bold uppercase tracking-widest ${user.approved ? 'text-green-600' : 'text-amber-600'}`}>
                    {user.approved ? 'Đã phê duyệt' : 'Chờ phê duyệt'}
                  </span>
                  <span className="text-[10px] text-[#5A5A40] uppercase tracking-widest font-bold">
                    Vai trò: {user.role === 'admin' ? 'Quản trị' : 'Thành viên'}
                  </span>
                </div>

                <button
                  onClick={() => toggleApproval(user)}
                  disabled={!canModify}
                  className={`p-3 rounded-full transition-all duration-300 ${
                    user.approved 
                      ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                      : 'bg-green-50 text-green-600 hover:bg-green-100'
                  } disabled:opacity-30`}
                  title={user.approved ? 'Hủy phê duyệt' : 'Phê duyệt'}
                >
                  {user.approved ? <X size={20} /> : <Check size={20} />}
                </button>

                <button
                  onClick={() => toggleRole(user)}
                  disabled={!canModify}
                  className={`p-3 rounded-full transition-all duration-300 ${
                    user.role === 'admin' 
                      ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' 
                      : 'bg-[#5A5A40]/10 text-[#5A5A40] hover:bg-[#5A5A40]/20'
                  } disabled:opacity-30`}
                  title={user.role === 'admin' ? 'Gỡ quyền Admin' : 'Cấp quyền Admin'}
                >
                  <Shield size={20} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

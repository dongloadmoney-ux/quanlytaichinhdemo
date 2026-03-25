import React, { useState, useContext } from 'react';
import { db, doc, updateDoc } from '../firebase';
import { AuthContext } from './Auth';
import { UserProfile } from '../types';
import { User as UserIcon, Mail, Calendar, Wallet, Save, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

export const Profile: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [currency, setCurrency] = useState(user?.currency || 'VND');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        displayName,
        currency
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-serif text-[#1A1A1A]">Hồ sơ cá nhân</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Info Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[32px] border border-[#E5E5E0] shadow-sm text-center">
            <div className="relative inline-block mb-6">
              {user?.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || ''} className="w-32 h-32 rounded-full border-4 border-[#F5F5F0] shadow-md mx-auto" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-32 h-32 rounded-full bg-[#F5F5F0] flex items-center justify-center text-[#5A5A40] mx-auto">
                  <UserIcon size={64} />
                </div>
              )}
              <div className="absolute bottom-0 right-0 bg-[#5A5A40] text-white p-2 rounded-full border-4 border-white">
                <CheckCircle size={16} />
              </div>
            </div>
            <h3 className="text-2xl font-serif text-[#1A1A1A]">{user?.displayName}</h3>
            <p className="text-[#5A5A40] italic mb-6">{user?.role === 'admin' ? 'Quản trị viên' : 'Thành viên'}</p>
            
            <div className="space-y-4 text-left border-t border-[#E5E5E0] pt-6">
              <div className="flex items-center gap-3 text-[#5A5A40]">
                <Mail size={18} />
                <span className="text-sm">{user?.email}</span>
              </div>
              <div className="flex items-center gap-3 text-[#5A5A40]">
                <Calendar size={18} />
                <span className="text-sm">Tham gia: {user?.createdAt ? format(new Date(user.createdAt), 'dd/MM/yyyy') : '-'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Card */}
        <div className="lg:col-span-2">
          <div className="bg-white p-8 rounded-[32px] border border-[#E5E5E0] shadow-sm">
            <h3 className="text-xl font-serif text-[#1A1A1A] mb-8">Cài đặt tài khoản</h3>
            
            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest font-semibold text-[#5A5A40]">Tên hiển thị</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5A5A40]" size={18} />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#F5F5F0] border-none rounded-2xl focus:ring-2 focus:ring-[#5A5A40] outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest font-semibold text-[#5A5A40]">Tiền tệ mặc định</label>
                <div className="relative">
                  <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5A5A40]" size={18} />
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#F5F5F0] border-none rounded-2xl focus:ring-2 focus:ring-[#5A5A40] outline-none appearance-none"
                  >
                    <option value="VND">VND - Việt Nam Đồng</option>
                    <option value="USD">USD - Đô la Mỹ</option>
                    <option value="EUR">EUR - Euro</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 bg-[#5A5A40] text-white px-8 py-3 rounded-full hover:bg-[#4A4A30] transition-all duration-300 shadow-lg shadow-[#5A5A40]/20 disabled:opacity-50"
                >
                  <Save size={18} />
                  {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
                {saved && (
                  <span className="text-green-600 text-sm flex items-center gap-1 animate-in fade-in slide-in-from-left-2">
                    <CheckCircle size={16} /> Đã lưu thành công
                  </span>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

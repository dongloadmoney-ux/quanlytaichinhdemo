import React, { useState, useEffect, useContext } from 'react';
import { db, collection, query, where, orderBy, onSnapshot } from '../firebase';
import { AuthContext } from './Auth';
import { Transaction } from '../types';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { ArrowUpRight, ArrowDownLeft, FileText, Search, Filter } from 'lucide-react';

export const TransactionList: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'transactions'),
      where('uid', '==', user.uid),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
      setTransactions(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const filteredTransactions = transactions.filter(t => 
    t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.note.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="animate-pulse text-[#5A5A40] italic">Đang tải giao dịch...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-3xl font-serif text-[#1A1A1A]">Lịch sử giao dịch</h2>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5A5A40]" size={18} />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-[#E5E5E0] rounded-full focus:ring-2 focus:ring-[#5A5A40] outline-none text-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-[#E5E5E0] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#F5F5F0] border-b border-[#E5E5E0]">
                <th className="px-6 py-4 text-xs uppercase tracking-widest font-semibold text-[#5A5A40]">Ngày</th>
                <th className="px-6 py-4 text-xs uppercase tracking-widest font-semibold text-[#5A5A40]">Danh mục</th>
                <th className="px-6 py-4 text-xs uppercase tracking-widest font-semibold text-[#5A5A40]">Ghi chú</th>
                <th className="px-6 py-4 text-xs uppercase tracking-widest font-semibold text-[#5A5A40] text-right">Số tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E0]">
              {filteredTransactions.map((t) => (
                <tr key={t.id} className="hover:bg-[#F5F5F0]/50 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="text-sm text-[#1A1A1A]">{format(new Date(t.date), 'dd/MM/yyyy')}</p>
                    <p className="text-[10px] text-[#5A5A40]">{format(new Date(t.date), 'EEEE', { locale: vi })}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${t.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {t.type === 'income' ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
                      </div>
                      <span className="text-sm font-medium text-[#1A1A1A]">{t.category}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-[#5A5A40] max-w-[200px] truncate">{t.note || '-'}</p>
                      {t.attachmentUrl && (
                        <a href={t.attachmentUrl} target="_blank" rel="noopener noreferrer" className="text-[#5A5A40] hover:text-[#1A1A1A]">
                          <FileText size={14} />
                        </a>
                      )}
                    </div>
                  </td>
                  <td className={`px-6 py-4 text-right font-medium ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString()}đ
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-[#5A5A40] italic">
                    Không tìm thấy giao dịch nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useContext } from 'react';
import { db, collection, addDoc, storage } from '../firebase';
import { AuthContext } from './Auth';
import { Transaction, DEFAULT_CATEGORIES } from '../types';
import { X, Upload, Check, DollarSign, Calendar, Tag, FileText } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from '../firebase';

interface TransactionFormProps {
  onClose: () => void;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ onClose }) => {
  const { user } = useContext(AuthContext);
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !amount || !category) return;

    setLoading(true);
    try {
      let attachmentUrl = '';
      if (file) {
        const storageRef = ref(storage, `attachments/${user.uid}/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        attachmentUrl = await getDownloadURL(storageRef);
      }

      const newTransaction: Omit<Transaction, 'id'> = {
        uid: user.uid,
        amount: parseFloat(amount),
        type,
        category,
        date: new Date(date).toISOString(),
        note,
        attachmentUrl,
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, 'transactions'), newTransaction);
      onClose();
    } catch (error) {
      console.error('Error adding transaction:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = DEFAULT_CATEGORIES.filter(c => c.type === type);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white w-full max-w-lg rounded-[32px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="p-8 border-b border-[#E5E5E0] flex items-center justify-between">
          <h2 className="text-2xl font-serif text-[#1A1A1A]">Thêm giao dịch mới</h2>
          <button onClick={onClose} className="text-[#5A5A40] hover:text-[#1A1A1A] transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Type Toggle */}
          <div className="flex bg-[#F5F5F0] p-1 rounded-full">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex-1 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                type === 'expense' ? 'bg-[#5A5A40] text-white shadow-md' : 'text-[#5A5A40]'
              }`}
            >
              Chi phí
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex-1 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                type === 'income' ? 'bg-[#5A5A40] text-white shadow-md' : 'text-[#5A5A40]'
              }`}
            >
              Thu nhập
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Amount */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest font-semibold text-[#5A5A40]">Số tiền</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5A5A40]" size={18} />
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-3 bg-[#F5F5F0] border-none rounded-2xl focus:ring-2 focus:ring-[#5A5A40] outline-none"
                  required
                />
              </div>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest font-semibold text-[#5A5A40]">Ngày</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5A5A40]" size={18} />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#F5F5F0] border-none rounded-2xl focus:ring-2 focus:ring-[#5A5A40] outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest font-semibold text-[#5A5A40]">Danh mục</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => setCategory(cat.name)}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-300 ${
                    category === cat.name
                      ? 'bg-[#5A5A40] border-[#5A5A40] text-white'
                      : 'bg-white border-[#E5E5E0] text-[#5A5A40] hover:bg-[#F5F5F0]'
                  }`}
                >
                  <span className="text-xs text-center">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest font-semibold text-[#5A5A40]">Ghi chú</label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 text-[#5A5A40]" size={18} />
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Nhập ghi chú..."
                className="w-full pl-10 pr-4 py-3 bg-[#F5F5F0] border-none rounded-2xl focus:ring-2 focus:ring-[#5A5A40] outline-none min-h-[100px]"
              />
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest font-semibold text-[#5A5A40]">Hóa đơn / Tệp đính kèm</label>
            <label className="flex items-center justify-center gap-3 w-full p-4 border-2 border-dashed border-[#E5E5E0] rounded-2xl cursor-pointer hover:bg-[#F5F5F0] transition-all">
              <Upload size={20} className="text-[#5A5A40]" />
              <span className="text-sm text-[#5A5A40]">{file ? file.name : 'Chọn tệp để tải lên'}</span>
              <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#5A5A40] text-white py-4 rounded-full font-medium hover:bg-[#4A4A30] transition-all duration-300 shadow-lg shadow-[#5A5A40]/20 disabled:opacity-50"
          >
            {loading ? 'Đang lưu...' : 'Lưu giao dịch'}
          </button>
        </form>
      </div>
    </div>
  );
};

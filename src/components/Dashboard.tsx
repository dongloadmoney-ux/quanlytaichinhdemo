import React, { useState, useEffect, useContext } from 'react';
import { db, collection, query, where, onSnapshot } from '../firebase';
import { AuthContext } from './Auth';
import { Transaction } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Wallet, PlusCircle } from 'lucide-react';

interface DashboardProps {
  onAddClick: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onAddClick }) => {
  const { user } = useContext(AuthContext);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'transactions'),
      where('uid', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
      setTransactions(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  // Data for Pie Chart (Expenses by Category)
  const expenseByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc: any, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  const pieData = Object.keys(expenseByCategory).map(name => ({
    name,
    value: expenseByCategory[name]
  }));

  // Data for Bar Chart (Monthly Income vs Expense)
  const monthlyData = transactions.reduce((acc: any, t) => {
    const month = new Date(t.date).toLocaleString('vi-VN', { month: 'short' });
    if (!acc[month]) acc[month] = { month, income: 0, expense: 0 };
    if (t.type === 'income') acc[month].income += t.amount;
    else acc[month].expense += t.amount;
    return acc;
  }, {});

  const barData = Object.values(monthlyData).slice(-6); // Last 6 months

  const COLORS = ['#5A5A40', '#8A8A60', '#A5A58D', '#B7B7A4', '#DDBEA9', '#FFE8D6'];

  if (loading) return <div className="animate-pulse text-[#5A5A40] italic">Đang tải báo cáo...</div>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-serif text-[#1A1A1A]">Chào mừng, {user?.displayName?.split(' ')[0]}</h2>
          <p className="text-[#5A5A40] italic">Hôm nay bạn muốn quản lý gì?</p>
        </div>
        <button
          onClick={onAddClick}
          className="hidden md:flex items-center gap-2 bg-[#5A5A40] text-white px-6 py-3 rounded-full hover:bg-[#4A4A30] transition-all duration-300 shadow-lg shadow-[#5A5A40]/20"
        >
          <PlusCircle size={20} />
          Thêm giao dịch
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[32px] border border-[#E5E5E0] shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-[#5A5A40]">
            <Wallet size={20} />
            <span className="text-xs uppercase tracking-widest font-semibold">Số dư hiện tại</span>
          </div>
          <p className="text-3xl font-serif text-[#1A1A1A]">{balance.toLocaleString()}đ</p>
        </div>
        <div className="bg-white p-8 rounded-[32px] border border-[#E5E5E0] shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-green-600">
            <TrendingUp size={20} />
            <span className="text-xs uppercase tracking-widest font-semibold">Tổng thu nhập</span>
          </div>
          <p className="text-3xl font-serif text-[#1A1A1A]">{totalIncome.toLocaleString()}đ</p>
        </div>
        <div className="bg-white p-8 rounded-[32px] border border-[#E5E5E0] shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-red-600">
            <TrendingDown size={20} />
            <span className="text-xs uppercase tracking-widest font-semibold">Tổng chi tiêu</span>
          </div>
          <p className="text-3xl font-serif text-[#1A1A1A]">{totalExpense.toLocaleString()}đ</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pie Chart */}
        <div className="bg-white p-8 rounded-[32px] border border-[#E5E5E0] shadow-sm min-h-[400px]">
          <h3 className="text-xl font-serif text-[#1A1A1A] mb-6">Chi tiêu theo danh mục</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-[#5A5A40] italic">
              Chưa có dữ liệu chi tiêu.
            </div>
          )}
        </div>

        {/* Bar Chart */}
        <div className="bg-white p-8 rounded-[32px] border border-[#E5E5E0] shadow-sm min-h-[400px]">
          <h3 className="text-xl font-serif text-[#1A1A1A] mb-6">Thu nhập & Chi tiêu hàng tháng</h3>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip />
                <Legend />
                <Bar dataKey="income" fill="#5A5A40" radius={[4, 4, 0, 0]} name="Thu nhập" />
                <Bar dataKey="expense" fill="#DDBEA9" radius={[4, 4, 0, 0]} name="Chi phí" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-[#5A5A40] italic">
              Chưa có dữ liệu hàng tháng.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

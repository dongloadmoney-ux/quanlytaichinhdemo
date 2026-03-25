export interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  createdAt: string;
  currency: string;
  approved: boolean;
  role: 'admin' | 'user';
}

export interface Transaction {
  id?: string;
  uid: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  note: string;
  attachmentUrl?: string;
  createdAt: string;
}

export interface Category {
  id?: string;
  uid: string;
  name: string;
  icon: string;
  type: 'income' | 'expense';
}

export const DEFAULT_CATEGORIES: Omit<Category, 'uid'>[] = [
  { name: 'Ăn uống', icon: 'Utensils', type: 'expense' },
  { name: 'Di chuyển', icon: 'Car', type: 'expense' },
  { name: 'Mua sắm', icon: 'ShoppingBag', type: 'expense' },
  { name: 'Giải trí', icon: 'Gamepad2', type: 'expense' },
  { name: 'Sức khỏe', icon: 'HeartPulse', type: 'expense' },
  { name: 'Lương', icon: 'Banknote', type: 'income' },
  { name: 'Thưởng', icon: 'Gift', type: 'income' },
  { name: 'Đầu tư', icon: 'TrendingUp', type: 'income' },
];

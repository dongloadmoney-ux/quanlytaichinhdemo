import React, { useState, useEffect } from 'react';
import { auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged, db, doc, getDoc, setDoc } from '../firebase';
import { UserProfile } from '../types';
import { LogIn, LogOut, User as UserIcon } from 'lucide-react';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data() as UserProfile;
          // Force super admin to be approved in state
          if (firebaseUser.email === "dongloadmoney@gmail.com") {
            userData.approved = true;
            userData.role = 'admin';
          }
          setUser(userData);
        } else {
          // Check if this is the initial admin
          const isAdminEmail = firebaseUser.email === "dongloadmoney@gmail.com";
          const newUser: UserProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            createdAt: new Date().toISOString(),
            currency: 'VND',
            approved: isAdminEmail, // Auto-approve the initial admin
            role: isAdminEmail ? 'admin' : 'user',
          };
          await setDoc(userDocRef, newUser);
          setUser(newUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F5F5F0]">
        <div className="animate-pulse text-[#5A5A40] font-serif italic text-xl">Nấm's finance đang tải...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F5F5F0] p-6">
        <div className="max-w-md w-full bg-white rounded-[32px] p-10 shadow-sm border border-[#E5E5E0] text-center">
          <h1 className="text-5xl font-serif font-light text-[#1A1A1A] mb-4">Nấm's finance</h1>
          <p className="text-[#5A5A40] italic mb-10">Quản lý tài chính cá nhân một cách tinh tế.</p>
          <button
            onClick={login}
            className="w-full flex items-center justify-center gap-3 bg-[#5A5A40] text-white py-4 rounded-full hover:bg-[#4A4A30] transition-all duration-300 shadow-lg shadow-[#5A5A40]/20"
          >
            <LogIn size={20} />
            Đăng nhập với Google
          </button>
        </div>
      </div>
    );
  }

  if (!user.approved) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F5F5F0] p-6 text-center">
        <div className="max-w-md w-full bg-white rounded-[32px] p-10 shadow-sm border border-[#E5E5E0]">
          <div className="w-20 h-20 bg-[#F5F5F0] rounded-full flex items-center justify-center mx-auto mb-6 text-[#5A5A40]">
            <UserIcon size={40} />
          </div>
          <h2 className="text-2xl font-serif text-[#1A1A1A] mb-4">Đang chờ phê duyệt</h2>
          <p className="text-[#5A5A40] mb-8">
            Tài khoản của bạn ({user.email}) đã được tạo thành công. Vui lòng đợi quản trị viên phê duyệt để bắt đầu sử dụng ứng dụng.
          </p>
          <button
            onClick={logout}
            className="text-[#5A5A40] hover:underline font-medium"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const AuthContext = React.createContext<{ user: UserProfile | null; logout: () => void }>({
  user: null,
  logout: () => {},
});

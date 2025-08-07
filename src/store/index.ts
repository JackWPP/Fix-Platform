import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 用户信息类型
interface User {
  id: string;
  phone: string;
  name: string;
  role: 'user' | 'repairman' | 'customer_service' | 'admin';
  created_at: string;
  updated_at: string;
}

// 认证状态
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
  updateUser: (user: Partial<User>) => void;
}

// 应用状态
interface AppState {
  loading: boolean;
  error: string | null;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

// 订单状态
interface OrderState {
  orders: any[];
  currentOrder: any | null;
  deviceTypes: any[];
  serviceTypes: any[];
  setOrders: (orders: any[]) => void;
  setCurrentOrder: (order: any) => void;
  setDeviceTypes: (types: any[]) => void;
  setServiceTypes: (types: any[]) => void;
  addOrder: (order: any) => void;
  updateOrder: (orderId: string, updates: any) => void;
  removeOrder: (orderId: string) => void;
}

// 用户管理状态
interface UserManagementState {
  users: any[];
  technicians: any[];
  userStats: any | null;
  setUsers: (users: any[]) => void;
  setTechnicians: (technicians: any[]) => void;
  setUserStats: (stats: any) => void;
  addUser: (user: any) => void;
  updateUserInList: (userId: string, updates: any) => void;
  removeUser: (userId: string) => void;
}

// 创建认证store
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      login: (user: User, token: string) => {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_info', JSON.stringify(user));
        set({ user, token, isAuthenticated: true });
      },
      
      logout: () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_info');
        set({ user: null, token: null, isAuthenticated: false });
      },
      
      setUser: (user: User) => {
        localStorage.setItem('user_info', JSON.stringify(user));
        set({ user });
      },
      
      updateUser: (updates: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          const updatedUser = { ...currentUser, ...updates };
          localStorage.setItem('user_info', JSON.stringify(updatedUser));
          set({ user: updatedUser });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// 创建应用状态store
export const useAppStore = create<AppState>((set) => ({
  loading: false,
  error: null,
  
  setLoading: (loading: boolean) => set({ loading }),
  
  setError: (error: string | null) => set({ error }),
  
  clearError: () => set({ error: null }),
}));

// 创建订单状态store
export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  currentOrder: null,
  deviceTypes: [],
  serviceTypes: [],
  
  setOrders: (orders: any[]) => set({ orders }),
  
  setCurrentOrder: (order: any) => set({ currentOrder: order }),
  
  setDeviceTypes: (types: any[]) => set({ deviceTypes: types }),
  
  setServiceTypes: (types: any[]) => set({ serviceTypes: types }),
  
  addOrder: (order: any) => {
    const orders = get().orders;
    set({ orders: [order, ...orders] });
  },
  
  updateOrder: (orderId: string, updates: any) => {
    const orders = get().orders;
    const updatedOrders = orders.map(order => 
      order.id === orderId ? { ...order, ...updates } : order
    );
    set({ orders: updatedOrders });
    
    // 如果当前订单被更新，也更新currentOrder
    const currentOrder = get().currentOrder;
    if (currentOrder && currentOrder.id === orderId) {
      set({ currentOrder: { ...currentOrder, ...updates } });
    }
  },
  
  removeOrder: (orderId: string) => {
    const orders = get().orders;
    const filteredOrders = orders.filter(order => order.id !== orderId);
    set({ orders: filteredOrders });
    
    // 如果删除的是当前订单，清空currentOrder
    const currentOrder = get().currentOrder;
    if (currentOrder && currentOrder.id === orderId) {
      set({ currentOrder: null });
    }
  },
}));

// 创建用户管理状态store
export const useUserManagementStore = create<UserManagementState>((set, get) => ({
  users: [],
  technicians: [],
  userStats: null,
  
  setUsers: (users: any[]) => set({ users }),
  
  setTechnicians: (technicians: any[]) => set({ technicians }),
  
  setUserStats: (stats: any) => set({ userStats: stats }),
  
  addUser: (user: any) => {
    const users = get().users;
    set({ users: [user, ...users] });
    
    // 如果是维修员，也添加到technicians列表
    if (user.role === 'repairman') {
      const technicians = get().technicians;
      set({ technicians: [user, ...technicians] });
    }
  },
  
  updateUserInList: (userId: string, updates: any) => {
    const users = get().users;
    const updatedUsers = users.map(user => 
      user.id === userId ? { ...user, ...updates } : user
    );
    set({ users: updatedUsers });
    
    // 更新technicians列表
    const technicians = get().technicians;
    const updatedTechnicians = technicians.map(tech => 
      tech.id === userId ? { ...tech, ...updates } : tech
    );
    set({ technicians: updatedTechnicians });
  },
  
  removeUser: (userId: string) => {
    const users = get().users;
    const filteredUsers = users.filter(user => user.id !== userId);
    set({ users: filteredUsers });
    
    // 从technicians列表中移除
    const technicians = get().technicians;
    const filteredTechnicians = technicians.filter(tech => tech.id !== userId);
    set({ technicians: filteredTechnicians });
  },
}));

// 导出所有store的类型
export type { User, AuthState, AppState, OrderState, UserManagementState };
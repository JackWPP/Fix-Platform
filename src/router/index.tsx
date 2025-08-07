import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store';

// 布局组件
import MainLayout from '../components/layout/MainLayout';
import AuthLayout from '../components/layout/AuthLayout';

// 页面组件
import LoginPortal from '../pages/auth/LoginPortal';
import Login from '../pages/auth/Login';
import Dashboard from '../pages/Dashboard';
import OrderList from '../pages/orders/OrderList';
import OrderDetail from '../pages/orders/OrderDetail';
import CreateOrder from '../pages/orders/CreateOrder';
import UserList from '../pages/users/UserList';
import UserDetail from '../pages/users/UserDetail';
import Profile from '../pages/Profile';
import Settings from '../pages/admin/Settings';
import NotFound from '../pages/NotFound';

// 权限保护组件
const ProtectedRoute = ({ children, requiredRoles }: { 
  children: React.ReactNode; 
  requiredRoles?: string[]; 
}) => {
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRoles && user && !requiredRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

// 公共路由保护（已登录用户不能访问登录页）
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useAuthStore();
  
  if (isAuthenticated && user) {
    // 根据用户角色跳转到相应页面
    switch (user.role) {
      case 'admin':
        return <Navigate to="/dashboard" replace />;
      case 'repairman':
        return <Navigate to="/dashboard" replace />;
      case 'customer_service':
        return <Navigate to="/dashboard" replace />;
      default:
        return <Navigate to="/dashboard" replace />;
    }
  }
  
  return <>{children}</>;
};

// 路由配置
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/portal" replace />,
  },
  {
    path: '/portal',
    element: (
      <PublicRoute>
        <LoginPortal />
      </PublicRoute>
    ),
  },
  {
    path: '/login',
    element: (
      <PublicRoute>
        <AuthLayout>
          <Login />
        </AuthLayout>
      </PublicRoute>
    ),
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'orders',
        children: [
          {
            index: true,
            element: <OrderList />,
          },
          {
            path: 'create',
            element: (
              <ProtectedRoute requiredRoles={['user', 'customer_service', 'admin']}>
                <CreateOrder />
              </ProtectedRoute>
            ),
          },
          {
            path: ':orderId',
            element: <OrderDetail />,
          },
        ],
      },
      {
        path: 'users',
        element: (
          <ProtectedRoute requiredRoles={['admin']}>
            <UserList />
          </ProtectedRoute>
        ),
      },
      {
        path: 'users/:userId',
        element: (
          <ProtectedRoute requiredRoles={['admin']}>
            <UserDetail />
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile',
        element: <Profile />,
      },
      {
        path: 'settings',
        element: (
          <ProtectedRoute requiredRoles={['admin']}>
            <Settings />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);

export default router;
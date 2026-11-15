import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import {
  Home,
  Users,
  Flame,
  HelpCircle,
  FolderGit2,
  Briefcase,
  MessageSquare,
  User
} from 'lucide-react';
import { Dock, DockItem, DockIcon, DockLabel } from './core/dock';

export const FloatingDockNav = () => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // If user is not logged in or is on landing/login/register, do not show dock
  if (!isAuthenticated) {
    return null;
  }

  // Hide on login, register, forgot-password, admin pages
  const isAuthPage = ['/login', '/register', '/forgot-password'].includes(location.pathname);
  if (isAuthPage) return null;

  const currentPath = location.pathname;

  const navItems = [
    {
      title: 'Home',
      icon: <Home />,
      path: '/dashboard',
      isActive: currentPath === '/dashboard' || currentPath === '/'
    },
    {
      title: 'Explore',
      icon: <Users />,
      path: '/explore',
      isActive: currentPath.startsWith('/explore')
    },
    {
      title: 'Community',
      icon: <Flame />,
      path: '/feed',
      isActive: currentPath.startsWith('/feed') || currentPath.startsWith('/posts')
    },
    {
      title: 'Discussions',
      icon: <HelpCircle />,
      path: '/discussions',
      isActive: currentPath.startsWith('/discussions')
    },
    {
      title: 'Projects',
      icon: <FolderGit2 />,
      path: '/projects',
      isActive: currentPath.startsWith('/projects')
    },
    {
      title: 'Opportunities',
      icon: <Briefcase />,
      path: '/opportunities',
      isActive: currentPath.startsWith('/opportunities')
    },
    {
      title: 'Messages',
      icon: <MessageSquare />,
      path: '/messages',
      isActive: currentPath.startsWith('/messages')
    },
    {
      title: 'Profile',
      icon: <User />,
      path: '/profile',
      isActive: currentPath === '/profile' || currentPath.startsWith('/profile/')
    }
  ];

  return (
    <div className="apple-dock-fixed-wrapper">
      <Dock magnification={64} distance={120} baseSize={44}>
        {navItems.map((item, idx) => (
          <DockItem
            key={idx}
            isActive={item.isActive}
            onClick={() => navigate(item.path)}
            ariaLabel={item.title}
          >
            <DockLabel>{item.title}</DockLabel>
            <DockIcon>{item.icon}</DockIcon>
          </DockItem>
        ))}
      </Dock>
    </div>
  );
};

export default FloatingDockNav;

/**
 * Resolves a notification object into a valid, safe internal route.
 * Prevents redirects to public landing page ('/') for authenticated students.
 */
export const resolveNotificationLink = (n) => {
  if (!n) return '/dashboard';

  // 1. Direct safe link check
  if (n.link && typeof n.link === 'string') {
    const trimmed = n.link.trim();
    if (trimmed && trimmed !== '/') {
      // Check if it's a known valid internal path
      if (
        trimmed.startsWith('/posts') ||
        trimmed.startsWith('/feed') ||
        trimmed.startsWith('/discussions') ||
        trimmed.startsWith('/projects') ||
        trimmed.startsWith('/messages') ||
        trimmed.startsWith('/connections') ||
        trimmed.startsWith('/profile') ||
        trimmed.startsWith('/opportunities') ||
        trimmed.startsWith('/events') ||
        trimmed.startsWith('/announcements') ||
        trimmed.startsWith('/dashboard') ||
        trimmed.startsWith('/settings')
      ) {
        return trimmed;
      }
    }
  }

  // 2. Map based on notification type
  switch (n.type) {
    case 'post_like':
    case 'post_comment':
      if (n.message && (n.message.toLowerCase().includes('discussion') || n.message.toLowerCase().includes('answered'))) {
        return '/discussions';
      }
      return '/feed';

    case 'discussion_answer':
      return '/discussions';

    case 'connection_request':
      return '/connections';

    case 'connection_accepted':
      if (n.sender) {
        const senderId = typeof n.sender === 'object' ? n.sender._id : n.sender;
        if (senderId) return `/profile/${senderId}`;
      }
      return '/connections';

    case 'project_collab_request':
    case 'project_collab_accepted':
      return '/projects';

    case 'new_message':
      if (n.sender) {
        const senderId = typeof n.sender === 'object' ? n.sender._id : n.sender;
        if (senderId) return `/messages/${senderId}`;
      }
      return '/messages';

    case 'admin_announcement':
      return '/announcements';

    case 'event_announcement':
      return '/events';

    default:
      // Heuristic fallback using message content
      if (n.message) {
        const msg = n.message.toLowerCase();
        if (msg.includes('liked your post') || msg.includes('commented on your post') || msg.includes('post')) {
          return '/feed';
        }
        if (msg.includes('discussion') || msg.includes('answered')) {
          return '/discussions';
        }
        if (msg.includes('connection')) {
          return '/connections';
        }
        if (msg.includes('message')) {
          return '/messages';
        }
        if (msg.includes('project') || msg.includes('collab')) {
          return '/projects';
        }
        if (msg.includes('event') || msg.includes('workshop')) {
          return '/events';
        }
        if (msg.includes('announcement')) {
          return '/announcements';
        }
      }
      return '/dashboard';
  }
};

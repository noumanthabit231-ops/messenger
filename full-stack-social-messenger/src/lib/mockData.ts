import { User } from '../store/authStore';

export const MOCK_USERS: User[] = [
  { id: 'mock-1', username: 'alex_dev', full_name: 'Alex Developer', avatar_url: 'https://i.pravatar.cc/150?u=alex', is_online: true },
  { id: 'mock-2', username: 'sarah_design', full_name: 'Sarah Designer', avatar_url: 'https://i.pravatar.cc/150?u=sarah', is_online: false },
  { id: 'mock-3', username: 'mike_pm', full_name: 'Mike Manager', avatar_url: 'https://i.pravatar.cc/150?u=mike', is_online: true },
  { id: 'mock-4', username: 'elena_qa', full_name: 'Elena QA', avatar_url: 'https://i.pravatar.cc/150?u=elena', is_online: false },
  { id: 'mock-5', username: 'david_ceo', full_name: 'David Boss', avatar_url: 'https://i.pravatar.cc/150?u=david', is_online: true },
];

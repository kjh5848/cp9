import { MyPageLayout } from '@/widgets/my-page/ui/MyPageLayout';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Page | Autopilot Settings',
  description: 'Manage your Autopilot settings, UI themes, and global persona.',
};

export default function MyPage() {
  return <MyPageLayout />;
}

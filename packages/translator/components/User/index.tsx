import { FC } from 'react';

import { useSession } from 'next-auth/react';

import { AuthModal } from '@/components/User/AuthModal';

import { SettingsMenu } from '@/components/User/SettingsDropdown';

interface Props {
  show?: boolean;
  onClose?: () => void;
}

export const User: FC<Props> = () => {
  const { data: session, status } = useSession();
  const user = session?.user;
  const isLoadingUser = status === 'loading';

  return isLoadingUser ? (
    <div className="h-8 w-[75px] animate-pulse rounded-md bg-gray-200" />
  ) : user ? (
    <SettingsMenu session={session} />
  ) : (
    <AuthModal />
  );
};

import Link from 'next/link';

import { Logo } from '@/components/icons';
import { User } from '@/components/User';
interface LayoutProps {
  children: React.ReactNode;
}
const Layout = ({ children }: LayoutProps): JSX.Element => {
  return (
    <div>
      <nav
        className="max-w-container mx-auto ml-3
        mt-3 flex items-center justify-between
        px-4 pb-3 text-base  font-medium leading-7 text-slate-900 sm:px-6 lg:px-8
        "
      >
        <div className="">
          <Logo width={'36px'} height={'36px'} className="inline" /> LangBridge
        </div>
        <div className="flex items-center">
          <Link href="/" className="mr-5">
            Properties
          </Link>
          <Link href="/md" className="mr-5">
            Markdown
          </Link>
          {/* <Link href="/convert" className="mr-5">
          🚢 Convert
          </Link> */}
          {/* <Link href="/csv" className="mr-5">
            🚧 CSV Loader (in progress)
          </Link> */}
          <User />
        </div>
      </nav>
      {children}
    </div>
  );
};
export default Layout;

import DropdownUser from './DropdownUser';
import DarkModeSwitcher from './DarkModeSwitcher';
import SubscriptionInfo from './SubscriptionInfo';
import { FiMenu } from 'react-icons/fi';

const Header = (props: {
  sidebarOpen: string | boolean | undefined;
  setSidebarOpen: (arg0: boolean) => void;
}) => {
  return (
    <header className="sticky top-0 z-50 flex w-full bg-white/90 backdrop-blur-sm border-b border-slate-100 dark:border-slate-700 dark:bg-boxdark/90 dark:backdrop-blur-sm">
      <div className="flex flex-grow items-center justify-between px-4 py-3 md:px-6 2xl:px-8">
        <div className="flex items-center gap-2 sm:gap-4 lg:hidden">
          {/* <!-- Hamburger Toggle BTN --> */}
          <button
            aria-controls="sidebar"
            onClick={(e) => {
              e.stopPropagation();
              props.setSidebarOpen(!props.sidebarOpen);
            }}
            className="z-50 flex items-center justify-center rounded-xl bg-slate-100 p-2 text-slate-600 transition-all duration-200 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 lg:hidden"
          >
            <FiMenu size={20} />
          </button>
          {/* <!-- Hamburger Toggle BTN --> */}
        </div>

        <div className="hidden sm:block">
          <SubscriptionInfo />
        </div>

        <div className="flex items-center gap-3 2xsm:gap-5">
          <div className="flex items-center gap-2 2xsm:gap-4">
            {/* <!-- Dark Mode Toggler --> */}
            <div className="rounded-xl overflow-hidden">
              <DarkModeSwitcher />
            </div>
            {/* <!-- Dark Mode Toggler --> */}
          </div>

          {/* <!-- User Area --> */}
          <DropdownUser />
          {/* <!-- User Area --> */}
        </div>
      </div>
    </header>
  );
};

export default Header;

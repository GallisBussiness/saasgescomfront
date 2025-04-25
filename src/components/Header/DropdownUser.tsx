import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Avatar, Badge } from 'antd';
import { FiSettings, FiLogOut, FiChevronDown, FiCreditCard } from 'react-icons/fi';
import { authclient } from '../../../lib/auth-client';
import { useNavigate } from 'react-router-dom';

const DropdownUser = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const trigger = useRef<any>(null);
  const dropdown = useRef<any>(null);
  const { data: session } = authclient.useSession() 

  const handleLogout = async () => {
    await authclient.signOut();
    navigate('/');
  };

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!dropdown.current) return;
      if (
        !dropdownOpen ||
        dropdown.current.contains(target) ||
        trigger.current.contains(target)
      )
        return;
      setDropdownOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  });

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
      if (!dropdownOpen || keyCode !== 27) return;
      setDropdownOpen(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  });

  return (
    <div className="relative">
      <Link
        ref={trigger}
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300"
        to="#"
      >
        <Badge dot color="#10B981" offset={[-4, 4]}>
          <span className="h-10 w-10 overflow-hidden rounded-full ring-2 ring-white/10 transition-all duration-300 hover:ring-[#FF5D14]/50">
            <Avatar 
              size={40} 
              className="bg-gradient-to-r from-[#FF5D14] to-[#FF7A40] shadow-md"
              style={{ fontWeight: 'bold', fontSize: '1rem' }}
            >
              {session?.user.name.slice(0, 2).toUpperCase()}
            </Avatar>
          </span>
        </Badge>
        
        <div className="hidden flex-col items-start md:flex">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            {`${session?.user.name}`}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Administrateur
          </span>
        </div>

        <FiChevronDown 
          className={`text-slate-400 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} 
          size={16} 
        />
      </Link>

      {/* <!-- Dropdown Start --> */}
      <div
        ref={dropdown}
        onFocus={() => setDropdownOpen(true)}
        onBlur={() => setDropdownOpen(false)}
        className={`absolute right-0 mt-2 flex w-64 flex-col rounded-xl border border-slate-100 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800 z-50 overflow-hidden transition-all duration-300 ${dropdownOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}
      >
        <div className="p-4 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <Avatar 
              size={40} 
              className="bg-gradient-to-r from-[#FF5D14] to-[#FF7A40] shadow-md"
              style={{ fontWeight: 'bold', fontSize: '1rem' }}
            >
              {session?.user.name.slice(0, 2).toUpperCase()}
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-700 dark:text-white">
                {session?.user.name}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {session?.user.email}
              </span>
            </div>
          </div>
        </div>
        
        <ul className="flex flex-col py-2">
          <li>
            <Link
              to="settings"
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700/50 transition-colors duration-200"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-50 text-[#FF5D14] dark:bg-slate-700">
                <FiSettings size={16} />
              </div>
              <span>Paramètres</span>
            </Link>
          </li>

          <li>
            <Link
              to="abonnements"
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700/50 transition-colors duration-200"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-50 text-[#FF5D14] dark:bg-slate-700">
                <FiCreditCard size={16} />
              </div>
              <span>Mes abonnements</span>
            </Link>
          </li>
          
          <li className="px-4 py-2">
            <div className="h-px w-full bg-slate-100 dark:bg-slate-700"></div>
          </li>
          
          <li>
            <button 
            onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700/50 transition-colors duration-200"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 text-red-500 dark:bg-slate-700">
                <FiLogOut size={16} />
              </div>
              <span>Déconnexion</span>
            </button>
          </li>
        </ul>
      </div>
      {/* <!-- Dropdown End --> */}
    </div>
  );
};

export default DropdownUser;

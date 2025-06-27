import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FaUsers, FaFileAlt, FaChevronRight, FaWarehouse, FaClipboardList } from "react-icons/fa";
import { FaBasketShopping } from 'react-icons/fa6';
import { MdDashboard, MdInventory, MdProductionQuantityLimits, MdSell } from 'react-icons/md';
import { motion } from 'framer-motion';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
}

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const location = useLocation();
  const { pathname } = location;

  const trigger = useRef<any>(null);
  const sidebar = useRef<any>(null);

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!sidebar.current || !trigger.current) return;
      if (
        !sidebarOpen ||
        sidebar.current.contains(target) ||
        trigger.current.contains(target)
      )
        return;
      setSidebarOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  });

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
      if (!sidebarOpen || keyCode !== 27) return;
      setSidebarOpen(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  });


  return (
    <aside
      ref={sidebar}
      className={`absolute left-0 top-0 z-50 flex h-screen w-72.5 flex-col overflow-y-hidden bg-gradient-to-b from-[#FF5D14] to-[#FF7A40] shadow-xl duration-300 ease-in-out lg:static lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* <!-- SIDEBAR HEADER --> */}
      <div className="flex items-center justify-between gap-2 px-6 py-5 backdrop-blur-sm bg-white/10">
        <NavLink to="/" className="p-2 rounded-xl bg-white/90 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
          <img src='/img/gallis.png' alt="Logo" className='w-16 h-16 object-contain' />
        </NavLink>

        <button
          ref={trigger}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-controls="sidebar"
          aria-expanded={sidebarOpen}
          className="block lg:hidden bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors duration-300"
        >
          <svg
            className="fill-white"
            width="20"
            height="18"
            viewBox="0 0 20 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19 8.175H2.98748L9.36248 1.6875C9.69998 1.35 9.69998 0.825 9.36248 0.4875C9.02498 0.15 8.49998 0.15 8.16248 0.4875L0.399976 8.3625C0.0624756 8.7 0.0624756 9.225 0.399976 9.5625L8.16248 17.4375C8.31248 17.5875 8.53748 17.7 8.76248 17.7C8.98748 17.7 9.17498 17.625 9.36248 17.475C9.69998 17.1375 9.69998 16.6125 9.36248 16.275L3.02498 9.8625H19C19.45 9.8625 19.825 9.4875 19.825 9.0375C19.825 8.55 19.45 8.175 19 8.175Z"
              fill=""
            />
          </svg>
        </button>
      </div>

      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
        <nav className="mt-5 py-4 px-4 lg:mt-6 lg:px-6">
          <div>
            <h3 className="mb-6 ml-2 text-sm font-bold text-white uppercase tracking-wider bg-white/10 py-2 px-4 rounded-lg backdrop-blur-sm shadow-inner">
              Gestion Commerciale GC
            </h3>

            <ul className="mb-6 flex flex-col gap-2">
              <li 
                onMouseEnter={() => setHoveredItem('dashboard')} 
                onMouseLeave={() => setHoveredItem(null)}
              >
                <NavLink
                  to="/dashboard"
                  className={`group relative flex items-center gap-3 rounded-xl py-3 px-4 font-medium text-white duration-300 ease-in-out ${pathname === '/dashboard' 
                    ? 'bg-white/20 shadow-md' 
                    : 'hover:bg-white/10'}`}
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${pathname === '/dashboard' ? 'bg-white text-[#FF5D14]' : 'bg-white/10'} transition-all duration-300`}>
                    <MdDashboard className="text-xl" />
                  </div>
                  <span>Tableau de bord</span>
                  {hoveredItem === 'dashboard' && (
                    <motion.div 
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="absolute right-2"
                    >
                      <FaChevronRight className="text-white/60 text-xs" />
                    </motion.div>
                  )}
                </NavLink>
              </li>
              <li 
                onMouseEnter={() => setHoveredItem('ventes')} 
                onMouseLeave={() => setHoveredItem(null)}
              >
                <NavLink
                  to="ventes"
                  className={`group relative flex items-center gap-3 rounded-xl py-3 px-4 font-medium text-white duration-300 ease-in-out ${pathname.includes('ventes') && !pathname.includes('inventaire-ventes') 
                    ? 'bg-white/20 shadow-md' 
                    : 'hover:bg-white/10'}`}
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${pathname.includes('ventes') && !pathname.includes('inventaire-ventes') ? 'bg-white text-[#FF5D14]' : 'bg-white/10'} transition-all duration-300`}>
                    <MdSell className="text-xl" />
                  </div>
                  <span>Ventes</span>
                  {hoveredItem === 'ventes' && (
                    <motion.div 
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="absolute right-2"
                    >
                      <FaChevronRight className="text-white/60 text-xs" />
                    </motion.div>
                  )}
                </NavLink>
              </li>
              <li 
                onMouseEnter={() => setHoveredItem('inventaire-ventes')} 
                onMouseLeave={() => setHoveredItem(null)}
              >
                <NavLink
                  to="inventaire-ventes"
                  className={`group relative flex items-center gap-3 rounded-xl py-3 px-4 font-medium text-white duration-300 ease-in-out ${pathname.includes('inventaire-ventes') 
                    ? 'bg-white/20 shadow-md' 
                    : 'hover:bg-white/10'}`}
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${pathname.includes('inventaire-ventes') ? 'bg-white text-[#FF5D14]' : 'bg-white/10'} transition-all duration-300`}>
                    <FaClipboardList className="text-xl" />
                  </div>
                  <span>Inventaire Ventes</span>
                  {hoveredItem === 'inventaire-ventes' && (
                    <motion.div 
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="absolute right-2"
                    >
                      <FaChevronRight className="text-white/60 text-xs" />
                    </motion.div>
                  )}
                </NavLink>
              </li>
              <li 
                onMouseEnter={() => setHoveredItem('approvisionnements')} 
                onMouseLeave={() => setHoveredItem(null)}
              >
                <NavLink
                  to="approvisionnements"
                  className={`group relative flex items-center gap-3 rounded-xl py-3 px-4 font-medium text-white duration-300 ease-in-out ${pathname.includes('approvisionnements') 
                    ? 'bg-white/20 shadow-md' 
                    : 'hover:bg-white/10'}`}
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${pathname.includes('approvisionnements') ? 'bg-white text-[#FF5D14]' : 'bg-white/10'} transition-all duration-300`}>
                    <MdProductionQuantityLimits className="text-xl" />
                  </div>
                  <span>Approvisionnement</span>
                  {hoveredItem === 'approvisionnements' && (
                    <motion.div 
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="absolute right-2"
                    >
                      <FaChevronRight className="text-white/60 text-xs" />
                    </motion.div>
                  )}
                </NavLink>
              </li>
              <li 
                onMouseEnter={() => setHoveredItem('articles')} 
                onMouseLeave={() => setHoveredItem(null)}
              >
                <NavLink
                  to="articles"
                  className={`group relative flex items-center gap-3 rounded-xl py-3 px-4 font-medium text-white duration-300 ease-in-out ${pathname.includes('articles') 
                    ? 'bg-white/20 shadow-md' 
                    : 'hover:bg-white/10'}`}
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${pathname.includes('articles') ? 'bg-white text-[#FF5D14]' : 'bg-white/10'} transition-all duration-300`}>
                    <FaBasketShopping className="text-xl" />
                  </div>
                  <span>Articles</span>
                  {hoveredItem === 'articles' && (
                    <motion.div 
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="absolute right-2"
                    >
                      <FaChevronRight className="text-white/60 text-xs" />
                    </motion.div>
                  )}
                </NavLink>
              </li>
              <li 
                onMouseEnter={() => setHoveredItem('stock')} 
                onMouseLeave={() => setHoveredItem(null)}
              >
                <NavLink
                  to="stock"
                  className={`group relative flex items-center gap-3 rounded-xl py-3 px-4 font-medium text-white duration-300 ease-in-out ${pathname.includes('stock') 
                    ? 'bg-white/20 shadow-md' 
                    : 'hover:bg-white/10'}`}
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${pathname.includes('stock') ? 'bg-white text-[#FF5D14]' : 'bg-white/10'} transition-all duration-300`}>
                    <MdInventory className="text-xl" />
                  </div>
                  <span>Stock</span>
                  {hoveredItem === 'stock' && (
                    <motion.div 
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="absolute right-2"
                    >
                      <FaChevronRight className="text-white/60 text-xs" />
                    </motion.div>
                  )}
                </NavLink>
              </li>
              <li 
                onMouseEnter={() => setHoveredItem('clients')} 
                onMouseLeave={() => setHoveredItem(null)}
              >
                <NavLink
                  to="clients"
                  className={`group relative flex items-center gap-3 rounded-xl py-3 px-4 font-medium text-white duration-300 ease-in-out ${pathname.includes('clients') 
                    ? 'bg-white/20 shadow-md' 
                    : 'hover:bg-white/10'}`}
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${pathname.includes('clients') ? 'bg-white text-[#FF5D14]' : 'bg-white/10'} transition-all duration-300`}>
                    <FaUsers className="text-xl" />
                  </div>
                  <span>Clients</span>
                  {hoveredItem === 'clients' && (
                    <motion.div 
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="absolute right-2"
                    >
                      <FaChevronRight className="text-white/60 text-xs" />
                    </motion.div>
                  )}
                </NavLink>
              </li>
              <li 
                onMouseEnter={() => setHoveredItem('fournisseurs')} 
                onMouseLeave={() => setHoveredItem(null)}
              >
                <NavLink
                  to="fournisseurs"
                  className={`group relative flex items-center gap-3 rounded-xl py-3 px-4 font-medium text-white duration-300 ease-in-out ${pathname.includes('fournisseurs') 
                    ? 'bg-white/20 shadow-md' 
                    : 'hover:bg-white/10'}`}
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${pathname.includes('fournisseurs') ? 'bg-white text-[#FF5D14]' : 'bg-white/10'} transition-all duration-300`}>
                    <FaUsers className="text-xl" />
                  </div>
                  <span>Fournisseurs</span>
                  {hoveredItem === 'fournisseurs' && (
                    <motion.div 
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="absolute right-2"
                    >
                      <FaChevronRight className="text-white/60 text-xs" />
                    </motion.div>
                  )}
                </NavLink>
              </li>
             
              <li 
                onMouseEnter={() => setHoveredItem('depots')} 
                onMouseLeave={() => setHoveredItem(null)}
              >
                <NavLink
                  to="/dashboard/depots"
                  className={`group relative flex items-center gap-3 rounded-xl py-3 px-4 font-medium text-white duration-300 ease-in-out ${pathname.includes('dashboard/depots') 
                    ? 'bg-white/20 shadow-md' 
                    : 'hover:bg-white/10'}`}
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${pathname.includes('dashboard/depots') ? 'bg-white text-[#FF5D14]' : 'bg-white/10'} transition-all duration-300`}>
                    <FaWarehouse className="text-xl" />
                  </div>
                  <span>Depôts</span>
                  {hoveredItem === 'depots' && (
                    <motion.div 
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="absolute right-2"
                    >
                      <FaChevronRight className="text-white/60 text-xs" />
                    </motion.div>
                  )}
                </NavLink>
              </li>
              <li 
                onMouseEnter={() => setHoveredItem('report')} 
                onMouseLeave={() => setHoveredItem(null)}
              >
                <NavLink
                  to="/dashboard/annual-report"
                  className={`group relative flex items-center gap-3 rounded-xl py-3 px-4 font-medium text-white duration-300 ease-in-out ${pathname.includes('dashboard/annual-report') 
                    ? 'bg-white/20 shadow-md' 
                    : 'hover:bg-white/10'}`}
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${pathname.includes('dashboard/annual-report') ? 'bg-white text-[#FF5D14]' : 'bg-white/10'} transition-all duration-300`}>
                    <FaFileAlt className="text-xl" />
                  </div>
                  <span>Rapport annuel</span>
                  {hoveredItem === 'report' && (
                    <motion.div 
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="absolute right-2"
                    >
                      <FaChevronRight className="text-white/60 text-xs" />
                    </motion.div>
                  )}
                </NavLink>
              </li>
            </ul>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;

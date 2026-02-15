import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { AiFillDashboard } from 'react-icons/ai';
import { FaBars, FaBoxes, FaClipboardCheck, FaClipboardList, FaExchangeAlt, FaFileAlt, FaHandshake, FaMapMarkedAlt, FaMoneyBill, FaMoneyCheckAlt, FaPlaneDeparture, FaSyncAlt, FaUsers } from 'react-icons/fa';
import { FiLogOut, FiSettings, FiUser } from 'react-icons/fi';
import '../styles/layout.css';
import '../styles/sidebar.css';
import { useAuth } from '../auth/AuthContext';

export default function Layout() {
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({
        Général: true,
    });
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

    // Détection de la largeur de l'écran pour responsive
    useEffect(() => {
        const handleResize = () => setSidebarOpen(window.innerWidth >= 820);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);


    const toggleSection = (section: string) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const { user, logout } = useAuth();

    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        {
            section: 'Général',
            items: [
                { name: 'Dashboard', path: '/', icon: <AiFillDashboard /> },
                { name: 'Opérations', path: '/operations', icon: <FaExchangeAlt /> },
                { name: 'Segments Opérations', path: '/operation_sergments', icon: <FaClipboardList /> },
                { name: 'Validation opérations', path: '/validation_operations', icon: <FaClipboardCheck /> },
            ],
        },
        {
            section: 'Finance',
            items: [
                { name: 'Cautions', path: '/cautions', icon: <FaHandshake /> },
                { name: 'Stocks', path: '/stocks', icon: <FaBoxes /> },
                { name: 'Cash flow', path: '/cash_flow', icon: <FaMoneyCheckAlt /> },
                { name: 'Opération financières', path: '/financial_operations', icon: <FaMoneyBill /> },
            ],
        },
        {
            section: 'Partenaires',
            items: [
                { name: 'Partenaires', path: '/partners', icon: <FaUsers /> },
                { name: 'Contrats', path: '/contract', icon: <FaHandshake /> },
            ],
        },
        {
            section: 'Référentiels',
            items: [
                { name: 'Systèmes', path: '/systems', icon: <FiSettings /> },
                { name: 'Airlines', path: '/airlines', icon: <FaPlaneDeparture /> },
                { name: 'Itinéraires', path: '/destinations', icon: <FaMapMarkedAlt /> },
            ],
        },
        {
            section: 'Organisation',
            items: [
                { name: 'Utilisateurs', path: '/users', icon: <FaUsers /> },
                { name: 'Services', path: '/services', icon: <FaHandshake /> },
            ],
        },
        {
            section: 'Audit',
            items: [
                { name: 'Audit', path: '/audits', icon: <FaClipboardCheck /> },
                { name: 'Change Logs', path: '/change_logs', icon: <FaFileAlt /> },
                { name: 'Synchronisations', path: '/synchronisations', icon: <FaSyncAlt /> },
            ],
        }
    ];

    return (
        <div className="layout">
            {/* Overlay mobile */}
            {sidebarOpen && window.innerWidth <= 820 && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
                <div className="sidebar-header">
                    <img src="/logo.png" alt="Logo ERP" className="sidebar-logo" />
                </div>

                <div className="sidebar-menu">
                    {menuItems.map(section => (
                        <div className="menu-section" key={section.section}>
                            <div className="menu-title" onClick={() => toggleSection(section.section)}>
                                {section.section}
                            </div>
                            {openSections[section.section] &&
                                section.items.map(item => (
                                    <NavLink
                                        to={item.path}
                                        key={item.path}
                                        className={({ isActive }) =>
                                            isActive ? 'menu-item active' : 'menu-item'
                                        }
                                        onClick={() => window.innerWidth <= 820 && setSidebarOpen(false)}
                                    /* ferme la sidebar au clic sur un item sur mobile */
                                    >
                                        <span className="menu-icon">{item.icon}</span>
                                        {item.name}
                                    </NavLink>
                                ))
                            }
                        </div>
                    ))}
                </div>
            </aside>

            {/* Main content */}
            <div className="main-content">
                <header className="header">
                    {/* Burger menu pour petits écrans */}
                    <button
                        className="burger-button"
                        onClick={() => setSidebarOpen(v => !v)}
                        aria-label="Ouvrir / Fermer menu"
                    >
                        <FaBars />
                    </button>

                    <div className="header-actions">
                        <div className="users_icon">
                            <Link to="/profile"><FiUser className="logout-icon" /></Link>
                        </div>
                        <div className="users_info">
                            <h2>{user?.username || 'Invité'}</h2>
                            <p>{user?.role || ''}</p>
                        </div>
                        <button className="logout-button" onClick={handleLogout}>
                            <FiLogOut className="logout-icon" />
                            Déconnexion
                        </button>
                    </div>
                </header>

                <section className="content">
                    <Outlet />
                </section>
            </div>
        </div>
    );
}

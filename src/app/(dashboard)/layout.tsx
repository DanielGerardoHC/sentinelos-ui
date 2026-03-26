'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next'; // <-- 1. Importamos el hook
import PillNav from '@/components/ui/PillNavbar/PillNav';
import StaggeredMenu from '@/components/ui/StaggeredMenu/StaggeredMenu';

interface MenuItem {
    key: string;
    fallback: string;
    link: string;
    subItems?: {
        key: string;
        fallback: string;
        link: string;
    }[];
}

const sidebarData: Record<string, MenuItem[]> = {
    network: [
        {
            key: 'sidebar.network.interfaces', fallback: 'Interfaces', link: '/network/interfaces',
            subItems: [{ key: 'sidebar.network.vlans_sub', fallback: 'Vlans', link: '/network/interfaces/vlans' }]
        },
        { key: 'sidebar.network.routing', fallback: 'Routing', link: '/network/routing' },
        {
            key: 'sidebar.network.vpn', fallback: 'VPN', link: '/network/vpn',
            subItems: [{ key: 'sidebar.network.ipsec_vpn', fallback: 'IPsec', link: '/network/vpn/ipsec_vpn' },
                       { key: 'sidebar.network.ssl_vpn', fallback: 'SSL VPN', link: '/network/vpn/ssl_vpn' },
                       { key: 'sidebar.network.vxlan', fallback: 'VXlan', link: '/network/vpn/vxlan' },
            ]
        },
    ],
    policies: [
        { key: 'sidebar.policies.rules', fallback: 'Security Rules', link: '/policies/rules' },
        { key: 'sidebar.policies.nat', fallback: 'NAT', link: '/policies/nat' },
        { key: 'sidebar.policies.binding', fallback: 'IP-MAC Binding', link: '/policies/binding' },
    ],
    system: [
        {
            key: 'sidebar.system.dashboard', fallback: 'Dashboard', link: '/system',
            subItems: [
                { key: 'sidebar.system.threats', fallback: 'Threats', link: '/system/threats' }
            ]
        },
        { key: 'sidebar.system.admins', fallback: 'Admins', link: '/management' },
    ],
    objects: [
        { key: 'sidebar.objects.zones', fallback: 'Zones', link: '/objects/zones' },
        { key: 'sidebar.objects.services', fallback: 'Services', link: '/objects/services' },
        { key: 'sidebar.objects.addresses', fallback: 'Addresses', link: '/objects/addresses' },
    ]
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const { t } = useTranslation();

    let activeModule = 'system';
    if (pathname.includes('/network')) activeModule = 'network';
    if (pathname.includes('/policies')) activeModule = 'policies';
    if (pathname.includes('/objects')) activeModule = 'objects';

    const rawMenu = sidebarData[activeModule as keyof typeof sidebarData];
    const translatedLeftMenu = rawMenu.map(item => ({
        label: t(item.key, item.fallback),
        ariaLabel: t(item.key, item.fallback),
        link: item.link,
        subItems: item.subItems?.map(sub => ({
            label: t(sub.key, sub.fallback),
            link: sub.link
        }))
    }));

    return (
        <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col">

            <header className="h-16 border-b border-zinc-800 bg-black/50 flex items-center justify-center relative z-50 pl-24">
                <PillNav
                    logo="/assets/shield.svg"
                    logoAlt="SentinelOS Logo"
                    items={[
                        { label: t('nav.system', 'System'), href: '/system' },
                        { label: t('nav.network', 'Network'), href: '/network/interfaces' },
                        { label: t('nav.policies', 'Policies'), href: '/policies/rules' },
                        { label: t('nav.monitor', 'Monitor'), href: '/monitor' },
                        { label: t('nav.objects', 'Objects'), href: '/objects/zones' }
                    ]}
                    activeHref={pathname.split('/').slice(0, 3).join('/')}
                    className="custom-nav"
                    ease="power2.easeOut"
                    baseColor="#000000"
                    pillColor="#10b981"
                    hoveredPillTextColor="#ffffff"
                    pillTextColor="#ffffff"
                    initialLoadAnimation={true}
                />
            </header>

            <div className="flex flex-1 relative overflow-hidden">


                <div className="absolute top-0 left-0 h-full z-40">
                    <StaggeredMenu
                        position="left"
                        isFixed={false}
                        items={translatedLeftMenu} // <--- Pasamos el menú ya traducido
                        socialItems={[]}
                        displaySocials={false}
                        displayItemNumbering={false}
                        menuButtonColor="#10b981"
                        openMenuButtonColor="#ffffff"
                        changeMenuColorOnOpen={true}
                        colors={['#064e3b', '#10b981']}
                        logoUrl="/assets/shield.svg"
                        accentColor="#10b981"
                        onMenuOpen={() => setIsMenuOpen(true)}
                        onMenuClose={() => setIsMenuOpen(false)}
                    />
                </div>

                <main
                    className={`flex-1 p-8 overflow-y-auto transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                        isMenuOpen ? 'ml-[260px]' : 'ml-24'
                    }`}
                >
                    {children}
                </main>

            </div>
        </div>
    );
}
{ /* 'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import PillNav from '@/components/ui/PillNavbar/PillNav';
import StaggeredMenu from '@/components/ui/StaggeredMenu/StaggeredMenu';
import { Shield } from 'lucide-react'; // Usaremos esto en lugar del logo temporal


// opciones dinamicas para el menu izquierdo
const sidebarData = {
    network: [
        { label: 'Interfaces',
            ariaLabel: 'Interfaces',
            link: '/network/interfaces',
            subItems: [
                { label: 'Vlans', link: '/network/interfaces/vlans', }
            ]
        },
        { label: 'Routing', ariaLabel: 'Routing', link: '/network/routing' },
        { label: 'VLANs & VXLAN', ariaLabel: 'VLANs', link: '/network/vlans' },
    ],
    policies: [
        { label: 'Security Rules', ariaLabel: 'Rules', link: '/policies/rules' },
        { label: 'NAT', ariaLabel: 'NAT', link: '/policies/nat' },
        { label: 'IP-MAC Binding', ariaLabel: 'Binding', link: '/policies/binding' },
    ],
    system: [
        {
            label: 'Dashboard',
            ariaLabel: 'Dashboard',
            link: '/system',
            subItems: [
                { label: 'System Overview', link: '/system' },
                { label: 'Users', link: '/system/users' },
                { label: 'Threats', link: '/system/threats' }
            ]
        },
        { label: 'Admins', ariaLabel: 'Admins', link: '/management' },
    ],
    objects: [
        {
            label: 'zones',
            ariaLabel: 'Zones',
            link: '/zones',
        }
    ]
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    let activeModule = 'system';
    if (pathname.includes('/network')) activeModule = 'network';
    if (pathname.includes('/policies')) activeModule = 'policies';
    if (pathname.includes('/objects')) activeModule = 'objects';

    const currentLeftMenu = sidebarData[activeModule as keyof typeof sidebarData];

    return (
        <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col">

                <header className="h-16 border-b border-zinc-800 bg-black/50 flex items-center justify-center relative z-50 pl-24">
                <PillNav
                    logo="/assets/shield.svg"
                    logoAlt="SentinelOS Logo"
                    items={[
                        { label: 'System', href: '/system' },
                        { label: 'Network', href: '/network/interfaces' },
                        { label: 'Policies', href: '/policies' },
                        { label: 'Monitor', href: '/monitor' },
                        { label: 'Objects', href: '/objects/zones' }
                    ]}
                    activeHref={pathname.split('/').slice(0, 3).join('/')}
                    className="custom-nav"
                    ease="power2.easeOut"
                    baseColor="#000000" // Fondo oscuro
                    pillColor="#10b981" // Esmeralda al seleccionar
                    hoveredPillTextColor="#ffffff"
                    pillTextColor="#ffffff" // zinc-400
                    initialLoadAnimation={true}
                />
            </header>

            <div className="flex flex-1 relative overflow-hidden">


                <div className="absolute top-0 left-0 h-full z-40">
                    <StaggeredMenu
                        position="left"
                        isFixed={false}
                        items={currentLeftMenu}
                        socialItems={[]} // vacio para el firewall
                        displaySocials={false}
                        displayItemNumbering={false}
                        menuButtonColor="#10b981" // esmeralda
                        openMenuButtonColor="#ffffff"
                        changeMenuColorOnOpen={true}
                        colors={['#064e3b', '#10b981']}
                        logoUrl="/assets/shield.svg"
                        accentColor="#10b981"
                        onMenuOpen={() => setIsMenuOpen(true)}
                        onMenuClose={() => setIsMenuOpen(false)}
                    />
                </div>


                <main
                    className={`flex-1 p-8 overflow-y-auto transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                        isMenuOpen ? 'ml-[260px]' : 'ml-24'
                    }`}
                   >
                    {children}
                </main>

            </div>
        </div>
    );
}
 */ }
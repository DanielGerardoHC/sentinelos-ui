'use client';

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

            {/* --- NAVBAR SUPERIOR --- */}
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

                {/* --- SIDEBAR IZQUIERDO --- */}
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

                {/* --- AREA DE CONTENIDO DINAMICO --- */}
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
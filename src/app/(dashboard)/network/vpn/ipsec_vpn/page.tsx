'use client';

import { ComingSoon } from '@/components/firewall/ComingSoon';
import { PageHeader } from '@/components/firewall/PageHeader';

export default function VPNPage() {
    return (
        <div className="space-y-6">
            <PageHeader
                title="IPsec VPN"
                description="Manage Site-to-Site and Remote Access VPNs."
            />
            <ComingSoon />
        </div>
    );
}
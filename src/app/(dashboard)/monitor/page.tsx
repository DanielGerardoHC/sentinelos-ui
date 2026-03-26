'use client';

import { ComingSoon } from '@/components/firewall/ComingSoon';
import { PageHeader } from '@/components/firewall/PageHeader';

export default function VPNPage() {
    return (
        <div className="space-y-6">
            <PageHeader
                title="Monitor"
                description="Traffic Monitor"
            />
            <ComingSoon />
        </div>
    );
}
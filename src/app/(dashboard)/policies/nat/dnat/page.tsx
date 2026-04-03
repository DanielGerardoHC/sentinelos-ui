"use client";

import { NatBaseView } from '@/components/firewall/NatBaseView';

export default function DnatPage() {
    return (
        <NatBaseView
            viewType="dnat"
            titleKey="dnat.title"
            descKey="dnat.desc"
            addBtnKey="dnat.add_btn"
        />
    );
}
"use client";
import { NatBaseView } from '@/components/firewall/NatBaseView';

export default function SnatPage() {
    return (
        <NatBaseView
            typeFilter="snat"
            titleKey="snat.title"
            descKey="snat.desc"
            addBtnKey="snat.add_btn"
        />
    );
}
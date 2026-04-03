import { NatBaseView } from '@/components/firewall/NatBaseView';

export default function SnatPage() {
    return (
        <NatBaseView
            actionType="snat"
            titleKey="snat.title"
            descKey="snat.desc"
            addBtnKey="snat.add_btn"
        />
    );
}
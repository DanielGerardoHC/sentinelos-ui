import { NatBaseView } from '@/components/firewall/NatBaseView';

export default function MasqueradePage() {
    return (
        <NatBaseView
            actionType="masquerade"
            titleKey="mnat.title"
            descKey="mnat.desc"
            addBtnKey="mnat.add_btn"
        />
    );
}
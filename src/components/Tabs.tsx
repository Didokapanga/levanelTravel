import { useState } from "react";
import "../styles/pages.css"
export interface TabItem {
    id: string;
    label: string;
}

interface TabsProps {
    tabs: TabItem[];
    defaultTab?: string;
    onChange?: (tabId: string) => void;
}

export default function Tabs({ tabs, defaultTab, onChange }: TabsProps) {

    const [activeTab, setActiveTab] = useState<string>(
        defaultTab || tabs[0]?.id
    );

    const handleClick = (id: string) => {
        setActiveTab(id);
        onChange?.(id);
    };

    return (
        <div className="operations-tabs">
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    className={`operations-tab ${activeTab === tab.id ? "active" : ""}`}
                    onClick={() => handleClick(tab.id)}
                    type="button"
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}

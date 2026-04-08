import React from 'react';
import PremiumCard from './PremiumCard';

const ChartContainer = ({ title, children, height = 300, glowColor = "" }) => {
    return (
        <PremiumCard glowColor={glowColor} className="flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">{title}</h2>
            </div>
            
            {/* Guarantee exact container dimensions preventing Recharts initialization width(-1) error */}
            <div style={{ width: "100%", height: height }} className="relative flex-grow flex items-center justify-center font-sans">
                {children}
            </div>
        </PremiumCard>
    );
};

export default ChartContainer;

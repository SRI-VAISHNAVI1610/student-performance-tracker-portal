import React from 'react';
import PremiumCard from './PremiumCard';

const themeMap = {
    orange: "from-orange-400 to-orange-500",
    blue: "from-blue-400 to-blue-600",
    emerald: "from-emerald-400 to-emerald-500",
    purple: "from-purple-400 to-purple-600",
    indigo: "from-indigo-400 to-indigo-600"
};

const shadowMap = {
    orange: "shadow-orange-500/30",
    blue: "shadow-blue-500/30",
    emerald: "shadow-emerald-500/30",
    purple: "shadow-purple-500/30",
    indigo: "shadow-indigo-500/30"
};

const StatCard = ({ title, value, icon: Icon, color = "blue", subtitle }) => {
    const gradient = themeMap[color] || themeMap.blue;
    const iconShadow = shadowMap[color] || shadowMap.blue;

    return (
        <PremiumCard glowColor={gradient} className="flex flex-col justify-between">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-4xl font-extrabold text-slate-900 tracking-tight">{value}</h3>
                    <p className="text-xs uppercase tracking-widest text-slate-400 font-bold mt-2">{title}</p>
                    {subtitle && <p className="text-[10px] text-slate-400 font-medium mt-1">{subtitle}</p>}
                </div>
                
                <div className={`p-4 rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg ${iconShadow} transform transition-transform duration-300 hover:scale-110 hover:-rotate-3`}>
                    {Icon && <Icon size={24} strokeWidth={2.5} />}
                </div>
            </div>
            
            <div className="w-full bg-slate-50 h-1.5 rounded-full overflow-hidden mt-auto">
                <div className={`h-full bg-gradient-to-r ${gradient} rounded-full opacity-40 w-full`} />
            </div>
        </PremiumCard>
    );
};

export default StatCard;

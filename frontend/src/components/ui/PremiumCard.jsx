import React from 'react';

const PremiumCard = ({ children, className = '', glowColor = '' }) => {
    return (
        <div className={`relative bg-white p-6 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100/50 hover:shadow-[0_15px_40px_rgba(0,0,0,0.07)] hover:-translate-y-1 transition-all duration-300 overflow-hidden ${className}`}>
            {/* Subtle top-corner radial soft glow if specified */}
            {glowColor && (
                <div className={`absolute -top-12 -right-12 w-40 h-40 bg-gradient-to-br ${glowColor} opacity-10 blur-3xl rounded-full pointer-events-none`} />
            )}
            <div className="relative z-10 w-full h-full text-slate-900">
                {children}
            </div>
        </div>
    );
};

export default PremiumCard;

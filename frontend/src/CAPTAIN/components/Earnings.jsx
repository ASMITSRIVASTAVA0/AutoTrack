import React from 'react';

const Earnings = ({ stats }) => {
    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-4">Earnings Breakdown</h3>
            <div className="space-y-4">
                <div className="bg-gradient-to-r from-emerald-900/30 to-emerald-800/20 p-4 rounded-xl">
                    <p className="text-emerald-400 text-sm">Today's Earnings</p>
                    <p className="text-2xl font-bold text-white">${stats.earnings}</p>
                </div>
                <div className="bg-gradient-to-r from-blue-900/30 to-blue-800/20 p-4 rounded-xl">
                    <p className="text-blue-400 text-sm">Total Earnings</p>
                    <p className="text-2xl font-bold text-white">$1,850</p>
                </div>
            </div>
        </div>
    );
};

export default Earnings;
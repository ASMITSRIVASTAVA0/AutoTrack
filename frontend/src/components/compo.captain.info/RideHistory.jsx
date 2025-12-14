import React from 'react';

const RideHistory = () => {
    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-4">Ride History</h3>
            {/* <div className="space-y-3">
                {[1, 2, 3].map((item) => (
                    <div key={item} className="group/history-item bg-gray-800/30 p-4 rounded-xl hover:bg-gray-800/50 transition-all duration-300">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-white font-medium">Ride #{item}01</p>
                                <p className="text-gray-400 text-sm">10:30 AM • $25.50</p>
                            </div>
                            <div className="text-emerald-400">
                                <i className="ri-checkbox-circle-line"></i>
                            </div>
                        </div>
                    </div>
                ))}
            </div> */}
        </div>
    );
};

export default RideHistory;
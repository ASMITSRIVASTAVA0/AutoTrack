import React from 'react';

const Support = () => {
    return (
        <div className="space-y-4">
           
            <h3 className="text-xl font-bold text-white mb-4">Support & Help</h3>
            <div className="space-y-3">
                <button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2">
                    <i className="ri-phone-line"></i>
                    Emergency: +1-800-RIDE-NOW
                </button>
                
                <button className="w-full bg-gradient-to-r from-purple-800 to-violet-900 hover:from-purple-700 hover:to-violet-800 text-gray-300 font-semibold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2">
                    <i className="ri-question-line"></i>
                    FAQ & Documentation
                </button>
            </div>
        </div>
    );
};

export default Support;
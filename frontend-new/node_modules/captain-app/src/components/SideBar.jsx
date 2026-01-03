import {Suspense} from "react";
import React from "react";

const SideBar=({
    mounted,
    isSidebarOpen,
    setIsSidebarOpen,
    activeSection,
    setActiveSection,
    renderActiveSection
})=>{
    return (
        <div className={`w-full lg:w-1/3 h-[70vh] sm:h-[70vh] lg:h-[calc(100vh-5rem)] bg-gradient-to-t from-gray-900/90 via-gray-900/80 to-black/90 backdrop-blur-xl border-t lg:border-l border-white/10 shadow-2xl overflow-auto transition-all duration-1000 delay-700 fixed lg:static bottom-0 left-0 z-40 lg:z-auto transform ${
                            isSidebarOpen ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'
                        } ${
                            mounted ? 'opacity-1' : 'opacity-0'
                        }`}>
                            
        
                            <div className="border-b border-white/10 ">
                            <div
                            className=''
                            >
                                <button
                                    onClick={() => setIsSidebarOpen(false)}
                                    className="lg:hidden top-4 right-4 p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors z-50"
                                    // className=""
                                >
                                    <i className="ri-close-line text-white text-xl"></i>
                                </button>
        
                            </div>
                                <div className="flex p-2">
                                    {[
                                        { id: 'profile', icon: 'ri-user-line', label: 'Profile' },
                                        { id: 'history', icon: 'ri-history-line', label: 'History' },
                                        { id: 'earnings', icon: 'ri-money-dollar-circle-line', label: 'Earnings' },
                                        { id: 'support', icon: 'ri-customer-service-line', label: 'Support' }
                                    ].map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveSection(tab.id)}
                                            className={`group/tab flex-1 flex flex-col items-center justify-center p-2 sm:p-3 rounded-lg transition-all duration-300 ${
                                                activeSection === tab.id 
                                                    ? 'bg-gradient-to-b from-blue-500/20 to-blue-600/10 text-blue-400' 
                                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                            }`}
                                        >
                                            <i className={`${tab.icon} text-base sm:text-lg mb-1 group-hover/tab:scale-110 transition-transform`}></i>
                                            <span className="text-xs font-medium">{tab.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
        
                            {/* Sidebar Content */}
                            <div className="p-3 sm:p-4 h-[calc(100%-4rem)] overflow-auto">
                                <Suspense fallback={<div className="text-white text-center">Loading...</div>}>
                                    {renderActiveSection()}
                                </Suspense>
        
                                
                            </div>
                        </div>
    )
}
export default SideBar;
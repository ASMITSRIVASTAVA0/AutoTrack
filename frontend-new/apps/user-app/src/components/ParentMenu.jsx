import React from "react";
import {Link} from "react-router-dom";


const ParentMenu=({
    parentMenuRef,
    showParentMenu,
    setShowParentMenu,
    currentParent,
    isLoadingParent,
    removeParent,
    parentRequests,
    setShowParentRequests,
    addNotification
})=>{
    return (
        <div className="absolute top-4 right-4 z-50" ref={parentMenuRef}>
                <div className="relative">
                    <button
                        onClick={() => setShowParentMenu(!showParentMenu)}
                        className={`relative flex items-center justify-center w-12 h-12 rounded-full shadow-lg transition-all duration-300 hover:scale-110 ${
                            currentParent 
                                ? 'bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700' 
                                : 'bg-gradient-to-br from-gray-700 to-gray-900 hover:from-gray-600 hover:to-gray-800'
                        }`}
                        disabled={isLoadingParent}
                        title={currentParent ? `Connected to ${currentParent.fullname?.firstname}` : 'No parent connected'}
                    >
                        {isLoadingParent ? (
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        ) : currentParent ? (
                            <>
                                <i className="ri-user-heart-line text-xl text-white"></i>
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900"></div>
                            </>
                        ) : (
                            <i className="ri-user-line text-xl text-gray-300"></i>
                        )}
                    </button>

                    {/* Parent Menu Dropdown */}
                    {showParentMenu && (
                        <div className="parent-menu-dropdown absolute top-14 right-0 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden z-50">
                            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="font-semibold text-gray-800 dark:text-white">
                                    {currentParent ? 'Parent Connected' : 'Parent Status'}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                    {currentParent 
                                        ? `Connected to ${currentParent.fullname?.firstname} ${currentParent.fullname?.lastname}`
                                        : 'No parent monitoring your rides'}
                                </p>
                            </div>
                            
                            {currentParent ? (
                                <>
                                    <div className="p-4">
                                        <div className="flex items-center space-x-3 mb-4">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                                                <span className="text-white font-semibold">
                                                    {currentParent.fullname?.firstname?.[0]}
                                                    {currentParent.fullname?.lastname?.[0]}
                                                </span>
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-gray-800 dark:text-white">
                                                    {currentParent.fullname?.firstname} {currentParent.fullname?.lastname}
                                                </h4>
                                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                                    {currentParent.email}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                                <i className="ri-shield-check-line mr-2 text-green-500"></i>
                                                <span>Can monitor your rides</span>
                                            </div>
                                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                                <i className="ri-map-pin-line mr-2 text-blue-500"></i>
                                                <span>Can see your location during rides</span>
                                            </div>
                                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                                <i className="ri-notification-line mr-2 text-yellow-500"></i>
                                                <span>Receives ride notifications</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                                        <button
                                            onClick={removeParent}
                                            className="w-full flex items-center justify-center py-2.5 px-4 rounded-lg bg-gradient-to-r from-red-500 to-pink-600 text-white font-medium hover:from-red-600 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={isLoadingParent}
                                        >
                                            {isLoadingParent ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                    Removing...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="ri-user-unfollow-line mr-2"></i>
                                                    Remove Parent
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="p-4">
                                    <div className="text-center py-4">
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center mx-auto mb-4">
                                            <i className="ri-user-line text-2xl text-gray-500 dark:text-gray-400"></i>
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                                            No parent is currently monitoring your rides.
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                                            Parents can send you connection requests to monitor your rides.
                                        </p>
                                        
                                        <div className="space-y-3">
                                            <button
                                                onClick={() => {
                                                    setShowParentRequests(true);
                                                    setShowParentMenu(false);
                                                }}
                                                className="w-full flex items-center justify-center py-2.5 px-4 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-medium hover:from-blue-600 hover:to-cyan-700 transition-all duration-300"
                                            >
                                                <i className="ri-user-add-line mr-2"></i>
                                                View Pending Requests ({parentRequests.length})
                                            </button>
                                            
                                            <button
                                                onClick={() => {
                                                    setShowParentMenu(false);
                                                    addNotification('You can ask parents to send you connection requests', 'info');
                                                }}
                                                className="w-full text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                                            >
                                                How to connect with a parent?
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
    )
}
export default ParentMenu;
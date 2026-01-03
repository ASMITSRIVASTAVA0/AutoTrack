import React from 'react';
import { Link } from 'react-router-dom';

const Header = ({ parent, manualRefresh, isRefreshing }) => {
  return (
    <div className='flex justify-between items-center mb-8 animate-slideInUp'
      style={{ animationDelay: '100ms' }}
    >
      <div className='group relative'>
        <div className='absolute -inset-4 bg-gradient-to-r from-pink-600/20 to-purple-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>
        <div className='relative flex items-center gap-4'>
          <div>
            <h1 className='text-4xl font-bold text-white'>
              Parent Dashboard
            </h1>
            <p className='text-white/60 mt-2 flex items-center gap-2 group-hover:text-white/80 transition-colors'>
              <i className="ri-user-heart-line text-pink-400 animate-pulse"></i>
              Welcome back, <span className='text-pink-300 font-semibold'>{parent?.fullname?.firstname}</span>
            </p>
          </div>

          {/* refresh button */}
          <div className="flex items-center gap-2">
            <button
              onClick={manualRefresh}
              disabled={isRefreshing}
              className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm hover:bg-blue-500/30 transition-colors hover:scale-105 flex items-center gap-1"
              title="Refresh data"
            >
              {isRefreshing ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-400"></div>
                  Refreshing...
                </>
              ) : (
                <>
                  <i className="ri-refresh-line"></i>
                  Refresh
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* logout button */}
      <div className='flex gap-3'>
        <Link 
          to='/parents/logout' 
          className='relative h-12 w-12 bg-gradient-to-br from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 flex items-center justify-center rounded-xl transition-all duration-300 shadow-2xl hover:shadow-rose-500/50 text-white hover:scale-110 active:scale-95 group'
        >
          <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000'></div>
          <i className="text-lg ri-logout-box-r-line group-hover:rotate-180 transition-transform duration-500"></i>
        </Link>
      </div>
    </div>
  );
};

export default Header;
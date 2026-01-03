import React from 'react';

const SendChildRequestForm = ({ 
  userEmail, 
  setUserEmail, 
  sendChildRequest, 
  isSendingRequest 
}) => {
  return (
    <div className='relative group animate-slideInUp' style={{ animationDelay: '300ms' }}>
      <div className='absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500'></div>
      <div className='relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10'>
        <h2 className='text-xl font-semibold mb-4 text-white flex items-center gap-2'>
          <div className='relative w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-500 rounded-lg flex items-center justify-center shadow-lg animate-wave'>
            <i className="ri-user-add-line text-white"></i>
          </div>
          Send Child Request
        </h2>
        <form 
          onSubmit={sendChildRequest} 
          className="flex gap-4"
        >
          <div className='relative flex-1 group/input'>
            <div className='absolute inset-0 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-xl blur opacity-0 group-hover/input:opacity-100 transition-opacity duration-500'></div>
            <input
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="Enter user's email address"
              className="relative w-full bg-gray-900/50 backdrop-blur-sm border-2 border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-pink-500/50 focus:bg-gray-900/70 transition-all duration-300"
              required
              disabled={isSendingRequest}
            />
            <i className="ri-mail-line absolute right-4 top-1/2 -translate-y-1/2 text-white/40"></i>
          </div>
          <button
            type="submit"
            disabled={isSendingRequest}
            className="relative px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl hover:from-pink-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-2xl hover:shadow-pink-500/25 flex items-center gap-2 group/btn hover:scale-105 active:scale-95"
          >
            <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000'></div>
            {isSendingRequest ? (
              <>
                <div className='relative w-5 h-5'>
                  <div className='absolute inset-0 border-2 border-white/20 rounded-full'></div>
                  <div className='absolute inset-0 border-2 border-t-white rounded-full animate-spin'></div>
                </div>
                Sending...
              </>
            ) : (
              <>
                <i className="ri-send-plane-fill group-hover/btn:translate-x-1 transition-transform"></i>
                Send Request
                <i className="ri-arrow-right-line ml-1 group-hover/btn:translate-x-1 transition-transform"></i>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SendChildRequestForm;
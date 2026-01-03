
const LoadingFallback = () => (
  <div className='absolute inset-0 z-0'>
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className='absolute w-1 h-1 bg-pink-500/20 rounded-full'
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`
            }}
          ></div>
        ))}
        
        <div className='absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-pink-600/10 to-purple-600/10 rounded-full blur-3xl animate-pulse'></div>
        <div className='absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-purple-600/10 to-pink-600/10 rounded-full blur-3xl animate-pulse' style={{animationDelay: '1s'}}></div>
        
        <div className='absolute inset-0 opacity-5'
          style={{
            backgroundImage: `linear-gradient(to right, #ec4899 1px, transparent 1px),
                             linear-gradient(to bottom, #ec4899 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        >Please Wait for a while</div>
      </div>
);

export default LoadingFallback;
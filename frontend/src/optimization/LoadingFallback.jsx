// import React from 'react'

// const LoadingFallback = () => {
//   return (
//     <div style={{
//         display: 'flex',
//         justifyContent: 'center',
//         alignItems: 'center',
//         height: '100vh',
//         background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
//     }}>
//         <div style={{
//         textAlign: 'center',
//         color: 'white',
//         padding: '2rem',
//         borderRadius: '1rem',
//         background: 'rgba(255, 255, 255, 0.1)',
//         backdropFilter: 'blur(10px)'
//         }}>
//         <div style={{
//             width: '50px',
//             height: '50px',
//             margin: '0 auto 1rem',
//             border: '3px solid white',
//             borderTop: '3px solid transparent',
//             borderRadius: '50%',
//             animation: 'spin 1s linear infinite'
//         }}></div>
//         <style>{`
//             @keyframes spin {
//             0% { transform: rotate(0deg); }
//             100% { transform: rotate(360deg); }
//             }
//         `}</style>
//         <p>Loading your experience...</p>
//         </div>
//     </div>
//   )
// }

// export default LoadingFallback;


const LoadingFallback = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  }}>
    <div style={{
      textAlign: 'center',
      color: 'white',
      padding: '2rem',
      borderRadius: '1rem',
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{
        width: '50px',
        height: '50px',
        margin: '0 auto 1rem',
        border: '3px solid white',
        borderTop: '3px solid transparent',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}></div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <p>Loading your experience...</p>
    </div>
  </div>
);

export default LoadingFallback;
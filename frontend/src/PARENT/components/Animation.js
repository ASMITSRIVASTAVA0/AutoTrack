export const Animation=()=>{
    const styles=`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0) rotate(0deg); }
          33% { transform: translateY(-20px) translateX(10px) rotate(120deg); }
          66% { transform: translateY(10px) translateX(-10px) rotate(240deg); }
        }
        
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideInUp {
          from { transform: translateY(50px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(236, 72, 153, 0.3); }
          50% { box-shadow: 0 0 40px rgba(236, 72, 153, 0.6); }
        }
        
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        
        @keyframes wave {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-10px) scale(1.05); }
        }
        
        .animate-slideInRight {
          animation: slideInRight 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        
        .animate-slideInUp {
          animation: slideInUp 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        
        .animate-glow {
          animation: glow 2s infinite;
        }
        
        .animate-shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          background-size: 200% 100%;
          animation: shimmer 3s infinite;
        }
        
        .animate-wave {
          animation: wave 3s ease-in-out infinite;
        }
        
        .floating-element {
          animation: float 20s ease-in-out infinite;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        
        @keyframes slideInLeft {
          from { transform: translateX(-50px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes bounceIn {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); opacity: 1; }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        
        .animate-slideInLeft {
          animation: slideInLeft 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        
        .animate-bounceIn {
          animation: bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        
        .dark-popup .leaflet-popup-content-wrapper {
          background: #1a1a2e;
          color: white;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .dark-popup .leaflet-popup-tip {
          background: #1a1a2e;
        }
        
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(236, 72, 153, 0.3);
          border-radius: 3px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(236, 72, 153, 0.5);
        }
      `;

    return {styles};
}
export const Animation=()=>{
    const styles = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideInUp {
            from { transform: translateY(50px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes shimmer {
            0% { background-position: -200% center; }
            100% { background-position: 200% center; }
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        .animate-slideInRight {
            animation: slideInRight 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        
        .animate-slideInUp {
            animation: slideInUp 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        
        .animate-shimmer {
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
            background-size: 200% 100%;
            animation: shimmer 3s infinite;
        }
        
        .animate-fadeIn {
            animation: fadeIn 0.3s ease-in-out;
        }
    `

    return {styles};
}
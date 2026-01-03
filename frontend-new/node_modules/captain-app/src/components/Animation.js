// src/hooks/useLandingAnimations.js
export const Animation = () => {
    const styles = `
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
            0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
            50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.6); }
        }
        
        @keyframes shimmer {
            0% { background-position: -200% center; }
            100% { background-position: 200% center; }
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
        
        .floating-element {
            animation: float 20s ease-in-out infinite;
        }
    `;
    
    return { styles };
};
import React from 'react';
import CaptainDetails from '../CaptainDetails';

const CaptainProfile = ({ stats }) => {
    return (
        <div className="space-y-6">
            <div className='animate-slideInUp' style={{ animationDelay: '1200ms' }}>
                <CaptainDetails />
            </div>
        </div>
    );
};

export default CaptainProfile;
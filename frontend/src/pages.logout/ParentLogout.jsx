import React, { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ParentDataContext } from '../context/ParentContext';

const ParentLogout = () => {
  const navigate = useNavigate();
  const { setParent } = useContext(ParentDataContext);

  useEffect(() => {
    const logout = async () => {
      try {
        // const token = localStorage.getItem('token');
        const token = localStorage.getItem('tokenParent');
        await axios.get(`${import.meta.env.VITE_BASE_URL}/parents/logout`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        localStorage.removeItem('tokenParent');
        localStorage.removeItem('parent');
        setParent(null);
        navigate('/parent-login');
      }
    };

    logout();
  }, [navigate, setParent]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Logging out...</p>
      </div>
    </div>
  );
};

export default ParentLogout;
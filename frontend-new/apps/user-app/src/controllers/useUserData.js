import { useEffect } from 'react';

const useUserData = ({ user, setUser, setCurrentParent }) => {
  useEffect(() => {
    console.log('User context updated - checking parent:', {
      id: user?._id,
      parentId: user?.parentId,
      hasParent: !!user?.parentId
    });
    
    if (user?.parentId) {
      console.log('ParentId found, fetching parent details...');
      // fetchCurrentParent will be called from parent management hook
    } else if (user && !user.parentId) {
      console.log('User has no parentId');
      setCurrentParent(null);
    }
  }, [user?._id, user?.parentId, setCurrentParent]);

  return {};
};

export default useUserData;
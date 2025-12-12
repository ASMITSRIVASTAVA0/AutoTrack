import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import UserContext from './context/UserContext'
import CaptainContext from './context/CaptainContext';
import ParentContext from './context/ParentContext';

const NewTabLink = ({ 
  to, 
  children, 
  className, 
  style, 
  onClick, 
  preserveContext = true,
  ...props 
}) => {
  const userContext = useContext(UserContext);
  const captainContext = useContext(CaptainContext);
  const parentContext = useContext(ParentContext);

  const handleClick = (e) => {
    if (onClick) onClick(e);
    
    // If Ctrl or Cmd key is pressed, let the default behavior handle it
    if (e.ctrlKey || e.metaKey) return;
    
    // Prevent default link behavior
    e.preventDefault();
    
    // Prepare data to pass to new tab
    let contextData = {};
    if (preserveContext) {
      if (userContext && userContext.user) {
        contextData.user = userContext.user;
      }
      if (captainContext && captainContext.captain) {
        contextData.captain = captainContext.captain;
      }
      if (parentContext && parentContext.parent) {
        contextData.parent = parentContext.parent;
      }
    }
    
    // Store context data in sessionStorage for the new tab
    if (Object.keys(contextData).length > 0) {
      sessionStorage.setItem('tabTransferData', JSON.stringify({
        context: contextData,
        timestamp: Date.now(),
        sourceTab: window.location.pathname
      }));
    }
    
    // Open in new tab
    const newTab = window.open(to, '_blank', 'noopener,noreferrer');
    
    // Focus the new tab
    if (newTab) {
      newTab.focus();
    }
  };

  return (
    <a
      href={to}
      onClick={handleClick}
      className={className}
      style={{ cursor: 'pointer', ...style }}
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    >
      {children}
    </a>
  );
};

NewTabLink.propTypes = {
  to: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  style: PropTypes.object,
  onClick: PropTypes.func,
  preserveContext: PropTypes.bool,
};

export default NewTabLink;
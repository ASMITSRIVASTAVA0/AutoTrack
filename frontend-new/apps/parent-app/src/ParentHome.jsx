import React, { useContext } from 'react';
import { SocketContext } from '../../context/SocketContext.jsx';
import { ParentDataContext } from './ParentContext.jsx';
import { useParentHomeController } from './controller.parent/index.js';
import ChildrenList from './component.parent/ChildrenList.jsx';
import Header from "./component.parent/Header.jsx";
import NotificationsPanel from './component.parent/NotificationPanel.jsx';
import PendingRequestsList from './component.parent/PendingRequestList.jsx';
import RideHistoryModal from './component.parent/RideHistoryModel.jsx';
import SendChildRequestForm from './component.parent/SendChildRequestForm.jsx';
import TrackingSection from './component.parent/TrackingSection.jsx';
import LoadingFallback from '../../optimization/LoadingFallback.jsx';
import { Animation } from './component.parent/Animation.js';
import Background from './component.parent/Background.jsx';
import NotificationToast from './component.parent/NotificationToast.jsx';

const ParentHome = () => {
  const { socket } = useContext(SocketContext);
  const { parent } = useContext(ParentDataContext);

  const controller = useParentHomeController(socket, parent);

  if (controller.isLoading && controller.children.length === 0 && controller.pendingRequests.length === 0) {
    return <LoadingFallback />;
  }

  const { styles } = Animation();

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900 relative overflow-hidden'>
      <Background />
      <style>{styles}</style>

      <NotificationToast
        notifications={controller.notifications}
        markNotificationAsRead={controller.markNotificationAsRead}
        removeNotification={controller.removeNotification}
        mousePosition={controller.mousePosition}
      />

      <div className='relative z-10 max-w-7xl mx-auto p-6'>
        <Header
          parent={parent}
          manualRefresh={controller.manualRefresh}
          isRefreshing={controller.isRefreshing}
        />

        <NotificationsPanel
          notifications={controller.notifications}
          clearNotifications={controller.clearNotifications}
          markNotificationAsRead={controller.markNotificationAsRead}
          removeNotification={controller.removeNotification}
        />

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          <div className='lg:col-span-2 space-y-6'>
            <SendChildRequestForm
              userEmail={controller.userEmail}
              setUserEmail={controller.setUserEmail}
              sendChildRequest={controller.sendChildRequest}
              isSendingRequest={controller.isSendingRequest}
            />

            <PendingRequestsList
              pendingRequests={controller.pendingRequests}
              cancelRequest={controller.cancelRequest}
              loadParentData={controller.loadParentData}
            />

            <ChildrenList
              children={controller.children}
              selectedChild={controller.selectedChild}
              currentRide={controller.currentRide}
              captainLocation={controller.captainLocation}
              trackChildCaptainLocation={controller.trackChildCaptainLocation}
              loadRideHistory={controller.loadRideHistory}
              setShowRideHistory={controller.setShowRideHistory}
              removeChild={controller.removeChild}
            />
          </div>

          <TrackingSection
            selectedChild={controller.selectedChild}
            currentRide={controller.currentRide}
            captainLocation={controller.captainLocation}
            mapCenter={controller.mapCenter}
            getRoutePolyline={controller.getRoutePolyline}
            pulseAnimation={controller.pulseAnimation}
            sendMessageToChild={controller.sendMessageToChild}
          />
        </div>
      </div>

      <RideHistoryModal
        showRideHistory={controller.showRideHistory}
        setShowRideHistory={controller.setShowRideHistory}
        selectedChild={controller.selectedChild}
        rideHistory={controller.rideHistory}
      />
    </div>
  );
};

export default ParentHome;
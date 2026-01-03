
// useGSAP is similar to useEffect but automatic cleanup and optimized for GSAP animations



import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';



// props me compo passed, 
// then created useRef for those components, 
// and used in useGSAP to animate those components


const useGSAPs = ({
  ridePopupPanel,
  confirmRidePopupPanel
}) => {
  const ridePopupPanelRef = useRef(null);
  const confirmRidePopupPanelRef = useRef(null);


  // Ride popup animation
  // useGSAP similar to useEffect
  useGSAP(() => {
    if (ridePopupPanel) {
      gsap.fromTo(ridePopupPanelRef.current, 
        { y: "100%", opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: "back.out(1.7)" }
      );
    } else {
      gsap.to(ridePopupPanelRef.current, {
        y: "100%",
        opacity: 0,
        duration: 0.3,
        ease: "power2.in"
      });
    }
  }, [ridePopupPanel]);


  

  // Confirm ride popup animation
  useGSAP(() => {
    if (confirmRidePopupPanel) {
      gsap.fromTo(confirmRidePopupPanelRef.current, 
        { y: "100%", opacity: 0 },//from=intital state
        { y: 0, opacity: 1, duration: 0.5, ease: "back.out(1.7)" }//to-final state
      );
    } else {
      gsap.to(confirmRidePopupPanelRef.current, 
      {
        y: "100%",
        opacity: 0,
        duration: 0.3,
        ease: "power2.in"
      }//to-final state
    );
    }
  }, [confirmRidePopupPanel]);



  return {
    ridePopupPanelRef,
    confirmRidePopupPanelRef
  };
};

export default useGSAPs;
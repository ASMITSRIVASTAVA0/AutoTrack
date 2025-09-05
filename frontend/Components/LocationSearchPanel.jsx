import React from 'react'


const LocationSearchPanel = (props) => {
    console.log(props);

    const locations=[
        "Akbarpur, Kanpur Dehat, 209101, Akbarpur, Kanpur Dehat, 209101",
        "Akbarpur, Kanpur Dehat, 209101, Akbarpur, Kanpur Dehat, 209101",
        "Akbarpur, Kanpur Dehat, 209101, Akbarpur, Kanpur Dehat, 209101",
        "Akbarpur, Kanpur Dehat, 209101, Akbarpur, Kanpur Dehat, 209101",
        "Akbarpur, Kanpur Dehat, 209101, Akbarpur, Kanpur Dehat, 209101",
        "Akbarpur, Kanpur Dehat, 209101, Akbarpur, Kanpur Dehat, 209101",
        "Akbarpur, Kanpur Dehat, 209101, Akbarpur, Kanpur Dehat, 209101",
        "Akbarpur, Kanpur Dehat, 209101, Akbarpur, Kanpur Dehat, 209101",
        "Akbarpur, Kanpur Dehat, 209101, Akbarpur, Kanpur Dehat, 209101"
        
        
    ]

  return (
    <div className="">

        {
            locations.map(function(elem,idx){
                return <div 
                        key={idx}
                        className=" flex m-2 gap-4 items-center justify-start" 
                        onClick={()=>{
                            props.setVehiclePanel(true);
                            props.set
                        }}
                        >
                            <h2 className="bg-[#eee]  h-10 flex items-center w-10 rounded-full  " >
                                <i className="ri-map-pin-fill text-xl"></i>
                            </h2>
                            <h4 className="font-medium">
                                {elem}
                            </h4>
                        </div>
            })
        }

        
    </div>
  )
}

export default LocationSearchPanel;
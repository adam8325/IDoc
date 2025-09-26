import React from "react";
import {X} from "lucide-react";
import HelpButton from "./helpButton"
import Image from "next/image";

export default function HelpModal() {

    const [openModal, setOpenModal] = React.useState(false);


    function handleOpen() {
        setOpenModal(true);
    }

    function handleClose() {
        setOpenModal(false);
    }
  
    return(
        <div>
            <HelpButton onClick={handleOpen}/>
            {openModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/80">
                    <div className="flex flex-col items-center gap-2 sm:gap-8 bg-white rounded-lg py-2 px-2 sm:py-6 sm:px-6 w-3/5 sm:w-2/5 h-4/5 mx-4 border">
                        <div className="grid grid-cols-[1fr_4fr_1fr] items-start w-full">
                            <div></div> 
                            <h2 className="text-md sm:text-3xl font-bold text-center">Sådan virker IDoc</h2>
                            <button 
                                onClick={handleClose} 
                                className="justify-self-end font-bold text-gray-500 rounded cursor-pointer"
                            >
                                <X className="h-3 w-3 sm:h-5 sm:w-5"/>
                            </button>
                        </div>

                        <div className="flex flex-col items-center justify-center gap-4 sm:gap-12 text-center h-full w-full sm:mt-4">
                            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-center gap-2">
                                <div className="flex flex-col gap-1 sm:gap-3 w-3/4 sm:w-1/2 order-1 sm:order-2">
                                    <h3 className="text-sm sm:text-xl font-bold">Indsæt din kode</h3>
                                    <p className="text-[9px] sm:text-sm"> Indsæt din kode direkte i tekstfeltet eller upload en fil med din kode.</p>
                                </div>
                                <div className="w-3/4 sm:w-1/2 order-2 sm:order-1 flex justify-center">
                                    <Image  src="/images/upload.png" alt="Upload Image" width={250} height={200} className="drop-shadow-[0_0_4px_rgba(0,0,0,0.3)]"/>
                                </div>                                
                            </div>
                            
                            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-center gap-2">
                                <div className="flex flex-col gap-1 sm:gap-3 w-3/4 sm:w-1/2">
                                    <h3 className="text-sm sm:text-xl font-bold">Vælg typen</h3>
                                    <p className="text-[9px] sm:text-sm">Vælg mellem en teknisk dokumentation til udviklere eller brugervenlige output til alle.</p>
                                </div>
                                <div className="w-3/4 sm:w-1/2 order-1 flex justify-center">
                                    <Image src="/images/type.png" alt="Type Image" width={250} height={160} className="drop-shadow-[0_0_4px_rgba(0,0,0,0.3)]"/>
                                </div>
                                
                            </div>                            
                            
                            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-center gap-2">
                                <div className="flex flex-col gap-1 sm:gap-3 w-3/4 sm:w-1/2 order-1 sm:order-2">
                                    <h3 className="text-sm sm:text-xl font-bold">Upload Kb-fil</h3>
                                    <p className="text-[9px] sm:text-sm">
                                        Vælger du at uploade en fil med jeres specifikke kodestandarder, så
                                        vil programmet tilrette din kode ud fra jeres retningslinjer.
                                    </p>
                                </div>
                                <div className="w-3/4 sm:w-1/2 order-2 sm:order-1 flex justify-center">
                                    <Image src="/images/context.png" alt="Context Image" width={250} height={160} className="drop-shadow-[0_0_4px_rgba(0,0,0,0.3)]"/>
                                </div>                                
                            </div>                           
                            
                        </div>                       
                    </div>
                </div>
            )}
        </div>
    )

}
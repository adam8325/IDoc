import React from "react";
import {Info} from "lucide-react";


export default function HelpButton({ onClick }) {
  
    return(
        <div>
            <button onClick={onClick} className="flex items-center justify-center gap-2 cursor-pointer py-2 px-3 sm:py-2 sm:px-3 text-xs sm:text-sm rounded-sm sm:rounded-md bg-white hover:bg-[linear-gradient(90deg,#06b6d4,#6366f1)] hover:text-white font-semibold">
                <Info className="h-5 w-5 bg-[linear-gradient(90deg,#06b6d4,#6366f1)] rounded-xl text-white" />
                <span>Sådan virker det</span>
            </button>            
        </div>
    )

}
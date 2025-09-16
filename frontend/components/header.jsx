import React from "react";
import { FileCode } from "lucide-react";


export default function Header() {
    return (
        <header className="border-b w-full h-full border border-stone-200 bg-white rounded-t p-4">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div>
              <FileCode className="rounded-xl h-9 w-9 p-1.5 text-white bg-gradient-to-r from-indigo-400 to-purple-600" />
            </div>
            <div>
                <h1
                  className="text-xl sm:text-2xl font-bold bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-600 bg-clip-text text-transparent"
                >
                  IDoc
                </h1>
                <p className="text-sm text-muted-foreground">
                  AI-drevet generator til kodedokumentation
                </p>
            </div>
          </div>
        </div>
      </header>
    )
}
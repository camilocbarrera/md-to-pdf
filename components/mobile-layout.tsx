"use client";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit3, Eye } from "lucide-react";
import { useState } from "react";

interface MobileLayoutProps {
  editor: React.ReactNode;
  preview: React.ReactNode;
}

export function MobileLayout({ editor, preview }: MobileLayoutProps) {
  const [activeTab, setActiveTab] = useState("editor");

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col overflow-hidden">
        <TabsList className="grid w-full grid-cols-2 mb-1 h-8 p-0.5 shrink-0">
          <TabsTrigger value="editor" className="flex items-center gap-1 h-6 px-2 text-xs transition-ultra">
            <Edit3 className="h-3 w-3" />
            <span>Editor</span>
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-1 h-6 px-2 text-xs transition-ultra">
            <Eye className="h-3 w-3" />
            <span>Preview</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="editor" className="flex-1 m-0 overflow-hidden">
          <div className="h-full overflow-hidden">
            {editor}
          </div>
        </TabsContent>
        
        <TabsContent value="preview" className="flex-1 m-0 overflow-hidden">
          <div className="h-full overflow-hidden">
            {preview}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 
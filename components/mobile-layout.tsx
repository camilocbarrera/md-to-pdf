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
    <div className="h-full flex flex-col">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-2 mb-2">
          <TabsTrigger value="editor" className="flex items-center gap-2">
            <Edit3 className="h-4 w-4" />
            <span className="hidden sm:inline">Editor</span>
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">Preview</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="editor" className="flex-1 m-0">
          {editor}
        </TabsContent>
        
        <TabsContent value="preview" className="flex-1 m-0">
          {preview}
        </TabsContent>
      </Tabs>
    </div>
  );
} 
"use client";

import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { toast } from "sonner";

interface PdfExportButtonProps {
  documentTitle: string;
}

export function PdfExportButton({ documentTitle }: PdfExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { theme } = useTheme();

  const handleExportToPdf = async () => {
    if (isExporting) return;

    setIsExporting(true);
    try {
      // Dynamically import the PDF export function
      const { exportToPdf } = await import("@/lib/pdf-export");

      await exportToPdf(documentTitle, theme);
      toast.success("PDF Exported", {
        description: `${documentTitle}.pdf has been downloaded.`,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Export Failed", {
        description: "There was an error exporting the PDF. Please try again.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button 
      variant="default" 
      size="sm" 
      className="h-6 px-2 text-xs transition-ultra" 
      onClick={handleExportToPdf} 
      disabled={isExporting}
    >
      <FileDown className="h-3 w-3 mr-1" />
      {isExporting ? "Exporting..." : "Export PDF"}
    </Button>
  );
}

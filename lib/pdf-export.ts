import { generatePdf } from "./html2pdf-wrapper";

export const exportToPdf = async (title: string, theme: string | undefined): Promise<void> => {
  // Wait for any pending renders to complete, including Mermaid diagrams
  await new Promise((resolve) => setTimeout(resolve, 500));

  const previewContainer = document.getElementById("preview-container");

  if (!previewContainer) {
    throw new Error("Preview container not found");
  }

  // Clone the preview container to avoid modifying the original
  const clonedContainer = previewContainer.cloneNode(true) as HTMLElement;

  // Apply PDF-specific styling
  clonedContainer.style.padding = "20px";
  clonedContainer.style.backgroundColor = theme === "dark" ? "#1a1a1a" : "#ffffff";
  clonedContainer.style.color = theme === "dark" ? "#ffffff" : "#000000";

  // Wait for all images and SVGs (including Mermaid diagrams) to be ready
  const images = clonedContainer.querySelectorAll("img");
  const svgs = clonedContainer.querySelectorAll("svg");

  const loadPromises = [
    ...Array.from(images).map((img) => {
      return new Promise((resolve) => {
        if (img.complete) {
          resolve(null);
        } else {
          img.onload = () => resolve(null);
          img.onerror = () => resolve(null); // Don't fail on image errors
          // Timeout after 5 seconds
          setTimeout(() => resolve(null), 5000);
        }
      });
    }),
    // Ensure SVGs are rendered
    ...Array.from(svgs).map(() => Promise.resolve()),
  ];

  await Promise.all(loadPromises);

  // Additional wait to ensure all content is rendered
  await new Promise((resolve) => setTimeout(resolve, 200));

  try {
    // Configure html2pdf options
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `${title || "document"}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
        allowTaint: true,
        backgroundColor: theme === "dark" ? "#1a1a1a" : "#ffffff",
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      },
    };

    // Use our wrapper to generate the PDF
    await generatePdf(clonedContainer, opt);
  } catch (error) {
    console.error("PDF generation error:", error);
    throw new Error(
      `Failed to generate PDF: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

// This is a wrapper around html2pdf.js to ensure it's properly loaded
// and to provide a more reliable interface

let html2pdfInstance: any = null;

export async function getHtml2Pdf() {
  if (html2pdfInstance) {
    return html2pdfInstance;
  }

  try {
    // Dynamic import of html2pdf.js
    const module = await import("html2pdf.js");

    // Check if the default export is a function
    if (typeof module.default === "function") {
      html2pdfInstance = module.default;
      return html2pdfInstance;
    }

    // If not a function, try to find the html2pdf function
    if (module.html2pdf && typeof module.html2pdf === "function") {
      html2pdfInstance = module.html2pdf;
      return html2pdfInstance;
    }

    throw new Error("html2pdf.js did not export a valid function");
  } catch (error) {
    console.error("Failed to load html2pdf:", error);
    throw error;
  }
}

export async function generatePdf(element: HTMLElement, options: any) {
  const html2pdf = await getHtml2Pdf();
  return html2pdf().from(element).set(options).save();
}

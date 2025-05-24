export function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Markdown to PDF Converter",
    "description": "Free online tool to convert Markdown to PDF with live preview, syntax highlighting, and Mermaid diagram support. Client-side processing ensures privacy.",
    "url": "https://mdtopdf.xyz",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "creator": {
      "@type": "Person",
      "name": "Cristian Camilo Correa",
      "url": "https://www.linkedin.com/in/cristiancamilocorrea/"
    },
    "features": [
      "Live Preview",
      "Syntax Highlighting", 
      "Mermaid Diagrams",
      "Client-side Processing",
      "Document Storage",
      "PDF Export",
      "Dark/Light Theme"
    ],
    "browserRequirements": "Requires JavaScript enabled",
    "permissions": "No special permissions required",
    "screenshot": "https://mdtopdf.xyz/og-image.png"
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
} 
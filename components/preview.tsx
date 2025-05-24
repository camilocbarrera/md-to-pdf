"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState, memo } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight, tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

interface OptimizedPreviewProps {
  markdown: string;
}

interface MermaidDiagramProps {
  code: string;
  theme: string;
}

// Memoized Mermaid component that only re-renders when code or theme changes
const MermaidDiagram = memo(({ code, theme }: MermaidDiagramProps) => {
  const [svg, setSvg] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError("");

    const renderDiagram = async () => {
      try {
        // Validate code first
        if (!code || !code.trim()) {
          if (isMounted) {
            setError("Empty diagram code");
            setLoading(false);
          }
          return;
        }

        const mermaidModule = await import("mermaid");
        const mermaid = mermaidModule.default;

        // Initialize Mermaid with safe settings
        mermaid.initialize({
          startOnLoad: false,
          theme: theme === "dark" ? "dark" : "default",
          securityLevel: "loose",
          fontFamily: "inherit",
          suppressErrorRendering: false,
          // Ensure no conflicting selectors
          deterministicIds: false,
        });

        // Generate a clean, unique ID
        const id = `mermaid-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
        
        // Clean and validate the code
        const trimmedCode = code.trim();
        console.log("Rendering Mermaid with ID:", id, "Code:", trimmedCode);
        
        const { svg: renderedSvg } = await mermaid.render(id, trimmedCode);
        
        if (isMounted) {
          setSvg(renderedSvg);
          setLoading(false);
        }
      } catch (err) {
        console.error("Mermaid rendering error:", err);
        if (isMounted) {
          const errorMessage = err instanceof Error ? err.message : "Unknown error";
          setError(`Diagram error: ${errorMessage}`);
          setLoading(false);
        }
      }
    };

    renderDiagram();

    return () => {
      isMounted = false;
    };
  }, [code, theme]);

  if (loading) {
    return <div className="text-muted-foreground text-sm">Loading diagram...</div>;
  }

  if (error) {
    return (
      <div className="text-red-500 text-sm p-2 border border-red-200 rounded">
        <div className="font-medium">Error rendering diagram:</div>
        <div className="text-xs mt-1">{error}</div>
        <details className="mt-2">
          <summary className="cursor-pointer text-xs opacity-60">Show code</summary>
          <pre className="text-xs mt-1 p-1 bg-red-50 rounded overflow-auto">{code}</pre>
        </details>
      </div>
    );
  }

  return <div dangerouslySetInnerHTML={{ __html: svg }} />;
});

MermaidDiagram.displayName = "MermaidDiagram";

export const OptimizedPreview = memo(function OptimizedPreview({ markdown }: OptimizedPreviewProps) {
  const { theme } = useTheme();
  const isMobile = useIsMobile();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="h-full w-full overflow-auto p-6 flex items-center justify-center">
        <div className="text-muted-foreground">Loading preview...</div>
      </div>
    );
  }

  return (
    <div 
      className={`h-full w-full overflow-auto ${isMobile ? 'p-4' : 'p-6'}`} 
      id="preview-container"
    >
      <div className={`mx-auto ${isMobile ? 'max-w-full' : 'max-w-3xl'}`}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            code({ className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || "");
              const language = match?.[1];

              if (language === "mermaid") {
                const code = String(children).replace(/\n$/, "");
                return (
                  <div className="my-4 flex justify-center">
                    <MermaidDiagram code={code} theme={theme || "light"} />
                  </div>
                );
              }

              return match ? (
                <SyntaxHighlighter
                  style={theme === "dark" ? tomorrow : oneLight}
                  language={language}
                  PreTag="div"
                  className={isMobile ? 'text-sm' : 'text-base'}
                  {...props}
                >
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              ) : (
                <code className={`${className} ${isMobile ? 'text-sm' : ''}`} {...props}>
                  {children}
                </code>
              );
            },
            table({ node, ...props }) {
              return (
                <div className="overflow-x-auto my-4">
                  <table className={`border-collapse border border-border w-full ${isMobile ? 'text-sm' : ''}`} {...props} />
                </div>
              );
            },
            thead({ node, ...props }) {
              return <thead className="bg-muted" {...props} />;
            },
            th({ node, ...props }) {
              return <th className={`border border-border text-left ${isMobile ? 'p-1' : 'p-2'}`} {...props} />;
            },
            td({ node, ...props }) {
              return <td className={`border border-border ${isMobile ? 'p-1' : 'p-2'}`} {...props} />;
            },
            img({ node, ...props }) {
              return <img className="max-w-full h-auto my-4" {...props} />;
            },
            a({ node, ...props }) {
              return <a className="text-primary hover:underline" {...props} />;
            },
            h1({ node, ...props }) {
              return <h1 className={`font-bold mt-6 mb-4 ${isMobile ? 'text-2xl' : 'text-3xl'}`} {...props} />;
            },
            h2({ node, ...props }) {
              return <h2 className={`font-bold mt-6 mb-3 ${isMobile ? 'text-xl' : 'text-2xl'}`} {...props} />;
            },
            h3({ node, ...props }) {
              return <h3 className={`font-bold mt-5 mb-2 ${isMobile ? 'text-lg' : 'text-xl'}`} {...props} />;
            },
            ul({ node, ...props }) {
              return <ul className="list-disc pl-6 my-4" {...props} />;
            },
            ol({ node, ...props }) {
              return <ol className="list-decimal pl-6 my-4" {...props} />;
            },
            blockquote({ node, ...props }) {
              return (
                <blockquote className="border-l-4 border-primary pl-4 italic my-4" {...props} />
              );
            },
            hr({ node, ...props }) {
              return <hr className="my-6 border-t border-border" {...props} />;
            },
          }}
        >
          {markdown}
        </ReactMarkdown>
      </div>
    </div>
  );
}); 
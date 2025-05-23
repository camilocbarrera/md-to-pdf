"use client";

import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight, tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

interface OptimizedPreviewProps {
  markdown: string;
}

export function OptimizedPreview({ markdown }: OptimizedPreviewProps) {
  const { theme } = useTheme();
  const isMobile = useIsMobile();
  const previewRef = useRef<HTMLDivElement>(null);
  const [mermaid, setMermaid] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);
  
  // Use longer debounce on mobile for better performance
  const debouncedMarkdown = useDebouncedValue(markdown, isMobile ? 1000 : 300);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Lazy load Mermaid only when needed
  useEffect(() => {
    if (!isClient || !debouncedMarkdown.includes("```mermaid")) return;

    const loadMermaid = async () => {
      try {
        const mermaidModule = await import("mermaid");
        const mermaidInstance = mermaidModule.default;

        mermaidInstance.initialize({
          startOnLoad: false,
          theme: theme === "dark" ? "dark" : "default",
          securityLevel: "loose",
          fontFamily: "inherit",
          // Mobile-specific optimizations
          flowchart: {
            htmlLabels: !isMobile, // Disable HTML labels on mobile for better performance
          },
        });

        setMermaid(mermaidInstance);
      } catch (error) {
        console.error("Failed to load mermaid:", error);
      }
    };

    loadMermaid();
  }, [theme, isClient, debouncedMarkdown, isMobile]);

  useEffect(() => {
    if (!mermaid || !isClient || !previewRef.current) return;

    const renderMermaidDiagrams = async () => {
      const mermaidElements = previewRef.current?.querySelectorAll(".mermaid-diagram");

      if (!mermaidElements || mermaidElements.length === 0) return;

      for (let i = 0; i < mermaidElements.length; i++) {
        const element = mermaidElements[i] as HTMLElement;
        const code = element.getAttribute("data-mermaid-code");

        if (!code) continue;

        try {
          const id = `mermaid-${Date.now()}-${i}`;
          const { svg } = await mermaid.render(id, code);
          element.innerHTML = svg;
        } catch (error) {
          console.error("Error rendering mermaid diagram:", error);
          element.innerHTML = `<pre class="text-red-500 text-sm">Error rendering diagram</pre>`;
        }
      }
    };

    const timer = setTimeout(() => {
      renderMermaidDiagrams();
    }, isMobile ? 200 : 100);

    return () => clearTimeout(timer);
  }, [debouncedMarkdown, mermaid, theme, isClient, isMobile]);

  if (!isClient) {
    return (
      <div className="h-full w-full overflow-auto p-6 flex items-center justify-center">
        <div className="text-muted-foreground">Loading preview...</div>
      </div>
    );
  }

  return (
    <div 
      ref={previewRef} 
      className={`h-full w-full overflow-auto ${isMobile ? 'p-4' : 'p-6'}`} 
      id="preview-container"
    >
      <div className={`mx-auto ${isMobile ? 'max-w-full' : 'max-w-3xl'}`}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            code({ node, inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || "");
              const language = match && match[1];

              if (language === "mermaid") {
                return (
                  <div
                    className="mermaid-diagram my-4 flex justify-center"
                    data-mermaid-code={String(children).replace(/\n$/, "")}
                  >
                    <div className="text-muted-foreground text-sm">Loading diagram...</div>
                  </div>
                );
              }

              return !inline && match ? (
                <SyntaxHighlighter
                  style={theme === "dark" ? tomorrow : oneLight}
                  language={language}
                  PreTag="div"
                  customStyle={{
                    fontSize: isMobile ? '0.875rem' : '1rem',
                    lineHeight: '1.5',
                  }}
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
          {debouncedMarkdown}
        </ReactMarkdown>
      </div>
    </div>
  );
} 
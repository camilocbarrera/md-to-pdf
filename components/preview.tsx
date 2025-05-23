"use client";

import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight, tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

interface PreviewProps {
  markdown: string;
}

export function Preview({ markdown }: PreviewProps) {
  const { theme } = useTheme();
  const previewRef = useRef<HTMLDivElement>(null);
  const [mermaid, setMermaid] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const loadMermaid = async () => {
      try {
        const mermaidModule = await import("mermaid");
        const mermaidInstance = mermaidModule.default;

        mermaidInstance.initialize({
          startOnLoad: false,
          theme: theme === "dark" ? "dark" : "default",
          securityLevel: "loose",
          fontFamily: "inherit",
        });

        setMermaid(mermaidInstance);
      } catch (error) {
        console.error("Failed to load mermaid:", error);
      }
    };

    loadMermaid();
  }, [theme, isClient]);

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
          element.innerHTML = `<pre class="text-red-500">Error rendering diagram: ${error}</pre>`;
        }
      }
    };

    const timer = setTimeout(() => {
      renderMermaidDiagrams();
    }, 100);

    return () => clearTimeout(timer);
  }, [markdown, mermaid, theme, isClient]);

  if (!isClient) {
    return (
      <div className="h-full w-full overflow-auto p-6 flex items-center justify-center">
        <div className="text-muted-foreground">Loading preview...</div>
      </div>
    );
  }

  return (
    <div ref={previewRef} className="h-full w-full overflow-auto p-6" id="preview-container">
      <div className="max-w-3xl mx-auto">
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
                    <div className="text-muted-foreground">Loading diagram...</div>
                  </div>
                );
              }

              return !inline && match ? (
                <SyntaxHighlighter
                  style={theme === "dark" ? tomorrow : oneLight}
                  language={language}
                  PreTag="div"
                  {...props}
                >
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
            table({ node, ...props }) {
              return (
                <div className="overflow-x-auto my-4">
                  <table className="border-collapse border border-border w-full" {...props} />
                </div>
              );
            },
            thead({ node, ...props }) {
              return <thead className="bg-muted" {...props} />;
            },
            th({ node, ...props }) {
              return <th className="border border-border p-2 text-left" {...props} />;
            },
            td({ node, ...props }) {
              return <td className="border border-border p-2" {...props} />;
            },
            img({ node, ...props }) {
              return <img className="max-w-full h-auto my-4" {...props} />;
            },
            a({ node, ...props }) {
              return <a className="text-primary hover:underline" {...props} />;
            },
            h1({ node, ...props }) {
              return <h1 className="text-3xl font-bold mt-6 mb-4" {...props} />;
            },
            h2({ node, ...props }) {
              return <h2 className="text-2xl font-bold mt-6 mb-3" {...props} />;
            },
            h3({ node, ...props }) {
              return <h3 className="text-xl font-bold mt-5 mb-2" {...props} />;
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
}

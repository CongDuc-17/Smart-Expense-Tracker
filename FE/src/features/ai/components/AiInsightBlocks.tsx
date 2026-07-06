
import type { ParsedAiInsightContent } from "@/features/ai/types/ai.types";
import { PieChart, AlertTriangle, Lightbulb, Target } from "lucide-react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

interface Props {
  content: ParsedAiInsightContent;
}

const MarkdownComponents: Components = {
  p: ({ children }) => <p className="leading-relaxed mb-2 last:mb-0">{children}</p>,
  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
  ul: ({ children }) => <ul className="list-disc pl-5 mb-2 space-y-1">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal pl-5 mb-2 space-y-1">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  h1: ({ children }) => <h1 className="text-lg font-semibold mt-4 mb-2">{children}</h1>,
  h2: ({ children }) => <h2 className="text-base font-semibold mt-3 mb-2">{children}</h2>,
  h3: ({ children }) => <h3 className="font-semibold mt-2 mb-1">{children}</h3>,
  blockquote: ({ children }) => <blockquote className="border-l-3 border-border pl-4 italic text-muted-foreground">{children}</blockquote>,
  code: ({ children }) => <code className="bg-muted text-destructive px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>,
};

export function AiInsightBlocks({ content }: Props) {
  return (
    <div className="space-y-8 max-w-4xl">
      {/* Overview Block */}
      <section>
        <h3 className="text-base font-semibold text-foreground flex items-center gap-2 mb-3">
          <PieChart className="w-5 h-5 text-blue-500" />
          Tổng quan
        </h3>
        <div className="bg-muted p-4 rounded-lg border border-border text-sm text-foreground leading-relaxed">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>
            {content.overview}
          </ReactMarkdown>
        </div>
      </section>

      {/* Risks Block */}
      {content.risks && content.risks.length > 0 && (
        <section>
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Rủi ro tiềm ẩn
          </h3>
          <ul className="space-y-2">
            {content.risks.map((risk, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-foreground">
                <span className="text-red-400 mt-0.5">•</span>
                <div className="leading-relaxed flex-1">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>
                    {risk}
                  </ReactMarkdown>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Recommendations Block */}
      {content.recommendations && content.recommendations.length > 0 && (
        <section>
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2 mb-3">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            Khuyến nghị
          </h3>
          <ul className="space-y-2">
            {content.recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-foreground">
                <span className="text-amber-400 mt-0.5">•</span>
                <div className="leading-relaxed flex-1">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>
                    {rec}
                  </ReactMarkdown>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Action Items Block */}
      {content.actions && content.actions.length > 0 && (
        <section>
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2 mb-3">
            <Target className="w-5 h-5 text-emerald-500" />
            Hành động tiếp theo
          </h3>
          <div className="space-y-2">
            {content.actions.map((action, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-md border border-border bg-card hover:bg-muted transition-colors">
                <div className="w-4 h-4 rounded border border-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="text-sm text-foreground leading-snug flex-1">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>
                    {action}
                  </ReactMarkdown>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

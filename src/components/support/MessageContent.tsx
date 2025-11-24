import React from 'react';
import ReactMarkdown from 'react-markdown';

interface MessageContentProps {
  content: string;
  isUser: boolean;
}

export const MessageContent: React.FC<MessageContentProps> = ({ content, isUser }) => {
  if (isUser) {
    return <p className="text-sm whitespace-pre-wrap">{content}</p>;
  }

  // Remove markdown emphasis markers for cleaner display
  const cleanContent = content
    .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.+?)\*/g, '$1')     // Remove italic
    .replace(/__(.+?)__/g, '$1');    // Remove underline

  return (
    <div className="text-sm prose prose-sm max-w-none dark:prose-invert">
      <ReactMarkdown
        components={{
          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
          ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
          li: ({ children }) => <li className="mb-1">{children}</li>,
          strong: ({ children }) => <span className="font-semibold">{children}</span>,
          em: ({ children }) => <span className="italic">{children}</span>,
        }}
      >
        {cleanContent}
      </ReactMarkdown>
    </div>
  );
};

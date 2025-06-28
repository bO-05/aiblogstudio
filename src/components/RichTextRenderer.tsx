import React from 'react';

interface RichTextRendererProps {
  content: string;
  className?: string;
}

export default function RichTextRenderer({ content, className = '' }: RichTextRendererProps) {
  // Simple markdown-like rendering for the content
  const renderContent = (text: string) => {
    // Convert markdown headers
    let html = text
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold text-gray-900 mb-6">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-semibold text-gray-900 mb-4 mt-8">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold text-gray-900 mb-3 mt-6">$1</h3>')
      // Convert bold text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
      // Convert bullet points
      .replace(/^- (.*$)/gim, '<li class="mb-2">$1</li>')
      // Convert numbered lists
      .replace(/^\d+\. (.*$)/gim, '<li class="mb-2">$1</li>')
      // Convert line breaks to paragraphs
      .split('\n\n')
      .map(paragraph => {
        if (paragraph.includes('<h1') || paragraph.includes('<h2') || paragraph.includes('<h3')) {
          return paragraph;
        }
        if (paragraph.includes('<li')) {
          return `<ul class="list-disc list-inside mb-6 space-y-2">${paragraph}</ul>`;
        }
        if (paragraph.trim()) {
          return `<p class="mb-6 text-gray-700 leading-relaxed">${paragraph}</p>`;
        }
        return '';
      })
      .join('');

    return html;
  };

  return (
    <div 
      className={`prose prose-lg max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: renderContent(content) }}
    />
  );
}
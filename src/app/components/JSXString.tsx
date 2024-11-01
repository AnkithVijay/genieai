import React from 'react';

type JSXStringRendererProps = {
  jsxString: string;
};

const JSXStringRenderer: React.FC<JSXStringRendererProps> = ({ jsxString }) => {
  return (
    <div
      className="flex flex-col gap-4 p-4 bg-white rounded-md shadow-md"
      dangerouslySetInnerHTML={{ __html: jsxString }}
    />
  );
};

export default JSXStringRenderer;
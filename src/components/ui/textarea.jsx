import * as React from "react";

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={`w-full p-3 text-black bg-gray-200 placeholder-gray-500 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-colors duration-200 ${className}`}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";

export { Textarea };

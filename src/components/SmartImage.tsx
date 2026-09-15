import React, { useState, useEffect } from 'react';

interface SmartImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSources?: string[];
}

export const SmartImage: React.FC<SmartImageProps> = ({
  src,
  fallbackSources = [],
  alt = '',
  className = '',
  ...props
}) => {
  const sources = [src, ...fallbackSources].filter(Boolean) as string[];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setCurrentIndex(0);
  }, [src]);

  const handleError = () => {
    if (currentIndex < sources.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  return (
    <img
      src={sources[currentIndex] || src}
      alt={alt}
      className={className}
      onError={handleError}
      referrerPolicy="no-referrer"
      {...props}
    />
  );
};

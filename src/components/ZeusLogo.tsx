import React from 'react';

interface ZeusLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  inverted?: boolean;
}

export const ZeusLogo: React.FC<ZeusLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  inverted = false,
}) => {
  const iconDimensions = {
    sm: 'w-6 h-6',
    md: 'w-9 h-9',
    lg: 'w-14 h-14',
    xl: 'w-24 h-24',
  }[size];

  const textDimensions = {
    sm: 'text-xs tracking-widest',
    md: 'text-base tracking-[0.25em]',
    lg: 'text-xl tracking-[0.25em]',
    xl: 'text-3xl tracking-[0.28em]',
  }[size];

  // SVG representation of the Zeus profile with lightning-bolt hair & beard from the brand mark
  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <div 
        className={`relative flex items-center justify-center shrink-0 rounded-xl overflow-hidden shadow-xs transition-transform ${
          inverted ? 'bg-white text-black' : 'bg-black text-white'
        }`}
        style={{
          width: size === 'sm' ? 32 : size === 'md' ? 40 : size === 'lg' ? 56 : 88,
          height: size === 'sm' ? 32 : size === 'md' ? 40 : size === 'lg' ? 56 : 88,
        }}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full p-1"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Stylized Zeus Thunder God Silhouette with jagged lightning mane */}
          <g transform="translate(4, 2) scale(0.92)">
            {/* Crown & flowing lightning locks */}
            <path d="M 52,12 C 48,15 42,16 38,20 C 34,24 33,29 27,33 C 24,35 20,38 21,43 C 22,46 26,45 28,44 C 33,41 38,36 43,33 C 39,38 34,44 28,49 C 24,53 19,57 23,62 C 25,64 28,62 31,59 C 36,54 42,47 48,42 C 44,48 39,56 34,63 C 30,68 28,74 33,78 C 36,80 39,78 42,74 C 47,68 53,60 58,54 C 54,61 49,69 46,78 C 44,82 46,86 50,87 C 53,88 56,84 59,80 C 66,71 72,59 74,48 C 76,38 72,28 66,20 C 62,15 57,11 52,12 Z" />
            
            {/* Chiseled Noble Face Profile (Brow, Greek nose, stern expression) */}
            <path d="M 57,28 C 55,25 58,22 62,24 C 65,26 67,30 68,34 C 65,34 62,32 59,31 C 57,30 56,29 57,28 Z" />
            
            {/* Forehead, eye ridge, nose bridge */}
            <path d="M 64,32 L 72,33 L 73,43 L 68,44 L 64,36 Z" />
            
            {/* Intense deep eye socket & brow */}
            <path d="M 60,37 C 62,36 64,36 66,38 C 65,40 63,40 61,39 Z" fill={inverted ? '#ffffff' : '#000000'} />
            
            {/* Upper lip & Mustache extending into beard */}
            <path d="M 66,45 C 72,46 76,49 76,52 C 72,53 67,52 63,50 Z" />
            
            {/* Serrated Lightning Beard & Strong Jaw */}
            <path d="M 62,53 C 69,55 74,60 72,67 C 70,72 66,76 65,82 C 63,80 62,75 60,73 C 59,71 57,75 56,79 C 55,75 54,71 53,69 C 52,67 50,71 49,74 C 50,68 52,62 55,57 C 57,54 59,53 62,53 Z" />
            
            {/* Inner Ear & Temple Definition */}
            <path d="M 52,38 C 54,36 57,38 57,41 C 56,44 53,46 51,44 C 50,42 50,39 52,38 Z" fill={inverted ? '#ffffff' : '#000000'} />
          </g>
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className={`font-black uppercase text-stone-900 leading-none font-mono ${textDimensions}`}>
            ZEUS
          </span>
          <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-amber-600 mt-0.5">
            Workforce OS
          </span>
        </div>
      )}
    </div>
  );
};

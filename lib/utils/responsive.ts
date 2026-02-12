/**
 * Responsive design utilities and breakpoint helpers
 */

export const breakpoints = {
  mobile: 'sm', // < 640px
  tablet: 'md', // >= 768px
  desktop: 'lg', // >= 1024px
  wide: 'xl', // >= 1280px
};

/**
 * Get responsive classes for grid layouts
 */
export const getResponsiveGridClass = (variant: 'auto' | 'cards' | 'table') => {
  switch (variant) {
    case 'cards':
      // Mobile: 1 col, Tablet: 2 cols, Desktop: 3+ cols
      return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4';
    case 'table':
      // Mobile: stack, Tablet/Desktop: table layout
      return 'w-full';
    case 'auto':
    default:
      return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4';
  }
};

/**
 * Responsive padding utilities
 */
export const getResponsivePadding = (size: 'sm' | 'md' | 'lg') => {
  switch (size) {
    case 'sm':
      return 'px-3 py-2 sm:px-4 sm:py-3 md:px-5 md:py-4';
    case 'md':
      return 'px-4 py-3 sm:px-6 sm:py-4 md:px-8 md:py-6';
    case 'lg':
      return 'px-5 py-4 sm:px-8 sm:py-6 md:px-12 md:py-8';
    default:
      return 'px-4 py-3';
  }
};

/**
 * Responsive font sizes
 */
export const getResponsiveFontSize = (size: 'xs' | 'sm' | 'base' | 'lg' | 'xl') => {
  switch (size) {
    case 'xs':
      return 'text-xs sm:text-xs md:text-sm';
    case 'sm':
      return 'text-sm sm:text-sm md:text-base';
    case 'base':
      return 'text-base sm:text-base md:text-lg';
    case 'lg':
      return 'text-lg sm:text-xl md:text-2xl';
    case 'xl':
      return 'text-xl sm:text-2xl md:text-3xl';
    default:
      return 'text-base';
  }
};

/**
 * Mobile-friendly table display classes
 */
export const getMobileTableClass = () => {
  return `
    w-full
    overflow-x-auto
    [&>table]:w-full
    [&>table]:text-sm
    [&_th]:px-3
    [&_th]:py-2
    [&_th]:text-left
    [&_th]:text-xs
    [&_td]:px-3
    [&_td]:py-2
    sm:[&_th]:px-4
    sm:[&_th]:py-3
    md:[&_th]:px-6
    md:[&_th]:py-4
  `;
};

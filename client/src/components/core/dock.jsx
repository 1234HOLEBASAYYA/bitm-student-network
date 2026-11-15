import React, { createContext, useContext, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'motion/react';
import '../../styles/dock.css';

const DockContext = createContext({
  mouseX: null,
  magnification: 68,
  distance: 140,
  baseSize: 46
});

/**
 * Dock Container
 */
export const Dock = ({
  children,
  className = '',
  magnification = 68,
  distance = 140,
  baseSize = 46,
  direction = 'bottom'
}) => {
  const mouseX = useMotionValue(Infinity);
  const dockRef = useRef(null);

  const handleMouseMove = (e) => {
    mouseX.set(e.pageX);
  };

  const handleMouseLeave = () => {
    mouseX.set(Infinity);
  };

  return (
    <DockContext.Provider value={{ mouseX, magnification, distance, baseSize }}>
      <motion.nav
        ref={dockRef}
        role="navigation"
        aria-label="Floating Quick Navigation"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={`apple-dock-container ${className}`}
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        <div className="apple-dock-inner">
          {children}
        </div>
      </motion.nav>
    </DockContext.Provider>
  );
};

/**
 * Dock Item
 */
export const DockItem = ({
  children,
  className = '',
  onClick,
  isActive = false,
  badge = null,
  ariaLabel
}) => {
  const ref = useRef(null);
  const { mouseX, magnification, distance, baseSize } = useContext(DockContext);
  const [isHovered, setIsHovered] = useState(false);

  const distanceFromMouse = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthSync = useTransform(
    distanceFromMouse,
    [-distance, 0, distance],
    [baseSize, magnification, baseSize]
  );

  const width = useSpring(widthSync, {
    mass: 0.1,
    stiffness: 170,
    damping: 14
  });

  return (
    <motion.button
      ref={ref}
      type="button"
      style={{ width, height: width }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-current={isActive ? 'page' : undefined}
      className={`apple-dock-item ${isActive ? 'active' : ''} ${className}`}
      whileTap={{ scale: 0.88 }}
    >
      {React.Children.map(children, (child) => {
        if (!child) return null;
        if (child.type === DockLabel) {
          return React.cloneElement(child, { isHovered });
        }
        return child;
      })}

      {badge !== null && badge !== undefined && badge > 0 && (
        <span className="dock-item-badge">
          {badge > 9 ? '9+' : badge}
        </span>
      )}

      {isActive && (
        <motion.span
          layoutId="dock-active-dot"
          className="dock-active-indicator"
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        />
      )}
    </motion.button>
  );
};

/**
 * Dock Icon Wrapper
 */
export const DockIcon = ({ children, className = '' }) => {
  return (
    <div className={`apple-dock-icon ${className}`}>
      {children}
    </div>
  );
};

/**
 * Dock Label Tooltip
 */
export const DockLabel = ({ children, className = '', isHovered = false }) => {
  return (
    <AnimatePresence>
      {isHovered && (
        <motion.div
          initial={{ opacity: 0, y: 6, scale: 0.85 }}
          animate={{ opacity: 1, y: -8, scale: 1 }}
          exit={{ opacity: 0, y: 4, scale: 0.85 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className={`apple-dock-label ${className}`}
          role="tooltip"
        >
          {children}
          <span className="dock-label-arrow" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

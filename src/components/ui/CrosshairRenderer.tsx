import React from 'react';
import { useSettingsStore } from '../../store/useSettingsStore';

interface CrosshairRendererProps {
  isFiring?: boolean;
}

export const CrosshairRenderer: React.FC<CrosshairRendererProps> = ({ isFiring = false }) => {
  const crosshair = useSettingsStore(state => state.settings.crosshair);

  const bloomOffset = crosshair.dynamicBloom && isFiring ? 4 : 0;
  const gap = crosshair.gap + bloomOffset;
  const size = crosshair.size;
  const thickness = crosshair.thickness;
  const color = crosshair.color;
  const opacity = crosshair.opacity;
  const outline = crosshair.outline;
  const outlineColor = crosshair.outlineColor;
  const outlineThickness = crosshair.outlineThickness;

  const outlineStyle = outline
    ? {
        boxShadow: `0 0 0 ${outlineThickness}px ${outlineColor}`
      }
    : {};

  return (
    <div
      className="pointer-events-none fixed inset-0 flex items-center justify-center z-40 select-none"
      style={{ opacity }}
    >
      <div className="relative flex items-center justify-center">
        {/* Center Dot */}
        {crosshair.dot && (
          <div
            className="absolute rounded-full"
            style={{
              width: `${crosshair.dotSize * 2}px`,
              height: `${crosshair.dotSize * 2}px`,
              backgroundColor: color,
              ...outlineStyle
            }}
          />
        )}

        {/* Cross Style */}
        {crosshair.style === 'cross' && (
          <>
            {/* Top */}
            <div
              className="absolute"
              style={{
                width: `${thickness}px`,
                height: `${size}px`,
                bottom: `${gap}px`,
                backgroundColor: color,
                ...outlineStyle
              }}
            />
            {/* Bottom */}
            <div
              className="absolute"
              style={{
                width: `${thickness}px`,
                height: `${size}px`,
                top: `${gap}px`,
                backgroundColor: color,
                ...outlineStyle
              }}
            />
            {/* Left */}
            <div
              className="absolute"
              style={{
                width: `${size}px`,
                height: `${thickness}px`,
                right: `${gap}px`,
                backgroundColor: color,
                ...outlineStyle
              }}
            />
            {/* Right */}
            <div
              className="absolute"
              style={{
                width: `${size}px`,
                height: `${thickness}px`,
                left: `${gap}px`,
                backgroundColor: color,
                ...outlineStyle
              }}
            />
          </>
        )}

        {/* T-Shape Style */}
        {crosshair.style === 't-shape' && (
          <>
            {/* Bottom */}
            <div
              className="absolute"
              style={{
                width: `${thickness}px`,
                height: `${size}px`,
                top: `${gap}px`,
                backgroundColor: color,
                ...outlineStyle
              }}
            />
            {/* Left */}
            <div
              className="absolute"
              style={{
                width: `${size}px`,
                height: `${thickness}px`,
                right: `${gap}px`,
                backgroundColor: color,
                ...outlineStyle
              }}
            />
            {/* Right */}
            <div
              className="absolute"
              style={{
                width: `${size}px`,
                height: `${thickness}px`,
                left: `${gap}px`,
                backgroundColor: color,
                ...outlineStyle
              }}
            />
          </>
        )}

        {/* Circle Style */}
        {crosshair.style === 'circle' && (
          <div
            className="absolute rounded-full"
            style={{
              width: `${(gap + size) * 2}px`,
              height: `${(gap + size) * 2}px`,
              border: `${thickness}px solid ${color}`,
              ...outlineStyle
            }}
          />
        )}

        {/* Box Style */}
        {crosshair.style === 'box' && (
          <div
            className="absolute"
            style={{
              width: `${(gap + size) * 2}px`,
              height: `${(gap + size) * 2}px`,
              border: `${thickness}px solid ${color}`,
              ...outlineStyle
            }}
          />
        )}
      </div>
    </div>
  );
};

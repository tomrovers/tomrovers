import Svg, { Circle, Path, Rect } from 'react-native-svg';

export type IconName = 'home' | 'cards' | 'game' | 'compass' | 'sofa' | 'settings' | 'back';

export function Icon({ name, color, size = 24 }: { name: IconName; color: string; size?: number }) {
  const stroke = { stroke: color, strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === 'home' && <Path d="M3 11 12 4l9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" {...stroke} />}
      {name === 'cards' && (
        <>
          <Rect x={3} y={6} width={12} height={15} rx={2.5} {...stroke} />
          <Path d="M9 3.5 18.6 4.8a2.5 2.5 0 0 1 2.1 2.8l-1.4 10.5" {...stroke} />
        </>
      )}
      {name === 'game' && (
        <>
          <Path d="M7 7h10a5 5 0 0 1 4.8 6.3l-.9 3.4a2.6 2.6 0 0 1-4.5 1L14.6 16H9.4l-1.8 1.7a2.6 2.6 0 0 1-4.5-1l-.9-3.4A5 5 0 0 1 7 7z" {...stroke} />
          <Path d="M8 10v4M6 12h4" {...stroke} />
          <Circle cx={16} cy={11} r={1} fill={color} />
          <Circle cx={18} cy={13} r={1} fill={color} />
        </>
      )}
      {name === 'compass' && (
        <>
          <Circle cx={12} cy={12} r={9} {...stroke} />
          <Path d="m15.5 8.5-2 5-5 2 2-5z" {...stroke} />
        </>
      )}
      {name === 'sofa' && (
        <>
          <Path d="M5 11V8a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v3" {...stroke} />
          <Path d="M3 13a2 2 0 0 1 4 0v1h10v-1a2 2 0 0 1 4 0v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM6 19v2M18 19v2" {...stroke} />
        </>
      )}
      {name === 'settings' && (
        <>
          <Circle cx={12} cy={12} r={3} {...stroke} />
          <Path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" {...stroke} />
        </>
      )}
      {name === 'back' && <Path d="M15 5l-7 7 7 7" {...stroke} />}
    </Svg>
  );
}

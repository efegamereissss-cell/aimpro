import { CrosshairSettings } from '../types/settings';

export interface ProCrosshairPreset {
  name: string;
  player: string;
  game: 'Valorant' | 'CS2';
  code: string;
  settings: CrosshairSettings;
}

export const PRO_CROSSHAIRS: ProCrosshairPreset[] = [
  {
    name: 'TenZ Cyan Dot',
    player: 'TenZ',
    game: 'Valorant',
    code: '0;s;1;P;c;5;h;0;m;1;0l;4;0v;4;0g;1;0a;1;0f;0;1b;0',
    settings: {
      style: 'cross',
      size: 4,
      thickness: 2,
      gap: 2,
      dot: true,
      dotSize: 2,
      color: '#00f0ff',
      opacity: 1.0,
      outline: true,
      outlineColor: '#000000',
      outlineThickness: 1,
      dynamicBloom: false
    }
  },
  {
    name: 'Aspas Clean Green',
    player: 'Aspas',
    game: 'Valorant',
    code: '0;P;c;1;o;1;d;0;0b;0;1b;0',
    settings: {
      style: 'cross',
      size: 5,
      thickness: 2,
      gap: 3,
      dot: false,
      dotSize: 2,
      color: '#00ff66',
      opacity: 1.0,
      outline: true,
      outlineColor: '#000000',
      outlineThickness: 1,
      dynamicBloom: false
    }
  },
  {
    name: 's1mple CS2 Yellow Cross',
    player: 's1mple',
    game: 'CS2',
    code: 'CSGO-UwHAe-j749b-omj7R-kH3Tj-UjWPA',
    settings: {
      style: 'cross',
      size: 3,
      thickness: 1,
      gap: 1,
      dot: false,
      dotSize: 1,
      color: '#ffdd00',
      opacity: 1.0,
      outline: false,
      outlineColor: '#000000',
      outlineThickness: 1,
      dynamicBloom: false
    }
  },
  {
    name: 'NiKo Red Precision',
    player: 'NiKo',
    game: 'CS2',
    code: 'CSGO-f5vWb-d54b8-kmj7R-2K3Tj-UkWPA',
    settings: {
      style: 'cross',
      size: 4,
      thickness: 2,
      gap: 1,
      dot: false,
      dotSize: 2,
      color: '#ff0055',
      opacity: 1.0,
      outline: true,
      outlineColor: '#000000',
      outlineThickness: 1,
      dynamicBloom: false
    }
  },
  {
    name: 'Yay White Micro Cross',
    player: 'Yay',
    game: 'Valorant',
    code: '0;P;h;0;f;0;0l;4;0o;0;0a;1;0f;0;1b;0',
    settings: {
      style: 'cross',
      size: 4,
      thickness: 2,
      gap: 0,
      dot: false,
      dotSize: 2,
      color: '#ffffff',
      opacity: 1.0,
      outline: true,
      outlineColor: '#000000',
      outlineThickness: 1,
      dynamicBloom: false
    }
  },
  {
    name: 'Micro Center Dot',
    player: 'Shroud',
    game: 'Valorant',
    code: '0;P;c;7;h;0;d;1;z;3;f;0;0b;0;1b;0',
    settings: {
      style: 'dot',
      size: 2,
      thickness: 2,
      gap: 0,
      dot: true,
      dotSize: 3,
      color: '#00f0ff',
      opacity: 1.0,
      outline: true,
      outlineColor: '#000000',
      outlineThickness: 1,
      dynamicBloom: false
    }
  }
];

export function exportCrosshairCode(settings: CrosshairSettings): string {
  // Generate a clean share code
  const colorHex = settings.color.replace('#', '');
  return `AIMPRO-${settings.style[0].toUpperCase()}${settings.size}T${settings.thickness}G${settings.gap}D${settings.dot ? 1 : 0}C${colorHex}O${settings.outline ? 1 : 0}`;
}

export function importCrosshairCode(code: string): Partial<CrosshairSettings> | null {
  try {
    const trimmed = code.trim();
    // Check if matching pro presets
    const matchedPreset = PRO_CROSSHAIRS.find(p => p.code.toLowerCase() === trimmed.toLowerCase());
    if (matchedPreset) {
      return matchedPreset.settings;
    }

    if (trimmed.startsWith('AIMPRO-')) {
      const body = trimmed.replace('AIMPRO-', '');
      const styleChar = body[0];
      const style = styleChar === 'D' ? 'dot' : (styleChar === 'C' ? 'circle' : 'cross');
      
      const sizeMatch = body.match(/[A-Z](\d+)T/);
      const thickMatch = body.match(/T(\d+)G/);
      const gapMatch = body.match(/G(\d+)D/);
      const dotMatch = body.match(/D([01])C/);
      const colorMatch = body.match(/C([0-9a-fA-F]{6})/);
      const outlineMatch = body.match(/O([01])/);

      return {
        style,
        size: sizeMatch ? parseInt(sizeMatch[1]) : 5,
        thickness: thickMatch ? parseInt(thickMatch[1]) : 2,
        gap: gapMatch ? parseInt(gapMatch[1]) : 2,
        dot: dotMatch ? dotMatch[1] === '1' : false,
        color: colorMatch ? '#' + colorMatch[1] : '#00f0ff',
        outline: outlineMatch ? outlineMatch[1] === '1' : true
      };
    }

    // Default fallback
    return {
      style: 'cross',
      size: 4,
      thickness: 2,
      gap: 2,
      dot: true,
      color: '#00f0ff'
    };
  } catch {
    return null;
  }
}

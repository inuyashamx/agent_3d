// Mapeo de colores en español a valores hexadecimales
export const COLOR_MAP_ES: Record<string, string> = {
  // Colores básicos
  'rojo': '#dc2626',
  'verde': '#16a34a',
  'azul': '#2563eb',
  'amarillo': '#eab308',
  'naranja': '#ea580c',
  'morado': '#9333ea',
  'púrpura': '#9333ea',
  'violeta': '#9333ea',
  'rosa': '#ec4899',
  'negro': '#000000',
  'blanco': '#ffffff',
  'gris': '#6b7280',
  'marrón': '#92400e',
  'café': '#92400e',
  'beige': '#f5f5dc',
  'crema': '#f5f5dc',
  
  // Variaciones de colores
  'rojo claro': '#f87171',
  'rojo oscuro': '#991b1b',
  'verde claro': '#4ade80',
  'verde oscuro': '#14532d',
  'azul claro': '#60a5fa',
  'azul oscuro': '#1e3a8a',
  'amarillo claro': '#fde047',
  'amarillo oscuro': '#a16207',
  'naranja claro': '#fb923c',
  'naranja oscuro': '#c2410c',
  'morado claro': '#a855f7',
  'morado oscuro': '#581c87',
  'rosa claro': '#f9a8d4',
  'rosa oscuro': '#be185d',
  'gris claro': '#d1d5db',
  'gris oscuro': '#374151',
  'marrón claro': '#d97706',
  'marrón oscuro': '#451a03',
  
  // Colores especiales
  'dorado': '#fbbf24',
  'plateado': '#e5e7eb',
  'bronce': '#cd7f32',
  'cobre': '#b87333',
  'oro': '#ffd700',
  'plata': '#c0c0c0',
  'turquesa': '#06b6d4',
  'cyan': '#06b6d4',
  'lima': '#84cc16',
  'magenta': '#d946ef',
  'índigo': '#6366f1',
  'añil': '#6366f1',
  'escarlata': '#dc143c',
  'carmesí': '#dc143c',
  'coral': '#ff7f50',
  'salmón': '#fa8072',
  'lavanda': '#e6e6fa',
  'marfil': '#fffff0',
  'oliva': '#808000',
  'caqui': '#f0e68c',
  'granate': '#800000',
  'marino': '#000080',
  'teal': '#008080',
  'aguamarina': '#7fffd4'
};

// Mapeo de colores en inglés a valores hexadecimales
export const COLOR_MAP_EN: Record<string, string> = {
  // Basic colors
  'red': '#dc2626',
  'green': '#16a34a',
  'blue': '#2563eb',
  'yellow': '#eab308',
  'orange': '#ea580c',
  'purple': '#9333ea',
  'violet': '#9333ea',
  'pink': '#ec4899',
  'black': '#000000',
  'white': '#ffffff',
  'gray': '#6b7280',
  'grey': '#6b7280',
  'brown': '#92400e',
  'beige': '#f5f5dc',
  'cream': '#f5f5dc',
  
  // Color variations
  'light red': '#f87171',
  'dark red': '#991b1b',
  'light green': '#4ade80',
  'dark green': '#14532d',
  'light blue': '#60a5fa',
  'dark blue': '#1e3a8a',
  'light yellow': '#fde047',
  'dark yellow': '#a16207',
  'light orange': '#fb923c',
  'dark orange': '#c2410c',
  'light purple': '#a855f7',
  'dark purple': '#581c87',
  'light pink': '#f9a8d4',
  'dark pink': '#be185d',
  'light gray': '#d1d5db',
  'light grey': '#d1d5db',
  'dark gray': '#374151',
  'dark grey': '#374151',
  'light brown': '#d97706',
  'dark brown': '#451a03',
  
  // Special colors
  'gold': '#ffd700',
  'silver': '#c0c0c0',
  'bronze': '#cd7f32',
  'copper': '#b87333',
  'turquoise': '#06b6d4',
  'cyan': '#06b6d4',
  'lime': '#84cc16',
  'magenta': '#d946ef',
  'indigo': '#6366f1',
  'scarlet': '#dc143c',
  'crimson': '#dc143c',
  'coral': '#ff7f50',
  'salmon': '#fa8072',
  'lavender': '#e6e6fa',
  'ivory': '#fffff0',
  'olive': '#808000',
  'khaki': '#f0e68c',
  'maroon': '#800000',
  'navy': '#000080',
  'teal': '#008080',
  'aqua': '#7fffd4',
  'aquamarine': '#7fffd4'
};

// Combinar mapas de colores
export const COLOR_MAP = {
  ...COLOR_MAP_ES,
  ...COLOR_MAP_EN
};

// Función para detectar un color en texto
export function detectColor(text: string): string | null {
  const normalized = text.toLowerCase().trim();
  
  // Buscar coincidencia exacta
  if (COLOR_MAP[normalized]) {
    return COLOR_MAP[normalized];
  }
  
  // Buscar coincidencias parciales
  for (const [colorName, colorValue] of Object.entries(COLOR_MAP)) {
    if (text.toLowerCase().includes(colorName)) {
      return colorValue;
    }
  }
  
  // Verificar si es un color hexadecimal
  const hexMatch = text.match(/#[0-9a-fA-F]{6}/);
  if (hexMatch) {
    return hexMatch[0];
  }
  
  // Verificar si es un color RGB
  const rgbMatch = text.match(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1]);
    const g = parseInt(rgbMatch[2]);
    const b = parseInt(rgbMatch[3]);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
  
  return null;
}

// Función para obtener el nombre del color más cercano
export function getColorName(hex: string): string | null {
  const normalizedHex = hex.toLowerCase();
  
  // Buscar coincidencia exacta
  for (const [colorName, colorValue] of Object.entries(COLOR_MAP)) {
    if (colorValue.toLowerCase() === normalizedHex) {
      return colorName;
    }
  }
  
  return null;
}

// Función para obtener colores similares
export function getSimilarColors(colorName: string): string[] {
  const normalized = colorName.toLowerCase();
  const colors: string[] = [];
  
  for (const [name, value] of Object.entries(COLOR_MAP)) {
    if (name.includes(normalized) || normalized.includes(name)) {
      colors.push(value);
    }
  }
  
  return colors;
}

// Función para verificar si un string es un color válido
export function isValidColor(color: string): boolean {
  // Verificar si es un color conocido
  if (COLOR_MAP[color.toLowerCase()]) {
    return true;
  }
  
  // Verificar si es hexadecimal
  if (/^#[0-9a-fA-F]{6}$/.test(color)) {
    return true;
  }
  
  // Verificar si es RGB
  if (/^rgb\s*\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/.test(color)) {
    return true;
  }
  
  return false;
}

// Función para obtener colores por categoría
export function getColorsByCategory(): Record<string, string[]> {
  return {
    basic: ['rojo', 'verde', 'azul', 'amarillo', 'naranja', 'morado', 'rosa', 'negro', 'blanco', 'gris'],
    light: ['rojo claro', 'verde claro', 'azul claro', 'amarillo claro', 'naranja claro', 'morado claro', 'rosa claro', 'gris claro'],
    dark: ['rojo oscuro', 'verde oscuro', 'azul oscuro', 'amarillo oscuro', 'naranja oscuro', 'morado oscuro', 'rosa oscuro', 'gris oscuro'],
    special: ['dorado', 'plateado', 'bronce', 'cobre', 'turquesa', 'lima', 'magenta', 'índigo', 'coral', 'lavanda']
  };
}

// Lista de colores más comunes para sugerencias
export const COMMON_COLORS = [
  'rojo', 'verde', 'azul', 'amarillo', 'naranja', 'morado', 'rosa', 'negro', 'blanco', 'gris', 'marrón'
];

// Función para obtener un color aleatorio
export function getRandomColor(): string {
  const colors = Object.values(COLOR_MAP);
  return colors[Math.floor(Math.random() * colors.length)];
} 
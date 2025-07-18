import { Shape } from '../state/types';

// Mapeo de vocabulario español a formas canónicas
export const SHAPE_VOCAB_ES: Record<string, Shape> = {
  // Esfera
  'pelota': 'sphere',
  'bola': 'sphere',
  'esfera': 'sphere',
  'balón': 'sphere',
  'canica': 'sphere',
  
  // Caja/Cubo
  'cubo': 'box',
  'caja': 'box',
  'bloque': 'box',
  'dado': 'box',
  'prisma': 'box',
  'rectangulo': 'box',
  'rectángulo': 'box',
  
  // Cilindro
  'cilindro': 'cylinder',
  'tubo': 'cylinder',
  'poste': 'cylinder',
  'columna': 'cylinder',
  'lata': 'cylinder',
  'botella': 'cylinder',
  'cubeta': 'cylinder',
  'balde': 'cylinder',
  'tambor': 'cylinder',
  
  // Cápsula
  'capsula': 'capsule',
  'cápsula': 'capsule',
  'pildora': 'capsule',
  'píldora': 'capsule',
  'pastilla': 'capsule',
  'palo': 'capsule',
  'barra': 'capsule',
  
  // Plano
  'plano': 'plane',
  'piso': 'plane',
  'suelo': 'plane',
  'mesa': 'plane',
  'tablero': 'plane',
  'superficie': 'plane',
  'hoja': 'plane',
  'papel': 'plane',
  'ventana': 'plane',
  'puerta': 'plane'
};

// Mapeo de vocabulario inglés a formas canónicas
export const SHAPE_VOCAB_EN: Record<string, Shape> = {
  // Sphere
  'ball': 'sphere',
  'sphere': 'sphere',
  'orb': 'sphere',
  'globe': 'sphere',
  'marble': 'sphere',
  
  // Box
  'box': 'box',
  'cube': 'box',
  'block': 'box',
  'brick': 'box',
  'die': 'box',
  'dice': 'box',
  'rectangle': 'box',
  'prism': 'box',
  
  // Cylinder
  'cylinder': 'cylinder',
  'tube': 'cylinder',
  'pipe': 'cylinder',
  'pole': 'cylinder',
  'column': 'cylinder',
  'can': 'cylinder',
  'bottle': 'cylinder',
  'barrel': 'cylinder',
  'drum': 'cylinder',
  
  // Capsule
  'capsule': 'capsule',
  'pill': 'capsule',
  'tablet': 'capsule',
  'rod': 'capsule',
  'bar': 'capsule',
  'stick': 'capsule',
  
  // Plane
  'plane': 'plane',
  'floor': 'plane',
  'ground': 'plane',
  'table': 'plane',
  'board': 'plane',
  'surface': 'plane',
  'sheet': 'plane',
  'paper': 'plane',
  'window': 'plane',
  'door': 'plane',
  'wall': 'plane'
};

// Combinar vocabularios
export const SHAPE_VOCAB = {
  ...SHAPE_VOCAB_ES,
  ...SHAPE_VOCAB_EN
};

// Verbos de acción en español
export const ACTION_VERBS_ES: Record<string, string[]> = {
  create: ['crear', 'crea', 'haz', 'hacer', 'añadir', 'añade', 'poner', 'pon', 'generar', 'genera'],
  delete: ['borrar', 'borra', 'eliminar', 'elimina', 'quitar', 'quita', 'remover', 'remueve', 'destruir', 'destruye'],
  color: ['colorear', 'colorea', 'pintar', 'pinta', 'cambiar color', 'color'],
  move: ['mover', 'mueve', 'colocar', 'coloca', 'posicionar', 'posiciona', 'ubicar', 'ubica'],
  place: ['arriba', 'encima', 'sobre', 'debajo', 'abajo', 'al lado', 'junto', 'cerca']
};

// Verbos de acción en inglés
export const ACTION_VERBS_EN: Record<string, string[]> = {
  create: ['create', 'make', 'add', 'put', 'generate', 'build', 'spawn'],
  delete: ['delete', 'remove', 'destroy', 'eliminate', 'clear', 'erase'],
  color: ['color', 'paint', 'dye', 'tint', 'change color'],
  move: ['move', 'place', 'position', 'locate', 'put'],
  place: ['above', 'on top', 'over', 'below', 'under', 'beside', 'next to', 'near']
};

// Pronombres y referencias
export const PRONOUNS_ES = [
  'la', 'el', 'lo', 'las', 'los', 'ella', 'él', 'ello', 'ellos', 'ellas',
  'esa', 'ese', 'eso', 'esas', 'esos', 'esta', 'este', 'esto', 'estas', 'estos',
  'aquella', 'aquel', 'aquello', 'aquellas', 'aquellos'
];

export const PRONOUNS_EN = [
  'it', 'that', 'this', 'them', 'those', 'these'
];

// Preposiciones de posición
export const POSITION_PREPOSITIONS_ES = [
  'en', 'a', 'sobre', 'encima', 'arriba', 'debajo', 'abajo', 'al lado', 'junto', 'cerca', 'lejos'
];

export const POSITION_PREPOSITIONS_EN = [
  'at', 'on', 'above', 'below', 'beside', 'next to', 'near', 'far', 'over', 'under'
];

// Función para detectar si una palabra es una forma
export function detectShape(word: string): Shape | null {
  const normalized = word.toLowerCase().trim();
  return SHAPE_VOCAB[normalized] || null;
}

// Función para detectar si una palabra es un pronombre
export function isPronoun(word: string): boolean {
  const normalized = word.toLowerCase().trim();
  return PRONOUNS_ES.includes(normalized) || PRONOUNS_EN.includes(normalized);
}

// Función para detectar verbos de acción
export function detectAction(text: string): string | null {
  const normalized = text.toLowerCase();
  
  // Verificar acciones en español
  for (const [action, verbs] of Object.entries(ACTION_VERBS_ES)) {
    if (verbs.some(verb => normalized.includes(verb))) {
      return action;
    }
  }
  
  // Verificar acciones en inglés
  for (const [action, verbs] of Object.entries(ACTION_VERBS_EN)) {
    if (verbs.some(verb => normalized.includes(verb))) {
      return action;
    }
  }
  
  return null;
}

// Función para obtener formas similares
export function getSimilarShapes(word: string): Shape[] {
  const normalized = word.toLowerCase().trim();
  const shapes: Shape[] = [];
  
  // Buscar coincidencias parciales
  for (const [vocab, shape] of Object.entries(SHAPE_VOCAB)) {
    if (vocab.includes(normalized) || normalized.includes(vocab)) {
      if (!shapes.includes(shape)) {
        shapes.push(shape);
      }
    }
  }
  
  return shapes;
}

// Función para obtener vocabulario de una forma específica
export function getVocabForShape(shape: Shape): string[] {
  const vocab: string[] = [];
  
  for (const [word, shapeType] of Object.entries(SHAPE_VOCAB)) {
    if (shapeType === shape) {
      vocab.push(word);
    }
  }
  
  return vocab;
}

// Función para detectar si es un comando de eliminación
export function isDeleteCommand(text: string): boolean {
  const normalized = text.toLowerCase();
  return ACTION_VERBS_ES.delete.some(verb => normalized.includes(verb)) ||
         ACTION_VERBS_EN.delete.some(verb => normalized.includes(verb));
}

// Función para detectar si es un comando de color
export function isColorCommand(text: string): boolean {
  const normalized = text.toLowerCase();
  return ACTION_VERBS_ES.color.some(verb => normalized.includes(verb)) ||
         ACTION_VERBS_EN.color.some(verb => normalized.includes(verb));
}

// Función para detectar si es un comando de movimiento
export function isMoveCommand(text: string): boolean {
  const normalized = text.toLowerCase();
  return ACTION_VERBS_ES.move.some(verb => normalized.includes(verb)) ||
         ACTION_VERBS_EN.move.some(verb => normalized.includes(verb));
}

// Función para detectar si es un comando de posicionamiento relativo
export function isPlaceCommand(text: string): boolean {
  const normalized = text.toLowerCase();
  return ACTION_VERBS_ES.place.some(verb => normalized.includes(verb)) ||
         ACTION_VERBS_EN.place.some(verb => normalized.includes(verb));
} 
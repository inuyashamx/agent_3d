import { Command, Shape, Vec3 } from '../state/types';
import { detectShape, detectAction, isPronoun, isDeleteCommand, isColorCommand, isMoveCommand, isPlaceCommand } from './vocab';
import { detectColor } from './colorMap';

// Interfaz para el contexto del parser
interface ParserContext {
  lastMentionedObject?: string;
  currentObjects: string[];
  language: 'es' | 'en';
}

// Función principal del parser
export function parseCommand(input: string, context: ParserContext): Command[] {
  const text = input.trim();
  if (!text) return [];

  try {
    // Detectar tipo de comando principal
    if (isDeleteCommand(text)) {
      return parseDeleteCommand(text, context);
    }
    
    if (isColorCommand(text)) {
      return parseColorCommand(text, context);
    }
    
    if (isMoveCommand(text)) {
      return parseMoveCommand(text, context);
    }
    
    if (isPlaceCommand(text)) {
      return parsePlaceCommand(text, context);
    }
    
    // Si no es ningún comando específico, intentar crear primitivo
    const createCommand = parseCreateCommand(text, context);
    if (createCommand) {
      return [createCommand];
    }
    
    // Si no podemos interpretar el comando, devolver comando de pregunta
    return [{
      action: 'ask' as const,
      message: context.language === 'es' 
        ? '¿Podrías ser más específico? No entiendo qué quieres hacer.'
        : 'Could you be more specific? I don\'t understand what you want to do.'
    }];
    
  } catch (error) {
    console.error('Error parsing command:', error);
    return [{
      action: 'ask' as const,
      message: context.language === 'es' 
        ? 'Hubo un error al interpretar tu comando. ¿Puedes intentar de nuevo?'
        : 'There was an error interpreting your command. Can you try again?'
    }];
  }
}

// Parsear comando de creación
function parseCreateCommand(text: string, context: ParserContext): Command | null {
  const words = text.toLowerCase().split(/\s+/);
  
  // Detectar forma
  let shape: Shape | null = null;
  let shapeName: string | null = null;
  
  for (const word of words) {
    const detectedShape = detectShape(word);
    if (detectedShape) {
      shape = detectedShape;
      shapeName = word;
      break;
    }
  }
  
  if (!shape) return null;
  
  // Detectar nombre personalizado
  const customName = extractCustomName(text, shapeName!);
  
  // Detectar color
  const color = detectColor(text);
  
  // Detectar posición
  const position = extractPosition(text);
  
  return {
    action: 'add_primitive' as const,
    shape,
    name: customName,
    color: color || undefined,
    position: position || undefined
  };
}

// Parsear comando de eliminación
function parseDeleteCommand(text: string, context: ParserContext): Command[] {
  const target = extractTarget(text, context);
  
  if (!target) {
    return [{
      action: 'ask' as const,
      message: context.language === 'es' 
        ? '¿Qué objeto quieres borrar?'
        : 'Which object do you want to delete?'
    }];
  }
  
  return [{
    action: 'delete' as const,
    target
  }];
}

// Parsear comando de color
function parseColorCommand(text: string, context: ParserContext): Command[] {
  const color = detectColor(text);
  const target = extractTarget(text, context);
  
  if (!color) {
    return [{
      action: 'ask' as const,
      message: context.language === 'es' 
        ? '¿De qué color quieres pintarlo?'
        : 'What color do you want to paint it?'
    }];
  }
  
  if (!target) {
    return [{
      action: 'ask' as const,
      message: context.language === 'es' 
        ? '¿Qué objeto quieres colorear?'
        : 'Which object do you want to color?'
    }];
  }
  
  return [{
    action: 'set_material' as const,
    target,
    color
  }];
}

// Parsear comando de movimiento
function parseMoveCommand(text: string, context: ParserContext): Command[] {
  const position = extractPosition(text);
  const target = extractTarget(text, context);
  
  if (!position) {
    return [{
      action: 'ask' as const,
      message: context.language === 'es' 
        ? '¿A dónde quieres moverlo? Ejemplo: "a x1 y2 z0"'
        : 'Where do you want to move it? Example: "to x1 y2 z0"'
    }];
  }
  
  if (!target) {
    return [{
      action: 'ask' as const,
      message: context.language === 'es' 
        ? '¿Qué objeto quieres mover?'
        : 'Which object do you want to move?'
    }];
  }
  
  return [{
    action: 'set_position' as const,
    target,
    position
  }];
}

// Parsear comando de posicionamiento relativo
function parsePlaceCommand(text: string, context: ParserContext): Command[] {
  const { target, base } = extractPlacementTargets(text, context);
  
  if (!target || !base) {
    return [{
      action: 'ask' as const,
      message: context.language === 'es' 
        ? '¿Qué objeto quieres colocar y sobre cuál?'
        : 'Which object do you want to place and on which one?'
    }];
  }
  
  return [{
    action: 'place_above' as const,
    target,
    base,
    gap: 0.1
  }];
}

// Extraer nombre personalizado del texto
function extractCustomName(text: string, shapeName: string): string | undefined {
  const patterns = [
    // Español
    /llamado\s+([a-zA-ZáéíóúÁÉÍÓÚñÑ0-9]+)/i,
    /llamada\s+([a-zA-ZáéíóúÁÉÍÓÚñÑ0-9]+)/i,
    /de\s+nombre\s+([a-zA-ZáéíóúÁÉÍÓÚñÑ0-9]+)/i,
    /que\s+se\s+llame\s+([a-zA-ZáéíóúÁÉÍÓÚñÑ0-9]+)/i,
    // Inglés
    /named\s+([a-zA-Z0-9]+)/i,
    /called\s+([a-zA-Z0-9]+)/i,
    /name\s+([a-zA-Z0-9]+)/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return undefined;
}

// Extraer posición del texto
function extractPosition(text: string): Vec3 | null {
  // Patrones para coordenadas
  const patterns = [
    // x1 y2 z3
    /x\s*(-?\d+(?:\.\d+)?)\s+y\s*(-?\d+(?:\.\d+)?)\s+z\s*(-?\d+(?:\.\d+)?)/i,
    // en x1 y2 z3
    /en\s+x\s*(-?\d+(?:\.\d+)?)\s+y\s*(-?\d+(?:\.\d+)?)\s+z\s*(-?\d+(?:\.\d+)?)/i,
    // at x1 y2 z3
    /at\s+x\s*(-?\d+(?:\.\d+)?)\s+y\s*(-?\d+(?:\.\d+)?)\s+z\s*(-?\d+(?:\.\d+)?)/i,
    // posición x1 y2 z3
    /posición\s+x\s*(-?\d+(?:\.\d+)?)\s+y\s*(-?\d+(?:\.\d+)?)\s+z\s*(-?\d+(?:\.\d+)?)/i,
    // position x1 y2 z3
    /position\s+x\s*(-?\d+(?:\.\d+)?)\s+y\s*(-?\d+(?:\.\d+)?)\s+z\s*(-?\d+(?:\.\d+)?)/i,
    // (x, y, z)
    /\(\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\)/i,
    // x:1 y:2 z:3
    /x\s*:\s*(-?\d+(?:\.\d+)?)\s+y\s*:\s*(-?\d+(?:\.\d+)?)\s+z\s*:\s*(-?\d+(?:\.\d+)?)/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return [
        parseFloat(match[1]),
        parseFloat(match[2]),
        parseFloat(match[3])
      ];
    }
  }
  
  return null;
}

// Extraer objetivo del texto
function extractTarget(text: string, context: ParserContext): string | null {
  const words = text.toLowerCase().split(/\s+/);
  
  // Buscar pronombres
  for (const word of words) {
    if (isPronoun(word) && context.lastMentionedObject) {
      return context.lastMentionedObject;
    }
  }
  
  // Buscar nombres específicos
  for (const objectName of context.currentObjects) {
    if (text.toLowerCase().includes(objectName.toLowerCase())) {
      return objectName;
    }
  }
  
  // Buscar formas mencionadas
  for (const word of words) {
    const shape = detectShape(word);
    if (shape) {
      // Buscar el primer objeto de este tipo
      const matchingObject = context.currentObjects.find(name => 
        name.toLowerCase().includes(shape)
      );
      if (matchingObject) {
        return matchingObject;
      }
    }
  }
  
  return null;
}

// Extraer objetivos para posicionamiento
function extractPlacementTargets(text: string, context: ParserContext): { target: string | null, base: string | null } {
  const normalized = text.toLowerCase();
  
  // Patrones para "arriba de", "encima de", "sobre"
  const patterns = [
    // Español
    /(.+?)\s+(?:arriba|encima|sobre)\s+(?:de\s+)?(.+)/i,
    /(?:pon|poner|colocar|coloca)\s+(.+?)\s+(?:arriba|encima|sobre)\s+(?:de\s+)?(.+)/i,
    // Inglés
    /(.+?)\s+(?:above|on top of|over)\s+(.+)/i,
    /(?:put|place)\s+(.+?)\s+(?:above|on top of|over)\s+(.+)/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const targetText = match[1].trim();
      const baseText = match[2].trim();
      
      const target = findObjectByText(targetText, context);
      const base = findObjectByText(baseText, context);
      
      return { target, base };
    }
  }
  
  return { target: null, base: null };
}

// Encontrar objeto por texto
function findObjectByText(text: string, context: ParserContext): string | null {
  const normalized = text.toLowerCase();
  
  // Buscar por nombre exacto
  for (const objectName of context.currentObjects) {
    if (normalized.includes(objectName.toLowerCase())) {
      return objectName;
    }
  }
  
  // Buscar por forma
  const shape = detectShape(normalized);
  if (shape) {
    const matchingObject = context.currentObjects.find(name => 
      name.toLowerCase().includes(shape)
    );
    if (matchingObject) {
      return matchingObject;
    }
  }
  
  return null;
}

// Detectar intención de comando
export function detectCommandIntent(text: string): string {
  const normalized = text.toLowerCase();
  
  if (isDeleteCommand(normalized)) return 'delete';
  if (isColorCommand(normalized)) return 'color';
  if (isMoveCommand(normalized)) return 'move';
  if (isPlaceCommand(normalized)) return 'place';
  
  // Buscar formas para comando de creación
  const words = normalized.split(/\s+/);
  for (const word of words) {
    if (detectShape(word)) return 'create';
  }
  
  return 'unknown';
}

// Validar comando
export function validateCommand(command: Command): boolean {
  switch (command.action) {
    case 'add_primitive':
      return !!command.shape;
    case 'delete':
      return !!command.target;
    case 'set_material':
      return !!command.target;
    case 'set_position':
      return !!command.target && !!command.position;
    case 'place_above':
      return !!command.target && !!command.base;
    case 'ask':
      return !!command.message;
    default:
      return false;
  }
}

// Función para generar respuesta en lenguaje natural
export function generateResponse(commands: Command[], language: 'es' | 'en' = 'es'): string {
  if (commands.length === 0) {
    return language === 'es' 
      ? 'No se ejecutaron comandos.' 
      : 'No commands were executed.';
  }
  
  const responses: string[] = [];
  
  for (const command of commands) {
    switch (command.action) {
      case 'add_primitive':
        const shapeName = language === 'es' 
          ? getShapeNameES(command.shape)
          : getShapeNameEN(command.shape);
        const name = command.name || `${shapeName}${Date.now()}`;
        responses.push(
          language === 'es' 
            ? `He creado ${shapeName} llamado "${name}"`
            : `I created a ${command.shape} called "${name}"`
        );
        break;
        
      case 'delete':
        responses.push(
          language === 'es' 
            ? `He eliminado "${command.target}"`
            : `I deleted "${command.target}"`
        );
        break;
        
      case 'set_material':
        responses.push(
          language === 'es' 
            ? `He cambiado el color de "${command.target}"`
            : `I changed the color of "${command.target}"`
        );
        break;
        
      case 'set_position':
        responses.push(
          language === 'es' 
            ? `He movido "${command.target}" a la nueva posición`
            : `I moved "${command.target}" to the new position`
        );
        break;
        
      case 'place_above':
        responses.push(
          language === 'es' 
            ? `He colocado "${command.target}" arriba de "${command.base}"`
            : `I placed "${command.target}" above "${command.base}"`
        );
        break;
        
      case 'ask':
        responses.push(command.message);
        break;
    }
  }
  
  return responses.join('. ');
}

// Obtener nombre de forma en español
function getShapeNameES(shape: Shape): string {
  const names = {
    sphere: 'una esfera',
    box: 'un cubo',
    cylinder: 'un cilindro',
    capsule: 'una cápsula',
    plane: 'un plano'
  };
  return names[shape] || shape;
}

// Obtener nombre de forma en inglés
function getShapeNameEN(shape: Shape): string {
  const names = {
    sphere: 'sphere',
    box: 'box',
    cylinder: 'cylinder',
    capsule: 'capsule',
    plane: 'plane'
  };
  return names[shape] || shape;
} 
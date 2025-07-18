import { describe, it, expect } from 'vitest';
import { parseCommand, generateResponse } from './parser';

describe('Parser', () => {
  const mockContext = {
    lastMentionedObject: undefined,
    currentObjects: [],
    language: 'es' as const
  };

  it('should parse create sphere command in Spanish', () => {
    const result = parseCommand('crea una pelota', mockContext);
    expect(result).toHaveLength(1);
    expect(result[0].action).toBe('add_primitive');
    expect((result[0] as any).shape).toBe('sphere');
  });

  it('should parse create sphere command in English', () => {
    const result = parseCommand('create a ball', { ...mockContext, language: 'en' });
    expect(result).toHaveLength(1);
    expect(result[0].action).toBe('add_primitive');
    expect((result[0] as any).shape).toBe('sphere');
  });

  it('should parse create cube with color', () => {
    const result = parseCommand('crea un cubo rojo', mockContext);
    expect(result).toHaveLength(1);
    expect(result[0].action).toBe('add_primitive');
    expect((result[0] as any).shape).toBe('box');
    expect((result[0] as any).color).toBe('#dc2626');
  });

  it('should parse create object with name', () => {
    const result = parseCommand('crea un cubo llamado torre', mockContext);
    expect(result).toHaveLength(1);
    expect(result[0].action).toBe('add_primitive');
    expect((result[0] as any).shape).toBe('box');
    expect((result[0] as any).name).toBe('torre');
  });

  it('should parse delete command', () => {
    const contextWithObjects = {
      ...mockContext,
      currentObjects: ['pelota1', 'cubo1']
    };
    const result = parseCommand('borra la pelota', contextWithObjects);
    expect(result).toHaveLength(1);
    expect(result[0].action).toBe('delete');
    expect((result[0] as any).target).toBe('pelota1');
  });

  it('should parse position command', () => {
    const result = parseCommand('crea una pelota en x1 y2 z3', mockContext);
    expect(result).toHaveLength(1);
    expect(result[0].action).toBe('add_primitive');
    expect((result[0] as any).position).toEqual([1, 2, 3]);
  });

  it('should return ask command for unknown input', () => {
    const result = parseCommand('comando desconocido', mockContext);
    expect(result).toHaveLength(1);
    expect(result[0].action).toBe('ask');
    expect((result[0] as any).message).toContain('específico');
  });

  it('should generate response for commands', () => {
    const commands = [{
      action: 'add_primitive' as const,
      shape: 'sphere' as const,
      name: 'pelota1'
    }];
    const response = generateResponse(commands, 'es');
    expect(response).toContain('He creado');
    expect(response).toContain('pelota1');
  });
});

describe('Color Detection', () => {
  const mockContext = {
    lastMentionedObject: undefined,
    currentObjects: [],
    language: 'es' as const
  };

  it('should detect basic colors in Spanish', () => {
    const result = parseCommand('crea una pelota roja', mockContext);
    expect((result[0] as any).color).toBe('#dc2626');
  });

  it('should detect basic colors in English', () => {
    const result = parseCommand('create a red ball', { ...mockContext, language: 'en' });
    expect((result[0] as any).color).toBe('#dc2626');
  });

  it('should detect light colors', () => {
    const result = parseCommand('crea una pelota rojo claro', mockContext);
    expect((result[0] as any).color).toBe('#f87171');
  });

  it('should detect dark colors', () => {
    const result = parseCommand('crea una pelota azul oscuro', mockContext);
    expect((result[0] as any).color).toBe('#1e3a8a');
  });
});

describe('Position Parsing', () => {
  const mockContext = {
    lastMentionedObject: undefined,
    currentObjects: [],
    language: 'es' as const
  };

  it('should parse coordinates with x y z format', () => {
    const result = parseCommand('crea una pelota en x1 y2 z3', mockContext);
    expect((result[0] as any).position).toEqual([1, 2, 3]);
  });

  it('should parse coordinates with parentheses format', () => {
    const result = parseCommand('crea una pelota en (1, 2, 3)', mockContext);
    expect((result[0] as any).position).toEqual([1, 2, 3]);
  });

  it('should parse negative coordinates', () => {
    const result = parseCommand('crea una pelota en x-1 y2 z-3', mockContext);
    expect((result[0] as any).position).toEqual([-1, 2, -3]);
  });

  it('should parse decimal coordinates', () => {
    const result = parseCommand('crea una pelota en x1.5 y2.7 z3.1', mockContext);
    expect((result[0] as any).position).toEqual([1.5, 2.7, 3.1]);
  });
}); 
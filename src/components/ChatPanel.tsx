import React, { useState, useRef, useEffect } from 'react';
import { useGameSceneStore } from '../state/gameSceneStore';

interface ChatPanelProps {
  onCommand: (command: string) => void;
}

export function ChatPanel({ onCommand }: ChatPanelProps) {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const config = useGameSceneStore(state => state.config);

  // Enfocar el input al montar el componente
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isProcessing) return;

    const command = input.trim();
    setInput('');
    setIsProcessing(true);

    try {
      await onCommand(command);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Sugerencias de comandos
  const suggestions = config.language === 'es' ? [
    'crea una pelota',
    'haz un cubo rojo',
    'pon la pelota arriba del cubo',
    'mueve el cubo a x2 y1 z0',
    'colorea la pelota de verde',
    'borra el cubo',
    'crea un cilindro llamado torre',
    'haz un plano amarillo'
  ] : [
    'create a ball',
    'make a red cube',
    'put the ball above the cube',
    'move the cube to x2 y1 z0',
    'color the ball green',
    'delete the cube',
    'create a cylinder named tower',
    'make a yellow plane'
  ];

  const placeholders = config.language === 'es' ? [
    'Escribe tu comando aquí...',
    'Ej: "crea una pelota azul"',
    'Ej: "mueve el cubo a x1 y2 z0"',
    'Ej: "colorea la esfera de rojo"',
    'Ej: "borra la pelota"'
  ] : [
    'Type your command here...',
    'Ex: "create a blue ball"',
    'Ex: "move the cube to x1 y2 z0"',
    'Ex: "color the sphere red"',
    'Ex: "delete the ball"'
  ];

  const currentPlaceholder = placeholders[Math.floor(Math.random() * placeholders.length)];

  return (
    <div className="p-4 bg-gray-800">
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={currentPlaceholder}
            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            disabled={isProcessing}
          />
          <button
            type="submit"
            disabled={!input.trim() || isProcessing}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-white transition-colors flex items-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                {config.language === 'es' ? 'Procesando...' : 'Processing...'}
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                {config.language === 'es' ? 'Enviar' : 'Send'}
              </>
            )}
          </button>
        </div>
      </form>

      {/* Sugerencias de comandos */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-300 mb-2">
          {config.language === 'es' ? 'Sugerencias:' : 'Suggestions:'}
        </h3>
        <div className="flex flex-wrap gap-2">
          {suggestions.slice(0, 4).map((suggestion, index) => (
            <button
              key={index}
              onClick={() => setInput(suggestion)}
              className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded transition-colors text-gray-300"
              disabled={isProcessing}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Ayuda rápida */}
      <div className="text-xs text-gray-400">
        <details className="cursor-pointer">
          <summary className="hover:text-gray-300">
            {config.language === 'es' ? '💡 Ayuda' : '💡 Help'}
          </summary>
          <div className="mt-2 space-y-1">
            <p><strong>{config.language === 'es' ? 'Crear:' : 'Create:'}</strong> {config.language === 'es' ? 'crea, haz, añade' : 'create, make, add'}</p>
            <p><strong>{config.language === 'es' ? 'Borrar:' : 'Delete:'}</strong> {config.language === 'es' ? 'borra, elimina, quita' : 'delete, remove, destroy'}</p>
            <p><strong>{config.language === 'es' ? 'Mover:' : 'Move:'}</strong> {config.language === 'es' ? 'mueve, coloca' : 'move, place'}</p>
            <p><strong>{config.language === 'es' ? 'Colorear:' : 'Color:'}</strong> {config.language === 'es' ? 'colorea, pinta' : 'color, paint'}</p>
            <p><strong>{config.language === 'es' ? 'Formas:' : 'Shapes:'}</strong> {config.language === 'es' ? 'pelota, cubo, cilindro, plano' : 'ball, cube, cylinder, plane'}</p>
            <p><strong>{config.language === 'es' ? 'Posición:' : 'Position:'}</strong> x1 y2 z0, (1, 2, 0)</p>
            <p><strong>{config.language === 'es' ? 'Colores:' : 'Colors:'}</strong> {config.language === 'es' ? 'rojo, verde, azul, amarillo' : 'red, green, blue, yellow'}</p>
          </div>
        </details>
      </div>
    </div>
  );
} 
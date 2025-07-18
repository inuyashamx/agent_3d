import React from 'react';

export type TransformMode = 'move' | 'rotate' | 'scale' | 'select';

interface TransformToolbarProps {
  mode: TransformMode;
  onModeChange: (mode: TransformMode) => void;
  selectedInstanceId: string | null;
  onDelete?: () => void;
  onDuplicate?: () => void;
}

export function TransformToolbar({ 
  mode, 
  onModeChange, 
  selectedInstanceId, 
  onDelete, 
  onDuplicate 
}: TransformToolbarProps) {
  const tools = [
    {
      id: 'select' as TransformMode,
      icon: '🏠',
      label: 'Seleccionar',
      shortcut: 'Q'
    },
    {
      id: 'move' as TransformMode,
      icon: '↔️',
      label: 'Mover',
      shortcut: 'W'
    },
    {
      id: 'rotate' as TransformMode,
      icon: '🔄',
      label: 'Rotar',
      shortcut: 'E'
    },
    {
      id: 'scale' as TransformMode,
      icon: '📏',
      label: 'Escalar',
      shortcut: 'R'
    }
  ];

  // Atajos de teclado
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement) return; // No activar en inputs
      
      switch (event.key.toLowerCase()) {
        case 'q':
          onModeChange('select');
          break;
        case 'w':
          onModeChange('move');
          break;
        case 'e':
          onModeChange('rotate');
          break;
        case 'r':
          onModeChange('scale');
          break;
        case 'delete':
        case 'backspace':
          if (selectedInstanceId && onDelete) {
            onDelete();
          }
          break;
        case 'd':
          if (event.ctrlKey && selectedInstanceId && onDuplicate) {
            event.preventDefault();
            onDuplicate();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onModeChange, selectedInstanceId, onDelete, onDuplicate]);

  return (
    <div className="bg-gray-800 border-b border-gray-700 p-2 flex items-center justify-between">
      {/* Herramientas de transformación */}
      <div className="flex items-center space-x-1">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => onModeChange(tool.id)}
            className={`
              px-3 py-2 rounded transition-colors text-sm font-medium
              ${mode === tool.id 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }
            `}
            title={`${tool.label} (${tool.shortcut})`}
          >
            <span className="text-lg mr-1">{tool.icon}</span>
            {tool.label}
          </button>
        ))}
      </div>

      {/* Controles de objeto */}
      <div className="flex items-center space-x-2">
        {selectedInstanceId && (
          <>
            <span className="text-sm text-gray-400">
              Objeto seleccionado
            </span>
            <div className="flex space-x-1">
              {onDuplicate && (
                <button
                  onClick={onDuplicate}
                  className="px-2 py-1 bg-green-600 hover:bg-green-500 text-white text-sm rounded"
                  title="Duplicar (Ctrl+D)"
                >
                  📋
                </button>
              )}
              {onDelete && (
                <button
                  onClick={onDelete}
                  className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white text-sm rounded"
                  title="Eliminar (Delete)"
                >
                  🗑️
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Indicadores de atajos */}
      <div className="text-xs text-gray-400">
        <div className="flex space-x-4">
          <span>Q: Seleccionar</span>
          <span>W: Mover</span>
          <span>E: Rotar</span>
          <span>R: Escalar</span>
          <span>Del: Eliminar</span>
          <span>Ctrl+D: Duplicar</span>
        </div>
      </div>
    </div>
  );
} 
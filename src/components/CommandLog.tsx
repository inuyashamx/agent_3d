import React, { useEffect, useRef } from 'react';
import { useGameSceneStore, useGameSceneActions } from '../state/gameSceneStore';
import { Command } from '../state/types';

export function CommandLog() {
  const chatLog = useGameSceneStore(state => state.chatLog);
  const config = useGameSceneStore(state => state.config);
  const { clearChatLog } = useGameSceneActions();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al final cuando se añaden nuevos mensajes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatLog]);

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString(
      config.language === 'es' ? 'es-ES' : 'en-US',
      { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      }
    );
  };

  const formatCommand = (command: any) => {
    if (!command || !command.action) {
      return 'Invalid command';
    }
    
    switch (command.action) {
      case 'add_primitive':
        return `${command.action}: ${command.shape}${command.name ? ` (${command.name})` : ''}${command.color ? ` - ${command.color}` : ''}`;
      case 'delete':
        return `${command.action}: ${command.target}`;
      case 'set_material':
        return `${command.action}: ${command.target} - ${command.color}`;
      case 'set_position':
        return `${command.action}: ${command.target} -> [${command.position.join(', ')}]`;
      case 'place_above':
        return `${command.action}: ${command.target} above ${command.base}`;
      case 'ask':
        return `question: ${command.message}`;
      default:
        return `${command.action}`;
    }
  };

  const getCommandIcon = (command: any) => {
    if (!command || !command.action) {
      return '❌';
    }
    
    switch (command.action) {
      case 'add_primitive':
        return '➕';
      case 'delete':
        return '🗑️';
      case 'set_material':
        return '🎨';
      case 'set_position':
        return '📍';
      case 'place_above':
        return '⬆️';
      case 'ask':
        return '❓';
      default:
        return '⚡';
    }
  };

  if (chatLog.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <div className="text-center">
          <div className="text-4xl mb-4">🤖</div>
          <p className="text-lg mb-2">
            {config.language === 'es' ? 'AGI 3D MVP' : 'AGI 3D MVP'}
          </p>
          <p className="text-sm">
            {config.language === 'es' 
              ? 'Escribe comandos para empezar a crear objetos 3D'
              : 'Type commands to start creating 3D objects'
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-white">
          {config.language === 'es' ? 'Registro de Comandos' : 'Command Log'}
        </h2>
        <button
          onClick={clearChatLog}
          className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 rounded transition-colors"
          title={config.language === 'es' ? 'Limpiar registro' : 'Clear log'}
        >
          {config.language === 'es' ? 'Limpiar' : 'Clear'}
        </button>
      </div>

      {/* Log content */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 chat-log"
      >
        {chatLog.map((entry) => (
          <div
            key={entry.id}
            className={`command-item ${entry.success ? 'success' : 'error'}`}
          >
            {/* Timestamp */}
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-400">
                {formatTimestamp(entry.timestamp)}
              </span>
              <span className={`text-xs px-2 py-1 rounded ${
                entry.success 
                  ? 'bg-green-800 text-green-200' 
                  : 'bg-red-800 text-red-200'
              }`}>
                {entry.success 
                  ? (config.language === 'es' ? 'Exitoso' : 'Success')
                  : (config.language === 'es' ? 'Error' : 'Error')
                }
              </span>
            </div>

            {/* User input */}
            <div className="mb-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-blue-400">👤</span>
                <span className="text-sm font-medium text-white">
                  {config.language === 'es' ? 'Usuario:' : 'User:'}
                </span>
              </div>
              <p className="text-sm text-gray-300 bg-gray-700 p-2 rounded">
                {entry.userInput}
              </p>
            </div>

            {/* Commands */}
            {entry.commands.length > 0 && (
              <div className="mb-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-green-400">⚡</span>
                  <span className="text-sm font-medium text-white">
                    {config.language === 'es' ? 'Comandos:' : 'Commands:'}
                  </span>
                </div>
                <div className="space-y-1">
                  {entry.commands.map((command, index) => (
                    <div
                      key={index}
                      className="text-xs text-gray-400 bg-gray-700 p-2 rounded font-mono flex items-center gap-2"
                    >
                      <span>{getCommandIcon(command)}</span>
                      <span>{formatCommand(command)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Response */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-purple-400">🤖</span>
                <span className="text-sm font-medium text-white">
                  {config.language === 'es' ? 'Respuesta:' : 'Response:'}
                </span>
              </div>
              <p className="text-sm text-gray-300 bg-gray-700 p-2 rounded">
                {entry.response}
              </p>
            </div>

            {/* Error details */}
            {entry.error && (
              <div className="mt-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-red-400">⚠️</span>
                  <span className="text-sm font-medium text-red-400">
                    {config.language === 'es' ? 'Error:' : 'Error:'}
                  </span>
                </div>
                <p className="text-xs text-red-300 bg-red-900 p-2 rounded">
                  {entry.error}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 
import React, { useState, useEffect, useRef } from 'react';
import './Prompts.css';

const defaultPrompts = [
  'Find nudity',
  'Find swearing',
  'Find maps of India',
  'Find cigarettes',
  'Find alcohol bottles',
];

interface PromptsProps {
    onSearch: (prompt: string) => void;
}

const Prompts: React.FC<PromptsProps> = ({ onSearch }) => {
  const [prompts, setPrompts] = useState(defaultPrompts);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; index: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    if (editingIndex !== null && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingIndex]);

  const handleContextMenu = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    setContextMenu({ x: e.pageX, y: e.pageY, index });
  };

  const handleDuplicate = (index: number) => {
    const newPrompts = [...prompts];
    newPrompts.splice(index + 1, 0, prompts[index]);
    setPrompts(newPrompts);
    setContextMenu(null);
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditingText(prompts[index]);
    setContextMenu(null);
  };

  const handleUpdatePrompt = () => {
    if (editingIndex === null) return;
    const newPrompts = [...prompts];
    newPrompts[editingIndex] = editingText;
    setPrompts(newPrompts);
    setEditingIndex(null);
    setEditingText('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingText(e.target.value);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleUpdatePrompt();
    }
  };

  return (
    <div className="prompts-container">
      {prompts.map((prompt, index) => (
        <div key={index} onContextMenu={(e) => handleContextMenu(e, index)}>
          {editingIndex === index ? (
            <input
              ref={inputRef}
              type="text"
              value={editingText}
              onChange={handleInputChange}
              onBlur={handleUpdatePrompt}
              onKeyDown={handleInputKeyDown}
              className="prompt-input"
            />
          ) : (
                        <button className="prompt-button" onClick={() => onSearch(prompt)}>{prompt}</button>
          )}
        </div>
      ))}
      {contextMenu && (
        <div className="context-menu" style={{ top: contextMenu.y, left: contextMenu.x }}>
          <div onClick={() => handleEdit(contextMenu.index)}>Edit</div>
          <div onClick={() => handleDuplicate(contextMenu.index)}>Duplicate</div>
        </div>
      )}
    </div>
  );
};

export default Prompts;

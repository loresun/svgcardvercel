'use client';

import { useState, useEffect } from 'react';

export default function GradientEditor() {
  const [text, setText] = useState('');

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  return (
    <div className="editor-container">
      <div className="left-panel">
        <h3>文字内容</h3>
        <textarea 
          id="textInput" 
          placeholder="在此输入文字内容..."
          value={text}
          onChange={handleTextChange}
        />
      </div>
      
      <div className="preview-panel">
        <svg 
          id="cardPreview" 
          className="card-preview" 
          viewBox="0 0 300 400" 
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4f46e5" />
              <stop offset="100%" stopColor="#0ea5e9" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#gradient1)" />
          <rect 
            id="borderRect" 
            width="100%" 
            height="100%" 
            fill="none" 
            stroke="#ffffff" 
            strokeWidth="2" 
            rx="8" 
          />
          <foreignObject x="20" y="20" width="260" height="360">
            <div 
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                color: 'white',
                fontSize: '24px',
                textAlign: 'center',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}
            >
              {text}
            </div>
          </foreignObject>
        </svg>
      </div>
    </div>
  );
}
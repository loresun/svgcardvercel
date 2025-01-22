'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Group {
  id: string;
  name: string;
  pattern: string;
}

export default function Home() {
  const [currentGroup, setCurrentGroup] = useState('all');
  const [allFiles, setAllFiles] = useState<string[]>([]);
  const [currentSortMode, setCurrentSortMode] = useState('default');
  const [modalActive, setModalActive] = useState(false);
  const [currentImage, setCurrentImage] = useState('');
  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    loadGroups();
    loadSVGFiles();
  }, []);

  async function loadGroups() {
    try {
      const response = await fetch('/config/cards.json');
      const config = await response.json();
      setGroups(config.groups);
    } catch (error) {
      console.error('Error loading groups:', error);
    }
  }

  async function loadSVGFiles() {
    try {
      const response = await fetch('/api/list-svg');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const files = await response.json();
      setAllFiles(files);
    } catch (error) {
      console.error('Error loading SVG files:', error);
    }
  }

  function getFileTimestamp(filename: string) {
    const match = filename.match(/\d{8}/);
    return match ? match[0] : '00000000';
  }

  function filterCards() {
    const currentGroupData = groups.find(group => group.id === currentGroup);
    if (!currentGroupData) return [];

    const regex = new RegExp(currentGroupData.pattern);
    const filteredFiles = allFiles.filter(file => regex.test(file));
    
    if (currentSortMode === 'time') {
      filteredFiles.sort((a, b) => getFileTimestamp(b).localeCompare(getFileTimestamp(a)));
    }
    
    return filteredFiles;
  }

  async function downloadAsPNG(svgUrl: string) {
    try {
      const img = document.createElement('img');
      img.src = svgUrl;
      await new Promise((resolve) => (img.onload = resolve));

      const canvas = document.createElement('canvas');
      canvas.width = 900;
      canvas.height = 1200;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(img, 0, 0, 900, 1200);
      const pngUrl = canvas.toDataURL('image/png');
      
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = 'card.png';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (error) {
      console.error('Error downloading PNG:', error);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="sidebar">
        <div className="sidebar-title">SVG卡片查看器</div>
        <Link href="/gradient" className="create-new">创建渐变卡片</Link>
        <ul className="group-list">
          {groups.map(group => (
            <li
              key={group.id}
              className={`group-item ${group.id === currentGroup ? 'active' : ''}`}
              onClick={() => setCurrentGroup(group.id)}
            >
              {group.name}
            </li>
          ))}
        </ul>
      </div>
      <div className="main-content flex-1 p-4">
        <div className="sort-controls">
          <select
            className="sort-select"
            value={currentSortMode}
            onChange={(e) => setCurrentSortMode(e.target.value)}
          >
            <option value="default">默认排序</option>
            <option value="time">时间排序</option>
          </select>
        </div>
        <div className="card-container">
          {filterCards().map((file, index) => (
            <div key={index} className="card" onClick={() => {
              setCurrentImage(`/svg/${file}`);
              setModalActive(true);
            }}>
              <img src={`/svg/${file}`} alt={file} />
              <div className="card-name">{file}</div>
            </div>
          ))}
        </div>
      </div>
      {modalActive && (
        <div className="modal active" onClick={(e) => {
          if (e.target === e.currentTarget) setModalActive(false);
        }}>
          <div className="modal-content">
            <span className="modal-close" onClick={() => setModalActive(false)}>&times;</span>
            <img src={currentImage} alt="放大预览" />
            <button className="download-btn" onClick={() => downloadAsPNG(currentImage)}>下载 PNG</button>
          </div>
        </div>
      )}
    </div>
  );
}

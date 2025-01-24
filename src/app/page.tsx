'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

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
  const [svgCode, setSvgCode] = useState('');
  const modalContentRef = useRef<HTMLDivElement>(null);

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
      const files = await response.json();
      setAllFiles(files);
    } catch (error) {
      console.error('Error loading SVG files:', error);
    }
  }

  function filterCards() {
    const regex = new RegExp(groups.find(group => group.id === currentGroup)?.pattern || '.*');
    const filteredFiles = allFiles.filter(file => regex.test(file));

    if (currentSortMode === 'time') {
      filteredFiles.sort((a, b) => {
        const aTime = new Date(a.match(/(\d{4}-\d{2}-\d{2})/)?.[0] || '1970-01-01').getTime();
        const bTime = new Date(b.match(/(\d{4}-\d{2}-\d{2})/)?.[0] || '1970-01-01').getTime();
        return bTime - aTime;
      });
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

  async function fetchSvgCode(svgUrl: string) {
    try {
      const response = await fetch(svgUrl);
      const code = await response.text();
      setSvgCode(code);
    } catch (error) {
      console.error('Error fetching SVG code:', error);
      setSvgCode('Failed to load SVG code.');
    }
  }

  const handleCardClick = async (file: string) => {
    const svgUrl = `/svg/${file}`;
    setCurrentImage(svgUrl);
    await fetchSvgCode(svgUrl);
    setModalActive(true);
  };

  const handleDownloadSVG = () => {
    if (!currentImage) return;
    const link = document.createElement('a');
    link.href = currentImage;
    link.download = currentImage.split('/').pop() || 'card.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopySVG = () => {
    if (!svgCode) return;
    navigator.clipboard.writeText(svgCode);
    alert('SVG code copied to clipboard!');
  };

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
            <div key={index} className="card" onClick={() => handleCardClick(file)}>
              <Image src={`/svg/${file}`} alt={file} width={150} height={200}  />
              <div className="card-name">{file}</div>
            </div>
          ))}
        </div>
      </div>
      {modalActive && (
        <div className="modal active" onClick={(e) => {
          if (e.target === e.currentTarget) setModalActive(false);
        }}>
          <div className="modal-content" ref={modalContentRef}>
            <span className="modal-close" onClick={() => setModalActive(false)}>&times;</span>
            <div className="modal-image-container">
              <Image src={currentImage} alt="放大预览" width={600} height={800} />
            </div>
            <div className="modal-actions">
              <button className="download-btn" onClick={() => downloadAsPNG(currentImage)}>下载 PNG</button>
              <button className="download-btn" onClick={handleDownloadSVG}>下载 SVG</button>
              <button className="download-btn" onClick={handleCopySVG}>复制 SVG 代码</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

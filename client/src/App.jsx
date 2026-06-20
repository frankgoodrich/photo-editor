import { useState, useRef, useEffect } from 'react';
import './App.css';

function App() {
  const [image, setImage] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);
  const [adjustments, setAdjustments] = useState({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    blur: 0,
  });
  const [activeFilter, setActiveFilter] = useState(null);
  const [zoom, setZoom] = useState(100);
  const [fileName, setFileName] = useState('');
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        setImage(img);
        setOriginalImage(img);
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  }

  useEffect(() => {
    if (!image) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const scale = zoom / 100;
    const w = image.naturalWidth * scale;
    const h = image.naturalHeight * scale;
    canvas.width = w;
    canvas.height = h;

    ctx.filter = getFilterString();
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(image, 0, 0, w, h);
    ctx.filter = 'none';
  }, [image, adjustments, activeFilter, zoom]);

  function getFilterString() {
    const parts = [];
    const { brightness, contrast, saturation, blur } = adjustments;
    parts.push(`brightness(${100 + brightness}%)`);
    parts.push(`contrast(${100 + contrast}%)`);
    parts.push(`saturate(${100 + saturation}%)`);
    if (blur > 0) parts.push(`blur(${blur}px)`);
    if (activeFilter === 'grayscale') parts.push('grayscale(100%)');
    if (activeFilter === 'sepia') parts.push('sepia(100%)');
    if (activeFilter === 'invert') parts.push('invert(100%)');
    if (activeFilter === 'hue-rotate') parts.push('hue-rotate(180deg)');
    return parts.join(' ');
  }

  function handleSlider(name, value) {
    setAdjustments((prev) => ({ ...prev, [name]: Number(value) }));
  }

  function resetAll() {
    setAdjustments({ brightness: 0, contrast: 0, saturation: 0, blur: 0 });
    setActiveFilter(null);
    setImage(originalImage);
  }

  function download() {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = fileName ? `edited-${fileName}` : 'edited-image.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  function zoomIn() { setZoom((z) => Math.min(z + 20, 300)); }
  function zoomOut() { setZoom((z) => Math.max(z - 20, 20)); }

  return (
    <div className="app">
      <aside className="sidebar">
        <h2>Photo Editor</h2>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleUpload}
          hidden
        />
        <button className="btn primary" onClick={() => fileInputRef.current.click()}>
          Open Image
        </button>

        <div className="section">
          <h3>Adjustments</h3>
          {[
            { key: 'brightness', label: 'Brightness', min: -100, max: 100 },
            { key: 'contrast', label: 'Contrast', min: -100, max: 100 },
            { key: 'saturation', label: 'Saturation', min: -100, max: 100 },
            { key: 'blur', label: 'Blur', min: 0, max: 10, step: 0.5 },
          ].map((s) => (
            <div key={s.key} className="slider-group">
              <label>
                {s.label} <span>{adjustments[s.key]}</span>
              </label>
              <input
                type="range"
                min={s.min}
                max={s.max}
                step={s.step || 1}
                value={adjustments[s.key]}
                onChange={(e) => handleSlider(s.key, e.target.value)}
              />
            </div>
          ))}
        </div>

        <div className="section">
          <h3>Filters</h3>
          <div className="filter-grid">
            {[
              { key: 'grayscale', label: 'Grayscale' },
              { key: 'sepia', label: 'Sepia' },
              { key: 'invert', label: 'Invert' },
              { key: 'hue-rotate', label: 'Hue Rotate' },
            ].map((f) => (
              <button
                key={f.key}
                className={`btn filter-btn ${activeFilter === f.key ? 'active' : ''}`}
                onClick={() => setActiveFilter(activeFilter === f.key ? null : f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="section buttons">
          <button className="btn danger" onClick={resetAll}>Reset</button>
          <button className="btn success" onClick={download} disabled={!image}>
            Download
          </button>
        </div>
      </aside>

      <main className="main">
        <div className="toolbar">
          <span>{fileName || 'No image loaded'}</span>
          <div className="zoom-controls">
            <button onClick={zoomOut}>−</button>
            <span>{zoom}%</span>
            <button onClick={zoomIn}>+</button>
          </div>
        </div>
        <div className="canvas-area">
          {image ? (
            <canvas ref={canvasRef} className="editor-canvas" />
          ) : (
            <div className="placeholder" onClick={() => fileInputRef.current.click()}>
              <div className="placeholder-icon">🖼️</div>
              <p>Click to upload an image</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;

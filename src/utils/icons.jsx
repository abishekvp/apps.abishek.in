import React from 'react';
import {
  Terminal,
  Code2,
  Braces,
  FileText,
  Sparkles,
  Image as ImageIcon,
  FileCode,
  Video,
  Globe,
  Crosshair,
  Database,
  Palette,
  Layers,
  Code
} from 'lucide-react';

export function ToolIcon({ name, size = 20, className = '' }) {
  const n = (name || '').toLowerCase().trim();

  switch (n) {
    case 'terminal':
    case 'base64':
      return <Terminal size={size} className={className} />;
    case 'code':
    case 'compiler':
      return <Code2 size={size} className={className} />;
    case 'brackets':
    case 'json':
      return <Braces size={size} className={className} />;
    case 'file-text':
    case 'md':
    case 'markdown':
      return <FileText size={size} className={className} />;
    case 'sparkles':
    case 'prettier':
      return <Sparkles size={size} className={className} />;
    case 'image':
      return <ImageIcon size={size} className={className} />;
    case 'file':
    case 'pdf':
      return <FileCode size={size} className={className} />;
    case 'video':
    case 'youtube':
      return <Video size={size} className={className} />;
    case 'globe':
    case 'portfolio':
      return <Globe size={size} className={className} />;
    case 'target':
    case 'regex':
      return <Crosshair size={size} className={className} />;
    case 'database':
    case 'sql':
      return <Database size={size} className={className} />;
    case 'palette':
    case 'svg':
      return <Palette size={size} className={className} />;
    case 'layers':
    case 'colors':
      return <Layers size={size} className={className} />;
    default:
      return <Code size={size} className={className} />;
  }
}

export function getInitials(name) {
  if (!name) return 'U';
  const clean = name.replace(/\([^)]*\)/g, '').replace(/@\S+/g, '').trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase() || 'U';
}

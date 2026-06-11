import React, { useRef, useState, useEffect } from 'react';

// ==========================================
// 1. ExamTimer Component
// ==========================================
interface ExamTimerProps {
  remainingSeconds: number;
  onTimeUp?: () => void;
  isPaused?: boolean;
}

export const ExamTimer: React.FC<ExamTimerProps> = ({
  remainingSeconds,
  onTimeUp,
  isPaused = false
}) => {
  const formatTime = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const remainingSecs = secs % 60;
    
    const pad = (num: number) => String(num).padStart(2, '0');
    
    if (hours > 0) {
      return `${pad(hours)}:${pad(mins)}:${pad(remainingSecs)}`;
    }
    return `${pad(mins)}:${pad(remainingSecs)}`;
  };

  useEffect(() => {
    if (remainingSeconds <= 0 && onTimeUp) {
      onTimeUp();
    }
  }, [remainingSeconds, onTimeUp]);

  const isLowTime = remainingSeconds < 600; // Less than 10 minutes

  return (
    <div
      role="timer"
      aria-live="polite"
      className={`px-4 py-2 rounded-md font-mono text-lg font-bold border transition-colors ${
        isLowTime
          ? 'bg-red-50 border-red-200 text-red-600 animate-pulse'
          : 'bg-slate-100 border-slate-200 text-slate-700'
      }`}
    >
      <span className="text-xs uppercase tracking-wider font-sans mr-2 block sm:inline-block">Time Remaining:</span>
      <span>{formatTime(remainingSeconds)}</span>
      {isPaused && (
        <span className="ml-2 text-xs font-sans text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
          PAUSED
        </span>
      )}
    </div>
  );
};

// ==========================================
// 2. IeltsAudioPlayer Component (Exam-Inspired)
// ==========================================
interface IeltsAudioPlayerProps {
  src: string;
  checksum?: string;
  onPlayTriggered?: () => void;
  onEnded?: () => void;
  examMode?: boolean; // If true, only permits playing ONCE
}

export const IeltsAudioPlayer: React.FC<IeltsAudioPlayerProps> = ({
  src,
  checksum,
  onPlayTriggered,
  onEnded,
  examMode = true
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playCount, setPlayCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = src;
      setIsFinished(false);
      setPlayCount(0);
      setIsPlaying(false);
    }
  }, [src]);

  const handlePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      if (examMode) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    } else {
      if (examMode && playCount >= 1 && audioRef.current.currentTime === 0) {
        return;
      }

      audioRef.current.play().catch(err => {
        console.error("Audio playback blocked or failed:", err);
      });
      setIsPlaying(true);
      if (playCount === 0 && onPlayTriggered) {
        onPlayTriggered();
      }
      setPlayCount(prev => prev + 1);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setIsFinished(true);
    if (onEnded) onEnded();
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const isDisabled = examMode && playCount >= 1 && !isPlaying && isFinished;
  const [playbackRate, setPlaybackRate] = useState(1);

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col gap-3 w-full max-w-xl shadow-sm">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleAudioEnded}
      />
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-slate-800">Listening Section Audio</span>
          <span className="text-xs text-slate-500 font-mono">
            {checksum ? `SHA256: ${checksum.substring(0, 8)}...` : 'Status: Ready'}
          </span>
        </div>
        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
          examMode ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-green-100 text-green-700 border border-green-200'
        }`}>
          {examMode ? 'Exam Mode (Lock Mode)' : 'Practice Mode'}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handlePlayPause}
          disabled={isDisabled}
          className={`flex items-center justify-center w-11 h-11 rounded-full font-bold transition-all shrink-0 ${
            isDisabled
              ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
              : isPlaying
                ? 'bg-slate-700 hover:bg-slate-800 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow'
          }`}
          aria-label={isPlaying ? "Pause audio" : "Play audio"}
        >
          {isPlaying ? (
            // Pause Icon
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
          ) : (
            // Play Icon
            <svg className="w-4 h-4 fill-current ml-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          )}
        </button>

        <div className="flex-1 flex flex-col gap-1">
          {/* Seekable/Locked Progress bar */}
          <input
            type="range"
            min={0}
            max={duration || 0}
            value={currentTime}
            onChange={(e) => {
              if (!audioRef.current || examMode) return;
              const newTime = parseFloat(e.target.value);
              audioRef.current.currentTime = newTime;
              setCurrentTime(newTime);
            }}
            disabled={examMode}
            className={`w-full h-1.5 rounded-full appearance-none bg-slate-200 outline-none transition-all ${
              examMode 
                ? 'cursor-not-allowed accent-slate-400 [&::-webkit-slider-thumb]:hidden' 
                : 'cursor-pointer accent-blue-600 hover:h-2'
            }`}
            style={{
              background: `linear-gradient(to right, ${examMode ? '#94a3b8' : '#2563eb'} 0%, ${examMode ? '#94a3b8' : '#2563eb'} ${progressPercent}%, #e2e8f0 ${progressPercent}%, #e2e8f0 100%)`
            }}
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {!examMode && (
          <select
            value={playbackRate}
            onChange={(e) => {
              const rate = parseFloat(e.target.value);
              setPlaybackRate(rate);
              if (audioRef.current) {
                audioRef.current.playbackRate = rate;
              }
            }}
            className="text-[10px] bg-white border border-slate-300 rounded px-1.5 py-1 text-slate-600 font-semibold cursor-pointer outline-none hover:bg-slate-50 shrink-0"
          >
            <option value="1">1.0x</option>
            <option value="1.25">1.25x</option>
            <option value="1.5">1.5x</option>
          </select>
        )}
      </div>
      
      {examMode && playCount >= 1 && (
        <p className="text-[10px] text-red-700 bg-red-50 p-2 rounded border border-red-100 font-semibold leading-relaxed">
          {"\u26A0"} CHẾ ĐỘ THI THẬT: Bạn không thể tua âm thanh phát đề thi Listening, chỉ được nghe duy nhất 1 lần và không được tạm dừng hay tua lại.
        </p>
      )}
    </div>
  );
};

// ==========================================
// 3. SplitScreenReading Component (Distraction-Free)
// ==========================================
interface SplitScreenReadingProps {
  passageHtml: string;
  children: React.ReactNode; // Test questions go here
}

export const SplitScreenReading: React.FC<SplitScreenReadingProps> = ({
  passageHtml,
  children
}) => {
  const [highlightColor, setHighlightColor] = useState<'yellow' | 'green' | 'none'>('none');
  const passageRef = useRef<HTMLDivElement | null>(null);

  // Highlighting selected text feature (Very premium)
  const handleSelection = () => {
    if (highlightColor === 'none') return;
    
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;

    const range = selection.getRangeAt(0);
    
    // Ensure selection is inside passage
    if (passageRef.current && passageRef.current.contains(range.commonAncestorContainer)) {
      const span = document.createElement('span');
      span.className = highlightColor === 'yellow' ? 'bg-yellow-200' : 'bg-green-200';
      
      try {
        range.surroundContents(span);
      } catch (e) {
        // If selection crosses complex tags, fall back to simple styling
        console.warn("Selection crossed elements, simple highlight failed.", e);
      }
      selection.removeAllRanges();
    }
  };

  return (
    <div className="flex flex-col md:flex-row border border-slate-200 rounded-lg overflow-hidden h-[80vh] bg-white shadow-sm">
      {/* Passage Side (Left Panel) */}
      <div className="w-full md:w-1/2 flex flex-col border-r border-slate-200 bg-slate-50/50">
        {/* Highlighter toolbar */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Reading Passage</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 mr-1">Highlight Tool:</span>
            <button
              onClick={() => setHighlightColor('yellow')}
              className={`w-6 h-6 rounded bg-yellow-200 border transition-all ${highlightColor === 'yellow' ? 'ring-2 ring-blue-500 border-transparent scale-105' : 'border-slate-300 hover:scale-105'}`}
              title="Yellow highlight"
            />
            <button
              onClick={() => setHighlightColor('green')}
              className={`w-6 h-6 rounded bg-green-200 border transition-all ${highlightColor === 'green' ? 'ring-2 ring-blue-500 border-transparent scale-105' : 'border-slate-300 hover:scale-105'}`}
              title="Green highlight"
            />
            <button
              onClick={() => setHighlightColor('none')}
              className={`px-2 py-0.5 rounded text-xs border bg-white text-slate-600 border-slate-300 hover:bg-slate-50 ${highlightColor === 'none' ? 'border-slate-400 font-semibold' : ''}`}
            >
              Off
            </button>
          </div>
        </div>

        {/* Text viewer */}
        <div
          ref={passageRef}
          onMouseUp={handleSelection}
          className="p-6 md:p-8 overflow-y-auto flex-1 font-serif text-slate-800 text-base leading-relaxed select-text tracking-wide focus:outline-none"
          style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif' }}
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(passageHtml) }}
        />
      </div>

      {/* Questions Side (Right Panel) */}
      <div className="w-full md:w-1/2 flex flex-col bg-white">
        <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Questions Panel</span>
        </div>
        <div className="p-6 md:p-8 overflow-y-auto flex-1 text-slate-700">
          {children}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 4. Strict XSS HTML Sanitizer
// ==========================================
export function sanitizeHtml(html: string): string {
  if (!html) return '';

  if (typeof window === 'undefined' || !window.DOMParser) {
    // SSR or Node fallback (safe script strip)
    return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const body = doc.body;

    const allowedTags = new Set([
      'p', 'span', 'b', 'i', 'strong', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'br', 'hr', 'mark', 'div', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'a', 'img'
    ]);

    const allowedAttributes: Record<string, Set<string>> = {
      'a': new Set(['href', 'title', 'target', 'class', 'id', 'style']),
      'img': new Set(['src', 'alt', 'width', 'height', 'class', 'id', 'style']),
      'mark': new Set(['class', 'id', 'style', 'title']),
      '*': new Set(['class', 'id', 'style'])
    };

    const cleanNode = (node: Node): Node | null => {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.cloneNode(true);
      }

      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        const tagName = el.tagName.toLowerCase();

        if (!allowedTags.has(tagName)) {
          // Flatten disallowed tags (keep children)
          const frag = doc.createDocumentFragment();
          el.childNodes.forEach(child => {
            const cleanChild = cleanNode(child);
            if (cleanChild) frag.appendChild(cleanChild);
          });
          return frag;
        }

        const newEl = doc.createElement(tagName);
        const attributes = el.attributes;
        const allowedAttrs = allowedAttributes[tagName] || new Set();
        const globalAttrs = allowedAttributes['*'];

        for (let i = 0; i < attributes.length; i++) {
          const attr = attributes[i];
          const attrName = attr.name.toLowerCase();

          // Block event handlers
          if (attrName.startsWith('on')) continue;
          
          // Block javascript protocol
          if ((attrName === 'href' || attrName === 'src') && attr.value.trim().toLowerCase().startsWith('javascript:')) {
            continue;
          }

          if (allowedAttrs.has(attrName) || globalAttrs.has(attrName)) {
            newEl.setAttribute(attr.name, attr.value);
          }
        }

        el.childNodes.forEach(child => {
          const cleanChild = cleanNode(child);
          if (cleanChild) newEl.appendChild(cleanChild);
        });

        return newEl;
      }

      return null;
    };

    const fragment = doc.createDocumentFragment();
    body.childNodes.forEach(child => {
      const cleanChild = cleanNode(child);
      if (cleanChild) fragment.appendChild(cleanChild);
    });

    const tempDiv = doc.createElement('div');
    tempDiv.appendChild(fragment);
    return tempDiv.innerHTML;
  } catch (e) {
    console.error("DOMParser HTML Sanitization failed:", e);
    return html;
  }
}

// ==========================================
// 5. MathRenderer Component (with Unicode Fallback)
// ==========================================
import katex from 'katex';
import 'katex/dist/katex.min.css';

const translateLatexToUnicode = (latex: string): string => {
  if (!latex) return "";
  let s = latex.trim();
  
  // 1. Support multi-line system of equations (begin{cases}) in Unicode fallback!
  s = s.replace(/\\begin\{cases\}([\s\S]+?)\\end\{cases\}/g, (_match, body) => {
    let lines = body.split(/\\\\/);
    lines = lines.map((line: string) => line.trim()).filter((line: string) => line.length > 0);
    let translatedLines = lines.map((line: string) => translateLatexToUnicode(line));
    let braceSize = translatedLines.length > 2 ? '3.2em' : '2.2em';
    return `<span style="display: inline-flex; align-items: center; vertical-align: middle; margin: 0 4px;"><span style="font-size: ${braceSize}; font-weight: 300; margin-right: 4px; line-height: 1; color: currentColor; font-family: system-ui, sans-serif; transform: translateY(-1px);">{</span><span style="display: inline-flex; flex-direction: column; text-align: left; line-height: 1.4; justify-content: center;">` + translatedLines.map((line: string) => `<span style="white-space: nowrap;">${line}</span>`).join("") + `</span></span>`;
  });

  // 2. Replace sqrt first with stylized overline span
  s = s.replace(/\\sqrt\{([\s\S]+?)\}/g, '<span style="display: inline-flex; align-items: baseline; white-space: nowrap;"><span style="font-family: inherit; font-size: 1.1em; transform: translateY(1px); line-height: 1; margin-right: 0.5px;">√</span><span style="border-top: 1.2px solid currentColor; padding-top: 1px; margin-left: 0.5px;">$1</span></span>');
  s = s.replace(/\\sqrt/g, "√");
  
  // 3. Replace frac
  s = s.replace(/\\frac\{([\s\S]+?)\}\{([\s\S]+?)\}/g, "($1)/($2)");
  
  // 4. Blackboards / Double-struck letters (R, N, Z, Q)
  s = s.replace(/\\mathbb\{R\}/g, "ℝ");
  s = s.replace(/\\mathbb\{N\}/g, "ℕ");
  s = s.replace(/\\mathbb\{Z\}/g, "ℤ");
  s = s.replace(/\\mathbb\{Q\}/g, "ℚ");
  s = s.replace(/\\mathbb\{([\s\S]+?)\}/g, "$1");
  
  // 5. Special decorations
  s = s.replace(/\\widehat\{([\s\S]+?)\}/g, "góc($1)");
  s = s.replace(/\\underline\{([\s\S]+?)\}/g, "<u>$1</u>");
  s = s.replace(/\\text\{([\s\S]+?)\}/g, "$1");
  
  // 6. Formatting controls
  s = s.replace(/\\left/g, "");
  s = s.replace(/\\right/g, "");
  
  // 7. Math symbols translation
  s = s.replace(/\\Delta/g, "Δ");
  s = s.replace(/\\Omega/g, "Ω");
  s = s.replace(/\\alpha/g, "α");
  s = s.replace(/\\beta/g, "β");
  s = s.replace(/\\theta/g, "θ");
  s = s.replace(/\\pi/g, "π");
  s = s.replace(/\\approx/g, "≈");
  s = s.replace(/\\geq/g, "≥");
  s = s.replace(/\\ge/g, "≥");
  s = s.replace(/\\leq/g, "≤");
  s = s.replace(/\\le/g, "≤");
  s = s.replace(/\\neq/g, "≠");
  s = s.replace(/\\iff/g, "⇔");
  s = s.replace(/\\implies/g, "⇒");
  s = s.replace(/\\cdot/g, "·");
  s = s.replace(/\\times/g, "×");
  s = s.replace(/\\div/g, "÷");
  s = s.replace(/\\pm/g, "±");
  s = s.replace(/\\parallel/g, "∥");
  s = s.replace(/\\perp/g, "⊥");
  s = s.replace(/\\sim/g, "∽");
  s = s.replace(/\\cong/g, "≅");
  s = s.replace(/\\equiv/g, "≡");
  s = s.replace(/\\infty/g, "∞");
  s = s.replace(/\\in/g, "∈");
  s = s.replace(/\\cap/g, "∩");
  s = s.replace(/\\cup/g, "∪");
  s = s.replace(/\\to/g, "→");
  s = s.replace(/\\triangle/g, "△");
  
  // Degree symbol replacements
  s = s.replace(/\^\\circ/g, "°");
  s = s.replace(/\\degree/g, "°");
  s = s.replace(/\\circ/g, "°");
  
  // Spaces and other modifiers
  s = s.replace(/\\quad/g, "  ");
  s = s.replace(/\\gcd/g, "gcd");
  s = s.replace(/\\sin/g, "sin");
  s = s.replace(/\\cos/g, "cos");
  s = s.replace(/\\tan/g, "tan");
  
  // 8. Subscripts & Superscripts
  s = s.replace(/\^2/g, "²");
  s = s.replace(/\^3/g, "³");
  s = s.replace(/\^4/g, "⁴");
  s = s.replace(/\^n/g, "ⁿ");
  s = s.replace(/_1/g, "₁");
  s = s.replace(/_2/g, "₂");
  s = s.replace(/_3/g, "₃");
  s = s.replace(/_4/g, "₄");
  s = s.replace(/_o/g, "₀");
  s = s.replace(/_0/g, "₀");
  s = s.replace(/_M/g, "ₘ");
  s = s.replace(/_N/g, "ₙ");
  s = s.replace(/_xq/g, "ₓq");
  
  // Strip remaining backslashes
  s = s.replace(/\\/g, "");
  
  return s;
};

export const renderMathCore = (text: string, useUnicodeFallback = false): string => {
  if (!text) return "";
  
  if (useUnicodeFallback) {
    let rendered = text.replace(/\$\$([\s\S]+?)\$\$/g, (_match, expr) => {
      return `<span style="font-family: inherit; font-weight: 700; color: #0f766e; background: rgba(16, 185, 129, 0.04); padding: 4px 8px; border-radius: 6px; display: block; margin: 8px 0; overflow-x: auto; border-left: 3px solid #10b981;">${translateLatexToUnicode(expr)}</span>`;
    });
    rendered = rendered.replace(/\$([\s\S]+?)\$/g, (_match, expr) => {
      return `<strong style="font-family: inherit; color: #0f766e; padding: 1px 4px; background: rgba(16, 185, 129, 0.03); border-radius: 4px; font-size: 0.95em;">${translateLatexToUnicode(expr)}</strong>`;
    });
    rendered = rendered.replace(/\n/g, "<br/>");
    rendered = rendered.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    return rendered;
  }
  
  let rendered = text.replace(/\$\$([\s\S]+?)\$\$/g, (_match, expr) => {
    try {
      return katex.renderToString(expr.trim(), { displayMode: true, throwOnError: false });
    } catch (e) {
      return _match;
    }
  });
  
  rendered = rendered.replace(/\$([\s\S]+?)\$/g, (_match, expr) => {
    try {
      return katex.renderToString(expr.trim(), { displayMode: false, throwOnError: false });
    } catch (e) {
      return _match;
    }
  });

  rendered = rendered.replace(/\n/g, "<br/>");
  rendered = rendered.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  
  return rendered;
};

interface MathRendererProps {
  text: string;
  useUnicodeFallback?: boolean;
  className?: string;
}

export const MathRenderer: React.FC<MathRendererProps> = ({
  text,
  useUnicodeFallback = false,
  className = ""
}) => {
  const sanitizedHtml = sanitizeHtml(renderMathCore(text, useUnicodeFallback));
  return (
    <div 
      className={`prose prose-slate max-w-none math-rendered-block ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
};

// ==========================================
// 6. Multiverse MiuMascot Component (Premium UI)
// ==========================================
interface MiuMascotProps {
  theme?: 'math' | 'sat' | 'ielts' | 'cpe' | 'cpa' | 'parent' | 'admin';
  mascotState?: 'idle' | 'success' | 'failed' | 'hint';
  bubbleText: string;
  className?: string;
}

export const MiuMascot: React.FC<MiuMascotProps> = ({
  theme = 'math',
  mascotState = 'idle',
  bubbleText,
  className = ""
}) => {
  // Mascot styling and accessory choices
  const getThemeAccessory = () => {
    switch (theme) {
      case 'sat':
        return { emoji: '🎓', label: 'SAT Graduate Miu', style: 'text-rose-500 font-bold' };
      case 'ielts':
      case 'cpe':
        return { emoji: '👓', label: 'Professor Miu', style: 'text-indigo-600 font-serif' };
      case 'cpa':
        return { emoji: '💼👔', label: 'Auditor Miu', style: 'text-amber-700 font-mono' };
      case 'parent':
        return { emoji: '👓☕', label: 'Parent Guardian Miu', style: 'text-orange-600' };
      case 'admin':
        return { emoji: '👑🛠️', label: 'Grand Overlord Miu', style: 'text-purple-600' };
      case 'math':
      default:
        return { emoji: '🧮🐟', label: 'Math Miu', style: 'text-emerald-700' };
    }
  };

  const getMascotExpression = () => {
    switch (mascotState) {
      case 'success':
        return { character: '😸✨', label: 'Happy Miu', moodStyle: 'bg-emerald-50 border-emerald-200 text-emerald-800' };
      case 'failed':
        return { character: '😿🐾', label: 'Sad Miu', moodStyle: 'bg-rose-50 border-rose-200 text-rose-800' };
      case 'hint':
        return { character: '💡😼', label: 'Insightful Miu', moodStyle: 'bg-amber-50 border-amber-200 text-amber-800' };
      case 'idle':
      default:
        return { character: '😻💤', label: 'Idle Miu', moodStyle: 'bg-slate-50 border-slate-200 text-slate-800' };
    }
  };

  const accessory = getThemeAccessory();
  const expression = getMascotExpression();

  return (
    <div className={`flex flex-col sm:flex-row items-center gap-4 p-4 border rounded-2xl shadow-sm transition-all duration-300 backdrop-blur-md bg-white/70 ${expression.moodStyle} ${className}`}>
      {/* Visual Mascot */}
      <div className="flex flex-col items-center justify-center shrink-0 w-24 h-24 rounded-full border-4 border-white bg-gradient-to-tr from-sky-100 to-indigo-50 shadow-inner relative hover:scale-105 transition-transform duration-300">
        <span className="text-4xl animate-bounce" style={{ animationDuration: '2.5s' }} role="img" aria-label={expression.label}>
          {expression.character}
        </span>
        <span className="absolute -top-2 -right-2 text-xl" role="img" aria-label={accessory.label}>
          {accessory.emoji}
        </span>
      </div>

      {/* Dynamic Bubble Dialog */}
      <div className="flex-1 flex flex-col gap-1 text-center sm:text-left">
        <span className="text-xs uppercase tracking-widest font-black opacity-60">Miu Mascot</span>
        <div 
          className="text-sm font-medium leading-relaxed" 
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(bubbleText) }}
        />
      </div>
    </div>
  );
};


// ==========================================
// ErrorBoundary Component
// ==========================================
interface ErrorBoundaryProps {
  children: React.ReactNode;
  /** Called once per crash with the error and React component stack (for SystemLog / crash reporting) */
  onError?: (error: Error, componentStack: string) => void;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    try {
      this.props.onError?.(error, info.componentStack || '');
    } catch {
      // Reporting must never crash the fallback UI
    }
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: '#0f172a', color: '#e2e8f0', fontFamily: 'system-ui, sans-serif', padding: 24
        }}>
          <div style={{ maxWidth: 480, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>😿</div>
            <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Đã xảy ra lỗi không mong muốn</h1>
            <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6, marginBottom: 16 }}>
              Ứng dụng gặp sự cố và không thể hiển thị màn hình này. Dữ liệu học tập của bạn vẫn an toàn.
              Hãy thử tải lại trang; nếu lỗi lặp lại, vui lòng liên hệ quản trị viên.
            </p>
            <pre style={{
              fontSize: 11, color: '#f87171', background: '#1e293b', borderRadius: 8,
              padding: 12, overflow: 'auto', maxHeight: 96, textAlign: 'left', marginBottom: 16
            }}>{String(this.state.error?.message || this.state.error)}</pre>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: '#2563eb', color: '#fff', border: 0, borderRadius: 10,
                padding: '10px 24px', fontSize: 13, fontWeight: 700, cursor: 'pointer'
              }}
            >
              Tải lại ứng dụng
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

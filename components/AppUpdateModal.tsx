import React, { useState } from 'react';

export interface AppUpdateInfo {
  version: string;
  versionCode: number;
  downloadUrl: string;
  releaseDate?: string;
  title?: string;
  changelog?: string[];
  forceUpdate?: boolean;
}

interface AppUpdateModalProps {
  isOpen: boolean;
  updateInfo: AppUpdateInfo | null;
  currentVersion: string;
  onClose: () => void;
}

export const AppUpdateModal: React.FC<AppUpdateModalProps> = ({
  isOpen,
  updateInfo,
  currentVersion,
  onClose,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen || !updateInfo) return null;

  const handleDownloadAndInstall = () => {
    setIsDownloading(true);
    try {
      // In Capacitor Android, window.open with _system or direct download link opens Android package installer
      const link = document.createElement('a');
      link.href = updateInfo.downloadUrl;
      link.download = 'sneakers-spicy.apk';
      link.target = '_system';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Fallback direct window open
      window.open(updateInfo.downloadUrl, '_system');
    } catch (e) {
      window.location.href = updateInfo.downloadUrl;
    }

    setTimeout(() => {
      setIsDownloading(false);
      if (!updateInfo.forceUpdate) {
        onClose();
      }
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 sm:p-6 select-none animate-fade-in">
      {/* Dark overlay backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md" 
        onClick={() => {
          if (!updateInfo.forceUpdate) onClose();
        }}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#121217] to-zinc-950 rounded-3xl border border-white/10 p-6 sm:p-8 shadow-[0_20px_70px_rgba(0,0,0,0.9)] overflow-hidden animate-scale-in">
        {/* Glowing Red Background Accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header with Pulse Icon & Badge */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-red-600/10 border border-red-600/30 flex items-center justify-center text-red-500 shadow-inner">
              <svg className="w-6 h-6 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
            <div>
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-red-500 block">
                NUEVA ACTUALIZACIÓN
              </span>
              <h3 className="text-xl font-[1000] italic uppercase tracking-tight text-white">
                {updateInfo.title || 'Actualización Disponible'}
              </h3>
            </div>
          </div>

          {!updateInfo.forceUpdate && (
            <button
              onClick={onClose}
              className="p-2 text-zinc-500 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Version Badges */}
        <div className="flex items-center justify-between bg-black/60 border border-white/5 p-3.5 rounded-2xl mb-5">
          <div className="text-center flex-1 border-r border-white/5">
            <span className="text-[9px] font-black uppercase text-zinc-500 tracking-wider block">Versión Actual</span>
            <span className="text-xs font-black text-zinc-400">v{currentVersion}</span>
          </div>
          <div className="px-3 text-red-500 font-black">&rarr;</div>
          <div className="text-center flex-1">
            <span className="text-[9px] font-black uppercase text-red-500 tracking-wider block">Nueva Versión</span>
            <span className="text-xs font-black text-white">v{updateInfo.version}</span>
          </div>
        </div>

        {/* Changelog Section */}
        {updateInfo.changelog && updateInfo.changelog.length > 0 && (
          <div className="space-y-2 mb-6 max-h-48 overflow-y-auto custom-scrollbar pr-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Novedades:</p>
            <ul className="space-y-2">
              {updateInfo.changelog.map((item, idx) => (
                <li key={idx} className="flex items-start space-x-2 text-xs text-zinc-300 font-medium">
                  <span className="text-red-500 font-black mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <button
            onClick={handleDownloadAndInstall}
            disabled={isDownloading}
            className="w-full bg-red-600 hover:bg-red-500 text-white py-4 px-6 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-[0_10px_30px_rgba(239,68,68,0.35)] active:scale-95 flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isDownloading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Iniciando Descarga...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Descargar e Instalar</span>
              </>
            )}
          </button>

          {!updateInfo.forceUpdate && (
            <button
              onClick={onClose}
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-colors"
            >
              Recordar Más Tarde
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppUpdateModal;

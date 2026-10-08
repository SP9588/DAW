/**
 * SP Studio DAW - Primary Application Component
 * Create. Record. Perform. Mix. Master.
 */

import React, { useState, useEffect } from 'react';
import { useDawStore } from './store/useDawStore';
import { TransportBar } from './components/Header/TransportBar';
import { Browser } from './components/Sidebar/Browser';
import { Timeline } from './components/Arrangement/Timeline';
import { MixerPanel } from './components/Mixer/MixerPanel';
import { PianoRoll } from './components/PianoRoll/PianoRoll';
import { MasteringWorkspace } from './components/Mastering/MasteringWorkspace';
import { PerformanceMode } from './components/Performance/PerformanceMode';
import { VocalWorkspace } from './components/Vocal/VocalWorkspace';
import { TrackInspector } from './components/Inspector/TrackInspector';
import { BottomDock } from './components/BottomDock/BottomDock';
import { ExportModal } from './components/Modals/ExportModal';
import { ProjectManagerModal } from './components/Modals/ProjectManagerModal';
import { SettingsModal } from './components/Modals/SettingsModal';
import { AIAssistantModal } from './components/AIAssistant/AIAssistantModal';
import { DesktopDownloadsModal } from './components/Modals/DesktopDownloadsModal';

export default function App() {
  const { state, togglePlay, setPlayheadBeat, undo } = useDawStore();

  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isProjectManagerOpen, setIsProjectManagerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAiProducerOpen, setIsAiProducerOpen] = useState(false);
  const [isDesktopDownloadsOpen, setIsDesktopDownloadsOpen] = useState(false);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'Enter') {
        e.preventDefault();
        setPlayheadBeat(state.transport.loopStartBeat);
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        undo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, setPlayheadBeat, undo, state.transport.loopStartBeat]);

  return (
    <div className="h-screen w-screen flex flex-col bg-[#121316] text-[#e0e2ec] font-sans overflow-hidden select-none">
      {/* Top Transport & Status Bar */}
      <TransportBar
        onOpenExport={() => setIsExportOpen(true)}
        onOpenProjectManager={() => setIsProjectManagerOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAiProducer={() => setIsAiProducerOpen(true)}
        onOpenDesktopDownloads={() => setIsDesktopDownloadsOpen(true)}
      />

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Browser Panel */}
        <Browser />

        {/* Central Active View */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {state.activeView === 'arrangement' && (
            <>
              <Timeline />
              <BottomDock />
            </>
          )}

          {state.activeView === 'mixer' && <MixerPanel />}
          {state.activeView === 'pianoroll' && <PianoRoll />}
          {state.activeView === 'mastering' && <MasteringWorkspace />}
          {state.activeView === 'performance' && <PerformanceMode />}
          {state.activeView === 'vocal' && <VocalWorkspace />}
        </div>

        {/* Right Track Properties Inspector */}
        <TrackInspector />
      </div>

      {/* Modals & Dialogs */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />

      <ProjectManagerModal
        isOpen={isProjectManagerOpen}
        onClose={() => setIsProjectManagerOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <AIAssistantModal
        isOpen={isAiProducerOpen}
        onClose={() => setIsAiProducerOpen(false)}
      />

      <DesktopDownloadsModal
        isOpen={isDesktopDownloadsOpen}
        onClose={() => setIsDesktopDownloadsOpen(false)}
      />
    </div>
  );
}

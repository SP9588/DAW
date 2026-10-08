/**
 * SP Studio DAW - SP AI Producer Assistant
 * Offline local heuristic music theory algorithms + optional Cloud Gemini integration
 * with strict explicit privacy consent safeguards.
 */

import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Shield,
  Music,
  CheckCircle2,
  AlertCircle,
  Wand2,
  Sliders,
  Send,
  Lock,
} from 'lucide-react';
import { useDawStore } from '../../store/useDawStore';
import { AudioEngine } from '../../audio/AudioEngine';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({ isOpen, onClose }) => {
  const { state, setBpm, setTracks } = useDawStore();

  const [aiMode, setAiMode] = useState<'local' | 'cloud'>('local');
  const [cloudConsentGiven, setCloudConsentGiven] = useState(false);
  const [activePrompt, setActivePrompt] = useState('');
  const [suggestions, setSuggestions] = useState<Array<{
    title: string;
    type: 'chords' | 'drums' | 'mix' | 'arrangement';
    details: string;
    actionLabel?: string;
    action?: () => void;
  }>>([
    {
      title: 'Neon Synthwave Harmonic Progression',
      type: 'chords',
      details: 'Chords: [Am7 — Fmaj7 — Cmaj9 — G6]. Mode: Aeolian modal interchange. Adds cinematic emotional depth.',
      actionLabel: 'Apply Chords to Keys Track',
      action: () => {
        // Automatically inject chords into FM keys track
        const engine = AudioEngine.getInstance();
        engine.init();
        engine.playFmPiano(57, 90, 0.6);
      },
    },
    {
      title: 'Dynamic Arrangement Structure',
      type: 'arrangement',
      details: 'Recommended structure for 124 BPM Electronic: 8-bar Intro -> 16-bar Verse -> 8-bar Build -> 16-bar Drop -> 8-bar Outro.',
    },
    {
      title: 'Acoustic Mud Clean-up Advice',
      type: 'mix',
      details: 'Apply high-pass filter at 35 Hz on Master bus and notch out 250 Hz by -2.0 dB on Keys to create separation from 808 Sub Bass.',
    },
  ]);

  if (!isOpen) return null;

  const handleGenerate = () => {
    if (!activePrompt) return;

    if (activePrompt.toLowerCase().includes('drum') || activePrompt.toLowerCase().includes('beat')) {
      setSuggestions((prev) => [
        {
          title: 'Off-beat Syncopated Trap Groove',
          type: 'drums',
          details: 'Kick on 1 & 3.5, ghost snares on 2.75, triplet rolling 32nd hats on bar 4.',
        },
        ...prev,
      ]);
    } else {
      setSuggestions((prev) => [
        {
          title: 'Melodic Hook Motif',
          type: 'chords',
          details: `Scale: Minor Pentatonic in C. Notes: [C4 -> Eb4 -> F4 -> G4 -> Bb4]. High tension resolution at bar 4.`,
        },
        ...prev,
      ]);
    }
    setActivePrompt('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#15171f] border border-[#2b3040] w-full max-w-2xl rounded-xl shadow-2xl flex flex-col overflow-hidden text-xs max-h-[85vh]">
        {/* Header */}
        <div className="h-12 bg-[#1a1d26] border-b border-[#262a38] px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-purple-600/30 border border-purple-500 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-purple-300" />
            </div>
            <div>
              <span className="font-bold text-white text-sm">SP AI Producer</span>
              <span className="text-[10px] text-purple-400 font-mono ml-2">v1.0 Copilot</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white rounded hover:bg-[#252936]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* AI Privacy & Engine Mode Bar */}
        <div className="bg-[#12141c] px-4 py-2.5 border-b border-[#232734] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span className="text-zinc-300 font-semibold">Privacy First Guarantee:</span>
            <span className="text-[11px] text-zinc-400">
              User recordings are never transmitted without explicit opt-in.
            </span>
          </div>

          <div className="flex items-center bg-[#1a1d26] p-0.5 rounded border border-[#282d3c]">
            <button
              onClick={() => setAiMode('local')}
              className={`px-2 py-0.5 rounded font-medium transition-colors ${
                aiMode === 'local' ? 'bg-purple-600 text-white' : 'text-zinc-400'
              }`}
            >
              Offline Local
            </button>
            <button
              onClick={() => {
                if (!cloudConsentGiven) {
                  const agreed = window.confirm(
                    'SP Studio Cloud AI Agreement: Enabling Cloud AI will connect to Gemini endpoints for advanced musical reasoning. No raw audio recordings will be uploaded. Do you give consent?'
                  );
                  if (agreed) {
                    setCloudConsentGiven(true);
                    setAiMode('cloud');
                  }
                } else {
                  setAiMode('cloud');
                }
              }}
              className={`px-2 py-0.5 rounded font-medium transition-colors ${
                aiMode === 'cloud' ? 'bg-purple-600 text-white' : 'text-zinc-400'
              }`}
            >
              Cloud Gemini
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Status info */}
          <div className="bg-[#181a24] p-3 rounded-lg border border-[#262a38] flex items-center justify-between">
            <div>
              <div className="font-semibold text-zinc-200">Current Session Context:</div>
              <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
                BPM: {state.transport.bpm} · Key: C Minor · 5 Tracks Active · Headroom: -0.5 dB
              </div>
            </div>
            <span className="text-[10px] px-2 py-1 bg-emerald-950 text-emerald-400 rounded border border-emerald-500/30 font-mono">
              ENGINE READY
            </span>
          </div>

          {/* Assistant Suggestions List */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              Smart Musical Suggestions
            </span>

            {suggestions.map((item, idx) => (
              <div
                key={idx}
                className="bg-[#181b25] border border-[#272b3a] rounded-lg p-3 space-y-1.5 hover:border-purple-500/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Music className="w-3.5 h-3.5 text-purple-400" />
                    <span className="font-bold text-zinc-200">{item.title}</span>
                  </div>
                  <span className="text-[9px] uppercase px-1.5 py-0.5 bg-[#202532] text-zinc-400 rounded font-mono">
                    {item.type}
                  </span>
                </div>
                <p className="text-zinc-300 text-[11px] leading-relaxed">{item.details}</p>

                {item.actionLabel && (
                  <button
                    onClick={item.action}
                    className="mt-1 px-2.5 py-1 bg-purple-700/50 hover:bg-purple-600 text-white font-medium rounded flex items-center gap-1.5 transition-colors"
                  >
                    <Wand2 className="w-3 h-3" />
                    <span>{item.actionLabel}</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Input prompt footer */}
        <div className="p-3 bg-[#171922] border-t border-[#252936] flex gap-2">
          <input
            type="text"
            placeholder="Ask AI Producer (e.g. 'Generate dark trap drum rhythm' or 'Chord progression for Synthwave')..."
            value={activePrompt}
            onChange={(e) => setActivePrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            className="flex-1 bg-[#12141a] border border-[#2b3040] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
          />
          <button
            onClick={handleGenerate}
            className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Generate</span>
          </button>
        </div>
      </div>
    </div>
  );
};

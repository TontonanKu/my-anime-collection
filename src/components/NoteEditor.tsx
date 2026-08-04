import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NoteEditorProps {
  initialNote: string;
  onSave: (note: string) => void;
}

export function NoteEditor({ initialNote, onSave }: NoteEditorProps) {
  const [note, setNote] = useState(initialNote);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSave(note);
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  };

  return (
    <div className="bg-surface-container-lowest border border-border rounded-xl p-5 ambient-shadow-sm focus-within:border-outline transition-colors">
      <textarea
        className="w-full bg-transparent border-none focus:outline-none focus:ring-0 resize-none text-[15px] text-on-surface placeholder-secondary/60 min-h-[120px] leading-relaxed"
        placeholder="Write your impressions, theories, or favorite moments here..."
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <div className="flex justify-end items-center gap-3 mt-3">
        <AnimatePresence>
          {saved && (
            <motion.span
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="text-xs text-secondary font-mono tracking-wide"
            >
              Saved
            </motion.span>
          )}
        </AnimatePresence>
        <button
          onClick={handleSave}
          className="px-4 py-2 text-[12px] font-mono uppercase tracking-widest text-primary-container hover:bg-primary-container/10 rounded transition-colors flex items-center gap-2 active:scale-95"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
            save
          </span>
          Save Notes
        </button>
      </div>
    </div>
  );
}

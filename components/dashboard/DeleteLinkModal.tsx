import { motion, AnimatePresence } from "motion/react";
import { Trash2 } from "lucide-react";
interface DeleteLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}
export default function DeleteLinkModal({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
}: DeleteLinkModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isDeleting ? onClose : undefined}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          {}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 flex items-center justify-center z-[60] p-4 sm:p-0 pointer-events-none"
          >
            <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden pointer-events-auto">
              <div className="p-6">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-4 border border-red-500/20 mx-auto shadow-inner">
                  <Trash2 className="text-red-500" size={20} strokeWidth={2} />
                </div>
                <h3 className="text-xl font-bold text-text text-center mb-2">Delete Link?</h3>
                <p className="text-sm text-muted text-center mb-6">
                  Are you sure you want to delete this shortened link? This action cannot be undone and the link will stop working immediately.
                </p>
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onClose}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 text-text rounded-xl font-medium hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onConfirm}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-2.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl font-medium hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center cursor-pointer disabled:opacity-50"
                  >
                    {isDeleting ? "Deleting..." : "Delete Link"}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Upload, File, X, Image as ImageIcon } from "lucide-react";

interface GlassDropzoneProps {
  onFileSelect: (file: File | null) => void;
  accept?: string;
  maxSize?: number;
  selectedFile?: File | null;
  className?: string;
}

export const GlassDropzone = ({ 
  onFileSelect, 
  accept = "image/*,.pdf",
  maxSize = 10 * 1024 * 1024,
  selectedFile,
  className 
}: GlassDropzoneProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file && file.size <= maxSize) {
      onFileSelect(file);
    }
  }, [maxSize, onFileSelect]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size <= maxSize) {
      onFileSelect(file);
    }
  };

  const clearFile = () => {
    onFileSelect(null);
  };

  const isImage = selectedFile?.type.startsWith("image/");

  return (
    <div className={cn("relative", className)}>
      <AnimatePresence mode="wait">
        {selectedFile ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="glass-card p-4 flex items-center gap-4"
          >
            <motion.div 
              className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 0.5 }}
            >
              {isImage ? (
                <ImageIcon className="w-6 h-6 text-primary" />
              ) : (
                <File className="w-6 h-6 text-primary" />
              )}
            </motion.div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {selectedFile.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <motion.button
              type="button"
              onClick={clearFile}
              className="p-2 rounded-full hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-4 h-4" />
            </motion.button>
          </motion.div>
        ) : (
          <motion.label
            key="dropzone"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={cn(
              "glass-dropzone flex flex-col items-center justify-center cursor-pointer text-center min-h-[140px]",
              isDragging && "dragging"
            )}
            onDragEnter={handleDragIn}
            onDragLeave={handleDragOut}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept={accept}
              onChange={handleFileInput}
              className="hidden"
            />
            <motion.div
              animate={isDragging ? { scale: 1.1, y: -5 } : { scale: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Upload className={cn(
                "w-10 h-10 mb-3 transition-colors",
                isDragging ? "text-primary" : "text-muted-foreground"
              )} />
            </motion.div>
            <p className="text-sm text-foreground font-medium mb-1">
              Drop your file here or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              Images or PDF up to {maxSize / 1024 / 1024}MB
            </p>
          </motion.label>
        )}
      </AnimatePresence>
    </div>
  );
};

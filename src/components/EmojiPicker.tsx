import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';

interface EmojiPickerProps {
    onEmojiSelect: (emoji: string) => void;
    inputRef?: React.RefObject<HTMLInputElement | null>;
}

export const EmojiPickerComponent: React.FC<EmojiPickerProps> = ({ onEmojiSelect, inputRef }) => {
    const [isOpen, setIsOpen] = useState(false);
    const pickerRef = useRef<HTMLDivElement>(null);

    // Cerrar el picker al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleEmojiClick = (emojiData: EmojiClickData) => {
        onEmojiSelect(emojiData.emoji);
        setIsOpen(false);

        // Enfocar el input después de seleccionar un emoji
        setTimeout(() => {
            if (inputRef?.current) {
                inputRef.current.focus();
            }
        }, 100);
    };

    const handlePickerClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const togglePicker = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsOpen(!isOpen);
    };

    return (
        <div className="emoji-picker-container" ref={pickerRef}>
            <motion.button
                type="button"
                className="emoji-picker-button"
                onClick={togglePicker}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                title="Seleccionar emoji"
            >
                😊
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="emoji-picker-popup"
                        initial={{ opacity: 0, scale: 0.8, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: -10 }}
                        transition={{ duration: 0.2 }}
                        onClick={handlePickerClick}
                    >
                        <EmojiPicker
                            onEmojiClick={handleEmojiClick}
                            autoFocusSearch={false}
                            searchPlaceholder="Buscar emoji..."
                            width={350}
                            height={400}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}; 
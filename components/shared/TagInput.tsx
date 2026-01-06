'use client';

import { useState, KeyboardEvent } from 'react';
import { X, Plus } from 'lucide-react';

interface TagInputProps {
    tags: string[];
    onChange: (tags: string[]) => void;
    placeholder?: string;
}

export default function TagInput({ tags, onChange, placeholder = "Add tags (e.g. 'PR', 'sick', 'travel')..." }: TagInputProps) {
    const [input, setInput] = useState('');

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag();
        } else if (e.key === 'Backspace' && input === '' && tags.length > 0) {
            removeTag(tags.length - 1);
        }
    };

    const addTag = () => {
        const trimmed = input.trim();
        if (trimmed && !tags.includes(trimmed)) {
            onChange([...tags, trimmed]);
            setInput('');
        }
    };

    const removeTag = (index: number) => {
        onChange(tags.filter((_, i) => i !== index));
    };

    return (
        <div className="w-full">
            <div className="flex flex-wrap items-center gap-2 p-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 focus-within:ring-2 ring-indigo-500/20 transition-all">
                {tags.map((tag, index) => (
                    <span
                        key={tag}
                        className="flex items-center gap-1 px-2 py-1 rounded-md bg-indigo-50 dark:bg-indigo-900/30 text-xs font-medium text-indigo-600 dark:text-indigo-400 animate-in zoom-in duration-200"
                    >
                        {tag}
                        <button
                            type="button"
                            onClick={() => removeTag(index)}
                            className="hover:text-indigo-800 dark:hover:text-indigo-200"
                        >
                            <X size={12} />
                        </button>
                    </span>
                ))}

                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={addTag}
                    placeholder={tags.length === 0 ? placeholder : ''}
                    className="flex-1 min-w-[120px] bg-transparent outline-none text-sm placeholder:text-gray-400"
                />
            </div>
            <p className="text-xs text-gray-400 mt-1.5 px-1">
                Press Enter or comma to add.
            </p>
        </div>
    );
}

"use client";

import { useRef, useState, KeyboardEvent } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const MAX_TAGS = 5;
const MIN_TAG_LENGTH = 2;
const MAX_TAG_LENGTH = 24;

interface KeywordsInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function KeywordsInput({
  value,
  onChange,
  placeholder = "Pievieno prasmi un spied Enter...",
  className,
  disabled,
}: KeywordsInputProps) {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = (raw: string) => {
    const tag = raw.trim();
    if (
      tag &&
      tag.length >= MIN_TAG_LENGTH &&
      tag.length <= MAX_TAG_LENGTH &&
      !value.includes(tag) &&
      value.length < MAX_TAGS
    ) {
      onChange([...value, tag]);
    }
    setInputValue("");
  };

  const removeTag = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === "Backspace" && inputValue === "" && value.length > 0) {
      removeTag(value.length - 1);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw.endsWith(",")) {
      addTag(raw.slice(0, -1));
    } else {
      // Enforce max character length in the input itself
      setInputValue(raw.slice(0, MAX_TAG_LENGTH));
    }
  };

  return (
    <div
      className={cn(
        "border-input ring-offset-background focus-within:ring-ring flex min-h-10 w-full flex-wrap gap-1.5 rounded-md border bg-transparent px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-offset-2",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
      onClick={() => inputRef.current?.focus()}
    >
      {value.map((tag, index) => (
        <span
          key={index}
          className="bg-primary/10 text-primary inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium"
        >
          {tag}
          {!disabled && (
            <button
              type="button"
              aria-label={`Noņemt "${tag}"`}
              onClick={(e) => {
                e.stopPropagation();
                removeTag(index);
              }}
              className="hover:text-destructive ml-0.5 rounded-sm outline-none transition-colors focus-visible:ring-1"
            >
              <X className="size-3" />
            </button>
          )}
        </span>
      ))}
      {value.length < MAX_TAGS && (
        <input
          ref={inputRef}
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? placeholder : ""}
          disabled={disabled}
          className="placeholder:text-muted-foreground min-w-[120px] flex-1 bg-transparent outline-none disabled:cursor-not-allowed"
        />
      )}
    </div>
  );
}

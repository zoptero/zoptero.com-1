"use client";

import { Delimiter, type Tag, TagInput } from "emblor";
import { useId, useMemo, useState } from "react";

import { cn } from "@/lib/utils";

const MAX_TAGS = 5;
const MIN_TAG_LENGTH = 2;
const MAX_TAG_LENGTH = 24;

interface Input25Props {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

function normalizeTag(value: string): string {
  return value.trim().toLowerCase();
}

export function Input25({
  value,
  onChange,
  placeholder = "Piem., elektriķis, seo, galdnieks",
  className,
  disabled,
}: Input25Props) {
  const id = useId();
  const [activeTagIndex, setActiveTagIndex] = useState<number | null>(null);

  const tags = useMemo<Tag[]>(
    () => value.map((tag, index) => ({ id: `${tag}-${index}`, text: tag })),
    [value],
  );

  return (
    <TagInput
      activeTagIndex={activeTagIndex}
      addOnPaste
      className={className}
      delimiter={Delimiter.Comma}
      disabled={disabled}
      id={id}
      inlineTags
      maxLength={MAX_TAG_LENGTH}
      maxTags={MAX_TAGS}
      minLength={MIN_TAG_LENGTH}
      onTagAdd={() => {
        setActiveTagIndex(null);
      }}
      onTagRemove={() => {
        setActiveTagIndex(null);
      }}
      placeholder={placeholder}
      placeholderWhenFull="Sasniegts limits"
      setActiveTagIndex={setActiveTagIndex}
      setTags={(nextTags) => {
        const resolvedTags = typeof nextTags === "function" ? nextTags(tags) : nextTags;
        const normalizedTags = resolvedTags
          .map((tag) => normalizeTag(tag.text))
          .filter(Boolean)
          .filter((tag, index, items) => items.indexOf(tag) === index)
          .slice(0, MAX_TAGS);
        onChange(normalizedTags);
      }}
      styleClasses={{
        inlineTagsContainer: cn(
          "border-input min-h-10 rounded-md bg-background px-3 py-2 shadow-xs transition-[color,box-shadow] outline-none",
          "focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50",
          disabled && "cursor-not-allowed opacity-50",
        ),
        input: "h-7 min-w-[120px] w-full px-1 shadow-none focus-visible:ring-0",
        tag: {
          body: "bg-primary/10 text-primary hover:bg-primary/10 relative h-7 rounded-md border border-transparent ps-2 pe-7 text-xs font-medium",
          closeButton:
            "text-primary/70 hover:text-primary absolute -inset-y-px -end-px flex size-7 rounded-e-md p-0 outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        },
      }}
      tags={tags}
      validateTag={(tag) => {
        const normalized = normalizeTag(tag);
        return (
          normalized.length >= MIN_TAG_LENGTH &&
          normalized.length <= MAX_TAG_LENGTH &&
          !value.includes(normalized)
        );
      }}
    />
  );
}

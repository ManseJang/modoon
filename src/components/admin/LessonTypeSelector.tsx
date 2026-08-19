"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Plus } from "lucide-react";

export default function LessonTypeSelector({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (types: string[]) => void;
}) {
  const [allTypes, setAllTypes] = useState<string[] | null>(null);
  const [newType, setNewType] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [showAddInput, setShowAddInput] = useState(false);

  useEffect(() => {
    fetch("/api/admin/lesson-types")
      .then((res) => res.json())
      .then((data) => setAllTypes(data.types ?? []));
  }, []);

  function toggle(type: string) {
    if (selected.includes(type)) {
      onChange(selected.filter((t) => t !== type));
    } else {
      onChange([...selected, type]);
    }
  }

  async function handleAddType(e: FormEvent) {
    e.preventDefault();
    const name = newType.trim();
    if (!name || isAdding) return;
    setIsAdding(true);
    try {
      const res = await fetch("/api/admin/lesson-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (res.ok) {
        setAllTypes(data.types);
        onChange([...selected, name]);
        setNewType("");
        setShowAddInput(false);
      }
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-foreground">학생참여중심 수업 유형 (선택)</label>
      <div className="flex flex-wrap gap-1.5">
        {allTypes === null ? (
          <span className="text-xs text-muted">불러오는 중...</span>
        ) : (
          allTypes.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => toggle(type)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                selected.includes(type)
                  ? "border-accent bg-accent-light text-accent"
                  : "border-border text-foreground/70 hover:bg-foreground/5"
              }`}
            >
              {type}
            </button>
          ))
        )}

        {showAddInput ? (
          <form onSubmit={handleAddType} className="flex items-center gap-1">
            <input
              autoFocus
              type="text"
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
              onBlur={() => {
                if (!newType.trim()) setShowAddInput(false);
              }}
              placeholder="새 유형 이름"
              maxLength={20}
              className="w-28 rounded-full border border-border bg-background px-3 py-1.5 text-xs outline-none focus:border-primary"
            />
            <button
              type="submit"
              disabled={isAdding || !newType.trim()}
              className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
            >
              추가
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setShowAddInput(true)}
            className="flex items-center gap-1 rounded-full border border-dashed border-border px-3 py-1.5 text-xs font-semibold text-muted hover:bg-foreground/5"
          >
            <Plus size={13} />
            새 유형 추가
          </button>
        )}
      </div>
    </div>
  );
}

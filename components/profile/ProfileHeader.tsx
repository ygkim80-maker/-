"use client";

import { useState } from "react";
import { SealCheck, PencilSimple, Check } from "@phosphor-icons/react";
import { myProfile } from "@/lib/mock-data";

export function ProfileHeader() {
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState(myProfile.bio);
  const [draft, setDraft] = useState(bio);

  function save() {
    setBio(draft);
    setEditing(false);
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 sm:p-7">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xl font-extrabold text-accent-text">
            {myProfile.name[0]}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-xl font-extrabold text-foreground">
                {myProfile.name}
              </h1>
              {myProfile.verified && (
                <SealCheck size={18} weight="fill" className="text-accent-text" />
              )}
            </div>
            <p className="mt-0.5 text-sm text-muted">만 {myProfile.age}세</p>

            {editing ? (
              <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  className="w-full max-w-sm rounded-lg border border-border-strong bg-background px-3 py-1.5 text-sm text-foreground focus:border-accent focus:outline-none"
                />
                <button
                  type="button"
                  onClick={save}
                  className="flex items-center justify-center gap-1 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground"
                >
                  <Check size={14} weight="bold" />
                  저장
                </button>
              </div>
            ) : (
              <p className="mt-2 text-sm text-foreground/80">{bio}</p>
            )}
          </div>
        </div>

        {!editing && (
          <button
            type="button"
            onClick={() => {
              setDraft(bio);
              setEditing(true);
            }}
            className="flex shrink-0 items-center gap-1.5 self-start rounded-lg border border-border-strong px-3 py-2 text-sm font-medium text-muted hover:text-foreground"
          >
            <PencilSimple size={15} />
            프로필 수정
          </button>
        )}
      </div>
    </div>
  );
}

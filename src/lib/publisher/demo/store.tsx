"use client";

import { createContext, useContext, useReducer, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import { MOCK_POSTS } from "./mock-data";
import type { DemoPost } from "./types";

export type DemoActivity = {
  id: string;
  at: string;
  message: string;
  postId?: string;
};

type State = {
  posts: DemoPost[];
  activities: DemoActivity[];
};

type Action =
  | { type: "ADD_POST"; post: DemoPost }
  | { type: "UPDATE_POST"; id: string; patch: Partial<DemoPost> }
  | { type: "LOG_ACTIVITY"; activity: DemoActivity }
  | { type: "RESET" }
  | { type: "HYDRATE"; state: State };

const STORAGE_KEY = "demo-store-r2-v1"; // r2: คนละ key กับรอบแรก กัน state เก่าค้างใน browser

function now(): string {
  return new Date().toISOString();
}

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "HYDRATE":
      return action.state;
    case "RESET":
      return { posts: MOCK_POSTS, activities: [] };
    case "ADD_POST":
      return { ...state, posts: [...state.posts, action.post] };
    case "UPDATE_POST":
      return {
        ...state,
        posts: state.posts.map((p) =>
          p.id === action.id ? { ...p, ...action.patch } : p
        ),
      };
    case "LOG_ACTIVITY":
      return { ...state, activities: [action.activity, ...state.activities] };
    default:
      return state;
  }
}

const INITIAL: State = { posts: MOCK_POSTS, activities: [] };

type StoreContextValue = {
  posts: DemoPost[];
  activities: DemoActivity[];
  addPost: (post: Omit<DemoPost, "id">) => DemoPost;
  updatePost: (id: string, patch: Partial<DemoPost>) => void;
  approvePost: (id: string) => void;
  rejectPost: (id: string, reason?: string) => void;
  schedulePost: (id: string, whenISO: string) => void;
  publishPost: (id: string) => void;
  resetDemo: () => void;
};

const StoreContext = createContext<StoreContextValue | null>(null);

export function DemoStoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL);

  // SSR-safe hydration from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as State;
        dispatch({ type: "HYDRATE", state: saved });
      }
    } catch {
      // ignore parse errors — keep initial state
    }
  }, []);

  // Persist to localStorage on every state change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore quota errors
    }
  }, [state]);

  const log = useCallback(
    (message: string, postId?: string) => {
      dispatch({
        type: "LOG_ACTIVITY",
        activity: { id: uid(), at: now(), message, postId },
      });
    },
    []
  );

  const addPost = useCallback(
    (post: Omit<DemoPost, "id">): DemoPost => {
      const newPost: DemoPost = { ...post, id: `p-${uid()}` };
      dispatch({ type: "ADD_POST", post: newPost });
      log(`Created: ${newPost.title}`, newPost.id);
      return newPost;
    },
    [log]
  );

  const updatePost = useCallback(
    (id: string, patch: Partial<DemoPost>) => {
      dispatch({ type: "UPDATE_POST", id, patch });
    },
    []
  );

  const approvePost = useCallback(
    (id: string) => {
      dispatch({ type: "UPDATE_POST", id, patch: { status: "creative_approved" } });
      const post = state.posts.find((p) => p.id === id);
      log(`Approved: ${post?.title ?? id}`, id);
    },
    [state.posts, log]
  );

  const rejectPost = useCallback(
    (id: string, reason?: string) => {
      dispatch({ type: "UPDATE_POST", id, patch: { status: "rejected" } });
      const post = state.posts.find((p) => p.id === id);
      log(`Rejected: ${post?.title ?? id}${reason ? ` — ${reason}` : ""}`, id);
    },
    [state.posts, log]
  );

  const schedulePost = useCallback(
    (id: string, whenISO: string) => {
      dispatch({
        type: "UPDATE_POST",
        id,
        patch: { status: "scheduled", scheduledAt: whenISO },
      });
      const post = state.posts.find((p) => p.id === id);
      log(`Scheduled: ${post?.title ?? id} → ${whenISO}`, id);
    },
    [state.posts, log]
  );

  const publishPost = useCallback(
    (id: string) => {
      dispatch({
        type: "UPDATE_POST",
        id,
        patch: { status: "published", scheduledAt: now() },
      });
      const post = state.posts.find((p) => p.id === id);
      log(`Published: ${post?.title ?? id}`, id);
    },
    [state.posts, log]
  );

  const resetDemo = useCallback(() => {
    dispatch({ type: "RESET" });
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  return (
    <StoreContext.Provider
      value={{
        posts: state.posts,
        activities: state.activities,
        addPost,
        updatePost,
        approvePost,
        rejectPost,
        schedulePost,
        publishPost,
        resetDemo,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useDemoStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useDemoStore must be used inside DemoStoreProvider");
  return ctx;
}

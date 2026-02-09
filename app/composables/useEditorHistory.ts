import { useDebounceFn, useEventListener } from "@vueuse/core";
import type { EditorPersistence } from "~/utils/editor-types";

interface HistoryEntry {
  snapshot: string;
  timestamp: number;
}

const MAX_HISTORY = 50;

/**
 * 编辑器 Undo / Redo 历史记录管理
 * 基于 JSON 快照实现，监听 store 变化自动记录。
 */
export function useEditorHistory(store: Ref<EditorPersistence>) {
  const undoStack = ref<HistoryEntry[]>([]);
  const redoStack = ref<HistoryEntry[]>([]);

  /** 是否正在恢复快照（避免递归触发 watch） */
  let isRestoring = false;

  const canUndo = computed(() => undoStack.value.length > 0);
  const canRedo = computed(() => redoStack.value.length > 0);

  function takeSnapshot(): string {
    return JSON.stringify(store.value);
  }

  function pushSnapshot(snapshot: string): void {
    undoStack.value.push({
      snapshot,
      timestamp: Date.now(),
    });
    if (undoStack.value.length > MAX_HISTORY) {
      undoStack.value.splice(0, undoStack.value.length - MAX_HISTORY);
    }
    // 新操作清空 redo 栈
    redoStack.value = [];
  }

  function restoreSnapshot(snapshot: string): void {
    try {
      isRestoring = true;
      const parsed = JSON.parse(snapshot) as EditorPersistence;
      store.value = parsed;
    } finally {
      // 延迟重置标记，等 watch 回调执行完毕
      nextTick(() => {
        isRestoring = false;
      });
    }
  }

  function undo(): void {
    if (!canUndo.value) return;
    const current = takeSnapshot();
    redoStack.value.push({ snapshot: current, timestamp: Date.now() });
    const entry = undoStack.value.pop()!;
    restoreSnapshot(entry.snapshot);
  }

  function redo(): void {
    if (!canRedo.value) return;
    const current = takeSnapshot();
    undoStack.value.push({ snapshot: current, timestamp: Date.now() });
    const entry = redoStack.value.pop()!;
    restoreSnapshot(entry.snapshot);
  }

  // ==================== 自动快照 ====================

  /** 上一次快照，用于变化检测 */
  let lastSnapshot = takeSnapshot();

  const debouncedRecord = useDebounceFn(() => {
    if (isRestoring) return;
    const current = takeSnapshot();
    if (current !== lastSnapshot) {
      pushSnapshot(lastSnapshot);
      lastSnapshot = current;
    }
  }, 300);

  watch(
    store,
    () => {
      if (isRestoring) return;
      debouncedRecord();
    },
    { deep: true },
  );

  // ==================== 键盘快捷键 ====================

  useEventListener("keydown", (e: KeyboardEvent) => {
    // 忽略输入框内的快捷键
    const tag = (e.target as HTMLElement)?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

    const isCtrlOrCmd = e.ctrlKey || e.metaKey;
    if (!isCtrlOrCmd || e.key.toLowerCase() !== "z") return;

    e.preventDefault();
    if (e.shiftKey) {
      redo();
    } else {
      undo();
    }
  });

  return {
    undo,
    redo,
    canUndo,
    canRedo,
  };
}

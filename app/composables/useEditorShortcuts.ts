import { useEventListener } from "@vueuse/core";

/**
 * 编辑器键盘快捷键
 * (Ctrl+N 新建, Ctrl+D 复制, Ctrl+S 导出, Del 删除)
 */
export function useEditorShortcuts(actions: {
  addLayer: () => void;
  removeLayer: () => void;
  duplicateLayer: () => void;
  exportConfig: () => void;
}) {
  function isInputFocused() {
    const tag = document.activeElement?.tagName;
    return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
  }

  useEventListener("keydown", (e: KeyboardEvent) => {
    const mod = e.ctrlKey || e.metaKey;

    // Ctrl+N — 新建图层
    if (mod && e.key === "n") {
      e.preventDefault();
      actions.addLayer();
      return;
    }

    // Ctrl+D — 复制图层
    if (mod && e.key === "d") {
      e.preventDefault();
      actions.duplicateLayer();
      return;
    }

    // Ctrl+S — 导出配置
    if (mod && e.key === "s") {
      e.preventDefault();
      actions.exportConfig();
      return;
    }

    // Delete — 删除图层 (输入时跳过)
    if (e.key === "Delete" && !isInputFocused()) {
      e.preventDefault();
      actions.removeLayer();
    }
  });
}

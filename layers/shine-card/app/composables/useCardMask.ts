import type { CSSProperties } from "vue";
import type { ParallaxLayer } from "../utils/shine-card-types";

/**
 * 管理卡片图层的遮罩数据
 * CSS mask-image 对跨域图片会发起独立的 CORS 请求，但 CDN / 反向代理
 * 可能缓存了不含 CORS 头的响应，导致 mask-image 失败。
 * 策略：利用已通过 `<img crossorigin="anonymous">` 成功加载的图片元素，
 * 通过 Canvas drawImage → toDataURL('image/png') 生成同源 data: URL。
 */
export function useCardMask() {
  const maskDataUrls = reactive(new Map<string, string>());
  const pendingMaskCount = ref(0);

  /**
   * 从已加载的 HTMLImageElement 通过 Canvas 同步生成 Data URL
   *
   * @param img - 已加载的图片元素（必须以 CORS 模式加载）
   * @param url - 该图片的原始 URL，用作缓存 key
   */
  function generateMaskFromImage(img: HTMLImageElement, url: string): void {
    if (maskDataUrls.has(url)) return;
    if (!img.naturalWidth || !img.naturalHeight) return;

    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d", { willReadFrequently: false });
    if (!ctx) return;

    try {
      ctx.drawImage(img, 0, 0);
      const dataUrl = canvas.toDataURL();
      maskDataUrls.set(url, dataUrl);
    } catch {
      // Canvas 被污染（CORS 失败）时静默回退，不应用遮罩
    }
  }

  /**
   * 加载独立的 mask 图片（mask URL 与 img URL 不同时）
   */
  function loadExternalMask(url: string): void {
    if (
      maskDataUrls.has(url) ||
      url.startsWith("data:") ||
      url.startsWith("blob:")
    )
      return;

    pendingMaskCount.value++;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      generateMaskFromImage(img, url);
      pendingMaskCount.value--;
    };
    img.onerror = () => {
      pendingMaskCount.value--;
    };
    img.src = url;
  }

  /**
   * 处理图片加载完成事件中的遮罩生成逻辑
   *
   * @param event - img 元素的 load 事件
   * @param layer - 对应的图层数据
   */
  function processMaskForImage(event: Event, layer: ParallaxLayer): void {
    const img = event.target as HTMLImageElement;
    const maskUrl = layer.mask || layer.img;

    if (maskUrl && maskUrl !== "full") {
      if (!layer.mask || layer.mask === layer.img) {
        // mask 未设置或与 img 相同：直接从已加载的 <img> 元素生成
        generateMaskFromImage(img, maskUrl);
      } else {
        // mask 是独立 URL：创建隐藏 Image 加载
        loadExternalMask(maskUrl);
      }
    }
  }

  /**
   * 生成图层遮罩样式
   *
   * 优先使用 Canvas 生成的同源 Data URL 以规避跨域限制。
   * 直接生成 CSS 规则而非 CSS 变量传递 url()，
   * 避免 CSS 自定义属性中的 url() 在每次样式重计算时被重新解析。
   */
  function getLayerMaskStyle(layer: ParallaxLayer): CSSProperties {
    if (layer.mask === "full") return {};
    const maskUrl = layer.mask || layer.img;
    if (!maskUrl) return {};

    // const resolvedUrl = maskDataUrls.get(maskUrl);
    const resolvedUrl = maskUrl;
    if (!resolvedUrl) return {};

    const urlValue = `url('${resolvedUrl}')`;
    return {
      WebkitMaskImage: urlValue,
      maskImage: urlValue,
      WebkitMaskSize: "cover",
      maskSize: "cover",
      WebkitMaskPosition: "center",
      maskPosition: "center",
    } as CSSProperties;
  }

  /**
   * SSR 水合补偿：为已在浏览器中加载完成的图片生成遮罩
   *
   * 浏览器在水合前可能已加载完 `<img>`，此时 `@load` 不会再次触发。
   *
   * @param container - 卡片根 DOM 元素
   * @param layers - 已验证的图层数据
   */
  function hydrateExistingImages(
    container: HTMLElement,
    layers: ParallaxLayer[],
  ): number {
    const imgs = container.querySelectorAll<HTMLImageElement>(".card__img");
    let hydratedCount = 0;
    layers.forEach((layer, index) => {
      const img = imgs[index];
      if (img?.complete && img.naturalWidth > 0) {
        processMaskForImage({ target: img } as unknown as Event, layer);
        hydratedCount++;
      }
    });
    return hydratedCount;
  }

  onUnmounted(() => {
    maskDataUrls.clear();
  });

  return {
    processMaskForImage,
    getLayerMaskStyle,
    hydrateExistingImages,
    pendingMaskCount: readonly(pendingMaskCount),
  };
}

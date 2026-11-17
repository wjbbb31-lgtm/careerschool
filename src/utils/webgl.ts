export interface WebGLCapabilities {
  supported: boolean;
  isSoftwareGl: boolean;
  isTouchDevice: boolean;
}

export function detectWebGLCapabilities(): WebGLCapabilities {
  const isTouchDevice =
    typeof window !== 'undefined' &&
    ('ontouchstart' in window || navigator.maxTouchPoints > 0 || window.matchMedia('(pointer: coarse)').matches);

  if (typeof document === 'undefined') {
    return { supported: true, isSoftwareGl: false, isTouchDevice: false };
  }

  try {
    const canvas = document.createElement('canvas');
    const gl =
      (canvas.getContext('webgl2') as WebGL2RenderingContext | null) ||
      (canvas.getContext('webgl') as WebGLRenderingContext | null) ||
      (canvas.getContext('experimental-webgl') as WebGLRenderingContext | null);

    if (!gl) {
      return { supported: false, isSoftwareGl: true, isTouchDevice };
    }

    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();

    const isSoftwareGl = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);

    return {
      supported: true,
      isSoftwareGl,
      isTouchDevice,
    };
  } catch {
    return { supported: false, isSoftwareGl: true, isTouchDevice };
  }
}

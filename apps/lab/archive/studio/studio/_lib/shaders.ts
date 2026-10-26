/* stable fluids (after pavel dobryakov's webgl fluid) plus a display pass:
   a bayer-dithered drift of fbm noise, cleared and tinted wherever the
   cursor stirs the dye, with text and cards drawn from mask textures */

export const BASE_VERTEX = `
  precision highp float;
  attribute vec2 aPosition;
  varying vec2 vUv;
  varying vec2 vL;
  varying vec2 vR;
  varying vec2 vT;
  varying vec2 vB;
  uniform vec2 texelSize;
  void main () {
    vUv = aPosition * 0.5 + 0.5;
    vL = vUv - vec2(texelSize.x, 0.0);
    vR = vUv + vec2(texelSize.x, 0.0);
    vT = vUv + vec2(0.0, texelSize.y);
    vB = vUv - vec2(0.0, texelSize.y);
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`;

export const COPY = `
  precision mediump float;
  precision mediump sampler2D;
  varying highp vec2 vUv;
  uniform sampler2D uTexture;
  void main () {
    gl_FragColor = texture2D(uTexture, vUv);
  }
`;

export const CLEAR = `
  precision mediump float;
  precision mediump sampler2D;
  varying highp vec2 vUv;
  uniform sampler2D uTexture;
  uniform float value;
  void main () {
    gl_FragColor = value * texture2D(uTexture, vUv);
  }
`;

export const SPLAT = `
  precision highp float;
  precision highp sampler2D;
  varying vec2 vUv;
  uniform sampler2D uTarget;
  uniform float aspectRatio;
  uniform vec3 color;
  uniform vec2 point;
  uniform float radius;
  void main () {
    vec2 p = vUv - point.xy;
    p.x *= aspectRatio;
    float gaussian = exp(-dot(p, p) / radius);
    vec3 base = texture2D(uTarget, vUv).xyz;
    gl_FragColor = vec4(base + gaussian * color, 1.0);
  }
`;

export const ADVECTION = `
  precision highp float;
  precision highp sampler2D;
  varying vec2 vUv;
  uniform sampler2D uVelocity;
  uniform sampler2D uSource;
  uniform vec2 texelSize;
  uniform vec2 dyeTexelSize;
  uniform float dt;
  uniform float dissipation;
  vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {
    vec2 st = uv / tsize - 0.5;
    vec2 iuv = floor(st);
    vec2 fuv = fract(st);
    vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
    vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
    vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
    vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);
    return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
  }
  void main () {
  #ifdef MANUAL_FILTERING
    vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;
    vec4 result = bilerp(uSource, coord, dyeTexelSize);
  #else
    vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
    vec4 result = texture2D(uSource, coord);
  #endif
    float decay = 1.0 + dissipation * dt;
    gl_FragColor = result / decay;
  }
`;

export const DIVERGENCE = `
  precision mediump float;
  precision mediump sampler2D;
  varying highp vec2 vUv;
  varying highp vec2 vL;
  varying highp vec2 vR;
  varying highp vec2 vT;
  varying highp vec2 vB;
  uniform sampler2D uVelocity;
  void main () {
    float L = texture2D(uVelocity, vL).x;
    float R = texture2D(uVelocity, vR).x;
    float T = texture2D(uVelocity, vT).y;
    float B = texture2D(uVelocity, vB).y;
    vec2 C = texture2D(uVelocity, vUv).xy;
    if (vL.x < 0.0) { L = -C.x; }
    if (vR.x > 1.0) { R = -C.x; }
    if (vT.y > 1.0) { T = -C.y; }
    if (vB.y < 0.0) { B = -C.y; }
    float div = 0.5 * (R - L + T - B);
    gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
  }
`;

export const PRESSURE = `
  precision mediump float;
  precision mediump sampler2D;
  varying highp vec2 vUv;
  varying highp vec2 vL;
  varying highp vec2 vR;
  varying highp vec2 vT;
  varying highp vec2 vB;
  uniform sampler2D uPressure;
  uniform sampler2D uDivergence;
  void main () {
    float L = texture2D(uPressure, vL).x;
    float R = texture2D(uPressure, vR).x;
    float T = texture2D(uPressure, vT).x;
    float B = texture2D(uPressure, vB).x;
    float divergence = texture2D(uDivergence, vUv).x;
    float pressure = (L + R + B + T - divergence) * 0.25;
    gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
  }
`;

export const GRADIENT_SUBTRACT = `
  precision mediump float;
  precision mediump sampler2D;
  varying highp vec2 vUv;
  varying highp vec2 vL;
  varying highp vec2 vR;
  varying highp vec2 vT;
  varying highp vec2 vB;
  uniform sampler2D uPressure;
  uniform sampler2D uVelocity;
  void main () {
    float L = texture2D(uPressure, vL).x;
    float R = texture2D(uPressure, vR).x;
    float T = texture2D(uPressure, vT).x;
    float B = texture2D(uPressure, vB).x;
    vec2 velocity = texture2D(uVelocity, vUv).xy;
    velocity.xy -= vec2(R - L, T - B);
    gl_FragColor = vec4(velocity, 0.0, 1.0);
  }
`;

export const DISPLAY = `
  precision highp float;
  precision highp sampler2D;

  varying vec2 vUv;
  uniform sampler2D uTexture;
  uniform sampler2D uTextMask;
  uniform sampler2D uOverlay;
  uniform float u_time;
  uniform vec2 u_resolution;
  uniform float u_fluidAmount;
  uniform float u_hasTextMask;
  uniform float u_hasOverlay;
  uniform float u_pixelRatio;
  uniform float u_dark;
  uniform vec3 u_ditherDark;
  uniform vec3 u_ditherLight;
  uniform vec3 u_text;
  uniform vec3 u_textTint;
  uniform vec3 u_accent;
  uniform vec3 u_accentPale;

  float hash(vec2 p) {
    p = fract(p * vec2(127.1, 311.7));
    p += dot(p, p.yx + 19.19);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  float fbm(vec2 p, float time) {
    float value = 0.0;
    float amplitude = 0.5;
    float phase = time * 0.015;
    for (int i = 0; i < 2; i++) {
      value += amplitude * noise(p);
      float fi = phase + float(i) * 0.5;
      p = p * 1.5 + vec2(12.7 + cos(fi) * 0.5, 4.3 + sin(fi) * 0.5);
      amplitude *= 0.5;
    }
    return value;
  }

  float shapeNoise(vec2 p, float time) {
    vec2 offset = vec2(fbm(p + vec2(7.1, -3.9), time) - 0.5) * 3.0;
    return fbm(p + offset, time);
  }

  float bayer4(vec2 pixelPos) {
    vec2 p = mod(pixelPos, 4.0);
    vec2 p2 = mod(p, 2.0);
    vec2 p4 = floor(p * 0.5);
    float inner = 2.0 * (p2.x + p2.y - 2.0 * p2.x * p2.y) + p2.y;
    float outer = 2.0 * (p4.x + p4.y - 2.0 * p4.x * p4.y) + p4.y;
    return (4.0 * inner + outer) / 16.0;
  }

  float maxOf(vec3 v) {
    return max(v.r, max(v.g, v.b));
  }

  // text is white on black; cards are drawn with real alpha, so their
  // colour comes through untouched (the reference normalises it, which
  // only suits very pale tints)
  float presence(vec2 uv) {
    float text = maxOf(texture2D(uTextMask, uv).rgb) * u_hasTextMask;
    float card = texture2D(uOverlay, uv).a * u_hasOverlay;
    return max(text, card);
  }

  void main () {
    float blockSize = 2.5 * u_pixelRatio;
    vec2 blockCoord = floor(gl_FragCoord.xy / blockSize);
    vec2 blockUv = (blockCoord + 0.5) * blockSize / u_resolution.xy;
    vec2 centeredUv = blockUv - 0.5;
    centeredUv.x *= u_resolution.x / max(u_resolution.y, 1.0);

    float t = u_time * 0.03;
    vec2 flow = vec2(t, -t * 0.65);
    vec2 noiseUv = vec2(centeredUv.x * 1.5, centeredUv.y * 1.5 * 0.45) + flow;
    float base = shapeNoise(noiseUv, u_time);
    base = clamp(((base - 0.5) * 6.0 + 0.5) * 1.5, 0.0, 1.0);

    vec3 dye = texture2D(uTexture, vUv).rgb;
    float fluidLum = max(dye.r, max(dye.g, dye.b));
    float fluidStrength = clamp(fluidLum / 0.15, 0.0, 1.0) * u_fluidAmount;

    float caAmount = fluidStrength * mix(17.0, 10.0, u_dark) / u_resolution.x;
    vec2 caDir = normalize(vec2(1.0, 0.4));
    vec2 caDirPerp = vec2(caDir.y, caDir.x);

    vec2 uvC = vec2(vUv.x, 1.0 - vUv.y);
    vec2 uvR = vec2(vUv.x + caDir.x * caAmount, 1.0 - (vUv.y + caDir.y * caAmount));
    vec2 uvG = vec2(vUv.x + caDirPerp.x * caAmount * 0.5, 1.0 - (vUv.y + caDirPerp.y * caAmount * 0.5));

    vec4 cardG = texture2D(uOverlay, uvG) * u_hasOverlay;
    float textMask = presence(uvC);
    float textMaskR = presence(uvR);
    float textMaskG = presence(uvG);

    float modifiedBase = clamp(base - fluidStrength * (1.0 - textMask), 0.0, 1.0);
    float threshold = (bayer4(blockCoord) - 0.5) * 2.0;
    float dithered = step(0.5, clamp(modifiedBase + threshold, 0.0, 1.0));

    float splatFade = fluidStrength * fluidStrength;
    vec3 tintedLight = mix(u_ditherLight, u_accent, splatFade * 0.9);
    vec3 bgColor = mix(u_ditherDark, tintedLight, dithered);

    float isCard = step(0.5, cardG.a);

    vec3 textEffect = mix(u_text, u_textTint, fluidStrength * 0.9);
    vec3 ditherColor = mix(u_accentPale, u_accent, dithered);
    vec3 cardEffect = mix(cardG.rgb, ditherColor, fluidStrength * 0.9);
    vec3 surface = mix(textEffect, cardEffect, isCard);

    // the reference splits red from green/blue; here the offset copies
    // become a soft double image, and where they disagree the edge goes
    // sage instead of red and cyan
    vec3 colorC = mix(bgColor, surface, textMask);
    vec3 colorR = mix(bgColor, surface, textMaskR);
    vec3 colorG = mix(bgColor, surface, textMaskG);
    vec3 color = mix(colorC, (colorR + colorG) * 0.5, 0.5);
    color = mix(color, u_textTint, abs(textMaskR - textMaskG) * 0.75);
    gl_FragColor = vec4(color, 1.0);
  }
`;

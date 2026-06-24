let ctx: AudioContext | null = null;
let timer: ReturnType<typeof setInterval> | null = null;

function beep(context: AudioContext) {
  const osc = context.createOscillator();
  const gain = context.createGain();
  osc.connect(gain);
  gain.connect(context.destination);
  osc.type = 'sine';
  osc.frequency.value = 880;
  gain.gain.setValueAtTime(0.4, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.6);
  osc.start(context.currentTime);
  osc.stop(context.currentTime + 0.65);
}

export function startSound() {
  try {
    ctx = new AudioContext();
    beep(ctx);
    timer = setInterval(() => ctx && beep(ctx), 900);
  } catch {
    // Audio API not available
  }
}

export function stopSound() {
  if (timer) clearInterval(timer);
  timer = null;
  ctx?.close();
  ctx = null;
}

let successDingContext = null;

export const prepareSuccessDing = async () => {
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return null;
        if (!successDingContext) successDingContext = new AudioCtx();
        if (successDingContext.state === 'suspended') {
            await successDingContext.resume();
        }
        return successDingContext;
    } catch {
        return null;
    }
};

const SUCCESS_DING_MS = 400;

export const playSuccessDing = async () => {
    try {
        const ctx = await prepareSuccessDing();
        if (!ctx) return Promise.resolve();

        const start = ctx.currentTime;
        [880, 1318].forEach((frequency, index) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const noteStart = start + index * 0.08;
            osc.type = 'sine';
            osc.frequency.value = frequency;
            gain.gain.setValueAtTime(0.0001, noteStart);
            gain.gain.exponentialRampToValueAtTime(0.16, noteStart + 0.015);
            gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.28);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(noteStart);
            osc.stop(noteStart + 0.3);
        });
    } catch {
        // A blocked or missing audio device should not fail the save.
        return Promise.resolve();
    }

    return new Promise((resolve) => {
        setTimeout(resolve, SUCCESS_DING_MS);
    });
};

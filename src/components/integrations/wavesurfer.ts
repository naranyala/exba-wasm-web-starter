import { ExbaComponent } from '@core/lifecycle/component';
import { t } from '@shell/theme/styles';
import WaveSurfer from 'wavesurfer.js';

export class WavesurferComponent extends ExbaComponent {
  static useShadow = true;

  private wavesurfer: WaveSurfer | null = null;
  private isPlaying = false;
  private isReady = false;
  private currentObjectUrl: string | null = null;
  private visualizationType: 'bar' | 'smooth' | 'solid' = 'bar';

  static styles = {
    container:
      'padding: 2rem; width: 100%; max-width: 900px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.5rem;',
    playerCard: `background: ${t.zinc900a}; border: 1px solid ${t.zinc800}; border-radius: 1.5rem; padding: 2rem; display: flex; flex-direction: column; gap: 1.5rem; backdrop-filter: blur(8px); box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5);`,
    waveformContainer: `width: 100%; height: 120px; background: ${t.zinc950}; border-radius: 0.75rem; border: 1px solid ${t.zinc800}; overflow: hidden;`,
    controls:
      'display: flex; gap: 1rem; align-items: center; justify-content: center; margin-top: 1rem;',
    btn: `background: ${t.indigo600a}; border: 1px solid ${t.indigo500}55; color: ${t.indigo300}; padding: 0.75rem 1.5rem; border-radius: 0.75rem; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 0.5rem; &:hover { background: ${t.indigo600}44; border-color: ${t.indigo400}; transform: translateY(-2px); }`,
    btnDisabled: `opacity: 0.5; cursor: not-allowed; pointer-events: none;`,
    timeDisplay: `font-family: 'SF Mono', 'Fira Code', monospace; color: ${t.zinc400}; font-size: 0.875rem;`,
    select: `background: ${t.zinc800}; color: ${t.zinc300}; padding: 0.5rem 1rem; border-radius: 0.75rem; border: 1px solid ${t.zinc700}; cursor: pointer;`,
  };

  protected onMount() {
    this.initWavesurfer();

    const fileInput = this.shadowRoot?.getElementById(
      'audio-upload',
    ) as HTMLInputElement;
    const fileNameDisplay = this.shadowRoot?.getElementById('file-name');
    const visSelect = this.shadowRoot?.getElementById(
      'vis-select',
    ) as HTMLSelectElement;

    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file && this.wavesurfer) {
          if (this.currentObjectUrl) {
            URL.revokeObjectURL(this.currentObjectUrl);
          }

          this.currentObjectUrl = URL.createObjectURL(file);
          this.isReady = false;
          this.isPlaying = false;
          this.updateState();

          if (fileNameDisplay) {
            fileNameDisplay.innerText = file.name;
          }

          this.wavesurfer.load(this.currentObjectUrl);
        }
      });
    }

    if (visSelect) {
      visSelect.addEventListener('change', (e) => {
        this.visualizationType = (e.target as HTMLSelectElement).value as
          | 'bar'
          | 'smooth'
          | 'solid';
        this.initWavesurfer();
      });
    }

    (this as any).togglePlay = () => {
      if (this.wavesurfer) {
        this.wavesurfer.playPause();
      }
    };

    (this as any).stopAudio = () => {
      if (this.wavesurfer) {
        this.wavesurfer.stop();
        this.wavesurfer.seekTo(0);
      }
    };
  }

  private initWavesurfer() {
    if (this.wavesurfer) {
      this.wavesurfer.destroy();
    }

    const container = this.shadowRoot?.getElementById('waveform');
    if (!container) return;

    const options: any = {
      container: container,
      waveColor: t.zinc500,
      progressColor: t.indigo500,
      cursorColor: t.indigo300,
      height: 120,
      normalize: true,
      minPxPerSec: 100,
    };

    if (this.visualizationType === 'bar') {
      options.barWidth = 3;
      options.barRadius = 3;
    } else if (this.visualizationType === 'smooth') {
      options.barWidth = 1;
      options.barGap = 1;
    }
    // 'solid' uses default options

    this.wavesurfer = WaveSurfer.create(options);

    this.wavesurfer.on('ready', () => {
      this.isReady = true;
      this.updateState();
    });

    this.wavesurfer.on('play', () => {
      this.isPlaying = true;
      this.updateState();
    });

    this.wavesurfer.on('pause', () => {
      this.isPlaying = false;
      this.updateState();
    });

    this.wavesurfer.on('audioprocess', () => {
      this.updateTimeDisplay();
    });

    if (this.currentObjectUrl) {
      this.wavesurfer.load(this.currentObjectUrl);
    } else {
      this.wavesurfer.load(
        'https://wavesurfer.xyz/wavesurfer-code/examples/audio/audio.wav',
      );
    }
  }

  private updateState() {
    const playBtn = this.shadowRoot?.getElementById('play-btn');
    if (playBtn) {
      if (!this.isReady) {
        playBtn.classList.add('disabled');
        playBtn.innerHTML = '⏳ Loading...';
      } else {
        playBtn.classList.remove('disabled');
        playBtn.innerHTML = this.isPlaying ? '⏸ Pause' : '▶️ Play';
      }
    }
  }

  private updateTimeDisplay() {
    if (!this.wavesurfer) return;
    const timeEl = this.shadowRoot?.getElementById('time-display');
    if (timeEl) {
      const currentTime = this.formatTime(this.wavesurfer.getCurrentTime());
      const totalTime = this.formatTime(this.wavesurfer.getDuration());
      timeEl.innerText = `${currentTime} / ${totalTime}`;
    }
  }

  private formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  protected onUnmount() {
    if (this.wavesurfer) {
      this.wavesurfer.destroy();
    }
  }

  render() {
    return `
      <div class="container">
        <h2 style="color: ${t.zinc100}; margin-bottom: 0.5rem; text-align: center; font-size: 2rem;">Audio Waveform Player</h2>
        <p style="color: ${t.zinc400}; font-size: 1rem; text-align: center; margin-bottom: 2rem; margin-top: 0;">High-performance audio visualization using Wavesurfer.js.</p>
        
        <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 1.5rem; justify-content: center; flex-wrap: wrap;">
            <input type="file" id="audio-upload" accept="audio/*" style="display: none;" />
            <button class="btn" style="background: ${t.emerald600}22; border-color: ${t.emerald600}55; color: ${t.emerald400};" onclick="this.getRootNode().getElementById('audio-upload').click()">
              📁 Choose Local File
            </button>
            <span id="file-name" style="color: ${t.zinc400}; font-size: 0.875rem;">example-audio.wav</span>
            
            <select id="vis-select" class="${this.constructor.styles.select}">
              <option value="bar">Bar Visualization</option>
              <option value="smooth">Smooth Visualization</option>
              <option value="solid">Solid Visualization</option>
            </select>
        </div>

        <div class="playerCard">
          <div id="waveform" class="waveformContainer"></div>
          
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 0 1rem;">
            <div id="time-display" class="timeDisplay">0:00 / 0:00</div>
          </div>

          <div class="controls">
            <button id="play-btn" class="btn ${!this.isReady ? 'disabled' : ''}" onclick="this.getRootNode().host.togglePlay()" ${!this.isReady ? 'disabled' : ''}>
              ⏳ Loading...
            </button>
            <button class="btn" style="background: ${t.zinc800}; border-color: ${t.zinc700}; color: ${t.zinc300};" onclick="this.getRootNode().host.stopAudio()">
              ⏹ Stop
            </button>
          </div>
        </div>
      </div>
    `;
  }
}

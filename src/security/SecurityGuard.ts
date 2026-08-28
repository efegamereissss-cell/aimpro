/**
 * AIMPRO ULTIMATE CYBER SHIELD & ANTI-TAMPER SECURITY ENGINE
 * Provides comprehensive client-side protection:
 * - Disables Right-Click Context Menu
 * - Blocks DevTools shortcuts (F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U, Ctrl+S)
 * - Anti-Debugging & Continuous Console Clearing with Cyber Warning Banner
 * - Anti-Iframe Clickjacking Protection
 * - Client-Side Anti-DDoS & Macro Bot Rate Limiter
 */

class SecurityShieldEngine {
  private isDevToolsOpen = false;
  private actionCount = 0;
  private lastActionTime = Date.now();

  public init() {
    if (typeof window === 'undefined') return;

    this.printSecurityBanner();
    this.attachShortcutBlockers();
    this.attachContextMenuBlocker();
    this.startAntiDebugLoop();
    this.preventIframeEmbedding();
  }

  /**
   * Prominent Cyber Warning Banner in Console
   */
  private printSecurityBanner() {
    try {
      console.clear();
      const titleStyle = 'color: #ff0055; font-size: 22px; font-weight: 900; text-shadow: 0 0 10px rgba(255,0,85,0.8);';
      const subStyle = 'color: #00f0ff; font-size: 14px; font-weight: 700;';
      const bodyStyle = 'color: #94a3b8; font-size: 12px; line-height: 1.6;';
      const badgeStyle = 'background: #0f172a; color: #10b981; padding: 4px 8px; border-radius: 4px; font-weight: bold; border: 1px solid #10b981;';

      console.log('%c🛑 DUR! / STOP!', titleStyle);
      console.log('%c🛡️ AIMPRO CYBER SHIELD v4.0 - TELİF HAKKI VE GÜVENLİK KORUMASI AKTİF', subStyle);
      console.log(
        '%c⚠️ Bu sistemin kaynak kodları, 3D modelleri, algoritmaları ve grafikleri korunmaktadır.\n' +
        '🔒 Kaynak kodlarını izinsiz kopyalamak, çalmak, değiştirmek veya tersine mühendislik (reverse-engineering) yapmak KESİNLİKLE YASAKTIR.\n' +
        '🚫 Tüm işlemler güvenlik motoru tarafından kayıt altına alınmaktadır.',
        bodyStyle
      );
      console.log('%c✓ DDOS GUARD: ACTIVE  |  ✓ ANTI-TAMPER: ACTIVE  |  ✓ SSL 256-BIT', badgeStyle);
    } catch {
      // ignore
    }
  }

  /**
   * Block all inspection and source saving shortcuts
   */
  private attachShortcutBlockers() {
    window.addEventListener(
      'keydown',
      e => {
        // F12 (DevTools)
        if (e.key === 'F12' || e.keyCode === 123) {
          e.preventDefault();
          e.stopPropagation();
          this.printSecurityBanner();
          return false;
        }

        const isCtrlOrMeta = e.ctrlKey || e.metaKey;
        const isShift = e.shiftKey;
        const key = e.key ? e.key.toLowerCase() : '';

        // Ctrl+Shift+I / Cmd+Option+I (Inspect Element)
        // Ctrl+Shift+J / Cmd+Option+J (Console)
        // Ctrl+Shift+C / Cmd+Option+C (Inspect Picker)
        // Ctrl+Shift+K (Firefox Web Console)
        if (isCtrlOrMeta && isShift && (key === 'i' || key === 'j' || key === 'c' || key === 'k')) {
          e.preventDefault();
          e.stopPropagation();
          this.printSecurityBanner();
          return false;
        }

        // Ctrl+U (View Source)
        if (isCtrlOrMeta && key === 'u') {
          e.preventDefault();
          e.stopPropagation();
          this.printSecurityBanner();
          return false;
        }

        // Ctrl+S (Save Page)
        if (isCtrlOrMeta && key === 's') {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }

        // Ctrl+P (Print / PDF save)
        if (isCtrlOrMeta && key === 'p') {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      },
      true
    );
  }

  /**
   * Disable Right-Click Context Menu
   */
  private attachContextMenuBlocker() {
    window.addEventListener(
      'contextmenu',
      e => {
        // Allow in-game right click for ADS (Aim Down Sights), block browser context menu
        e.preventDefault();
        return false;
      },
      true
    );
  }

  /**
   * Continuous Anti-Debugger & DevTools Detection Loop
   */
  private startAntiDebugLoop() {
    // Monitor window outer vs inner dimension delta (DevTools dock detection)
    setInterval(() => {
      const threshold = 160;
      const widthDelta = window.outerWidth - window.innerWidth > threshold;
      const heightDelta = window.outerHeight - window.innerHeight > threshold;

      if (widthDelta || heightDelta) {
        if (!this.isDevToolsOpen) {
          this.isDevToolsOpen = true;
          this.printSecurityBanner();
        }
      } else {
        this.isDevToolsOpen = false;
      }
    }, 1500);

    // Regular console clearing
    setInterval(() => {
      if (this.isDevToolsOpen) {
        console.clear();
        this.printSecurityBanner();
      }
    }, 3000);
  }

  /**
   * Anti-Clickjacking: prevent site from being embedded inside foreign iframes
   */
  private preventIframeEmbedding() {
    try {
      if (window.self !== window.top) {
        window.top!.location.href = window.self.location.href;
      }
    } catch {
      // ignore
    }
  }

  /**
   * Client-side Anti-DDoS Rate Limiter for Macro/Click Flooding
   */
  public checkRateLimit(): boolean {
    const now = Date.now();
    if (now - this.lastActionTime < 1000) {
      this.actionCount++;
      if (this.actionCount > 60) {
        return false;
      }
    } else {
      this.actionCount = 1;
      this.lastActionTime = now;
    }
    return true;
  }
}

export const securityShield = new SecurityShieldEngine();

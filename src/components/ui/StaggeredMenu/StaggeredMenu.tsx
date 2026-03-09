import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Menu, X, Shield } from 'lucide-react'; // <-- Importamos los iconos correctos

export interface StaggeredMenuItem {
  label: string;
  ariaLabel: string;
  link: string;
  subItems?: { label: string; link: string }[];
}
export interface StaggeredMenuSocialItem {
  label: string;
  link: string;
}
export interface StaggeredMenuProps {
  position?: 'left' | 'right';
  colors?: string[];
  items?: StaggeredMenuItem[];
  socialItems?: StaggeredMenuSocialItem[];
  displaySocials?: boolean;
  displayItemNumbering?: boolean;
  className?: string;
  logoUrl?: string;
  menuButtonColor?: string;
  openMenuButtonColor?: string;
  accentColor?: string;
  isFixed?: boolean;
  changeMenuColorOnOpen?: boolean;
  closeOnClickAway?: boolean;
  onMenuOpen?: () => void;
  onMenuClose?: () => void;
}

export const StaggeredMenu: React.FC<StaggeredMenuProps> = ({
                                                              position = 'right',
                                                              colors = ['#B19EEF', '#5227FF'],
                                                              items = [],
                                                              socialItems = [],
                                                              displaySocials = true,
                                                              displayItemNumbering = true,
                                                              className,
                                                              logoUrl = '/assets/shield.svg',
                                                              menuButtonColor = '#fff',
                                                              openMenuButtonColor = '#fff',
                                                              changeMenuColorOnOpen = true,
                                                              accentColor = '#5227FF',
                                                              isFixed = false,
                                                              closeOnClickAway = true,
                                                              onMenuOpen,
                                                              onMenuClose
                                                            }: StaggeredMenuProps) => {
  const [open, setOpen] = useState(false);
  const openRef = useRef(false);

  const panelRef = useRef<HTMLDivElement | null>(null);
  const preLayersRef = useRef<HTMLDivElement | null>(null);
  const preLayerElsRef = useRef<HTMLElement[]>([]);

  const openTlRef = useRef<gsap.core.Timeline | null>(null);
  const closeTweenRef = useRef<gsap.core.Tween | null>(null);
  const colorTweenRef = useRef<gsap.core.Tween | null>(null);

  const toggleBtnRef = useRef<HTMLButtonElement | null>(null);
  const busyRef = useRef(false);

  const itemEntranceTweenRef = useRef<gsap.core.Tween | null>(null);

  // LIMPIEZA: Quitamos las referencias que GSAP usaba para animar el texto y el "+" viejo
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const panel = panelRef.current;
      const preContainer = preLayersRef.current;

      if (!panel) return;

      let preLayers: HTMLElement[] = [];
      if (preContainer) {
        preLayers = Array.from(preContainer.querySelectorAll('.sm-prelayer')) as HTMLElement[];
      }
      preLayerElsRef.current = preLayers;

      const offscreen = position === 'left' ? -100 : 100;
      gsap.set([panel, ...preLayers], { xPercent: offscreen });

      if (toggleBtnRef.current) gsap.set(toggleBtnRef.current, { color: menuButtonColor });
    });
    return () => ctx.revert();
  }, [menuButtonColor, position]);

  const buildOpenTimeline = useCallback(() => {
    const panel = panelRef.current;
    const layers = preLayerElsRef.current;
    if (!panel) return null;

    openTlRef.current?.kill();
    if (closeTweenRef.current) {
      closeTweenRef.current.kill();
      closeTweenRef.current = null;
    }
    itemEntranceTweenRef.current?.kill();

    const itemEls = Array.from(panel.querySelectorAll('.sm-panel-itemLabel')) as HTMLElement[];
    const layerStates = layers.map(el => ({ el, start: Number(gsap.getProperty(el, 'xPercent')) }));
    const panelStart = Number(gsap.getProperty(panel, 'xPercent'));

    if (itemEls.length) gsap.set(itemEls, { yPercent: 140, rotate: 10 });

    const tl = gsap.timeline({ paused: true });

    layerStates.forEach((ls, i) => {
      tl.fromTo(ls.el, { xPercent: ls.start }, { xPercent: 0, duration: 0.5, ease: 'power4.out' }, i * 0.07);
    });

    const lastTime = layerStates.length ? (layerStates.length - 1) * 0.07 : 0;
    const panelInsertTime = lastTime + (layerStates.length ? 0.08 : 0);
    const panelDuration = 0.65;

    tl.fromTo(
        panel,
        { xPercent: panelStart },
        { xPercent: 0, duration: panelDuration, ease: 'power4.out' },
        panelInsertTime
    );

    if (itemEls.length) {
      const itemsStartRatio = 0.15;
      const itemsStart = panelInsertTime + panelDuration * itemsStartRatio;

      tl.to(
          itemEls,
          { yPercent: 0, rotate: 0, duration: 1, ease: 'power4.out', stagger: { each: 0.1, from: 'start' } },
          itemsStart
      );
    }

    openTlRef.current = tl;
    return tl;
  }, [position]);

  const playOpen = useCallback(() => {
    if (busyRef.current) return;
    busyRef.current = true;
    const tl = buildOpenTimeline();
    if (tl) {
      tl.eventCallback('onComplete', () => {
        busyRef.current = false;
      });
      tl.play(0);
    } else {
      busyRef.current = false;
    }
  }, [buildOpenTimeline]);

  const playClose = useCallback(() => {
    openTlRef.current?.kill();
    openTlRef.current = null;
    itemEntranceTweenRef.current?.kill();

    const panel = panelRef.current;
    const layers = preLayerElsRef.current;
    if (!panel) return;

    const all: HTMLElement[] = [...layers, panel];
    closeTweenRef.current?.kill();

    const offscreen = position === 'left' ? -100 : 100;

    closeTweenRef.current = gsap.to(all, {
      xPercent: offscreen,
      duration: 0.32,
      ease: 'power3.in',
      overwrite: 'auto',
      onComplete: () => {
        const itemEls = Array.from(panel.querySelectorAll('.sm-panel-itemLabel')) as HTMLElement[];
        if (itemEls.length) gsap.set(itemEls, { yPercent: 140, rotate: 10 });
        busyRef.current = false;
      }
    });
  }, [position]);

  const animateColor = useCallback(
      (opening: boolean) => {
        const btn = toggleBtnRef.current;
        if (!btn) return;
        colorTweenRef.current?.kill();
        if (changeMenuColorOnOpen) {
          const targetColor = opening ? openMenuButtonColor : menuButtonColor;
          colorTweenRef.current = gsap.to(btn, { color: targetColor, delay: 0.18, duration: 0.3, ease: 'power2.out' });
        } else {
          gsap.set(btn, { color: menuButtonColor });
        }
      },
      [openMenuButtonColor, menuButtonColor, changeMenuColorOnOpen]
  );

  React.useEffect(() => {
    if (toggleBtnRef.current) {
      if (changeMenuColorOnOpen) {
        const targetColor = openRef.current ? openMenuButtonColor : menuButtonColor;
        gsap.set(toggleBtnRef.current, { color: targetColor });
      } else {
        gsap.set(toggleBtnRef.current, { color: menuButtonColor });
      }
    }
  }, [changeMenuColorOnOpen, menuButtonColor, openMenuButtonColor]);

  const toggleMenu = useCallback(() => {
    const target = !openRef.current;
    openRef.current = target;
    setOpen(target);

    if (target) {
      onMenuOpen?.();
      playOpen();
    } else {
      onMenuClose?.();
      playClose();
    }
    animateColor(target);
  }, [playOpen, playClose, animateColor, onMenuOpen, onMenuClose]);

  const closeMenu = useCallback(() => {
    if (openRef.current) {
      openRef.current = false;
      setOpen(false);
      onMenuClose?.();
      playClose();
      animateColor(false);
    }
  }, [playClose, animateColor, onMenuClose]);

  React.useEffect(() => {
    if (!closeOnClickAway || !open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
          panelRef.current &&
          !panelRef.current.contains(event.target as Node) &&
          toggleBtnRef.current &&
          !toggleBtnRef.current.contains(event.target as Node)
      ) {
        closeMenu();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [closeOnClickAway, open, closeMenu]);

  return (
      <div className={`sm-scope z-40 ${isFixed ? 'fixed top-0 left-0 w-screen h-screen overflow-hidden' : 'w-full h-full'}`}>
        <div
            className={(className ? className + ' ' : '') + 'staggered-menu-wrapper pointer-events-none relative w-full h-full z-40'}
            style={accentColor ? ({ ['--sm-accent' as any]: accentColor } as React.CSSProperties) : undefined}
            data-position={position}
            data-open={open || undefined}
        >
          <div ref={preLayersRef} className="sm-prelayers absolute top-0 right-0 bottom-0 pointer-events-none z-[5]" aria-hidden="true">
            {(() => {
              const raw = colors && colors.length ? colors.slice(0, 4) : ['#1e1e22', '#35353c'];
              let arr = [...raw];
              if (arr.length >= 3) {
                const mid = Math.floor(arr.length / 2);
                arr.splice(mid, 1);
              }
              return arr.map((c, i) => (
                  <div key={i} className="sm-prelayer absolute top-0 right-0 h-full w-full translate-x-0" style={{ background: c }} />
              ));
            })()}
          </div>

          <header className="staggered-menu-header absolute top-0 left-0 w-full flex items-center justify-between p-[2em] bg-transparent pointer-events-none z-20">
            <div className="sm-logo flex items-center gap-2 select-none pointer-events-auto" aria-label="Logo">
              <Shield className="w-8 h-8 text-emerald-500" />
              <span className="text-xl font-bold font-mono text-zinc-100 tracking-wider uppercase">
           </span>
            </div>

            {/* ESTE ES EL NUEVO BOTÓN LIMPIO Y MINIMALISTA */}
            <button
                ref={toggleBtnRef}
                className="sm-toggle relative flex items-center justify-center p-2 rounded-md hover:bg-zinc-800/50 transition-all duration-300 pointer-events-auto"
                aria-label={open ? 'Close menu' : 'Open menu'}
                aria-expanded={open}
                onClick={toggleMenu}
                type="button"
            >
              {/* Si está abierto muestra la X, si está cerrado muestra la Hamburguesa */}
              {open ? (
                  <X className="w-8 h-8 transition-transform duration-300 rotate-0 hover:scale-110" />
              ) : (
                  <Menu className="w-8 h-8 transition-transform duration-300 rotate-0 hover:scale-110" />
              )}
            </button>
          </header>

          <aside
              id="staggered-menu-panel"
              ref={panelRef}
              className="staggered-menu-panel absolute top-0 right-0 h-full bg-[#09090b] flex flex-col p-[6em_2em_2em_2em] overflow-y-auto z-10 backdrop-blur-[12px] pointer-events-auto border-r border-zinc-800"
              aria-hidden={!open}
          >
            <div className="sm-panel-inner flex-1 flex flex-col gap-5">
              <ul className="sm-panel-list list-none m-0 p-0 flex flex-col gap-6" role="list">
                {items && items.length ? (
                    items.map((it, idx) => (
                        // 1. Usamos "group" de Tailwind en el li principal para detectar el hover
                        <li className="relative group" key={it.label + idx}>

                          {/* 2. Envolvemos el enlace en su propio div para no romper la animación de GSAP */}
                          <div className="sm-panel-itemWrap relative overflow-hidden leading-none">
                            <a
                                className="sm-panel-item relative text-zinc-300 font-mono font-semibold text-base md:text-lg cursor-pointer leading-none uppercase transition-[color] duration-150 ease-linear inline-block no-underline hover:text-emerald-500"
                                href={it.link}
                                aria-label={it.ariaLabel}
                            >
                        <span className="sm-panel-itemLabel inline-block [transform-origin:50%_100%] will-change-transform">
                          {it.label}
                        </span>
                            </a>
                          </div>

                          {/* 3. SUBMENÚ: Acordeón puro con CSS Grid que se abre al hacer hover en el 'group' */}
                          {it.subItems && (
                              <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]">
                                <div className="overflow-hidden">
                                  {/* Línea lateral izquierda estilo "árbol de directorios" */}
                                  <ul className="pl-4 mt-4 space-y-3 border-l border-zinc-800 ml-2">
                                    {it.subItems.map((sub, sIdx) => (
                                        <li key={sIdx}>
                                          <a
                                              href={sub.link}
                                              className="text-zinc-400 hover:text-emerald-400 font-mono text-sm uppercase tracking-wider transition-colors block"
                                          >
                                            {sub.label}
                                          </a>
                                        </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                          )}

                        </li>
                    ))
                ) : null}
              </ul>
            </div>
          </aside>
        </div>

        <style>{`
.sm-scope .staggered-menu-wrapper { position: relative; width: 100%; height: 100%; z-index: 40; pointer-events: none; }
.sm-scope .staggered-menu-header { position: absolute; top: 0; left: 0; width: 100%; display: flex; align-items: center; justify-content: space-between; padding: 2em; background: transparent; pointer-events: none; z-index: 20; }
.sm-scope .staggered-menu-header > * { pointer-events: auto; }
.sm-scope .sm-logo-img { display: block; height: 32px; width: auto; object-fit: contain; left:-50 }
.sm-scope .staggered-menu-panel { position: absolute; top: 0; right: 0; width: 260px; height: 100%; background: #09090b; display: flex; flex-direction: column; padding: 6em 2em 2em 2em; overflow-y: auto; z-index: 10; }
.sm-scope [data-position='left'] .staggered-menu-panel { right: auto; left: 0; border-right: 1px solid #27272a; }
.sm-scope .sm-prelayers { position: absolute; top: 0; right: 0; bottom: 0; width: 260px; pointer-events: none; z-index: 5; }
.sm-scope [data-position='left'] .sm-prelayers { right: auto; left: 0; }
.sm-scope .sm-prelayer { position: absolute; top: 0; right: 0; height: 100%; width: 100%; transform: translateX(0); }
@media (max-width: 1024px) { .sm-scope .staggered-menu-panel { width: 100%; left: 0; right: 0; border-right: none; } }
      `}</style>
      </div>
  );
};

export default StaggeredMenu;
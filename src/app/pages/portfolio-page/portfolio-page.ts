import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HeroScene } from '../../components/hero-scene/hero-scene';

type PaletteCommand =
  | { id: string; label: string; kind: 'section'; target: string; detail?: string }
  | { id: string; label: string; kind: 'link'; target: string; detail?: string }
  | { id: string; label: string; kind: 'route'; target: string; detail?: string }
  | { id: string; label: string; kind: 'action'; target: 'theme'; detail?: string };

@Component({
  selector: 'app-portfolio-page',
  imports: [HeroScene, RouterLink],
  templateUrl: './portfolio-page.html',
  styleUrl: './portfolio-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.light-theme]': 'lightTheme()',
    '(document:keydown)': 'onDocumentKeydown($event)',
    '(window:scroll)': 'onWindowScroll()',
  },
})
export class PortfolioPage implements AfterViewInit, OnDestroy {
  @ViewChild('paletteInput') private paletteInput?: ElementRef<HTMLInputElement>;
  private readonly router = inject(Router);

  protected readonly navItems = [
    { id: 'work', label: 'WORK' },
    { id: 'skills', label: 'SKILLS' },
    { id: 'about', label: 'ABOUT' },
    { id: 'journey', label: 'JOURNEY' },
    { id: 'contact', label: 'CONTACT' },
  ];
  protected readonly technologies = ['.NET', 'ANGULAR', 'C++', 'SQL', 'AI'];
  protected readonly skillGroups = [
    {
      title: 'Languages & frameworks',
      description: 'The building blocks I reach for.',
      skills: ['.NET', 'Angular', 'TypeScript', 'C++'],
    },
    {
      title: 'Data & systems',
      description: 'Thinking about what happens underneath.',
      skills: ['SQL', 'AI', 'Systems thinking'],
    },
    {
      title: 'How I work',
      description: 'A curious, practical approach to engineering.',
      skills: ['Problem solving', 'Clean code', 'Continuous learning'],
    },
  ];

  protected readonly activeSection = signal('');
  protected readonly commandPaletteOpen = signal(false);
  protected readonly lightTheme = signal(false);
  protected readonly mobileMenuOpen = signal(false);
  protected readonly paletteQuery = signal('');
  protected readonly selectedCommandIndex = signal(0);

  protected readonly filteredCommands = computed(() => {
    const query = this.paletteQuery().trim().toLowerCase();
    return this.commands().filter((command) => command.label.toLowerCase().includes(query));
  });

  private readonly commands = computed<PaletteCommand[]>(() => [
    ...this.navItems.map((item) => ({
      id: item.id,
      label: `Go to ${this.titleCase(item.label)}`,
      kind: 'section' as const,
      target: item.id,
    })),
    { id: 'github', label: 'Open GitHub', kind: 'link', target: 'https://github.com/Pothal2000', detail: '↗' },
    { id: 'resume', label: 'View CV / Download PDF', kind: 'route', target: '/resume', detail: '↗' },
    {
      id: 'theme',
      label: `Switch to ${this.lightTheme() ? 'dark' : 'light'} theme`,
      kind: 'action',
      target: 'theme',
    },
  ]);

  private sectionObserver?: IntersectionObserver;
  private previousFocus?: HTMLElement;

  ngAfterViewInit(): void {
    this.observeSections();
  }

  ngOnDestroy(): void {
    this.sectionObserver?.disconnect();
    document.body.classList.remove('light-theme');
    document.documentElement.classList.remove('light-theme');
  }

  protected onDocumentKeydown(event: KeyboardEvent): void {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.openPalette();
      return;
    }

    if (event.key === 'Escape' && this.commandPaletteOpen()) {
      event.preventDefault();
      this.closePalette();
    }
  }

  protected onPaletteKeydown(event: KeyboardEvent): void {
    const commands = this.filteredCommands();
    if (event.key === 'ArrowDown' && commands.length > 0) {
      event.preventDefault();
      this.selectedCommandIndex.update((index) => (index + 1) % commands.length);
    } else if (event.key === 'ArrowUp' && commands.length > 0) {
      event.preventDefault();
      this.selectedCommandIndex.update((index) => (index - 1 + commands.length) % commands.length);
    } else if (event.key === 'Enter' && commands.length > 0) {
      event.preventDefault();
      this.executeCommand(commands[this.selectedCommandIndex()]!);
    } else if (event.key === 'Tab') {
      this.trapPaletteFocus(event);
    }
  }

  protected onPaletteInput(event: Event): void {
    const input = event.target;
    if (input instanceof HTMLInputElement) {
      this.paletteQuery.set(input.value);
      this.selectedCommandIndex.set(0);
    }
  }

  protected openPalette(): void {
    if (!this.commandPaletteOpen()) {
      this.previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : undefined;
    }
    this.commandPaletteOpen.set(true);
    this.paletteQuery.set('');
    this.selectedCommandIndex.set(0);
    requestAnimationFrame(() => {
      if (this.commandPaletteOpen()) {
        this.paletteInput?.nativeElement.focus();
      }
    });
  }

  protected closePalette(): void {
    this.commandPaletteOpen.set(false);
    this.paletteQuery.set('');
    this.previousFocus?.focus();
  }

  protected executeCommand(command: PaletteCommand): void {
    if (command.kind === 'section') {
      document.getElementById(command.target)?.scrollIntoView({ behavior: 'smooth' });
    } else if (command.kind === 'link') {
      window.open(command.target, '_blank', 'noopener,noreferrer');
    } else if (command.kind === 'route') {
      this.closePalette();
      void this.router.navigateByUrl(command.target);
      return;
    } else {
      this.toggleTheme();
    }
    this.closePalette();
  }

  protected toggleTheme(): void {
    const isLight = !this.lightTheme();
    this.lightTheme.set(isLight);
    document.body.classList.toggle('light-theme', isLight);
    document.documentElement.classList.toggle('light-theme', isLight);
  }

  protected toggleMobileMenu(): void {
    this.mobileMenuOpen.update((isOpen) => !isOpen);
  }

  protected closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  protected onWindowScroll(): void {
    if (typeof window !== 'undefined') {
      document.body.classList.toggle('has-scrolled', window.scrollY > 24);
    }
  }

  private observeSections(): void {
    if (typeof IntersectionObserver === 'undefined') {
      return;
    }

    this.sectionObserver = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((first, second) => second.intersectionRatio - first.intersectionRatio);
        const activeId = visibleEntries[0]?.target.id;
        if (activeId && this.navItems.some((item) => item.id === activeId)) {
          this.activeSection.set(activeId);
        }
      },
      { rootMargin: '-22% 0px -60% 0px', threshold: [0, 0.2, 0.5, 1] },
    );

    for (const item of this.navItems) {
      const section = document.getElementById(item.id);
      if (section) {
        this.sectionObserver.observe(section);
      }
    }
  }

  private trapPaletteFocus(event: KeyboardEvent): void {
    const palette = document.querySelector('.command-palette');
    const focusable = palette?.querySelectorAll<HTMLElement>(
      'input:not([disabled]), button:not([disabled])',
    );
    if (!focusable?.length) {
      return;
    }

    const first = focusable[0]!;
    const last = focusable[focusable.length - 1]!;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  private titleCase(value: string): string {
    return value.toLowerCase().replace(/\b\w/g, (character) => character.toUpperCase());
  }
}

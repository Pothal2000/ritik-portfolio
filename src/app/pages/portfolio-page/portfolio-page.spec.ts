import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PortfolioPage } from './portfolio-page';

describe('PortfolioPage', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PortfolioPage],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create the portfolio page', () => {
    const fixture = TestBed.createComponent(PortfolioPage);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render title', async () => {
    const fixture = TestBed.createComponent(PortfolioPage);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('I build software');
  });

  it('should render the portfolio sections', async () => {
    const fixture = TestBed.createComponent(PortfolioPage);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('#work')).toBeTruthy();
    expect(compiled.querySelector('#skills')).toBeTruthy();
    expect(compiled.querySelector('#about')).toBeTruthy();
    expect(compiled.querySelector('#journey')).toBeTruthy();
    expect(compiled.querySelector('#contact')).toBeTruthy();
  });

  it('should show ForgeEngine as the only in-development project', async () => {
    const fixture = TestBed.createComponent(PortfolioPage);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelectorAll('.project-card')).toHaveLength(1);
    expect(compiled.querySelector('.project-card h3')?.textContent).toContain('ForgeEngine');
    expect(compiled.textContent).not.toContain('LogisticsAI');
  });

  it('should link to the generated CV page', async () => {
    const fixture = TestBed.createComponent(PortfolioPage);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('a[routerLink="/resume"]')?.textContent).toContain('View CV');
  });

  it('should open and close the command palette from the keyboard', async () => {
    const fixture = TestBed.createComponent(PortfolioPage);
    await fixture.whenStable();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="dialog"]')).toBeTruthy();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="dialog"]')).toBeNull();
  });
});

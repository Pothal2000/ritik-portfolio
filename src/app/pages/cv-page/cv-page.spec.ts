import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { cvProfile } from '../../data/cv-data';
import { CvPdfService } from './cv-pdf.service';
import { CvPage } from './cv-page';

describe('CvPage', () => {
  const cvPdfService = { download: vi.fn(), preload: vi.fn().mockResolvedValue(undefined) };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CvPage],
      providers: [provideRouter([]), { provide: CvPdfService, useValue: cvPdfService }],
    }).compileComponents();
    cvPdfService.download.mockClear();
    cvPdfService.preload.mockClear();
  });

  it('should render the CV from profile data', async () => {
    const fixture = TestBed.createComponent(CvPage);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(cvPdfService.preload).toHaveBeenCalledOnce();
    expect(compiled.querySelector('h1')?.textContent).toContain('Ritik Pothal');
    expect(compiled.textContent).toContain('ZedEx Software');
    expect(compiled.textContent).toContain('C++ (currently learning)');
    expect(compiled.textContent).toContain('10+ client projects');
    expect(compiled.textContent).toContain('Indira Gandhi National Open University (IGNOU)');
    expect(compiled.textContent).not.toContain('Bachelor of Technology');
    expect(compiled.querySelector('a[href="mailto:ritikpothal1999@gmail.com"]')).toBeTruthy();
    expect(compiled.querySelector('a[href="https://www.linkedin.com/in/ritik-pothal-64611917a"]')).toBeTruthy();
    expect(compiled.querySelector('a[href="https://github.com/Pothal2000"]')).toBeTruthy();
    expect(compiled.querySelector('.cv-footer')).toBeNull();
    expect(compiled.querySelector('.print-hint')).toBeNull();
  });

  it('should download a generated PDF without opening the print dialog', async () => {
    const print = vi.spyOn(window, 'print').mockImplementation(() => undefined);
    const fixture = TestBed.createComponent(CvPage);
    await fixture.whenStable();
    fixture.nativeElement.querySelector('.download-button')?.click();

    expect(cvPdfService.download).toHaveBeenCalledWith(cvProfile);
    expect(print).not.toHaveBeenCalled();
    print.mockRestore();
  });

  it('should report a PDF download failure', async () => {
    cvPdfService.download.mockRejectedValueOnce(new Error('PDF generation failed'));
    const fixture = TestBed.createComponent(CvPage);
    await fixture.whenStable();
    fixture.nativeElement.querySelector('.download-button')?.click();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain(
      'The PDF could not be downloaded',
    );
  });
});

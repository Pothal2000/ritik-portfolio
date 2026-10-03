import { cvProfile } from '../../data/cv-data';
import { createCvPdf } from './cv-pdf';

describe('createCvPdf', () => {
  it('creates a searchable PDF with clickable contact and profile links', () => {
    const pdf = createCvPdf(cvProfile);
    const output = pdf.output();

    expect(output).toContain('%PDF-');
    expect(output).toContain('Ritik Pothal');
    expect(output).toContain('PROFESSIONAL SUMMARY');
    expect(output).toContain('WORK EXPERIENCE');
    expect(output).toContain('ZedEx Software');
    expect(output).toContain('TECHNICAL SKILLS');
    expect(output).toContain('Bachelor of Computer Applications');
    expect(output).toContain('SELECTED ACHIEVEMENT');
    expect(output).toContain('mailto:ritikpothal1999@gmail.com');
    expect(output).toContain('tel:7428585990');
    expect(output).toContain('https://www.linkedin.com/in/ritik-pothal-64611917a');
    expect(output).toContain('https://github.com/Pothal2000');
    expect(pdf.getNumberOfPages()).toBe(1);
  });
});

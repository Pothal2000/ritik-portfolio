import { jsPDF } from 'jspdf';
import { cvProfile } from '../../data/cv-data';

type CvProfile = typeof cvProfile;
type PdfColor = readonly [number, number, number];

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 46;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const BOTTOM = PAGE_HEIGHT - MARGIN;

const colors = {
  ink: [27, 39, 58] as const,
  body: [55, 67, 83] as const,
  muted: [100, 113, 130] as const,
  rule: [218, 224, 232] as const,
  accent: [73, 83, 157] as const,
  accentTint: [243, 245, 250] as const,
};

export function createCvPdf(cv: CvProfile): jsPDF {
  const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
  pdf.setProperties({
    title: `${cv.name} - CV`,
    author: cv.name,
    subject: 'Curriculum vitae',
    creator: 'Ritik Pothal Portfolio',
  });

  let y = MARGIN;
  let hasSection = false;

  const ensureSpace = (height: number): void => {
    if (y + height > BOTTOM) {
      pdf.addPage();
      y = MARGIN;
      hasSection = false;
    }
  };

  const addWrapped = (
    value: string,
    x: number,
    width: number,
    fontSize: number,
    lineHeight: number,
    color: PdfColor,
    font: 'normal' | 'bold' = 'normal',
  ): number => {
    pdf.setFont('helvetica', font);
    pdf.setFontSize(fontSize);
    pdf.setTextColor(...color);
    const lines = pdf.splitTextToSize(value, width) as string[];
    const height = lines.length * lineHeight;
    ensureSpace(height);
    pdf.text(lines, x, y, { lineHeightFactor: lineHeight / fontSize });
    y += height;
    return height;
  };

  const addSectionHeading = (title: string): void => {
    ensureSpace(31);
    y += hasSection ? 10 : 0;
    const baseline = y + 8;
    pdf.setFillColor(...colors.accent);
    pdf.roundedRect(MARGIN, baseline - 8, 3, 11, 1.2, 1.2, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8.5);
    pdf.setTextColor(...colors.ink);
    pdf.text(title.toUpperCase(), MARGIN + 10, baseline);
    const titleWidth = pdf.getTextWidth(title.toUpperCase());
    pdf.setDrawColor(...colors.rule);
    pdf.setLineWidth(0.65);
    pdf.line(MARGIN + 18 + titleWidth, baseline - 2.5, PAGE_WIDTH - MARGIN, baseline - 2.5);
    y = baseline + 11;
    hasSection = true;
  };

  const addBullet = (value: string): void => {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    const lines = pdf.splitTextToSize(value, CONTENT_WIDTH - 17) as string[];
    const lineHeight = 12;
    const height = lines.length * lineHeight;
    ensureSpace(height + 4);
    pdf.setFillColor(...colors.accent);
    pdf.circle(MARGIN + 4, y - 2.6, 1.35, 'F');
    pdf.setTextColor(...colors.body);
    pdf.text(lines, MARGIN + 14, y, { lineHeightFactor: lineHeight / 9 });
    y += height + 4;
  };

  const addContactLink = (label: string, url: string): void => {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8.5);
    pdf.setTextColor(...colors.accent);
    const width = pdf.getTextWidth(label);
    const x = PAGE_WIDTH - MARGIN - width;
    pdf.textWithLink(label, x, y, { url });
    pdf.setDrawColor(...colors.accent);
    pdf.setLineWidth(0.35);
    pdf.line(x, y + 1.5, x + width, y + 1.5);
    y += 12.5;
  };

  pdf.setFillColor(...colors.accent);
  pdf.rect(MARGIN, y, CONTENT_WIDTH, 3, 'F');
  y += 37;

  const nameBaseline = y;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(28);
  pdf.setTextColor(...colors.ink);
  pdf.text(cv.name, MARGIN, nameBaseline);

  y = nameBaseline - 15;
  addContactLink(cv.email, `mailto:${cv.email}`);
  addContactLink(cv.phone, `tel:${cv.phone.replaceAll(' ', '')}`);
  addContactLink('LinkedIn', cv.linkedin);
  addContactLink('GitHub', cv.github);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.setTextColor(...colors.muted);
  pdf.text(cv.location, PAGE_WIDTH - MARGIN, y, { align: 'right' });

  const roleBaseline = nameBaseline + 18;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(11);
  pdf.setTextColor(...colors.accent);
  pdf.text(cv.title, MARGIN, roleBaseline);
  y = Math.max(roleBaseline + 17, y + 13);
  pdf.setDrawColor(...colors.ink);
  pdf.setLineWidth(1);
  pdf.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  y += 17;

  addSectionHeading('Professional Summary');
  addWrapped(cv.summary, MARGIN + 10, CONTENT_WIDTH - 10, 9.2, 12.8, colors.body);

  addSectionHeading('Work Experience');
  for (const experience of cv.experience) {
    ensureSpace(38);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10.5);
    pdf.setTextColor(...colors.ink);
    pdf.text(experience.role, MARGIN + 10, y);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8.5);
    pdf.setTextColor(...colors.muted);
    pdf.text(`${experience.start} - ${experience.end}`, PAGE_WIDTH - MARGIN, y, {
      align: 'right',
    });
    y += 13;

    addWrapped(
      `${experience.company}  |  ${experience.location}`,
      MARGIN + 10,
      CONTENT_WIDTH - 10,
      8.8,
      11.5,
      colors.accent,
      'bold',
    );
    y += 4;
    for (const highlight of experience.highlights) addBullet(highlight);
  }

  addSectionHeading('Technical Skills');
  const skillLabelWidth = 92;
  for (const group of cv.skills) {
    ensureSpace(15);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8.8);
    pdf.setTextColor(...colors.ink);
    pdf.text(group.category, MARGIN + 10, y);
    addWrapped(
      group.items.join('  |  '),
      MARGIN + 10 + skillLabelWidth,
      CONTENT_WIDTH - 10 - skillLabelWidth,
      8.8,
      11.8,
      colors.body,
    );
  }

  addSectionHeading('Education');
  for (const education of cv.education) {
    addWrapped(
      education.qualification,
      MARGIN + 10,
      CONTENT_WIDTH - 10,
      9.5,
      12,
      colors.ink,
      'bold',
    );
    if (education.institution) {
      addWrapped(education.institution, MARGIN + 10, CONTENT_WIDTH - 10, 8.8, 11.5, colors.body);
    }
    addWrapped(education.detail, MARGIN + 10, CONTENT_WIDTH - 10, 8.3, 11, colors.muted);
    y += 3;
  }

  addSectionHeading('Professional Development');
  for (const item of cv.certifications) addBullet(item);

  addSectionHeading('Additional');
  addWrapped(
    `Languages: ${cv.languages.join('  |  ')}`,
    MARGIN + 10,
    CONTENT_WIDTH - 10,
    8.8,
    12,
    colors.body,
  );
  addWrapped(
    `Interests: ${cv.interests.join('  |  ')}`,
    MARGIN + 10,
    CONTENT_WIDTH - 10,
    8.8,
    12,
    colors.body,
  );

  ensureSpace(38);
  y += 8;
  const achievementLines = pdf.splitTextToSize(cv.achievement, CONTENT_WIDTH - 30) as string[];
  const achievementHeight = Math.max(40, achievementLines.length * 12 + 22);
  ensureSpace(achievementHeight);
  pdf.setFillColor(...colors.accentTint);
  pdf.roundedRect(MARGIN, y, CONTENT_WIDTH, achievementHeight, 3, 3, 'F');
  pdf.setFillColor(...colors.accent);
  pdf.rect(MARGIN, y, 3, achievementHeight, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(...colors.accent);
  pdf.text('SELECTED ACHIEVEMENT', MARGIN + 14, y + 15);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(...colors.body);
  pdf.text(achievementLines, MARGIN + 14, y + 30, { lineHeightFactor: 12 / 9 });

  return pdf;
}

export function downloadCvPdf(cv: CvProfile): void {
  createCvPdf(cv).save('Ritik-Pothal-CV.pdf');
}

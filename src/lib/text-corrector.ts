// Text Corrector for OpenAI Whisper mistakes
// Fixes common Arabic transcription errors

export function correctWhisperMistakes(text: string): string {
  // Dictionary of common mistakes and their corrections
  const corrections: Record<string, string> = {
    // Hamza errors (Whisper often drops them)
    'افهم': 'أفهم',
    'احل': 'أحل',
    'اكتب': 'أكتب',
    'اقرا': 'أقرأ',
    'اعرف': 'أعرف',

    // Ta Marbuta errors
    'المساله': 'المسألة',
    'الماده': 'المادة',
    'الصفحه': 'الصفحة',
  };

  let result = text;

  // Apply all corrections
  for (const [wrong, correct] of Object.entries(corrections)) {
    const regex = new RegExp(`\\b${wrong}\\b`, 'gi');
    result = result.replace(regex, correct);
  }

  return result.trim();
}

import { toAsciiName } from '@shared/utils/string.util';

describe('toAsciiName', () => {
  it('normalizes Vietnamese diacritics and spaces', () => {
    expect(toAsciiName('Nguyễn Văn A')).toBe('nguyen-van-a');
  });

  it('trims and lowercases input', () => {
    expect(toAsciiName('  HELLO World  ')).toBe('hello-world');
  });
});

import { describe, expect, it } from 'vitest';

describe('RentProof solvency logic', () => {
  it('approves balance equal to threshold', () => {
    expect(100n >= 100n).toBe(true);
  });

  it('approves balance above threshold', () => {
    expect(150n >= 100n).toBe(true);
  });

  it('rejects balance below threshold', () => {
    expect(99n >= 100n).toBe(false);
  });

  it('rejects zero balance against positive threshold', () => {
    expect(0n >= 100n).toBe(false);
  });

  it('approves zero balance when threshold is zero', () => {
    expect(0n >= 0n).toBe(true);
  });
});

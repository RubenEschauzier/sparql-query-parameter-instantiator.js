import { SubstitutionProviderStatic } from '../../lib/substitution/SubstitutionProviderStatic';

describe('SubstitutionProviderStatic', () => {
  describe('getValues', () => {
    it('should return the provided values', async() => {
      const provider = new SubstitutionProviderStatic([ 'a', 'b', 'c' ]);
      await expect(provider.getValues()).resolves.toEqual([ 'a', 'b', 'c' ]);
    });

    it('should return an empty array when constructed with no values', async() => {
      const provider = new SubstitutionProviderStatic([]);
      await expect(provider.getValues()).resolves.toEqual([]);
    });

    it('should return the same values on repeated calls', async() => {
      const provider = new SubstitutionProviderStatic([ 'x', 'y' ]);
      const first = await provider.getValues();
      const second = await provider.getValues();
      expect(first).toEqual(second);
    });
  });
});

import type { ISubstitutionProvider } from '../../lib/substitution/ISubstitutionProvider';
import { SubstitutionProviderShuffle } from '../../lib/substitution/SubstitutionProviderShuffle';

describe('SubstitutionProviderShuffle', () => {
  let provider: SubstitutionProviderShuffle;
  let subprovider1: ISubstitutionProvider;

  describe('for a plain CSV file', () => {
    beforeEach(() => {
      subprovider1 = {
        getValues: jest.fn(async() => [ 'a1', 'a2', 'a3' ]),
      };
      provider = new SubstitutionProviderShuffle(subprovider1, 123);
    });

    describe('getValues', () => {
      it('returns the rows of the subprovider in a shuffled manner', async() => {
        await expect(provider.getValues()).resolves.toEqual([ 'a2', 'a1', 'a3' ]);

        expect(subprovider1.getValues).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('for an empty provider', () => {
    beforeEach(() => {
      subprovider1 = {
        getValues: jest.fn(async() => []),
      };
      provider = new SubstitutionProviderShuffle(subprovider1, 42);
    });

    describe('getValues', () => {
      it('should return an empty array', async() => {
        await expect(provider.getValues()).resolves.toEqual([]);
      });
    });
  });

  describe('for different seeds', () => {
    it('produces a valid permutation of the input values', async() => {
      const values = [ 'a', 'b', 'c', 'd', 'e' ];
      const subprovider: ISubstitutionProvider = {
        getValues: async() => [ ...values ],
      };
      const shuffleProvider = new SubstitutionProviderShuffle(subprovider, 123);
      const result = await shuffleProvider.getValues();
      expect([ ...result ].sort((a, b) => String(a).localeCompare(String(b)))).toEqual([ ...values ]);
    });

    it('produces the same ordering for the same seed (deterministic)', async() => {
      const values = [ 'a', 'b', 'c', 'd', 'e' ];
      const makeSubprovider = (): ISubstitutionProvider => ({
        getValues: async() => [ ...values ],
      });

      const result1 = await new SubstitutionProviderShuffle(makeSubprovider(), 42).getValues();
      const result2 = await new SubstitutionProviderShuffle(makeSubprovider(), 42).getValues();
      expect(result1).toEqual(result2);
    });
  });
});

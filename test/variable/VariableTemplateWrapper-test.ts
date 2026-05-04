import 'jest-rdf';
import { DataFactory } from 'rdf-data-factory';
import type { ISubstitutionProvider } from '../../lib/substitution/ISubstitutionProvider';
import type { IVariableTemplate } from '../../lib/variable/IVariableTemplate';
import { VariableTemplateWrapper } from '../../lib/variable/VariableTemplateWrapper';

const DF = new DataFactory();

describe('VariableTemplateWrapper', () => {
  let innerSubstitutionProvider: ISubstitutionProvider;
  let innerTemplate: IVariableTemplate;

  beforeEach(() => {
    innerSubstitutionProvider = { getValues: jest.fn(async() => [ 'inner1', 'inner2' ]) };
    innerTemplate = {
      createTerm: jest.fn(() => DF.namedNode('ex:inner')),
      getName: jest.fn(() => 'innerName'),
      getSubstitutionProvider: jest.fn(() => innerSubstitutionProvider),
    };
  });

  describe('createTerm', () => {
    it('should delegate to the inner template', () => {
      const wrapper = new VariableTemplateWrapper(innerTemplate);
      const term = wrapper.createTerm('val');
      expect(term).toEqualRdfTerm(DF.namedNode('ex:inner'));
      expect(innerTemplate.createTerm).toHaveBeenCalledWith('val');
    });
  });

  describe('getName', () => {
    it('should delegate to the inner template', () => {
      const wrapper = new VariableTemplateWrapper(innerTemplate);
      expect(wrapper.getName()).toBe('innerName');
      expect(innerTemplate.getName).toHaveBeenCalledTimes(1);
    });
  });

  describe('getSubstitutionProvider', () => {
    it('should return its own substitution provider when one is set', () => {
      const ownProvider: ISubstitutionProvider = { getValues: jest.fn(async() => [ 'own1' ]) };
      const wrapper = new VariableTemplateWrapper(innerTemplate, ownProvider);
      expect(wrapper.getSubstitutionProvider()).toBe(ownProvider);
      expect(innerTemplate.getSubstitutionProvider).not.toHaveBeenCalled();
    });

    it('should fall back to the inner template provider when no own provider is set', () => {
      const wrapper = new VariableTemplateWrapper(innerTemplate);
      expect(wrapper.getSubstitutionProvider()).toBe(innerSubstitutionProvider);
      expect(innerTemplate.getSubstitutionProvider).toHaveBeenCalledTimes(1);
    });
  });
});

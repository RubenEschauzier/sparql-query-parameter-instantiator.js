import 'jest-rdf';
import { VariableTemplateVoid } from '../../lib/variable/VariableTemplateVoid';

describe('VariableTemplateVoid', () => {
  let variable: VariableTemplateVoid;

  beforeEach(() => {
    variable = new VariableTemplateVoid();
  });

  describe('getName', () => {
    it('should return __void', () => {
      expect(variable.getName()).toBe('__void');
    });
  });

  describe('getSubstitutionProvider', () => {
    it('should return undefined', () => {
      expect(variable.getSubstitutionProvider()).toBeUndefined();
    });
  });

  describe('createTerm', () => {
    it('should produce a blank node', () => {
      const term = variable.createTerm();
      expect(term.termType).toBe('BlankNode');
    });

    it('should produce a fresh blank node on each call', () => {
      const term1 = variable.createTerm();
      const term2 = variable.createTerm();
      expect(term1.termType).toBe('BlankNode');
      expect(term2.termType).toBe('BlankNode');
      expect(term1.value).not.toBe(term2.value);
    });
  });
});

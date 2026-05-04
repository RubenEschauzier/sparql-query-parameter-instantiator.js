import 'jest-rdf';
import { DataFactory } from 'rdf-data-factory';
import type { ISubstitutionProvider } from '../../lib/substitution/ISubstitutionProvider';
import { ValueTransformerReplaceIri } from '../../lib/valuetransformer/ValueTransformerReplaceIri';
import { VariableTemplateList } from '../../lib/variable/VariableTemplateList';
import { VariableTemplateLiteral } from '../../lib/variable/VariableTemplateLiteral';
import { VariableTemplateNamedNode } from '../../lib/variable/VariableTemplateNamedNode';

const DF = new DataFactory();

describe('VariableTemplateList', () => {
  let substitutionProvider: ISubstitutionProvider;
  let variable: VariableTemplateList;

  describe('without variable transformers', () => {
    beforeEach(() => {
      substitutionProvider = <any> {};
      variable = new VariableTemplateList(
        'varNames',
        ', ',
        new VariableTemplateLiteral('varName'),
        substitutionProvider,
      );
    });

    describe('createTerm', () => {
      it('should produce for a string array', () => {
        expect(variable.createTerm([ 'a', 'b' ])).toEqualRdfTerm(DF.literal('a, b'));
      });

      it('should produce for a number array', () => {
        expect(variable.createTerm([ 1, 2 ])).toEqualRdfTerm(DF.literal('1, 2'));
      });

      it('should produce an empty literal for an empty array', () => {
        expect(variable.createTerm([])).toEqualRdfTerm(DF.literal(''));
      });

      it('should throw for a string', () => {
        expect(() => variable.createTerm('a'))
          .toThrow(`Received unsupported non-array value for the VariableTemplateList for varNames`);
      });

      it('should throw for a number', () => {
        expect(() => variable.createTerm(123))
          .toThrow(`Received unsupported non-array value for the VariableTemplateList for varNames`);
      });
    });

    describe('getName', () => {
      it('should return the name', () => {
        expect(variable.getName()).toBe('varNames');
      });
    });

    describe('getSubstitutionProvider', () => {
      it('should return the substitution provider', () => {
        expect(variable.getSubstitutionProvider()).toBe(substitutionProvider);
      });
    });
  });

  describe('with a NamedNode inner template', () => {
    beforeEach(() => {
      substitutionProvider = <any> {};
      variable = new VariableTemplateList(
        'varNames',
        ' ',
        new VariableTemplateNamedNode('varName'),
        substitutionProvider,
      );
    });

    describe('createTerm', () => {
      it('should concatenate named node values using the inner template', () => {
        expect(variable.createTerm([ 'http://ex.org/a', 'http://ex.org/b' ]))
          .toEqualRdfTerm(DF.literal('http://ex.org/a http://ex.org/b'));
      });
    });
  });

  describe('with outer value transformers', () => {
    beforeEach(() => {
      substitutionProvider = <any> {};
      variable = new VariableTemplateList(
        'varNames',
        '-',
        new VariableTemplateLiteral('varName'),
        substitutionProvider,
        [ new ValueTransformerReplaceIri('a', 'b') ],
      );
    });

    describe('createTerm', () => {
      it('should apply transformers to the concatenated literal', () => {
        // ValueTransformerReplaceIri only transforms NamedNodes, so a Literal is left unchanged
        expect(variable.createTerm([ 'x', 'y' ])).toEqualRdfTerm(DF.literal('x-y'));
      });
    });
  });
});

import fs from 'fs';

import { Optionality, PresentationDefinition } from '@sphereon/pe-models';

import { Checked, Status } from '../../lib';
import { EvaluationClient } from "../../lib/evaluation/evaluationClient";
import { HandlerCheckResult } from "../../lib/evaluation/handlerCheckResult";

function getFile(path: string) {
    return JSON.parse(fs.readFileSync(path, 'utf-8'));
}

describe('evaluate', () => {

    it('should return error if value of predicate is not one of [required, preferred]', function () {
        const pdSchema = getFile('./test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json').presentation_definition;
        pdSchema.input_descriptors[0].constraints.fields[0].predicate = "necessary";
        const validPredicates = ['required', 'preferred'];
        const exceptionResults = [];
        pdSchema.input_descriptors.forEach(id => {
            if (id.constraints) {
                id.constraints.fields.forEach(f => {
                    if (!validPredicates.includes(f.predicate)) {
                        exceptionResults.push(new Checked('root.input_descriptor', Status.ERROR, 'predicate value should be one of these values: [\'required\', \'preferred\']'));
                    }
                })
            }
        })
        expect(exceptionResults.length).toEqual(1);
        expect(exceptionResults[0]).toEqual(new Checked('root.input_descriptor', Status.ERROR, 'predicate value should be one of these values: [\'required\', \'preferred\']'));
    });

    it('should return error ok if verifiableCredential\'s age value is matching the specification in the input descriptor', function () {
        const pdSchema: PresentationDefinition = getFile('./test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json').presentation_definition;
        const vpSimple = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
        const evaluationClient: EvaluationClient = new EvaluationClient();
        const results: HandlerCheckResult[] = evaluationClient.evaluate(pdSchema, vpSimple);
        expect(results[3]).toEqual(new HandlerCheckResult('$.input_descriptors[0]', '$.verifiableCredential[0]', 'PredicateRelatedField', Status.INFO, "Input candidate valid for presentation submission", 19));
    });

    it('should return error ok if verifiableCredential\'s age value is matching the specification in the input descriptor', function () {
        const pdSchema: PresentationDefinition = getFile('./test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json').presentation_definition;
        const vpSimple = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
        pdSchema.input_descriptors[0].constraints.fields[0].predicate = Optionality.Preferred;
        const evaluationClient: EvaluationClient = new EvaluationClient();
        const results: HandlerCheckResult[] = evaluationClient.evaluate(pdSchema, vpSimple);
        expect(results[3]).toEqual(new HandlerCheckResult('$.input_descriptors[0]', '$.verifiableCredential[0]', 'PredicateRelatedField', Status.INFO, "Input candidate valid for presentation submission", true));
    });
});
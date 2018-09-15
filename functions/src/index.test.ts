import { snakeCasify } from './index';

test('changeCaseProperties should return an empty object if it recieves one', () => {
    expect(snakeCasify({})).toEqual({});
});

test('changeCaseProperties simple', () => {
    const testObject = {
        someCamelCase: 'hey there',
        sectionEighty: true,
        toPimpAButterfly: ['0', '1']
    };
    const expectedObject = {
        some_camel_case: 'hey there',
        section_eighty: true,
        to_pimp_a_butterfly: ['0', '1']
    };
    expect(snakeCasify(testObject)).toEqual(expectedObject);
});

test('changeCaseProperties complex', () => {
    const testObject = {
        someCamelCase: 'hey there',
        pastInsideThePresent: {
            nestedField: true,
            emergencyPhone: ['0', '1']
        }
    };
    const expectedObject = {
        some_camel_case: 'hey there',
        past_inside_the_present: {
            nested_field: true,
            emergency_phone: ['0', '1']
        }
    };
    expect(snakeCasify(testObject)).toEqual(expectedObject);
});

import {faker} from "@faker-js/faker";
import {failure, success} from "../result";
import {Result} from "../types";

describe('The Result', () => {
    const data = {t: faker.lorem.sentence()};
    const reason = faker.lorem.sentence();

    describe('success', () => {
        const aSuccess: Result<{ t: string }, string> = success(data);

        describe('why it is a monad', () => {
            test('orElse: should return the data', () =>
                expect(aSuccess.orElse(reason)).toEqual(data));

            test('map: should allow us to to produce a new value within a new success', () =>
                expect(aSuccess.map(value => value + reason).orElse(reason)).toEqual(data + reason));

            test('mBind: should allow us to bind to a new Result that produces a new value', () => {
                expect(aSuccess.mBind(value => success(value + reason)).orElse(reason)).toEqual(data + reason);
                expect(aSuccess.mBind(value => failure(value + reason)).orElse(reason)).toEqual(reason);
            });

            test('or: should be skipped', () =>
                expect(aSuccess.or(thisShouldNotHappen).orElse(reason)).toEqual(data));
        });

        test('orNull: should return the data', () =>
            expect(aSuccess.orNull()).toEqual(data));

        describe('either: should call the success path', () => {
            it('should allow us to change it to a failure', () =>
                expect(aSuccess.either(
                    value => failure({t: value.t + reason}),
                    thisShouldNotHappen
                ).value).toEqual({t: data.t + reason}));

            it('should allow us to change it to a different success', () =>
                expect(aSuccess.either(
                    value => success(reason + value),
                    thisShouldNotHappen
                ).value).toEqual(reason + data));
        });

        test('onSuccess: should allow us to consume the value, and return the original value', () =>
            expect(aSuccess.onSuccess(value => expect(value).toEqual(data)).orElse(reason)).toEqual(data));

        test('onFailure: should be skipped', () =>
            expect(aSuccess.onFailure(thisShouldNotHappen).orElse(reason)).toEqual(data));

        test('toMaybe: should be a Some containing the value', () =>
            expect(aSuccess.toMaybe().inspect()).toBe(`Some(${data})`));

        test('isSuccess: should be true', () =>
            expect(aSuccess.isSuccess).toBe(true));
    });

    describe('failure', () => {
        const aFailure: Result<{ t: string }, string> = failure(reason);

        describe('why it is a monad', () => {
            test('orElse: should return the fallback value', () =>
                expect(aFailure.orElse(data)).toEqual(data));

            test('map: should be skipped', () =>
                expect(aFailure.map(thisShouldNotHappen).orElse(reason)).toEqual(reason));

            test('mBind: should be skipped', () =>
                expect(aFailure.mBind(thisShouldNotHappen).orElse(reason)).toEqual(reason));

            test('or: should not allow us to bind to a new Result that produces a new value', () => {
                expect(aFailure.or(value => success(value + reason)).orElse(reason)).toEqual(reason + reason);
                expect(aFailure.or(value => failure(value + reason)).orElse(reason)).toEqual(reason);
            });
        });

        test('orNull: should be null', () =>
            expect(aFailure.orNull()).toBeNull());

        describe('either: should call the failure path', () => {
            it('should allow us to change it to a failure', () =>
                expect(aFailure.either(
                    thisShouldNotHappen,
                    value => success({t: value})
                ).value).toEqual({t: reason}));

            it('should allow us to change it to a different success', () =>
                expect(aFailure.either(
                    thisShouldNotHappen,
                    value => failure(reason + value)
                ).value).toEqual(reason + reason));
        });

        test('onSuccess:: should be skipped', () =>
            expect(aFailure.onSuccess(thisShouldNotHappen).value).toEqual(reason));

        test('onFailure should allow us to consume the value, and return the original value', () =>
            expect(aFailure.onFailure(value => expect(value).toEqual(reason)).value).toEqual(reason));

        test('toMaybe: should be Nothing', () =>
            expect(aFailure.toMaybe().inspect()).toBe('Nothing'));

        test('isSuccess: should be false', () =>
            expect(aFailure.isSuccess).toBe(false));
    });

    const thisShouldNotHappen = () => fail('this should not happen');
});

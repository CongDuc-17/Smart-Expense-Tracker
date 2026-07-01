export class ObjectComparerDto<T> {
	private objectData: T;

	constructor(objectData: T) {
		this.objectData = objectData;
	}

	getUpdatedFields<K>(newObjectData: K): Partial<K> {
		const getUpdatedFields: Partial<K> = {};

		for (const key in newObjectData) {
			if (
				newObjectData[key as keyof K] !=
				(this.objectData as unknown as K)[key as keyof K]
			) {
				getUpdatedFields[key as keyof K] = newObjectData[key as keyof K];
			}
		}

		return getUpdatedFields;
	}
}

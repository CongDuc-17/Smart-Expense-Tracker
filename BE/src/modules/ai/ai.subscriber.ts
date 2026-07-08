import { ImageClassificationService } from './image-classification.service';

import { AppEvents, eventBus, ExpenseImageUploadedEventPayload } from '@/common/events';

const imageClassificationService = new ImageClassificationService();

export function setupAiEventSubscribers() {
	eventBus.on(
		AppEvents.EXPENSE_IMAGE_UPLOADED,
		(payload: ExpenseImageUploadedEventPayload) => {
			console.log(
				`[AI Event] EXPENSE_IMAGE_UPLOADED for expense ${payload.expenseId}`,
			);
			imageClassificationService
				.classify(payload.expenseId, payload.imageUrl)
				.catch((err) => {
					console.error('[AI Event] classify error:', err);
				});
		},
	);
}

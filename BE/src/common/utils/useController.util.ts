import { container } from 'tsyringe';

/**
 * Helper function to resolve controller từ DI container
 * @param ControllerClass - Class controller cần resolve
 * @returns instance của controller với dependencies đã inject
 */
export function useControllerUtil<T>(ControllerClass: new (...args: unknown[]) => T): T {
	return container.resolve<T>(ControllerClass);
}

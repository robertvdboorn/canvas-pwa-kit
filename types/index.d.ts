import { RootComponentInstance } from "@uniformdev/canvas";
import { Request, Response } from "express";

/**
 * Options for the GET handler.
 */
export interface CreatePreviewHandlerGetOptions {
	secret?: string;
	resolveFullPath?: (path: string) => string;
	playgroundPath?: string;
	additionalQueryParams?: string[];
	previewSpecificParams?: string[];
	playgroundSpecificParams?: string[];
}

/**
 * Options for the POST handler.
 */
export interface CreatePreviewHandlerPostOptions {
	secret?: () => string | string;
	enhance?: (
		composition: RootComponentInstance,
		context: {
			req: Request;
		}
	) => Promise<void>;
}

/**
 * Unified options for both GET and POST handlers.
 */
export type CreatePreviewHandlerOptions = CreatePreviewHandlerGetOptions &
	CreatePreviewHandlerPostOptions;

/**
 * GET handler factory.
 * @param options Options for the GET handler.
 * @returns A request handler function for the GET method.
 */
export function createPreviewHandlerGet(
	options?: CreatePreviewHandlerGetOptions
): (req: Request, res: Response) => void;

/**
 * POST handler factory.
 * @param options Options for the POST handler.
 * @returns A request handler function for the POST method.
 */
export function createPreviewHandlerPost(
	options?: CreatePreviewHandlerPostOptions
): (req: Request, res: Response) => Promise<void>;

/**
 * Unified preview handler factory for both GET and POST methods.
 * @param options Options for both GET and POST handlers.
 * @returns A unified request handler function.
 */
export function createPreviewHandler(
	options?: CreatePreviewHandlerOptions
): (req: Request, res: Response) => void;

import { createPreviewHandlerGet } from "./previewHandlerGet.js";
import { createPreviewHandlerPost } from "./previewHandlerPost.js";

/**
 * Creates a unified handler for preview and playground routes.
 * @param {Object} options - Configuration options.
 * @param {string|Function} [options.secret] - The secret key for validating requests or a function to generate it.
 * @param {Function} [options.resolveFullPath] - A function to resolve the full path for the redirect.
 * @param {string} [options.playgroundPath] - The path for the playground.
 * @param {Array<string>} [options.additionalQueryParams] - General additional query string keys to forward.
 * @param {Array<string>} [options.previewSpecificParams] - Query string keys to forward only in preview mode.
 * @param {Array<string>} [options.playgroundSpecificParams] - Query string keys to forward only in playground mode.
 * @param {Function} [options.enhance] - A function to enhance the response data for POST requests.
 * @returns {Function} - The unified handler function.
 */
const createPreviewHandler = ({
	secret,
	resolveFullPath,
	playgroundPath,
	additionalQueryParams,
	previewSpecificParams,
	playgroundSpecificParams,
	enhance,
} = {}) => {
	const getHandler = createPreviewHandlerGet({
		secret,
		resolveFullPath,
		playgroundPath,
		additionalQueryParams,
		previewSpecificParams,
		playgroundSpecificParams,
	});

	const postHandler = createPreviewHandlerPost({ secret, enhance });

	return (req, res) => {
		const method = req.method?.toLowerCase();

		res.setHeader("Access-Control-Allow-Origin", "*");
		res.setHeader("Access-Control-Allow-Headers", "*");
		res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

		if (method === "get") {
			return getHandler(req, res);
		}

		if (method === "post") {
			return postHandler(req, res);
		}

		if (method === "options") {
			return res.status(204).end();
		}

		res.status(501).json({ message: `Method "${method}" not implemented` });
	};
};

export { createPreviewHandler };

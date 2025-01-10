import {
	IN_CONTEXT_EDITOR_QUERY_STRING_PARAM,
	SECRET_QUERY_STRING_PARAM,
	IN_CONTEXT_EDITOR_PLAYGROUND_QUERY_STRING_PARAM,
} from "@uniformdev/canvas";

/**
 * Handles GET requests for the preview and playground routes.
 * @param {Object} options - Configuration options.
 * @param {string|Function} [options.secret] - The secret key for validating requests or a function to generate it.
 * @param {Function} [options.resolveFullPath] - A function to resolve the full path for the redirect.
 * @param {string} [options.playgroundPath] - The path for the playground.
 * @param {Array<string>} [options.additionalQueryParams] - General additional query string keys to forward.
 * @param {Array<string>} [options.previewSpecificParams] - Query string keys to forward only in preview mode.
 * @param {Array<string>} [options.playgroundSpecificParams] - Query string keys to forward only in playground mode.
 */
const createPreviewHandlerGet = ({
	secret,
	resolveFullPath,
	playgroundPath = "/uniform-playground",
	additionalQueryParams = [],
	previewSpecificParams = [],
	playgroundSpecificParams = [],
} = {}) => {
	const baseQueryParams = [
		IN_CONTEXT_EDITOR_QUERY_STRING_PARAM,
		SECRET_QUERY_STRING_PARAM,
		IN_CONTEXT_EDITOR_PLAYGROUND_QUERY_STRING_PARAM,
		...additionalQueryParams,
	];

	return (req, res) => {
		const { query, headers } = req;
		const isConfigCheck = query["is_config_check"] === "true";
		const isPlayground =
			query[IN_CONTEXT_EDITOR_PLAYGROUND_QUERY_STRING_PARAM] === "true";
		const path = query.path;

		if (isConfigCheck) {
			return res.json({
				hasPlayground: Boolean(playgroundPath),
				isUsingCustomFullPathResolver: Boolean(resolveFullPath),
			});
		}

		if (headers["sec-fetch-mode"] === "no-cors") {
			if (query.disable) {
				res.clearPreviewData();
			}
			return res.status(204).end();
		}

		const previewSecret = typeof secret === "function" ? secret?.() : secret;
		const isUsingPreviewSecret = Boolean(previewSecret);

		if (
			isUsingPreviewSecret &&
			query[SECRET_QUERY_STRING_PARAM] !== previewSecret
		) {
			return res.status(401).json({ message: "Invalid token" });
		}

		const buildQueryString = () => {
			const newQuery = new URLSearchParams();
			baseQueryParams.forEach(
				(param) => query[param] && newQuery.append(param, query[param])
			);

			if (isPlayground) {
				playgroundSpecificParams.forEach(
					(param) => query[param] && newQuery.append(param, query[param])
				);
			} else {
				previewSpecificParams.forEach(
					(param) => query[param] && newQuery.append(param, query[param])
				);
			}

			newQuery.append("preview", "true");
			return newQuery.toString();
		};

		if (isPlayground) {
			const redirectUrl = `${playgroundPath}?${buildQueryString()}`;
			return res.set("Referrer-Policy", "origin").redirect(302, redirectUrl);
		}

		if (!path) {
			return res.status(400).json({ message: "Missing slug" });
		}

		const redirectUrl = resolveFullPath
			? resolveFullPath(path)
			: `${path}?${buildQueryString()}`;
		res.set("Referrer-Policy", "origin").redirect(302, redirectUrl);
	};
};

export { createPreviewHandlerGet };

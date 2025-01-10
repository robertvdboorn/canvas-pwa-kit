import { generateHash } from "@uniformdev/canvas";

/**
 * Handles POST requests for the preview and playground routes.
 * @param {Object} options - Configuration options.
 * @param {Function} [options.secret] - A function or value that provides the secret for hash generation.
 * @param {Function} [options.enhance] - A function to enhance the composition instance.
 * @returns {Function} - A handler function for POST requests.
 */
const createPreviewHandlerPost = ({ secret, enhance } = {}) => {
	return async (req, res) => {
		const { composition, hash } = req.body || {};

		if (!composition) {
			return res
				.status(422)
				.json({ message: 'Missing "composition" parameter' });
		}

		const previewSecret = typeof secret === "function" ? secret() : secret;
		const hasProvidedHash = Boolean(hash);
		const hasConfiguredHash = Boolean(previewSecret);

		// Validate hash if configured and provided
		if (hasProvidedHash && hasConfiguredHash) {
			const calculatedHash = generateHash({
				composition,
				secret: previewSecret,
			});

			if (calculatedHash !== hash) {
				return res.status(401).json({ message: "Not authorized" });
			}
		} else if (hasConfiguredHash) {
			// If a secret is configured but no hash is provided
			return res.status(401).json({ message: "Not authorized" });
		}

		// Optionally enhance the composition
		if (enhance) {
			await enhance(composition, { req });
		}

		// Respond with the composition
		return res.status(200).json({
			composition,
		});
	};
};

export { createPreviewHandlerPost };

export function return500OnError(f) {
    return async (req, res, next) => {
        try {
            const result = await f(req, res, next);
            return result;
        } catch (error) {
            if (req.body) {
                console.error(`[body ${JSON.stringify(req.body)}] ${error}`);
            } else {
                console.error(error);
            }
            res.status(500).send();
            throw error;
        }
    };
}

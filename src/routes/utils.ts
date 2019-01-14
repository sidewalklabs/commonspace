export function return500OnError(f) {
    return async (req, res, next) => {
        try {
            const result = await f(req, res, next);
            return result;
        } catch (error) {
            console.error(`[body ${JSON.stringify(req.body)}] ${error}`);
            res.status(500).send();
            throw error;
        }
    };
}

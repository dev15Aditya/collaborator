function generateUniqueId() {
    const uniqueId = Math.random().toString(16).slice(2, 18);
    const generatedIds = new Set();

    if (generatedIds.has(uniqueId)) {
        return generateUniqueId();
    } else {
        generatedIds.add(uniqueId);
        return uniqueId;
    }
}

export default generateUniqueId;

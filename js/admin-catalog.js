(function () {
    const pendingDeletes = new Set();
    const endpointBySection = {
        articles: '/admin-api/catalog',
        books: '/admin-api/catalog',
        authors: '/admin-api/authors',
        publishers: '/admin-api/publishers',
        directions: '/admin-api/directions'
    };

    window.deleteCatalogRecord = async (section, id, displayName) => {
        const endpoint = endpointBySection[section];
        if (!endpoint) return;

        const requestKey = `${section}:${id}`;
        if (pendingDeletes.has(requestKey)) return;
        pendingDeletes.add(requestKey);

        const label = String(displayName || id);
        if (!confirm(`Удалить запись «${label}»?`)) {
            pendingDeletes.delete(requestKey);
            return;
        }

        try {
            const response = await fetch(`${endpoint}/${encodeURIComponent(id)}`, {
                method: 'DELETE'
            });
            if (response.status === 404) {
                if (typeof window.loadForKey === 'function') await window.loadForKey(section);
                return;
            }
            const result = await response.json();
            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Не удалось удалить запись.');
            }

            if (typeof window.loadForKey === 'function') {
                await window.loadForKey(section);
            }
        } catch (error) {
            alert(error.message);
        } finally {
            pendingDeletes.delete(requestKey);
        }
    };
})();

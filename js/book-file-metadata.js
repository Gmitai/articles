(function () {
    const fileInput = document.getElementById('fileUpload');
    const titleInput = document.getElementById('title');
    const pageCountInput = document.getElementById('pageCount');
    if (!fileInput || !titleInput || !pageCountInput) return;

    let lastAutoTitle = '';
    let selectionVersion = 0;
    let titleEditedManually = false;

    titleInput.addEventListener('input', () => {
        if (titleInput.value !== lastAutoTitle) titleEditedManually = true;
    });

    function pageCountFromPdf(file) {
        return (async () => {
            const decoder = new TextDecoder('windows-1252');
            let carry = '';
            let pageCount = 0;
            let treeCount = 0;
            const chunkSize = 2 * 1024 * 1024;

            for (let offset = 0; offset < file.size; offset += chunkSize) {
                const prefixLength = carry.length;
                const bytes = await file.slice(offset, offset + chunkSize).arrayBuffer();
                const text = carry + decoder.decode(bytes);
                for (const match of text.matchAll(/\/Type\s*\/Page\b/g)) {
                    if (match.index + match[0].length > prefixLength) pageCount += 1;
                }
                for (const match of text.matchAll(/\/Count\s+(\d+)/g)) {
                    if (match.index + match[0].length > prefixLength) {
                        treeCount = Math.max(treeCount, Number(match[1]) || 0);
                    }
                }
                carry = text.slice(-64);
            }
            return pageCount || treeCount;
        })();
    }

    async function pageCountFromServer(file) {
        const formData = new FormData();
        formData.append('fileData', file, file.name);
        const response = await fetch('/bookMetadata', { method: 'POST', body: formData });
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(data.message || 'Не удалось определить число страниц.');
        return Number(data.pageCount) || 0;
    }

    fileInput.addEventListener('change', async () => {
        const version = ++selectionVersion;
        const files = Array.from(fileInput.files || []);
        const firstFile = files[0];
        if (!firstFile) return;

        const baseName = firstFile.name.replace(/\.[^.]+$/, '').trim();
        if (baseName && (!titleEditedManually || titleInput.value === lastAutoTitle || !titleInput.value.trim())) {
            titleInput.value = baseName;
            lastAutoTitle = baseName;
            titleEditedManually = false;
        }

        let pages = 0;
        if (files.every(file => /\.(jpe?g|png)$/i.test(file.name))) {
            pages = files.length;
        } else if (files.length === 1 && /\.pdf$/i.test(firstFile.name)) {
            pages = await pageCountFromPdf(firstFile).catch(() => 0);
            if (!pages) pages = await pageCountFromServer(firstFile).catch(error => {
                console.warn('Не удалось определить страницы PDF:', error.message);
                return 0;
            });
        } else if (files.length === 1 && /\.(docx?|djvu?)$/i.test(firstFile.name)) {
            pages = await pageCountFromServer(firstFile).catch(error => {
                console.warn('Не удалось определить страницы документа:', error.message);
                return 0;
            });
        }

        if (version === selectionVersion && pages > 0) pageCountInput.value = String(pages);
    });
})();

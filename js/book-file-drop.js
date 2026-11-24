document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('fileUpload');
    const zone = document.getElementById('fileDropZone');
    const selection = document.getElementById('fileSelection');
    if (!input || !zone || !selection) return;

    const allowedFile = /\.(pdf|docx?|djvu?|jpe?g|png)$/i;
    const imageFile = /\.(jpe?g|png)$/i;
    const compareNames = (left, right) =>
        left.localeCompare(right, undefined, { numeric: true, sensitivity: 'base' });

    function readDirectory(entry, parentPath = '') {
        const reader = entry.createReader();
        const readBatch = () => new Promise((resolve, reject) => {
            reader.readEntries(resolve, reject);
        });
        return (async () => {
            const collected = [];
            while (true) {
                const entries = await readBatch();
                if (!entries.length) break;
                for (const child of entries) {
                    const relativePath = `${parentPath}${child.name}`;
                    if (child.isDirectory) {
                        collected.push(...await readDirectory(child, `${relativePath}/`));
                    } else if (child.isFile) {
                        const file = await new Promise((resolve, reject) => child.file(resolve, reject));
                        collected.push({ file, relativePath });
                    }
                }
            }
            return collected;
        })();
    }

    async function collectDroppedFiles(dataTransfer) {
        const collected = [];
        const rootFolders = [];
        let hasRootFiles = false;
        const items = Array.from(dataTransfer?.items || []);
        for (const item of items) {
            if (item.kind !== 'file') continue;
            const entry = item.webkitGetAsEntry?.();
            if (entry?.isDirectory) {
                rootFolders.push(entry.name);
                collected.push(...await readDirectory(entry, `${entry.name}/`));
            } else if (entry?.isFile) {
                hasRootFiles = true;
                const file = item.getAsFile();
                if (file) collected.push({ file, relativePath: file.name });
            } else {
                hasRootFiles = true;
                const file = item.getAsFile();
                if (file) collected.push({ file, relativePath: file.webkitRelativePath || file.name });
            }
        }
        if (!collected.length) {
            return {
                entries: Array.from(dataTransfer?.files || []).map(file => ({
                    file,
                    relativePath: file.webkitRelativePath || file.name
                })),
                folderName: ''
            };
        }
        return {
            entries: collected,
            folderName: rootFolders.length === 1 && !hasRootFiles ? rootFolders[0] : ''
        };
    }

    const sortImagesByPath = entries => entries.sort((left, right) =>
        compareNames(left.relativePath, right.relativePath)
    );

    const updateSelection = () => {
        const files = Array.from(input.files || []);
        selection.textContent = files.length
            ? files.map(file => file.name).join(', ')
            : 'Файл не выбран';
    };

    input.addEventListener('change', updateSelection);
    input.form?.addEventListener('reset', () => setTimeout(updateSelection, 0));

    for (const eventName of ['dragenter', 'dragover']) {
        zone.addEventListener(eventName, event => {
            event.preventDefault();
            event.stopPropagation();
            zone.classList.add('drag-over');
        });
    }
    for (const eventName of ['dragleave', 'dragend']) {
        zone.addEventListener(eventName, event => {
            event.preventDefault();
            zone.classList.remove('drag-over');
        });
    }

    zone.addEventListener('drop', async event => {
        event.preventDefault();
        event.stopPropagation();
        zone.classList.remove('drag-over');

        let droppedFiles;
        try {
            droppedFiles = await collectDroppedFiles(event.dataTransfer);
        } catch (error) {
            console.error('Не удалось прочитать содержимое папки:', error);
            window.alert('Не удалось прочитать папку. Попробуйте перетащить её ещё раз или выберите изображения вручную.');
            return;
        }
        const files = droppedFiles.entries.map(entry => entry.file);
        if (!files.length) return;
        const totalSize = files.reduce((total, file) => total + file.size, 0);
        const isOneDocument = files.length === 1 && /\.(pdf|docx?|djvu?)$/i.test(files[0].name);
        const areImages = files.every(file => imageFile.test(file.name));
        const valid = files.every(file => allowedFile.test(file.name)) &&
            (isOneDocument || (files.length === 1 && areImages) || (input.multiple && areImages)) &&
            files.length <= (input.multiple ? 500 : 1) && totalSize <= 500 * 1024 * 1024;

        if (!valid) {
            window.alert(input.multiple
                ? 'Перетащите один PDF, Word или DjVu либо до 500 изображений JPG/PNG общим размером до 500 МБ.'
                : 'Перетащите один PDF, Word, DjVu или файл изображения размером до 500 МБ.');
            return;
        }

        try {
            const transfer = new DataTransfer();
            // Folder drag order is inconsistent across browsers. Sort relative
            // paths naturally so page-2 precedes page-10, including subfolders.
            const orderedFiles = areImages ? sortImagesByPath(droppedFiles.entries) : droppedFiles.entries;
            orderedFiles.forEach(({ file }) => transfer.items.add(file));
            input.files = transfer.files;
            if (droppedFiles.folderName) input.dataset.droppedFolderName = droppedFiles.folderName;
            else delete input.dataset.droppedFolderName;
            input.dispatchEvent(new Event('change', { bubbles: true }));
        } catch (error) {
            console.error('Не удалось добавить перетащенный файл:', error);
            window.alert('Браузер не смог принять перетащенный файл. Нажмите на область и выберите файл вручную.');
        }
    });
});

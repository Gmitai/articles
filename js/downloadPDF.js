async function downloadPDF(filename){
    try{
        const response = await fetch(`/download/${filename}`).then(res => res.blob()).then(blob => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
        })


        if(!response.ok){
            throw new Error('Файл не найден');
        }

       /* const blob=await response.blob();
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.fref = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();

        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);*/
    } catch(err){
        console.error('Ошибка',err);
    }
}

async function getFileName(artId){
  const res = await fetch(`/articleFileName/${artId}`);
    if(!res.ok) throw new Error(res.statusText||'Ошибка сети');
    const data = await res.json();
    downloadPDF(data[0]['filePath']);
}
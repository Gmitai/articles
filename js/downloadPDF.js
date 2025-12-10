async function downloadPDF(filename){
    try{
        const response = await fetch(`/download/${filename}`);

        if(!response.ok){
            throw new Error('Файл не найден');
        }

        const blob=await response.blob();
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.fref = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();

        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    } catch(err){
        console.error('Ошибка',err);
    }
}

async function getFileName(artId){
  await fetch(`/articleFileName/${artId}`).then(res=>{
      console.log(res);
      return res});
}
function getFrmId(){
    let frmId = localStorage.getItem('frmId');
    if(frmId == null) frmId=-1;
    return frmId;
}

function getRowId(){
    let rowId = localStorage.getItem('rowId');
    if(rowId == null) rowId=-1;
    return rowId;
}
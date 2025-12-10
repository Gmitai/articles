const nav = document.getElementById('nav');
const contentEl = document.getElementById('main-content');
const titleEl = document.getElementById('page-title');
const refreshBtn = document.getElementById('refreshBtn');
    
    const TABLES = [
        "articles",
        "books",
        "authors",
        "publishers",
        "directions",
        "genres",
        "users"
    ];
    createNav();

    function createNav() {
      TABLES.forEach(key => {
        const btn = document.createElement('button');
        btn.textContent = key === 'articles' ? 'Мақолаҳо' : humanizeKey(key);
        btn.dataset.key = key;
        btn.addEventListener('click', onNavClick);
        nav.appendChild(btn);
      });
      
      const first = nav.querySelector('button');
      if(first) { setActive(first); loadForKey(first.dataset.key); }
    }

    function humanizeKey(key){
      const map = {articles:'Мақолаҳо', authors:'Муалифҳо', publishers:'Нашриёт', directions:'Классификаторҳо', genres:'Жанрҳо', users:'Истифодабарандагон', books:'Китобҳо'};
      return map[key]||key;
    }

     function onNavClick(e){
      const btn = e.currentTarget;
      setActive(btn);
      const key = btn.dataset.key;
      titleEl.textContent = humanizeKey(key);
      loadForKey(key);
    }
     function setActive(btn){
      document.querySelectorAll('.nav button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    }

    async function loadForKey(key){
      showLoading();
      try{
        const res = await fetch(`/${encodeURIComponent(key)}`);
        if(!res.ok) throw new Error(res.statusText||'Ошибка сети');
        const data = await res.json();
        renderTable(key, data[0]);
        localStorage.setItem('frmId', JSON.stringify(data[1]));

      }catch(err){
        showError(err);
      }
    }

    function showLoading(){
      contentEl.innerHTML = '';
      const loaderWrap = document.createElement('div');
      loaderWrap.className = 'placeholder';
      loaderWrap.innerHTML = '<div class="loader" aria-hidden="true"></div><div>Загрузка...</div>';
      contentEl.appendChild(loaderWrap);
    }

    function showError(err){
      contentEl.innerHTML = `<div class="error">Ошибка при загрузке: ${err.message || err}</div>`;
    }

    function renderTable(key, rows){
      contentEl.innerHTML = '';
      if(!Array.isArray(rows) || rows.length === 0){
        contentEl.innerHTML = `<div class="placeholder">Нет данных для таблицы <strong>${key}</strong>.</div>`;
        return;
      }
       const table = document.createElement('table');
      table.className = 'data-table';
      const thead = document.createElement('thead');
      const headerRow = document.createElement('tr');
      const cols = Object.keys(rows[0]);
      cols.forEach(c => { const th = document.createElement('th'); th.textContent = c; headerRow.appendChild(th); });
      thead.appendChild(headerRow);
      table.appendChild(thead);

      const tbody = document.createElement('tbody');
      rows.forEach(r => {
        const tr = document.createElement('tr');
        cols.forEach(c => {
          const td = document.createElement('td');
          td.textContent = r[c] === null ? '' : r[c];
          tr.appendChild(td);
        });


          const img = document.createElement('img');
          img.src = 'edit-icon.png';
          img.alt = 'Редактировать';
          img.style.width = '32px';
          img.style.height = '32px';

          const img2 = document.createElement('img');
          img2.src = 'load-icon.png';
          img2.alt = 'Загрузить';
          img2.style.width = '32px';
          img2.style.height = '32px';

        const tdNew = document.createElement('td');
        const button = document.createElement('button');
        button.appendChild(img);
        button.setAttribute('id', 'edit');
        button.addEventListener('click', () =>{
            showForm(getFrmId(), r['id'])
            refresh()
        });
        tdNew.appendChild(button);

          const button1 = document.createElement('button');
          button1.appendChild(img2);
          button1.setAttribute('id', 'loading');
          button1.addEventListener('click', () =>{
              window.location.href='404.html'
          });
          tdNew.appendChild(button1);

        tr.appendChild(tdNew);
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
      contentEl.appendChild(table);
    }

     refreshBtn.addEventListener('click', () => {
      const active = document.querySelector('.nav button.active');
      if(active) loadForKey(active.dataset.key);
    });

    function refresh() {
    const iframe = document.getElementById('meIframe2');
    iframe.contentWindow.location.reload();
}




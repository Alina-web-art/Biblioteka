const books=[
{t:"Война и мир",a:"Лев Толстой",g:"Классика",in:true},
{t:"Преступление и наказание",a:"Фёдор Достоевский",g:"Классика",in:true},
{t:"Мастер и Маргарита",a:"Михаил Булгаков",g:"Классика",in:false},
{t:"Евгений Онегин",a:"Александр Пушкин",g:"Поэзия",in:true},
{t:"Стихотворения",a:"Анна Ахматова",g:"Поэзия",in:true},
{t:"Мёртвые души",a:"Николай Гоголь",g:"Классика",in:true},
{t:"Пикник на обочине",a:"Аркадий и Борис Стругацкие",g:"Фантастика",in:false},
{t:"Солярис",a:"Станислав Лем",g:"Фантастика",in:true},
{t:"Краткая история времени",a:"Стивен Хокинг",g:"Наука",in:true},
{t:"Sapiens. Краткая история человечества",a:"Юваль Ной Харари",g:"Наука",in:false},
{t:"Маленький принц",a:"Антуан де Сент-Экзюпери",g:"Детская",in:true},
{t:"Денискины рассказы",a:"Виктор Драгунский",g:"Детская",in:true}
];
const q=document.getElementById("q"),g=document.getElementById("g"),list=document.getElementById("books");
[...new Set(books.map(b=>b.g))].forEach(x=>g.insertAdjacentHTML("beforeend",`<option>${x}</option>`));
function render(){
  const s=q.value.trim().toLowerCase(),gv=g.value;
  const r=books.filter(b=>(!gv||b.g===gv)&&(b.t+" "+b.a).toLowerCase().includes(s));
  list.innerHTML=r.length?r.map(b=>`<div class="card book"><span class="genre">${b.g}</span><h3>${b.t}</h3><span class="author">${b.a}</span><span class="status ${b.in?"in":"out"}">${b.in?"● В наличии":"○ Выдана"}</span></div>`).join(""):'<p class="empty">По вашему запросу ничего не найдено.</p>';
}
q.addEventListener("input",render);g.addEventListener("change",render);render();
document.getElementById("year").textContent=new Date().getFullYear();

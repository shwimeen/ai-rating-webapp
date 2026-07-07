const tg = window.Telegram.WebApp;

tg.expand();

const photoInput = document.getElementById("photo");
const preview = document.getElementById("preview");
const photoBox = document.querySelector(".photo-box");
const photoText = document.getElementById("photo-text");


photoInput.addEventListener("change", function(){

    const file = this.files[0];


    if(file){

        preview.src = URL.createObjectURL(file);

        preview.style.display = "block";


        photoText.innerHTML =
        "✅ Фото загружено";


        photoBox.classList.add("loaded");

    }

});

async function analyze() {

    const file =
        document.getElementById("photo").files[0];

    if (!file) {
        alert("Выберите фото");
        return;
    }

    const formData = new FormData();

    formData.append("photo", file);

    formData.append(
        "mode",
        document.getElementById("mode").value
    );

    formData.append(
        "age",
        document.getElementById("age").value
    );

    formData.append(
        "height",
        document.getElementById("height").value
    );

    formData.append(
        "weight",
        document.getElementById("weight").value
    );

    document.getElementById("result").innerHTML =
`
<div class="loading">

<div class="loader"></div>

<h3>✨ AI анализирует</h3>

<p id="ai-text">
🔍 Изучаем изображение...
</p>

</div>
`;


    const response = await fetch(
        "https://brief-crew-waters-hybrid.trycloudflare.com/analyze",
        {
            method: "POST",
            body: formData
        }
    );


    if (!response.ok) {
        document.getElementById("result").innerHTML =
            "❌ Ошибка сервера";

        return;
    }


    const data = await response.json();


   document.getElementById("result").innerHTML =
`
<div class="score">
    <h2>${data.rating}<span>/10</span></h2>
    <p>${data.summary}</p>
</div>


<div class="section">

<h3>✨ Сильные стороны</h3>

<ul>
    ${data.strengths.map(item => 
    `<li>${item}</li>`).join("")}
</ul>

</div>


<div class="section">

<h3>💡 Советы</h3>

<ul>
    ${data.advice.map(item => 
    `<li>${item}</li>`).join("")}
</ul>

</div>
`;
}
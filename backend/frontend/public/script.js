const parseJSON = async (url) => {
    const response = await fetch(url)
    return response.json()
}

const swiperComponent = (data, component) => {
    return`
        <div class="swiper">
            <div class="swiper-wrapper">
                ${data.map(img => component(img)).join("")}
            </div>
        </div>
    `
}

const swiperSlideComponent = ({url, title, upload_date, photographer_name, filename, id}) => {
    return`
    <div class="swiper-slide" id=${id}>
        <img src="/img/${filename}">
        <h2>${title}</h2>
        <h3>Photographer's name: ${photographer_name}</h3>
        <h4>Upload date: ${upload_date}</h4>
        <h5>Original url: ${url}</h5>
        <button class="deleteBtn">Delete</button>
    </div>
    `
}

const formComponent = `
    <form id="form">
        <input type="text" required name="title" class="title" placeholder="Title">
        <input type="text" required name="photographer" class="photographer" placeholder="Photographer's name">
        <input type="url" required name="url" class="url" placeholder="Paste here the original URL">
        <input type="file" required accept=".jpg, .jpeg, .png" name="picture" class="picture">
        <button type="submit">Submit</button>
    </form>
`

const loadEvent = async () => {
    const rootElement = document.getElementById("root")
    const result = await parseJSON("/image-list")
    //console.log(result);
    
    rootElement.insertAdjacentHTML("beforeend", swiperComponent(result, swiperSlideComponent))
    rootElement.insertAdjacentHTML("afterend", formComponent)
    
    const swiper = new Swiper(".swiper", {
        loop: true
    })
    
    
    const formElement = document.getElementById("form")
    
    
    formElement.addEventListener("submit", e => {
        e.preventDefault()
        
        const today = new Date()
        const formData = new FormData()
        const formattedDate = `${today.getFullYear()}.${(today.getMonth()+1)}.${today.getDate()} ${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`

        formData.append("url", e.target.querySelector(`input[name="url"]`).value)
        formData.append("title", e.target.querySelector(`input[name="title"]`).value)
        formData.append("photographer_name", e.target.querySelector(`input[name="photographer"]`).value)
        formData.append("picture", e.target.querySelector(`input[name="picture"]`).files[0])
        formData.append("upload_date", formattedDate)
       
        const fetchSettings = {
            method: "POST",
            body: formData
        }

        fetch('/', fetchSettings)
            .then (async data => {
                if (data.status === 200) {
                    
                    const res = await data.json()
                    console.log(res);
                    
                    const id = res.id
                    const url = res.url
                    const title = res.title
                    const photographer_name = res.photographer_name
                    const filename = res.filename
                    const upload_date = res.upload_date
                    swiper.appendSlide(swiperSlideComponent({id, url, title, photographer_name, filename, upload_date})) // a valtozo neve ugyanaz legyen mint a res mert csak ugy ismeri fel valamiert
                    addEventListenersToDeleteButtons() // van ertelme ezt itt is?
                    swiper.update() //nem igazan csinal semmit ebben az esetben 
                    
                }
                
            })
            .catch(error => {
                e.target.outerHTML = `Error happend!`
                console.log(error);
            })
    })

    const addEventListenersToDeleteButtons = () =>{
        const removeButtons = document.getElementsByClassName("deleteBtn")
        

        Array.from(removeButtons).forEach((removeButton) => { //array-e kellett alakitani, h lehessen szelektalni a lentebb az adott element id-jat 
			removeButton.addEventListener("click", () => {
				let id = removeButton.parentElement.id; //parentElement kellett nem parentNode!
                console.log(id);
				fetch("/delete/" + id, {  //itt kotjuk ossze backenddel, hogy tudja melyiket kell kitorolni
					method: "DELETE",
				})
					.then((res) => res.text()) // or res.json()
					.then((res) => console.log(res));

				swiper.removeSlide(swiper.realIndex); // realindex : Index number of currently active slide 
				swiper.update(); // nem igazan csinal semmit ebben az esetben 
			});
		});
	};
    addEventListenersToDeleteButtons()
    
       
}
    
window.addEventListener("load", loadEvent)


/*     const deleteButtons = document.querySelector(".delete")  //Original delete probalkozas

    deleteButtons.addEventListener("click", e => {
        
        
        const slideName = e.target.innerHTML;
        console.log(slideName);
        
        const deleteSettings = {
            method: "DELETE"
        }

        fetch(`/delete/${id}`, deleteSettings)
            .then(async data =>{
                const data1 = await data.json()
                console.log(data1);
            })
            .catch(error => {
                console.log(error);
            })
        }) */
        
 

    /* 
    const deleteButtons = document.querySelectorAll(".delete")
    for(const deleteButton of deleteButtons) {

        deleteButton.addEventListener("click", e => {
            const title = e.target.innerHTML;
            console.log(title);

            
            const deleteSettings = {
                method: "DELETE",
             
            }

            fetch('/delete', deleteSettings)
                .then(async data =>{
                    const data1 = await data.json()
                    console.log(data1);
                    swiper.removeSlide(title)
                })
            })
        } */
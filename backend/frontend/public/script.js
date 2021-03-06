const parseJSON = async (url) => {
    const response = await fetch(url);
    return response.json();
};

const swiperComponent = (data, component) => {
    return `
        <div class="swiper">
            <div class="swiper-wrapper">
                ${data.map((img) => component(img)).join("")}
            </div>
            <div class="swiper-button-next"></div>
            <div class="swiper-button-prev"></div>
        </div>
    `;
};

const swiperSlideComponent = ({
    url,
    title,
    upload_date,
    photographer_name,
    filename,
    id,
}) => {
    return `
    <div class="swiper-slide" id=${id}>
        <img src="/img/${filename}">
        <h2>${title}</h2>
        <h5>Original url: ${url}</h5>
        <h3>Photographer's name: ${photographer_name}</h3>
        <h4>Upload date: ${upload_date}</h4>
        <button class="deleteBtn">Delete</button>
    </div>
    `;
};

const formComponent = `
    <form id="form">
        <h2>Upload your pictures!</h2>
        <input type="text" required name="title" class="title" placeholder="Title">
        <input type="text" required name="photographer" class="photographer" placeholder="Photographer's name">
        <input type="url" required name="url" class="url" placeholder="Paste here the original URL">
        <input type="file" required accept=".jpg, .jpeg, .png" name="picture" class="picture">
        <button type="submit">Submit</button>
        <p id="log"></p>
    </form>
`;

const loadEvent = async () => {
    const rootElement = document.getElementById("root");
    const result = await parseJSON("/image-list");

    rootElement.insertAdjacentHTML(
        "beforeend",
        swiperComponent(result, swiperSlideComponent)
    );
    rootElement.insertAdjacentHTML("beforeend", formComponent);

    const swiper = new Swiper(".swiper", {
        loop: true,
        navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
        },
    });

    const logUpload = () => {
        const log = document.getElementById("log");
        log.textContent = `Form Submitted!`;
    };

    const formElement = document.getElementById("form");

    formElement.addEventListener("submit", (e) => {
        e.preventDefault();

        const today = new Date();
        const formData = new FormData();
        const formattedDate = `${today.getFullYear()}.${
            today.getMonth() + 1
        }.${today.getDate()}. ${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;

        formData.append(
            "url",
            e.target.querySelector(`input[name="url"]`).value
        );
        formData.append(
            "title",
            e.target.querySelector(`input[name="title"]`).value
        );
        formData.append(
            "photographer_name",
            e.target.querySelector(`input[name="photographer"]`).value
        );
        formData.append(
            "picture",
            e.target.querySelector(`input[name="picture"]`).files[0]
        );
        formData.append("upload_date", formattedDate);

        const fetchSettings = {
            method: "POST",
            body: formData,
        };

        fetch("/", fetchSettings)
            .then(async (data) => {
                if (data.status === 200) {
                    const res = await data.json();
                    console.log(res);

                    const id = res.id;
                    const url = res.url;
                    const title = res.title;
                    const photographer_name = res.photographer_name;
                    const filename = res.filename;
                    const upload_date = res.upload_date;
                    swiper.appendSlide(
                        swiperSlideComponent({
                            id,
                            url,
                            title,
                            photographer_name,
                            filename,
                            upload_date,
                        })
                    );
                    addEventListenersToDeleteButtons();
                    swiper.update();
                    logUpload();
                }
            })
            .catch((error) => {
                e.target.outerHTML = `Error happend!`;
                console.log(error);
            });
    });

    const addEventListenersToDeleteButtons = () => {
        const removeButtons = document.getElementsByClassName("deleteBtn");

        Array.from(removeButtons).forEach((removeButton) => {
            removeButton.addEventListener("click", () => {
                let id = removeButton.parentElement.id;

                fetch("/delete/" + id, {
                    method: "DELETE",
                }).then((res) => res.text());

                swiper.removeSlide(swiper.realIndex);
                swiper.update();
            });
        });
    };
    addEventListenersToDeleteButtons();
};

window.addEventListener("load", loadEvent);

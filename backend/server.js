const { json } = require("express")
const express = require("express")
const fileUpload = require("express-fileupload")
const fs = require("fs")
const path = require("path")
const { addAbortSignal } = require("stream")
const { deflateSync } = require("zlib")

const app = express()
app.use(express.json())
app.use(fileUpload())



const pathToFrontend = path.join(`${__dirname}/frontend`)


//index kiszolgalasa
app.get('/', (req, res) => {
    res.sendFile(`${pathToFrontend}/index.html`)
})



//feltotott kepek kiszolgalasa 

app.get('/image-list', (req, res) =>{
    res.sendFile(`${__dirname}/data.json`)
})



const uploads = `${pathToFrontend}/img/`

// jsonData letrehozasa, hogy abba tudjuk belementeni eloszor az adatokat h majd push mehessen a data.jsonba
let jsonData = [];
    try {
        let data = fs.readFileSync(`${__dirname}/data.json`, error => {
            if (error) {
                console.log(error);
            }
        })
        jsonData = JSON.parse(data)
    } catch (error) {
        console.log(error);
        
    }

const getId = () => {        //ami enne az erteke lesz az megy hozza az adathoz lentebb
    let ids= [];
    jsonData.forEach((element) => {
        ids.push(parseInt(element.id))
    })

    return ids.length === 0 ? 0 : Math.max(...ids) + 1;
}

app.post('/', (req, res) => {
    const picture = req.files.picture

    //upload data from input fields

    const inputFields = req.body
    inputFields.id = getId();
    inputFields.filename = picture.name
    jsonData.push(inputFields)

    fs.writeFile(`${__dirname}/data.json`, JSON.stringify(jsonData), error => {
        if (error) {
            console.log(error);
        }
    })

    //upload image



    if (picture) {
        picture.mv(`${uploads}${picture.name}`)
    }

    res.send(inputFields)

})



    //delete image and json data

app.delete('/delete/:id' , (req,res) => {
	let newJsonData = [];
	jsonData.forEach((element) => {
        //console.log(element);
        //console.log(req.params.id);
        if (element.id.toString() === req.params.id) { // ha az id-k megegyeznek, akkor torolje
			const removePath = __dirname + "/frontend/img/" + element.filename;
			console.log(removePath);
			try {
				fs.unlinkSync(removePath);
			} catch (err) {
				console.error(err);
			}

        } else { // HA NEM EGYEZNEK MEG AKKOR PUSHOLJA A NEWJSONDATA-BA!!!
            newJsonData.push(element) // itt kerul bele a newJsonData-ba az uj array!
        }

	});
    
    jsonData = newJsonData //jsonData tartalma legyen felulirva az uj array-el, h ne maradjon benne a regi ertek
    //console.log(jsonData);
    //console.log(newJsonData);

    //Overwrite the data.json with the updated array
    fs.writeFile(`${__dirname}/data.json`, JSON.stringify(jsonData), err => {
        if (err) {
            console.log(err);
        }
    })

    // Send back what was deleted
    res.sendStatus(200)
        
        
    })

//public mappa kiszolgalasa 

app.use('/public', express.static(`${pathToFrontend}/public`))
app.use('/img', express.static(`${pathToFrontend}/img`))

const port = 9000
app.listen(port, () => {
    console.log(`http://127.0.0.1:${port}`);
})




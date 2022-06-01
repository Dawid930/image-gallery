const express = require("express")
const fileUpload = require("express-fileupload")
const fs = require("fs")
const path = require("path")


const app = express()
app.use(express.json())
app.use(fileUpload())



const pathToFrontend = path.join(`${__dirname}/frontend`)


// serve of index.html
app.get('/', (req, res) => {
    res.sendFile(`${pathToFrontend}/index.html`)
})



// serve of uploaded pictures from data.json

app.get('/image-list', (req, res) =>{
    res.sendFile(`${__dirname}/data.json`)
})



const uploads = `${pathToFrontend}/img/`

// creation of jsonData to save the data then push it to data.json
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

const getId = () => {
    let ids= [];
    jsonData.forEach((element) => {
        ids.push(parseInt(element.id))
    })

    return ids.length === 0 ? 0 : Math.max(...ids) + 1;
}

app.post('/', (req, res) => {
    const picture = req.files.picture

    // upload data from input fields

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

    // delete image and json data

app.delete('/delete/:id' , (req,res) => {
	let newJsonData = [];
	jsonData.forEach((element) => {
    
        if (element.id.toString() === req.params.id) { 
			const removePath = __dirname + "/frontend/img/" + element.filename;
			console.log(removePath);
			try {
				fs.unlinkSync(removePath);
			} catch (err) {
				console.error(err);
			}

        } else { 
            newJsonData.push(element) 
        }

	});
    
    jsonData = newJsonData
  


    // overwrite the data.json with the updated array
    fs.writeFile(`${__dirname}/data.json`, JSON.stringify(jsonData), err => {
        if (err) {
            console.log(err);
        }
    })

    // send back what was deleted
    res.sendStatus(200)
        
        
    })

//public mappa kiszolgalasa 

app.use('/public', express.static(`${pathToFrontend}/public`))
app.use('/img', express.static(`${pathToFrontend}/img`))

const port = 9000
app.listen(port, () => {
    console.log(`http://127.0.0.1:${port}`);
})




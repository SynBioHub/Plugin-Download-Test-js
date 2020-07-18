const express = require('express')
const path = require('path')
const fs = require('fs');
const app = express();
const port = 5000


app.use(express.json());

app.get('/Status', function (req, res) {
	res.status(200).send('The Download Test Plugin Flask Server is up and running')
})

app.post('/Evaluate', function (req, res) {
	var data =  JSON.stringify(req.body)
	var rdf_type = req.body.type.toString()
	
	////////REPLACE THIS SECTION WITH OWN RUN CODE ////////////
	//Use rdf types
	var accepted_types = ['Activity', 'Agent', 'Association', 'Attachment', 'Collection',
                'CombinatorialDerivation', 'Component', 'ComponentDefinition',
                'Cut', 'Experiment', 'ExperimentalData',
                'FunctionalComponent','GenericLocation',
                'Implementation', 'Interaction', 'Location',
                'MapsTo', 'Measure', 'Model', 'Module', 'ModuleDefinition',
                'Participation', 'Plan', 'Range', 'Sequence',
                'SequenceAnnotation', 'SequenceConstraint',
                'Usage', 'VariableComponent'];
	
	var acceptable = accepted_types.includes(rdf_type);
	
	//to ensure it shows up on all pages
	// acceptable = true
	//////////////////END SECTION//////////////////////////////
	
	if (acceptable) {
		res.status(200).send(`The type sent (${rdf_type}) is an accepted type`);
	} else {
		res.status(415).send(`The type sent (${rdf_type}) is NOT an accepted type`);
	};

})

app.post('/Run', function (req, res) {
	var cwd = __dirname
	var temp_dir = path.join(cwd, 'temp_dir')

	
	//Delete temp_dir if it exists
	if (fs.existsSync(temp_dir)) {
	  fs.rmdirSync(temp_dir, {recursive: true});
	};
	fs.mkdirSync(temp_dir);
	
	var data =  JSON.stringify(req.body)
    
    var top_level_url = req.body.top_level.toString()
    var complete_sbol = req.body.complete_sbol.toString()
    var instance_url = req.body.instanceUrl.toString()
    var genbank_url = req.body.genbank.toString()
    var size = req.body.size.toString()
    var rdf_type = req.body.type.toString()
    var shallow_sbol = req.body.shallow_sbol.toString()
    
	var url = complete_sbol.replace("/sbol","");
	
	try{
        ////////REPLACE THIS SECTION WITH OWN RUN CODE ////////////
        //read in test.html
		var filename = path.join(cwd, 'Test.html');
        var result = fs.readFileSync(filename);
		result = result.toString()
            
        //put in the url, uri, and instance given by synbiohub
		result = result.replace("URL_REPLACE", url);
        result = result.replace("URI_REPLACE", top_level_url);
        result = result.replace("INSTANCE_REPLACE", instance_url);
        result = result.replace("REQUEST_REPLACE", data);

        //write out file
        var out_name = "Out.html"
		var filename = path.join(cwd, 'temp_dir', out_name);
		
		fs.writeFileSync(filename, result);
		
        
        //this file could be a zip archive or any path and file name relative to temp_dir
        var download_file_path = filename
        //////////////////END SECTION//////////////////////////////
        
		res.sendFile(download_file_path, function(){
			//clear temp_dir directory
			fs.rmdirSync(temp_dir, {recursive: true});
		});
    } catch (err) {    
        console.log(err)
		res.status(400)
	};
})

app.listen(port, () => console.log(`Test Visualisation app is listening at http://localhost:${port}`))

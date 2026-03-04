const express = require('express')
const path = require('path')
const fs = require('fs');
const http = require('http');
const https = require('https');
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

app.post('/Run', async function (req, res) {
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
	var token = (typeof req.body.token === 'undefined' || req.body.token === null) ? undefined : req.body.token.toString()
    
	var url = complete_sbol.replace("/sbol", "");

	try{
		
        ////////REPLACE THIS SECTION WITH OWN RUN CODE ////////////
        //read in test.html
		var filename = path.join(cwd, 'Test.html');
        var result = fs.readFileSync(filename);
		result = result.toString()

		var tokenVal = (typeof token === 'undefined' || token === null) ? 'null' : token;
		var headers = { 'Accept': 'text/plain' };
		if (tokenVal !== 'null') {
			headers['X-authorization'] = tokenVal;
		}

		var responseStatusCode = 'ERROR';
		if (typeof fetch === 'function') {
			var response = await fetch(url, { method: 'GET', headers: headers });
			responseStatusCode = response.status;
		} else {
			// Fallback for older Node: use http/https without changing control flow elsewhere.
			responseStatusCode = await new Promise(function(resolve) {
				var client = url.startsWith('https://') ? https : http;
				var req2 = client.get(url, { headers: headers }, function(r) {
					r.on('data', function(){});
					r.on('end', function(){ resolve(r.statusCode); });
				});
				req2.on('error', function(){ resolve('ERROR'); });
			});
		}

		
            
        //put in the url, uri, and instance given by synbiohub
		result = result.replace("URL_REPLACE", url);
        result = result.replace("URI_REPLACE", top_level_url);
        result = result.replace("TOKEN_REPLACE", tokenVal);
        result = result.replace("INSTANCE_REPLACE", instance_url);
        result = result.replace("SIZE_REPLACE", String(size));
        result = result.replace("RDFTYPE_REPLACE", rdf_type);
        result = result.replace("SHALLOWSBOL_REPLACE", shallow_sbol);
        result = result.replace("REQUEST_REPLACE", data);
        result = result.replace("RESPONSE_CODE_REPLACE", String(responseStatusCode));



        //write out file
        var out_name = "Out.html"
		var filename = path.join(cwd, 'temp_dir', out_name);
		
		fs.writeFileSync(filename, result);
		
        
        //this file could be a zip archive or any path and file name relative to temp_dir
        var download_file_path = filename
        //////////////////END SECTION//////////////////////////////
		
		//Sets filename parameter to filename (avoid quoted filename for clients that mis-parse it)
		res.setHeader('Content-Disposition', 'attachment; filename=' + out_name)
		
		//sends file
		res.sendFile(download_file_path, function(){
			//clear temp_dir directory
			fs.rmdirSync(temp_dir, {recursive: true});
		});
    } catch (err) {    
        console.error(err)
		res.status(400)
	};
})

app.listen(port, () => console.log(`Test Download app is listening at http://localhost:${port}`))

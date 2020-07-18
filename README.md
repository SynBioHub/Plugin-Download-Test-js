# Plugin-Download-Test-js
A small test plugin to test the download interface is working for SynBioHub. Could be the basis for javascript (Node.js) based download plugins.

# Install
## Using docker
Run `docker run --publish 8090:5000 --detach --name js-test-plug synbiohub/plugin-download-test-js:snapshot`
Check it is up using localhost:8090/status or post to localhost:8090/run.

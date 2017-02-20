const gh = new GitHub();
var btn = document.getElementById('submit');

function makeScene(githubResponse){
	/*
		 Data we care about:
		 - author
		 - by week, additions, deletions, commits
		 */
	var ret = githubResponse.data.reduce( function _makeAuthors( acc, authorInfo ){
		var authorName = authorInfo.author.login;
		/* commits are tuples of form { date, additions, deletions, commits } */
		var info = authorInfo.weeks.map( function _convertWeekInfo(wi, weekNumber) {
			return {
				date: weekNumber,
				additions: wi.a,
				deletions: wi.d,
				commits: wi.c
			}
		});

		acc[authorName] = (acc[authorName] || []).concat(info);
		return acc;
	}, Object.create(null));

	console.log(ret);
	init(ret);
	animate();
}

function getFreqs(){
	var user = document.getElementById('user').value; // e.g. 'hawthornehaus';
	var repo = document.getElementById('repo').value; // e.g. 'statisaur';
	gh.getRepo(user, repo).getContributorStats().then(makeScene);
	
}

btn.addEventListener('click', getFreqs);

var container;
var camera, scene, renderer;

function init( commitInfo ) {
	container = document.getElementById( 'container' );
	scene = new THREE.Scene();
	var light, object;
	scene.add( new THREE.AmbientLight( 0x404040 ) );

	light = new THREE.DirectionalLight( 0xffffff );
	light.position.set( 0, 1, 0 );
	scene.add( light );

	var axisHelper = new THREE.AxisHelper( 20 );
	axisHelper.position.x = -10;
	axisHelper.position.y = -10;
	axisHelper.position.z = -10;
	scene.add( axisHelper );

	function makeCommitLine(author, authorIndex, commitInfo, dataKey){
		// Set a random color for user
		var material = new THREE.LineBasicMaterial();
		//material.color = new THREE.Color( Math.random(), Math.random(), Math.random() );

		var keyOptions = {
			'deletions': {'color':new THREE.Color( 1, 0, 0 ), 'xform':-1},
			'additions': {'color':new THREE.Color( 0, 1, 0 ), 'xform':1}
		};

		material.color = keyOptions[dataKey].color;

		var info = commitInfo[author];
		var commitLine = new THREE.Geometry();
		info.forEach( function _addCommitLineVertices(d){
			// Apply transform (negation for deletion) if appropriate
			var yValue = d[dataKey] * keyOptions[dataKey].xform;
			// Push point onto line
			commitLine.vertices.push( new THREE.Vector3(d.date , yValue, 0 ) );
		});


		var object = new THREE.Line( commitLine, material );
		object.position.z = authorIndex*25;

		return object;
	}

	Object.keys(commitInfo).forEach( function _buildLines( author, authorIndex ){
		deletionObject = makeCommitLine(author, authorIndex, commitInfo, "deletions")
			scene.add(deletionObject);
		additionObject = makeCommitLine(author, authorIndex, commitInfo, "additions")
			scene.add(additionObject);

		console.log("Added commit line for ", author);
	});

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	//TODO: Move this functionality to canvas
	if(container.firstChild){
		container.replaceChild( renderer.domElement, container.firstChild );
	} else {
		container.appendChild( renderer.domElement );
	}

	camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 2000 );
	camera.position.x = 1000;

	controls = new THREE.OrbitControls( camera, renderer.domElement );
	controls.addEventListener( 'change', render );
	window.addEventListener( 'resize', onWindowResize, false );
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
	requestAnimationFrame( animate );
	controls.update();
}

function render() {
	renderer.render( scene, camera );
}

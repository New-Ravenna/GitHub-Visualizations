const gh = new GitHub();
var btn = document.getElementById('submit');
var getFreqs = function(){
	var user_name = document.getElementById('user').value;//'hawthornehaus';
	var repo_name = document.getElementById('repo').value;//'statisaur';
	var repo = gh.getRepo(user_name, repo_name);
	var stats = repo.getContributorStats().then(function(data){
		/*
			Data we care about:
				- author
				- by week, additions, deletions, commits
		*/
		var ret = data.data.reduce( function _makeAuthors( acc, authorInfo ){
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
	});
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

	Object.keys(commitInfo).forEach( function _buildLines( author, authorIndex ){
		var info = commitInfo[author];
		var commitLine = new THREE.Geometry();
		info.forEach( function _addCommitLineVertices(d){
			commitLine.vertices.push( new THREE.Vector3(d.date , d.additions,0 ) );
		});

		var material = new THREE.MeshBasicMaterial({wireframe:false});
		material.color = new THREE.Color( Math.random(), Math.random(), Math.random() );

		var object = new THREE.Line( commitLine, material);
		object.position.z = authorIndex*25;
		scene.add(object);

		console.log("Added commit line for ", author);
	});

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
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

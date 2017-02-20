const gh = new GitHub();
var btn = document.getElementById('submit');
var getFreqs = function(){
	var user_name = document.getElementById('user').value;//'hawthornehaus';
	var repo_name = document.getElementById('repo').value;//'statisaur';
	var repo = gh.getRepo(user_name, repo_name);
	var stats = repo.getContributorStats().then(function(data){
		var output = _(data.data)
			.map((v) => ({ 
				author: v.author.login,
				additions: _.sumBy(v.weeks, 'a')
			})).value();
		console.log(output)});
	init();
	animate();
}
btn.addEventListener('click', getFreqs);

var container;

var camera, scene, renderer;

function init() {
	container = document.getElementById( 'container' );
	//document.body.appendChild( container );
	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
	camera.position.y = 400;

	scene = new THREE.Scene();

	var light, object;

	scene.add( new THREE.AmbientLight( 0x404040 ) );

	light = new THREE.DirectionalLight( 0xffffff );
	light.position.set( 0, 1, 0 );
	scene.add( light );

	//	var map = new THREE.TextureLoader().load( 'textures/UV_Grid_Sm.jpg' );

	var material = new THREE.MeshBasicMaterial({wireframe:true});
	material.color = new THREE.Color( Math.random(), Math.random(), Math.random() );

	object = new THREE.Mesh( new THREE.SphereGeometry( 75, 20, 10 ) , material );
	object.position.set( -200, 0, 200 );

	scene.add( object );

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	if(container.firstChild){
		container.replaceChild( renderer.domElement, container.firstChild );
	} else {
		container.appendChild( renderer.domElement );
	}


	window.addEventListener( 'resize', onWindowResize, false );
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}
//
function animate() {
	requestAnimationFrame( animate );
	render();
}
function render() {
	var timer = Date.now() * 0.0001;
	camera.position.x = Math.cos( timer ) * 800;
	camera.position.z = Math.sin( timer ) * 800;
	camera.lookAt( scene.position );
	//	for ( var i = 0, l = scene.children.length; i < l; i ++ ) {
	//		var object = scene.children[ i ];
	//		object.rotation.x = timer * 5;
	//		object.rotation.y = timer * 2.5;
	//	}
	renderer.render( scene, camera );
}







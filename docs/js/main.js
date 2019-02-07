import Navigation from '../Sauna/js/NavigationSpa.js';
import Util from '../Diabetes/Util.js';
import PromiseUtils from '../PromiseUtils/PromiseUtils.js';
import Finger from '../Finger/DatabaseStore.js';

let n = new Navigation();
n.setPageInit('page1');

let db = new Finger
({
	name		: "runs"
	,version	: 4
	,stores		:{
		session : {
			keyPath	: 'id'
			,autoIncrement: true
			,indexes	:
			[
				{ indexName: "session_id", keyPath:"session_id", objectParameters: { unique : false, multiEntry: false, locale: 'auto'  } }
			]
		}
	}
});

db.init().then(()=>
{
	console.log('loaded');
});

let error_counter = 0;

Util.getById('stopButton').addEventListener('click',(evt)=>
{
	Util.stopEvent( evt );
	nxt_stop_geolocation();
});

Util.getById('startButton').addEventListener('click',(evt)=>
{
	Util.stopEvent( evt );
	let buffer	= [];
	let session_id = Date.now();
	let counter = 0;

	n.click_anchorHash( '#pageRunning' );
	nxt_start_geolocation
	({
		options:
		{
			enableHighAccuracy	: true,
			maximumAge		: 30000,
			timeout		: 40000
		}
		,error:	function(e)
		{
			error_counter++;
			Util.getById('error').textContent = e.msg;
			Util.getById('error_counter').textContent = ''+error_counter;
		}
		,onUpdate:function(p)
		{
			counter++;
			let coord_copy =
			{
				session_id: session_id
				,timestamp: p.timestamp
				,latitude : p.coords.latitude
				,longitude: p.coords.longitude
				,altitude: p.coords.altitude
				,accuracy: p.coords.accuracy
				,altitudeAccuracy: p.coords.altitudeAccuracy
				,heading: p.coords.heading
				,speed: p.coords.speed
			};


			buffer.push( coord_copy );

			for( let i in coord_copy )
			{
				let d = Util.getById( i );

				if( d )
				 d.textContent = ''+coord_copy[ i ];
			}

			Util.getById('counter').textContent = counter;

			if( buffer.length > 10 )
			{
				let copy = buffer.splice(0,buffer.length);

				db.addItems('session', copy, true ).catch((e)=>
				{
					console.log('Error');
				});
			}
		}
	});
});




/*
nxt_start_geolocation
({
	onUpdate:function(p)
	{

	}
	,error:	function(e)
	{

	}
	,options:
	{

	}
});
*/

var _nxt_sim_gps = [];
var NXT_position_id = false;

function nxt_start_geolocation( obj )
{
	if( ! navigator.geolocation )
	{
		console.error('Browser has no geolocation support');
		return;
	}

	if( typeof obj.onUpdate != 'function' )
		return;

	nxt_stop_geolocation();

	var options	 = obj.options ||
	{
		enableHighAccuracy	: true,
		maximumAge		: 30000,
		timeout		: 40000
	};

	var e			= (typeof obj.error == 'function' ? obj.error : function(a){ console.error( a ); });

	if( ! obj.simulate )
	{
		NXT_position_id = navigator.geolocation.watchPosition(obj.onUpdate ,e ,options );
		return;
	}

	//simulacion
	NXT_position_id = true;

	var i		= { lat: 0, lon: 1, altitude: 2, speed: 3, timestamp: 4 };
	var now	 = Date.now();
	var time0	= obj.simulateData[0][i.timestamp];
	var diff	= now - time0;
	var calls	= 0;

	var f = function( d ,t, delay )
	{
		var x = function()
		{
			calls++;
			//console.log('XXXX');

			if( NXT_position_id	=== false )
				return;

			obj.onUpdate
			({
				timestamp	: t,
				coords	 :
				{
					latitude			: d[ i.lat ]
					,longitude			: d[ i.lon ]
					,accuracy			: null
					,altitudeAccuracy	: null
					,heading			: null
					,speed				: d[ i.speed ]
				}
			});
		};
		_nxt_sim_gps.push( x );
		setTimeout( x, delay );
	};

	for(var j=0,ii=obj.simulateData.length;j<ii;j++)
	{
		var c		= obj.simulateData[ j ][ i.timestamp ];
		var delay	= c - time0;
		var t		= diff+c;
		f( obj.simulateData[ j ], c, delay );
	}
}


function nxt_stop_geolocation()
{
	if( NXT_position_id !== false )
		navigator.geolocation.clearWatch( NXT_position_id );

	NXT_position_id = false;

	if( _nxt_sim_gps.length > 0 )
	{
		for(var i=0,j=_nxt_sim_gps.length;i<j;i++)
		{
			clearTimeout( _nxt_sim_gps[ i ] );
		}
		_nxt_sim_gps = [];
	}
}


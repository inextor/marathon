var z = require('./SESSION_backup_2019-02-07T22_47_21.700Z.json');

var xy = [];
var previous = null;

z.session.forEach((currentPoint, index)=>
{
	//console.log( currentPoint );

	if( currentPoint.speed  )
	{
		let speed_kh = currentPoint.speed*3600/1000;
		let speed_sk = Math.round( 1000/currentPoint.speed );
		let minutes  = Math.floor( speed_sk/60 );
		let seconds  = Math.floor( speed_sk-( minutes*60 ) );

		let d = new Date();
		d.setTime( currentPoint.timestamp );

		console.log(currentPoint.speed.toFixed(3)+'ms\t'+speed_kh.toFixed(3)+'k/h\t'+minutes+':'+seconds+'\t'+d.toISOString());
	}

	if( index == 0 )
	{
		xy.push({ x:0, y:0});
	}
	else
	{
		let distance = rhumbdistance( previous.latitude,previous.longitude,currentPoint.latitude, currentPoint.longitude );
		let angle = getBearing( previous.latitude, previous.longitude, currentPoint.latitude, currentPoint.longitude );

	//	console.log( 'distance',distance, angle );
		xy.push( getCoords( xy[xy.length-1],distance, angle ) );
	}

	previous = currentPoint;
});

//let xMin = 0;
//let yMin = 0;
//let xMax = -1;
//let yMax = -1;
//
//xy.forEach((p)=>
//{
//	xMin = Math.min( xMin, xy.x );
//	xMax = Math.max( xMax, xy.x );
//
//	yMin = Math.min( yMin, xy.y );
//	yMax = Math.max( yMax, xy.y );
//});
//
//xMin = Math.floor( xMin );
//xMax = Math.floor( xMax );
//
//yMin = Math.floor( yMin );
//yMax = Math.floor( yMax );

xy.forEach((p)=>
{
	console.log(Math.floor(p.x)+','+Math.floor(p.y));
});



function getBearing(λ1,φ1,λ2,φ2)
{
	var y = Math.sin(λ2-λ1) * Math.cos(φ2);
	var x = Math.cos(φ1)*Math.sin(φ2) -
		Math.sin(φ1)*Math.cos(φ2)*Math.cos(λ2-λ1);
	return  Math.atan2(y, x) * 180 / Math.PI;
}


function rhumbdistance(lat1,lon1,lat2,lon2)
{
    let radius =  6371e3;

    // see www.edwilliams.org/avform.htm#Rhumb

    var R = radius;
    var φ1 = toRadians( lat1 ), φ2 = toRadians( lat2 );
    var Δφ = φ2 - φ1;
    var Δλ = toRadians( Math.abs( lon2-lon1 ) );
    // if dLon over 180° take shorter rhumb line across the anti-meridian:
    if (Δλ > Math.PI) Δλ -= 2*Math.PI;

    // on Mercator projection, longitude distances shrink by latitude; q is the 'stretch factor'
    // q becomes ill-conditioned along E-W line (0/0); use empirical tolerance to avoid it
    var Δψ = Math.log(Math.tan(φ2/2+Math.PI/4)/Math.tan(φ1/2+Math.PI/4));
    var q = Math.abs(Δψ) > 10e-12 ? Δφ/Δψ : Math.cos(φ1);

    // distance is pythagoras on 'stretched' Mercator projection
    var δ = Math.sqrt(Δφ*Δφ + q*q*Δλ*Δλ); // angular distance in radians
    var dist = δ * R;

    return Math.abs( dist );
}

function getDistance(lat1,lon1, lat2,lon2 )
{
	let radius = 6371e3;

    // a = sin²(Δφ/2) + cos(φ1)⋅cos(φ2)⋅sin²(Δλ/2)
    // tanδ = √(a) / √(1−a)
    // see mathforum.org/library/drmath/view/51879.html for derivation

    var R = radius;
    var φ1 = toRadians( lat1 ),  λ1 = toRadians(lon1);
    var φ2 = toRadians(lat2), λ2 = toRadians( lon2 );
    var Δφ = φ2 - φ1;
    var Δλ = λ2 - λ1;

    var a = Math.sin(Δφ/2) * Math.sin(Δφ/2)
          + Math.cos(φ1) * Math.cos(φ2)
          * Math.sin(Δλ/2) * Math.sin(Δλ/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c;

    return d;
}

function getDistance2(lat1,lon1, lon2, lat2 )
{
	var R = 6371e3; // metres
	var φ1 = toRadians( lat1 );
	var φ2 = toRadians( lat2 );
	var Δφ = toRadians(lat2-lat1);
	var Δλ = toRadians(lon2-lon1);

	var a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
		Math.cos(φ1) * Math.cos(φ2) *
		Math.sin(Δλ/2) * Math.sin(Δλ/2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
	var d = R * c;
	return d;
}

function getCoords(p1,distance,angle)
{
	let result = { x: 0, y: distance };
	return rotate_point( p1, result, angle );
}

function rotate_point(point_origin, point_to_rotate, angle)
{
  let s = Math.sin(angle);
  let c = Math.cos(angle);

  // rotate point
  let xnew = point_to_rotate.x * c - point_to_rotate.y * s;
  let ynew = point_to_rotate.x * s + point_to_rotate.y * c;

  // translate point back:
  return { x: xnew + point_origin.x, y: ynew + point_origin.y };
}

function toRadians( value )
{
	return value * Math.PI / 180;
}

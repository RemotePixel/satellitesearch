'use strict';

mapboxgl.accessToken = '{YOUR MAPBOX TOKEN}';
const rpix_api_us = '{YOU API URL}'; //landsat
const rpix_api_eu = '{YOU API URL}'; //sentinel

const sat_api_url = 'https://api.developmentseed.org/satellites/?search=';

const scope = { results: {} };

$('#modalGL').on('shown.bs.modal', function () {
    setTimeout(function () {
        window.location = 'https://remotepixel.ca/projects/satellitesearch-nogl.html';
    }, 3000);
});

$('#modalPreview').on('shown.bs.modal', function () {
    $('.img-preview').focus();
});

$('#modalPreview').on('hidden.bs.modal', function () {
    $('.img-preview').scrollTop(0);
    $('.img-preview').empty();
});

$('#modalDownloadL8').on('shown.bs.modal', function () {
    $('#modalDownloadL8 .dwn-bands').focus();
    $('#modalDownloadL8 .btn-download').removeClass('processing');
    $('#modalDownloadL8 .btn-download').removeClass('error');
    $('#modalDownloadL8 .btn-download').removeClass('ready');
    $('#modalDownloadL8 .btn-download span').text('Download');
    $('#modalDownloadL8 .btn-download a').attr('href', '');
    $('#modalDownloadL8 .dropdown-menu li a').each(function () {
        $(this).removeClass('on');
    });

    $('#modalDownloadL8 .dropdown-menu li a').first().addClass('on');
    $('#modalDownloadL8 .dropdown .btn:first-child').html($('#modalDownloadL8 .dropdown-menu li a').first().text() + ' <span class="caret"></span>');
});

$('#modalDownloadL8').on('hidden.bs.modal', function () {
    $('#modalPreview').focus();
    $('#modalDownloadL8 .dwn-bands').empty();
    $('#modalDownloadL8 .overview').attr('data-id', '');
    $('#modalDownloadL8 .overview').html('<span><i class="fa fa-spinner fa-spin"></i></span>');
});

$('#modalDownloadS2').on('shown.bs.modal', function () {

    $('#modalDownloadS2 .dwn-bands').focus();
    $('#modalDownloadS2 .dropdown-menu li a').each(function () {
        $(this).removeClass('on');
    });
    $('#modalDownloadS2 .dropdown-menu li a').first().addClass('on');
    $('#modalDownloadS2 .dropdown .btn:first-child').html($('#modalDownloadS2 .dropdown-menu li a').first().text() + ' <span class="caret"></span>');
});

$('#modalDownloadS2').on('hidden.bs.modal', function () {

    $('#modalPreview').focus();
    $('#modalDownloadS2 .dwn-bands').empty();
    $('#modalDownloadS2 .overview').attr('data-id', '');
    $('#modalDownloadS2 .overview').html('<span><i class="fa fa-spinner fa-spin"></i></span>');
});

$(function () {
    $('#modalDownloadS2 .dropdown-menu li a').click(function () {
        $('#modalDownloadS2 .overview').html('<span><i class="fa fa-spinner fa-spin"></i></span>');
        $('#modalDownloadS2 .dropdown .btn:first-child').html($(this).text() + ' <span class="caret"></span>');

        const params = {
            scene: $('#modalDownloadS2 .overview').attr('data-id'),
            bands: $(this).parent().attr('data-bands')
        };

        if (params.bands === ['04','03','02']) {
            $('#modalDownloadS2 .overview').html('<img src="' + $('#modalDownloadS2 .overview').attr('data-prev') + '">');
        } else {
            $.get(rpix_api_eu + 's2_overview', params)
                .done(function (data) {
                    $('#modalDownloadS2 .overview').html('<img src="data:image/png;base64,' + data + '">');
                })
                .fail(function () {
                    $('#modalDownloadS2 .overview').html('<span>Preview Unavailable</span>');
                });
        }

        $('#modalDownloadS2 .dropdown-menu li a').each(function () {
            $(this).removeClass('on');
        });
        $(this).addClass('on');
    });
});


$(function () {
    $('#modalDownloadL8 .dropdown-menu li a').click(function () {
        $('#modalDownloadL8 .btn-download').removeClass('processing');
        $('#modalDownloadL8 .btn-download').removeClass('error');
        $('#modalDownloadL8 .btn-download').removeClass('ready');
        $('#modalDownloadL8 .btn-download span').text('Download');
        $('#modalDownloadL8 .btn-download a').attr('href', '');
        $('#modalDownloadL8 .overview').html('<span><i class="fa fa-spinner fa-spin"></i></span>');
        $('#modalDownloadL8 .dropdown .btn:first-child').html($(this).text() + ' <span class="caret"></span>');

        const params = {
            scene: $('#modalDownloadL8 .overview').attr('data-id'),
            bands: $(this).parent().attr('data-bands')
        };

        $.get(rpix_api_us + 'l8_overview', params )
            .done(function (data) {
                $('#modalDownloadL8 .overview').html('<img src="data:image/png;base64,' + data + '">');
            })
            .fail(function () {
                $('#modalDownloadL8 .overview').html('<span>Preview Unavailable</span>');
            });

        $('#modalDownloadL8 .dropdown-menu li a').each(function () {
            $(this).removeClass('on');
        });
        $(this).addClass('on');

    });
});

function landsatdownload() {
    $('#modalDownloadL8 button.btn-download').addClass('processing');

    const params = {
        scene: $('#modalDownloadL8 .overview').attr('data-id'),
        bands: $('#modalDownloadL8 .dropdown-menu li .on').parent().attr('data-bands')
    };

    $.get(rpix_api_us + 'l8_full', params)
        .done(function () {
            $('#modalDownloadL8 button.btn-download').removeClass('processing');
            $('#modalDownloadL8 button.btn-download').addClass('error');
            $('#modalDownloadL8 button.btn-download span').text('Error');
        })
        .fail(function () {
            $('#modalDownloadL8 button.btn-download').removeClass('processing');
            $('#modalDownloadL8 button.btn-download').addClass('error');
            $('#modalDownloadL8 button.btn-download span').text('Error');
        });
}

function showSiteInfo() {
    $('.site-info').toggleClass('in');
    window.dispatchEvent(new Event('resize'));
}

////////////////////////////////////////////////////////////////////////////////
//From Libra by developmentseed (https://github.com/developmentseed/libra)
function zeroPad(n, c) {
    const s = String(n);

    if (s.length < c) {
        return zeroPad('0' + n, c);
    }

    return s;
}

function sortScenes(a, b) {
    return Date.parse(b.date) - Date.parse(a.date);
}

function parse_s2_tile(tile) {
    return {
        uz : tile.slice(0, 2),
        lb : tile.slice(2, 3),
        sq : tile.slice(3, 5)
    };
}

function s2_name_to_key(scene) {
    const info = scene.split('_');
    const acquisitionDate = info[2];
    const tile_info = parse_s2_tile(info[3]);
    const num = info[4];

    return [
        tile_info.uz,
        tile_info.lb,
        tile_info.sq,
        acquisitionDate.slice(0,4),
        acquisitionDate.slice(4,6).replace(/^0+/, ''),
        acquisitionDate.slice(6,8).replace(/^0+/, ''),
        num
    ].join('/');
}

function parse_landsat_product_id(landsat_product) {

    const info = landsat_product.split('_');

    return {
        satellite: info[0].slice(0,1) + info[0].slice(3),
        sensor:  info[0].slice(1,2),
        correction_level: info[1],
        path: info[2].slice(0,3),
        row: info[2].slice(3),
        acquisition_date: info[3],
        ingestion_date: info[4],
        collection: info[5],
        category: info[6]
    };
}


////////////////////////////////////////////////////////////////////////////////
function buildQueryAndRequestS2(features) {

    $('.list-img').scrollTop(0);
    $('.list-img').empty();

    const tile_string = features.map(function (e) {
        let tile_info = parse_s2_tile(e.properties.Name);
        return `(grid_square:${tile_info.sq}+AND+latitude_band:${tile_info.lb}+AND+utm_zone:${tile_info.uz})`;
    }).join('+OR+');

    const query = sat_api_url + 'satellite_name:sentinel-2+AND+(' + tile_string + ')&limit=2000';
    const results = {};

    $.getJSON(query)
        .done(function(data){
            if (data.meta.found !== 0) {

                for (let i = 0; i < data.results.length; i += 1) {
                    let scene = {};
                    scene.date = data.results[i].date;
                    scene.cloud = data.results[i].cloud_coverage;
                    scene.utm_zone = data.results[i].utm_zone.toString();
                    scene.grid_square = data.results[i].grid_square;
                    scene.coverage = data.results[i].data_coverage_percentage;
                    scene.latitude_band = data.results[i].latitude_band;
                    scene.sceneID = data.results[i].scene_id;
                    scene.browseURL = data.results[i].thumbnail.replace('.jp2', '.jpg');
                    scene.path = data.results[i].aws_path.replace('tiles', '#tiles');
                    scene.AWSurl = 'http://sentinel-s2-l1c.s3-website.eu-central-1.amazonaws.com/' + scene.path + '/';
                    scene.grid = scene.utm_zone + scene.latitude_band + scene.grid_square;

                    let key = s2_name_to_key(scene.sceneID);
                    scene.browseURL = 'https://sentinel-s2-l1c.s3.amazonaws.com/tiles/' + key + '/preview.jpg';

                    if (results.hasOwnProperty(scene.grid)) {
                        results[scene.grid].push(scene);
                    } else {
                        results[scene.grid] = [scene];
                    }
                }

                let grid = Object.keys(results);

                for (let i = 0; i < grid.length; i += 1) {

                    results[grid[i]].sort(sortScenes);

                    let latest = results[grid[i]][0];
                    $('.list-img').append(
                        `<div id="${latest.grid}" sat="sentinel2" img-date="${latest.date}" class="list-element" onclick="feedPreviewS2(this)" onmouseover="hoverS2(\'${latest.grid}\')">` +
                            '<div class="col">' +
                                `<div class="prinfo"><span class="pathrow">${latest.grid}</span></div>` +
                                '<div class="prinfo">' +
                                    `<span class="date">Latest: ${latest.date} </span>` +
                                    `<span class="date"><i class="fa fa-cloud"></i> ${latest.cloud}%</span>` +
                                '</div>' +
                            '</div>' +
                            '<div class="img-thumb">' +
                                `<img id="${latest.sceneID}" class="img-item img-responsive lazy2 lazyload" src="${latest.browseURL}">` +
                            '</div>' +
                        '</div>'
                    );
                }
                scope.results = results;
            } else {
                $('.list-img').append('<span class="nodata-error">No image found</span>');
            }

        })
        .always(function () {
            $('.spin').addClass('display-none');
        })
        .fail(function () {
            $('.list-img').append('<span class="serv-error">Server Error: Please contact <a href="mailto:contact@remotepixel.ca">contact@remotepixel.ca</a></span>');
        });
}

////////////////////////////////////////////////////////////////////////////////
function buildQueryAndRequestL8(features) {
    $('.list-img').scrollTop(0);
    $('.list-img').empty();

    const pathrow_string = features.map(function (e) {
        return `(path:${e.properties.PATH.toString()}+AND+row:${e.properties.ROW.toString()})`;
    }).join('+OR+');

    const query = sat_api_url + 'satellite_name:landsat-8+AND+(' + pathrow_string + ')&limit=2000';
    const results = {};

    $.getJSON(query)
        .done(function(data){
            if (data.meta.found !== 0) {
                for (let i = 0; i < data.results.length; i += 1) {
                    let scene = {};
                    scene.path = data.results[i].path.toString();
                    scene.row = data.results[i].row.toString();
                    scene.grid = data.results[i].path + '/' + data.results[i].row;
                    scene.date = data.results[i].date;
                    scene.cloud = data.results[i].cloud_coverage;
                    scene.browseURL = data.results[i].browseURL.replace('http://', 'https://');
                    scene.usgsURL = data.results[i].cartURL.replace('http://', 'https://');
                    scene.sceneID = data.results[i].scene_id;
                    scene.landsat_product_ID = data.results[i].LANDSAT_PRODUCT_ID;

                    if (moment(scene.date) < moment('2017-05-01')) {
                        scene.id = data.results[i].scene_id;
                        scene.AWSurl = 'http://landsat-pds.s3.amazonaws.com/L8/' + zeroPad(data.results[i].path, 3) + '/' + zeroPad(data.results[i].row, 3) + '/' + data.results[i].id + '/';
                        scene.sumAWSurl = 'https://landsatonaws.com/L8/' + zeroPad(data.results[i].path, 3) + '/' + zeroPad(data.results[i].row, 3) + '/' + data.results[i].sceneID;
                    } else {
                        let scene_params = parse_landsat_product_id(scene.landsat_product_ID);
                        scene.collection = scene_params.collection;
                        scene.category = scene_params.category;

                        scene.id = data.results[i].LANDSAT_PRODUCT_ID;
                        scene.AWSurl = `http://landsat-pds.s3.amazonaws.com/c1/L8/${scene_params.path}/${scene_params.row}/${scene.id}/`;
                        scene.sumAWSurl = `http://landsatonaws.com/L8/${scene_params.path}/${scene_params.row}/${scene.id}/`;
                    }

                    if (results.hasOwnProperty(scene.grid)) {
                        results[scene.grid].push(scene);
                    } else {
                        results[scene.grid] = [scene];
                    }
                }

                const grid = Object.keys(results);

                for (let i = 0; i < grid.length; i += 1) {

                    results[grid[i]].sort(sortScenes);

                    let latest = results[grid[i]][0];
                    $('.list-img').append(
                        `<div id=${latest.grid} sat="landsat8" img-date="${latest.date}" class="list-element" onclick="feedPreviewL8(this)" onmouseover="hoverL8(${latest.path}\,${latest.row})">` +
                            '<div class="col">' +
                                `<div class="prinfo"><span class="pathrow">${latest.grid}</span></div>` +
                                '<div class="prinfo">' +
                                    `<span class="date">Latest: ${latest.date} </span>` +
                                    `<span class="date"><i class="fa fa-cloud"></i> ${latest.cloud}%</span>` +
                                '</div>' +
                            '</div>' +
                            '<div class="img-thumb">' +
                                `<img id="${latest.id}" class="img-item img-responsive lazy2 lazyload" src="${latest.browseURL}">` +
                            '</div>' +
                        '</div>'
                    );
                }
                scope.results = results;
            } else {
                $('.list-img').append('<span class="nodata-error">No image found</span>');
            }
        })
        .always(function () {
            $('.spin').addClass('display-none');
        })
        .fail(function () {
            $('.list-img').append('<span class="serv-error">Server Error: Please contact <a href="mailto:contact@remotepixel.ca">contact@remotepixel.ca</a></span>');
        });
}

////////////////////////////////////////////////////////////////////////////////
function feedPreviewS2(elem) {

    const res = scope.results[elem.id];

    for (let i = 0; i < res.length; i += 1) {
        $('.img-preview').append(
            '<div class="item">' +
                '<img class="img-item img-responsive lazy lazyload" data-src="' + res[i].browseURL + '" class="img-responsive">' +
                '<div class="result-overlay">' +
                    '<span>' + res[i].sceneID + '</span>' +
                    '<span><i class="fa fa-calendar-o"></i> ' + res[i].date + '</span>' +
                    '<span><i class="fa fa-cloud"></i> ' + res[i].cloud + '%  <i class="fa fa-map-o"></i> ' + res[i].coverage + '%</span>' +
                    '<span>Link:</span>' +
                    '<div class="btnDD" onclick="feeddownloadS2(\'' + res[i].sceneID  + '\')"><i class="fa fa-download"></i></div>' +
                    '<a target="_blank" href="' + res[i].AWSurl + '"><img src="/img/aws.png"> </a>' +
                '</div>' +
                '</div>'
        );
    }
    $('#modalPreview').modal();
}

function feeddownloadS2(elem) {

    const key = s2_name_to_key(elem);
    const aws_s2_url = 'https://sentinel-s2-l1c.s3.amazonaws.com/tiles/' + key;

    $('#modalDownloadS2 .overview').attr('data-id', elem);
    $('#modalDownloadS2 .overview').attr('data-prev', aws_s2_url + '/preview.jpg');

    $('#modalDownloadS2 .dwn-bands').append(
        '<span>Direct Download S2 band (Right Click on link)</span>' +
            '<a id="b1" target="_blank" href="' + aws_s2_url + '/B01.jp2" download>B1 - Coastal (60m)</a>' +
            '<a id="b2" target="_blank" href="' + aws_s2_url + '/B02.jp2" download>B2 - Blue (10m)</a>' +
            '<a id="b3" target="_blank" href="' + aws_s2_url + '/B03.jp2" download>B3 - Green (10m)</a>' +
            '<a id="b4" target="_blank" href="' + aws_s2_url + '/B04.jp2" download>B4 - Red (10m)</a>' +
            '<a id="b5" target="_blank" href="' + aws_s2_url + '/B05.jp2" download>B5 - Vegetation Classif 1 (20m)</a>' +
            '<a id="b6" target="_blank" href="' + aws_s2_url + '/B06.jp2" download>B6 - Vegetation Classif 2 (20m)</a>' +
            '<a id="b7" target="_blank" href="' + aws_s2_url + '/B07.jp2" download>B7 - Vegetation Classif 3 (20m)</a>' +
            '<a id="b8" target="_blank" href="' + aws_s2_url + '/B08.jp2" download>B8 - Near Infrared (10m)</a>' +
            '<a id="b8" target="_blank" href="' + aws_s2_url + '/B8A.jp2" download>B8A - Narrow Near Infrared (20m)</a>' +
            '<a id="b9" target="_blank" href="' + aws_s2_url + '/B09.jp2" download>B9 - Water vapour (60m)</a>' +
            '<a id="b10" target="_blank" href="' + aws_s2_url + '/B10.jp2" download>B10 - Cirrus (60m)</a>' +
            '<a id="b11" target="_blank" href="' + aws_s2_url + '/B11.jp2" download>B11 - Shortwave Infrared 1 (20m)</a>' +
            '<a id="b12" target="_blank" href="' + aws_s2_url + '/B12.jp2" download>B12 - Shortwave Infrared 2 (20m)</a>' +
            '<a id="mtl" target="_blank" href="' + aws_s2_url + '/productInfo.json" download>Metadata</a>'
    );

    $('#modalDownloadS2 .overview').html('<img src="' + aws_s2_url + '/preview.jpg' + '">');
    $('#modalDownloadS2').modal();
}

////////////////////////////////////////////////////////////////////////////////
function feedPreviewL8(elem) {

    const res = scope.results[elem.id];

    for (let i = 0; i < res.length; i += 1) {
        $('.img-preview').append(
            '<div class="item">' +
                '<img class="img-item img-responsive lazy lazyload" data-src="' + res[i].browseURL + '" class="img-responsive">' +
                '<div class="result-overlay">' +
                    '<span><i class="fa fa-calendar-o"></i> ' + res[i].date + '</span>' +
                    '<span><i class="fa fa-cloud"></i> ' + res[i].cloud + '%</span>' +
                    '<span>Link:</span>' +
                    '<div class="btnDD" onclick="feeddownloadL8(\'' + res[i].AWSurl + '\',\'' + res[i].id + '\')"><i class="fa fa-download"></i></div>' +
                    '<a target="_blank" href="' + res[i].sumAWSurl + '"><img src="/img/aws.png"> </a>' +
                    '<a target="_blank" href="' + res[i].usgsURL + '"><img src="/img/usgs.jpg"></a>' +
                '</div>' +
                '</div>'
        );
    }
    $('#modalPreview').modal();
}

function feeddownloadL8(url, id) {

    $('#modalDownloadL8 .overview').attr('data-id', id);
    $('#modalDownloadL8 .dwn-bands').append(
        `<span>Scene ID: ${id}</span><br>` +
        '<span>Direct Download L8 band (Right Click on link)</span>' +
        '<a id="b1" target="_blank" href="' + url + id + '_B1.TIF" download>B1 - Coastal aerosol</a>' +
        '<a id="b2" target="_blank" href="' + url + id + '_B2.TIF" download>B2 - Blue</a>' +
        '<a id="b3" target="_blank" href="' + url + id + '_B3.TIF" download>B3 - Green</a>' +
        '<a id="b4" target="_blank" href="' + url + id + '_B4.TIF" download>B4 - Red</a>' +
        '<a id="b5" target="_blank" href="' + url + id + '_B5.TIF" download>B5 - Near Infrared</a>' +
        '<a id="b6" target="_blank" href="' + url + id + '_B6.TIF" download>B6 - Shortwave Infrared 1</a>' +
        '<a id="b7" target="_blank" href="' + url + id + '_B7.TIF" download>B7 - Shortwave Infrared 2</a>' +
        '<a id="b8" target="_blank" href="' + url + id + '_B8.TIF" download>B8 - Panchromatic (15m)</a>' +
        '<a id="b9" target="_blank" href="' + url + id + '_B9.TIF" download>B9 - Cirrus</a>' +
        '<a id="b10" target="_blank" href="' + url + id + '_B10.TIF" download>B10 - Thermal Infrared 1</a>' +
        '<a id="b11" target="_blank" href="' + url + id + '_B11.TIF" download>B11 - Thermal Infrared 2</a>' +
        '<a id="bQA" target="_blank" href="' + url + id + '_BQA.TIF" download>BQA - Quality Assessment</a>' +
        '<a id="mtl" target="_blank" href="' + url + id + '_MTL.txt" download>MTL - Metadata</a>'
    );

    const params = {
        scene: id,
        bands: '[4,3,2]'
    };

    $.get(rpix_api_us + 'l8_overview', params )
        .done(function (data) {
            $('#modalDownloadL8 .overview').html('<img src="data:image/png;base64,' + data + '">');
        })
        .fail(function () {
            $('#modalDownloadL8 .overview').html('<span>Preview Unavailable</span>');
        });

    $('#modalDownloadL8').modal();
}

////////////////////////////////////////////////////////////////////////////////

function hoverS2(grid) {
    map.setFilter('S2_Highlighted', ['in', 'Name', grid]);
}

function hoverL8(path, row) {
    console.log(path,row);
    map.setFilter('L8_Highlighted', ['all', ['==', 'PATH', path], ['==', 'ROW', row]]);
}

$('#sat-checkbox').change(function () {
    $('.list-img').scrollTop(0);
    $('.list-img').empty();
    $('.list-img').append('<span class="nodata-error">Click on Tile</span>');
    addLayers();
});

function addLayers() {
    if (document.getElementById('sat-checkbox').checked) {
        $('#sat-checkbox').parent().addClass('slider-white');

        ['L8_Grid', 'L8_GridCentroid', 'L8_GridName', 'L8_Selected', 'L8_Highlighted'].forEach(function (e) {
            if (map.getLayer(e)) map.removeLayer(e);
        });

        map.addLayer({
            'id': 'S2_Grid',
            'type': 'fill',
            'source': 'sentinel',
            'source-layer': 'Sentinel2_Grid',
            'paint': {
                'fill-color': 'hsla(0, 0%, 0%, 0)',
                'fill-outline-color': {
                    'base': 1,
                    'stops': [
                        [0, 'hsla(207, 84%, 57%, 0.24)'],
                        [22, 'hsl(207, 84%, 57%)']
                    ]
                },
                'fill-opacity': 1
            }
        });

        map.addLayer({
            'id': 'S2_GridCentroid',
            'type': 'circle',
            'source': 'sentinelcentro',
            'source-layer': 'Sentinel2_Grid_Centroid',
            'paint': {
                'circle-color': 'hsl(207, 84%, 57%)',
                'circle-opacity': 0.4,
                'circle-radius': 21
            },
            'minzoom': 4.3
        });

        map.addLayer({
            'id': 'S2_GridName',
            'type': 'symbol',
            'source': 'sentinelcentro',
            'source-layer': 'Sentinel2_Grid_Centroid',
            'layout': {
                'text-field': '{Name}',
                'text-font': {
                    'base': 1,
                    'stops': [
                        [0, ['Open Sans Bold', 'Arial Unicode MS Bold']],
                        [22, ['Open Sans Bold', 'Arial Unicode MS Bold']]
                    ]
                },
                'text-size': {
                    'base': 1,
                    'stops': [
                        [3, 8],
                        [10, 10],
                        [20, 35]
                    ]
                },
                'visibility': 'visible'
            },
            'paint': {
                'text-color': 'hsl(0, 0%, 100%)',
                'text-opacity': 0.8
            },
            'minzoom': 4.3
        });

        map.addLayer({
            'id': 'S2_Highlighted',
            'type': 'fill',
            'source': 'sentinel',
            'source-layer': 'Sentinel2_Grid',
            'paint': {
                'fill-outline-color': '#1386af',
                'fill-color': '#0f6d8e',
                'fill-opacity': 0.3
            },
            'filter': ['in', 'Name', '']
        });

        map.addLayer({
            'id': 'S2_Selected',
            'type': 'fill',
            'source': 'sentinel',
            'source-layer': 'Sentinel2_Grid',
            'paint': {
                'fill-outline-color': '#FFF',
                'fill-color': '#FFF',
                'fill-opacity': 0.2
            },
            'filter': ['in', 'Name', '']
        });

    } else {
        $('#sat-checkbox').parent().removeClass('slider-white');
        ['S2_Grid', 'S2_GridCentroid', 'S2_GridName', 'S2_Selected', 'S2_Highlighted'].forEach(function (e) {
            if (map.getLayer(e)) map.removeLayer(e);
        });

        map.addLayer({
            'id': 'L8_Grid',
            'type': 'fill',
            'source': 'landsat',
            'source-layer': 'Landsat8_Desc_filtr2',
            'paint': {
                'fill-color': 'hsla(0, 0%, 0%, 0)',
                'fill-outline-color': {
                    'base': 1,
                    'stops': [
                        [0, 'hsla(207, 84%, 57%, 0.24)'],
                        [22, 'hsl(207, 84%, 57%)']
                    ]
                },
                'fill-opacity': 1
            }
        });

        map.addLayer({
            'id': 'L8_GridCentroid',
            'type': 'circle',
            'source': 'landsatcentro',
            'source-layer': 'Landsat8_Desc_filtr_Centro',
            'paint': {
                'circle-color': 'hsl(207, 84%, 57%)',
                'circle-opacity': 0.4,
                'circle-radius': 21
            },
            'minzoom': 4.3
        });

        map.addLayer({
            'id': 'L8_GridName',
            'type': 'symbol',
            'source': 'landsatcentro',
            'source-layer': 'Landsat8_Desc_filtr_Centro',
            'layout': {
                'text-field': '{PATH}/{ROW}',
                'text-font': {
                    'base': 1,
                    'stops': [
                        [0, ['Open Sans Bold', 'Arial Unicode MS Bold']],
                        [22, ['Open Sans Bold', 'Arial Unicode MS Bold']]
                    ]
                },
                'text-size': {
                    'base': 1,
                    'stops': [
                        [3, 8],
                        [10, 10],
                        [20, 35]
                    ]
                },
                'visibility': 'visible'
            },
            'paint': {
                'text-color': 'hsl(0, 0%, 100%)',
                'text-opacity': 0.8
            },
            'minzoom': 4.3
        });

        map.addLayer({
            'id': 'L8_Highlighted',
            'type': 'fill',
            'source': 'landsat',
            'source-layer': 'Landsat8_Desc_filtr2',
            'paint': {
                'fill-outline-color': '#1386af',
                'fill-color': '#0f6d8e',
                'fill-opacity': 0.3
            },
            'filter': ['in', 'PATH', '']
        });

        map.addLayer({
            'id': 'L8_Selected',
            'type': 'fill',
            'source': 'landsat',
            'source-layer': 'Landsat8_Desc_filtr2',
            'paint': {
                'fill-outline-color': '#FFF',
                'fill-color': '#FFF',
                'fill-opacity': 0.2
            },
            'filter': ['in', 'PATH', '']
        });
    }
}

////////////////////////////////////////////////////////////////////////////////
// if (!mapboxgl.supported()) {
//
//     alert('Your browser does not support Mapbox GL');
//     $('#modalGL').modal();
//
// } else {

var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/satellite-streets-v9',
    center: [-70.50, 40],
    zoom: 2,
    attributionControl: false,
    minZoom: 2,
    maxZoom: 9
});

map.addControl(new mapboxgl.NavigationControl(), 'top-left');
map.dragRotate.disable();
map.touchZoomRotate.disableRotation();

const ctrl = document.getElementsByClassName('mapboxgl-ctrl-bottom-right')[0];
const attr = document.createElement('div');

attr.className = 'mapboxgl-ctrl-attrib mapboxgl-ctrl';
ctrl.appendChild(attr);

$('.mapboxgl-ctrl-attrib').append('<a href="https://remotepixel.ca" target="_blank">&copy; RemotePixel.ca</a>');
$('.mapboxgl-ctrl-attrib').append('<a href="https://www.mapbox.com/about/maps/" target="_blank"> © Mapbox</a>');
$('.mapboxgl-ctrl-attrib').append('<a href="http://www.openstreetmap.org/about/" target="_blank"> © OpenStreetMap</a>');
$('.mapboxgl-ctrl-attrib').append('<a href="https://www.digitalglobe.com/" target="_blank"> © DigitalGlobe</a></div>');

map.on('mousemove', function (e) {

    if (document.getElementById('sat-checkbox').checked) {

        const features = map.queryRenderedFeatures(e.point, {layers: ['S2_Grid']});

        if (features.length !== 0) {
            const pr = ['any'];
            features.forEach(function (e) {
                pr.push(['==', 'Name', e.properties.Name]);
            });
            map.setFilter('S2_Highlighted', pr);
        } else {
            map.setFilter('S2_Highlighted', ['in', 'Name', '']);
        }

    } else {

        const features = map.queryRenderedFeatures(e.point, {layers: ['L8_Grid']});

        if (features.length !== 0) {
            const pr = ['any'];
            features.forEach(function (e) {
                pr.push(['all', ['==', 'PATH', e.properties.PATH], ['==', 'ROW', e.properties.ROW]]);
            });
            map.setFilter('L8_Highlighted', pr);
        } else {
            map.setFilter('L8_Highlighted', ['in', 'PATH', '']);
        }
    }
});

map.on('click', function (e) {

    scope.results = {};

    $('.spin').removeClass('display-none');

    if (document.getElementById('sat-checkbox').checked) {
        const features = map.queryRenderedFeatures(e.point, {layers: ['S2_Grid']});

        if (features.length !== 0) {
            const pr = ['any'];
            features.forEach(function (e) {
                pr.push(['==', 'Name', e.properties.Name]);
            });
            map.setFilter('S2_Selected', pr);
            buildQueryAndRequestS2(features);
        } else {
            $('.spin').addClass('display-none');
            map.setFilter('S2_Selected', ['in', 'Name', '']);
        }

    } else {

        const features = map.queryRenderedFeatures(e.point, {layers: ['L8_Grid']});

        if (features.length !== 0) {
            const pr = ['any'];
            features.forEach(function (e) {
                pr.push(['all', ['==', 'PATH', e.properties.PATH], ['==', 'ROW', e.properties.ROW]]);
            });
            map.setFilter('L8_Selected', pr);
            buildQueryAndRequestL8(features);
        } else {
            $('.spin').addClass('display-none');
            map.setFilter('L8_Selected', ['in', 'PATH', '']);
        }
    }
});

map.on('load', function () {

    map.addSource('sentinel', {
        'type': 'vector',
        'url': 'mapbox://vincentsarago.0qowxm38'
    });

    map.addSource('sentinelcentro', {
        'type': 'vector',
        'url': 'mapbox://vincentsarago.29xm4q9t'
    });

    map.addSource('landsat', {
        'type': 'vector',
        'url': 'mapbox://vincentsarago.8ib6ynrs'
    });

    map.addSource('landsatcentro', {
        'type': 'vector',
        'url': 'mapbox://vincentsarago.9sh46kql'
    });

    addLayers();
    $('.loading-map').addClass('off');
});
// }

$(document).ready(function () {
    $('#twitter').attr('href',
            'https://twitter.com/share?url=' + encodeURIComponent(window.location.href) +
            '&via=RemotePixel' +
            '&text=Satellite Search: Search for Landsat and Sentinel2 data');

    $('#linkedin').attr('href',
            'https://www.linkedin.com/shareArticle?mini=true&url=' + encodeURIComponent(window.location.href) +
            '&title=Satellite Search: Search for Landsat and Sentinel2 data' +
            '&source=https://remotepixel.ca');

    $('#facebook').attr('href',
            'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(window.location.href));
});

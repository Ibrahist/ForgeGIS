import os
import json
import tempfile
from forgegis import ForgeMap, Map

def test_map_initialization():
    m = ForgeMap(center=(-122.4, 37.75), zoom=12.0)
    assert m.center == (-122.4, 37.75)
    assert m.zoom == 12.0
    assert len(m._layers) == 0

def test_add_geojson_layer():
    m = Map()
    geo = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": {"name": "Test Point"},
                "geometry": {"type": "Point", "coordinates": [-122.4, 37.8]},
            }
        ],
    }
    m.add_layer(geo, name="Buoy Telemetry", style={"color": "#f47fa3", "opacity": 1.0})
    assert len(m._layers) == 1
    assert m._layers[0]["name"] == "Buoy Telemetry"
    assert m._layers[0]["data"]["type"] == "FeatureCollection"
    assert m._layers[0]["style"]["color"] == "#f47fa3"

def test_set_view():
    m = ForgeMap()
    m.set_view(longitude=-73.98, latitude=40.75, zoom=14.0)
    assert m.view_state["longitude"] == -73.98
    assert m.view_state["latitude"] == 40.75
    assert m.view_state["zoom"] == 14.0

def test_execute_sql():
    m = ForgeMap()
    res = m.execute_sql("SELECT count(*) FROM points")
    assert res["status"] == "queued"
    assert res["query"] == "SELECT count(*) FROM points"

def test_to_html_export():
    m = ForgeMap(center=(-122.35, 37.8))
    m.add_layer({"type": "FeatureCollection", "features": []}, name="Empty Layer")

    with tempfile.NamedTemporaryFile(suffix=".html", delete=False) as tmp:
        tmp_path = tmp.name

    try:
        html = m.to_html(filename=tmp_path)
        assert "<!DOCTYPE html>" in html
        assert "maplibregl.Map" in html
        assert "Empty Layer" in html
        assert os.path.exists(tmp_path)
        assert os.path.getsize(tmp_path) > 100
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

import React, { Component } from 'react';
import URLSearchParams from 'url-search-params';

import InputCoord from './InputCoord';
import InputList from './InputList';

import './InputPoints.css';
const default_data = {
  p: [
    {x: 3, y: 4}
  ],
  q: [
    {x: 3, y: 6}
  ]
};

function getDataFromURLParams() {
  let params = new URLSearchParams(window.location.search);

  let data = default_data;

  if (params.has("p")) {
    let p = parsePoints(params.get("p"));
    if (p.length >= 1) {
      data.p = p;
    }
  }
  if (params.has("q")) {
    let q = parsePoints(params.get("q"));
    if (q.length >= 1) {
      data.q = q;
    }
  }

  return data;
}

function parsePoints(string) {
  let points = [];
  string.slice(1, -1).split(")(").forEach((str_point) => {
    let coords = str_point.split("_");
    if (coords.length === 2) {
      let x = parseFloat(coords[0]);
      let y = parseFloat(coords[1]);
      if (!isNaN(x) && !isNaN(y)) {
        points.push({x: x, y: y});
      }
    }
  });
  return points;
}

function writeDataToURLParams(data) {
  let params = new URLSearchParams(window.location.search);

  // generate param strings
  params.set('p', stringifyPoints(data.p));
  params.set('q', stringifyPoints(data.q));

  // set window url
  let new_url = decodeURI(`${window.location.pathname}?${params}`);
  window.history.replaceState({}, '', new_url);
}

function stringifyPoints(points) {
  let string = "(";
  points.forEach(point => {
    string += point.x + "_" + point.y + ")(";
  });
  string = string.slice(0, -1);
  return string;
}

class InputPoints extends Component {
  constructor(props) {
    super(props);

    // get data from url params
    let data = getDataFromURLParams();
    writeDataToURLParams(data);

    this.state = {
      data: data,
      selectedPath: "p"
    };
  }

  calculateInputRange = () => {
    // data
    const coords_p = this.state.data.p;
    const coords_q = this.state.data.q;

    let xMin = Math.min(Math.min(...coords_p.map(p => {return p.x})),
      Math.min(...coords_q.map(p => {return p.x})));
    let xMax = Math.max(Math.max(...coords_p.map(q => {return q.x})),
      Math.max(...coords_q.map(q => {return q.x})));
    let yMin = Math.min(Math.min(...coords_p.map(p => {return p.y})),
      Math.min(...coords_q.map(p => {return p.y})));
    let yMax = Math.max(Math.max(...coords_p.map(q => {return q.y})),
      Math.max(...coords_q.map(q => {return q.y})));

    let dx = Math.abs(xMax-xMin);
    let dy = Math.abs(yMax-yMin);
    if (dx > dy) {
      const dxy = dx - dy;
      yMin -= 0.5*dxy;
      yMax += 0.5*dxy;
      dy = dx;
    } else if (dy > dx) {
      const dyx = dy - dx;
      xMin -= 0.5*dyx;
      xMax += 0.5*dyx;
      dx = dy;
    }

    const padding = 0.05;
    const xRange = {
      min: Math.min(0, xMin-dx*padding),
      max: Math.max(10, xMax+dx*padding)
    };
    const yRange = {
      min: Math.min(0, yMin-dy*padding),
      max: Math.max(10, yMax+dy*padding)
    };
    return [xRange, yRange];
  };

  dataChanged = (newData) => {
    this.setState({data: newData});
    // write to url params
    writeDataToURLParams(newData);
  };

  pathChanged = (path) => {
    return (points) => {
      // update data
      let newData = this.state.data;
      newData[path] = points;
      // set state
      this.dataChanged(newData);
    }
  };

  selectPath = (path) => {
    this.setState({selectedPath: path});
  };

  go = () => {
    this.props.go(this.state.data);
  }

  render() {
    const width = this.props.width;
    const inputRange = this.calculateInputRange();

    console.log("state: ", this.state);

    return (
      <div>
        <div className="input">
          <InputCoord data={this.state.data}
            pathsColor={{p: "DarkSlateBlue", q: "Green"}}
            dataChanged={this.dataChanged}
            size={{ width: (2/3)*width, height: (2/3)*width }}
            selectedPath={this.state.selectedPath}
            inputRange={inputRange} />
          <div className="input_lists"
            style={{width: (1/3)*width, height: (2/3)*width}}>
            <InputList id="p" label="Path P"
              style={{
                backgroundColor: "DarkSlateBlue",
                width: (1/3)*width,
                height: (1/3)*width
              }}
              points={this.state.data.p}
              pointsChanged={this.pathChanged("p")}
              selected={this.state.selectedPath === "p"}
              select={() => {this.selectPath("p")}}
              inputRange={inputRange} />
            <InputList id="q" label="Path Q"
              style={{
                backgroundColor: "Green",
                width: (1/3)*width,
                height: (1/3)*width
              }}
              points={this.state.data.q}
              pointsChanged={this.pathChanged("q")}
              selected={this.state.selectedPath === "q"}
              select={() => {this.selectPath("q")}}
              inputRange={inputRange} />
          </div>
        </div>
        <div className="buttons">
          <div className="button go" onClick={this.go}>
            Run!
          </div>
        </div>
      </div>
    );
  }
}

export default InputPoints;

/*
 * @Description: 
 * @Version: 1.0
 * @Author: bclz
 * @Date: 2021-12-02 08:50:50
 * @LastEditors: bclz
 * @LastEditTime: 2021-12-02 09:40:37
 */
import React from "react";
import { Graph } from "@antv/x6";
import svg from "./a.svg";
import "./app.css";

Graph.registerNode(
  "custom-image",
  {
    // inherit: "rect",
    markup: [
      {
        tagName: "image",
        selector: "body"
      }
    ]
  },
  true
);

const data = {
  // 节点
  cells: [
    {
      postion: {
        x: 0,
        y: 0
      },
      size: {
        width: 330,
        height: 220
      },
      attrs: {
        text: {
          text: "self"
        },
        image: {
          "xlink:href": svg
        }
      },
      shape: "custom-image",
      id: "1",
      zIndex: 1
    },
    {
      postion: {
        x: 300,
        y: 500
      },
      size: {
        width: 330,
        height: 220
      },
      attrs: {
        text: {
          text: "self"
        },
        image: {
          "xlink:href": svg
        }
      },
      shape: "custom-image",
      id: "2",
      zIndex: 1
    }
  ]
  // 边
};

export default class Example extends React.Component {
  private container: HTMLDivElement | undefined;

  componentDidMount() {
    const graph = new Graph({
      container: this.container,
      grid: true
    });

    graph.fromJSON(data);
  }

  refContainer = (container: HTMLDivElement) => {
    this.container = container;
  };

  render() {
    return (
      <div className="app">
        <div className="app-content" ref={this.refContainer} />
      </div>
    );
  }
}

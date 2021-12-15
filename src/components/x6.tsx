/*
 * @Description:
 * @Version: 1.0
 * @Author: bclz
 * @Date: 2021-12-10 09:05:24
 * @LastEditors: bclz
 * @LastEditTime: 2021-12-15 17:55:18
 */

import { Graph, Shape, Addon, ToolsView, Point, EdgeView } from "@antv/x6";
import moment from "moment";
import coolFan from "../images/cool-fan.gif";
import textIcon from "../images/icon_text_default@2x.png";
import timeIcon from "../images/icon_time_default@2x.png";
import lineIcon from "../images/selfLine.svg";
import tabelIcon from '../images/icon_table_default@2x.png'
import pipelineCross from "../images/pipeline-cross.svg"; // 交叉管道
import pipelineRevolve from "../images/pipeline-revolve.svg"; // 旋转管道
import pipelineTransverse from "../images/pipeline-transverse.svg"; // 横向管道

// 注册文本编辑元件
class EditableCellTool extends ToolsView.ToolItem<
  EdgeView,
  EditableCellToolOptions
> {
  private editorContent: any;

  render() {
    super.render();
    const cell = this.cell;
    let x = 0;
    let y = 0;
    let width = 0;
    let height = 0;

    if (cell.isNode()) {
      const position = cell.position();
      const size = cell.size();
      const pos = this.graph.localToGraph(position);
      const zoom = this.graph.zoom();
      x = pos.x;
      y = pos.y;
      width = size.width * zoom;
      height = size.height * zoom;
    } else {
      x = this.options.x - 40;
      y = this.options.y - 20;
      width = 80;
      height = 40;
    }

    const editorParent = ToolsView.createElement(
      "div",
      false
    ) as HTMLDivElement;
    editorParent.style.position = "absolute";
    editorParent.style.left = `${x}px`;
    editorParent.style.top = `${y}px`;
    editorParent.style.width = `${width}px`;
    editorParent.style.height = `${height}px`;
    editorParent.style.display = "flex";
    editorParent.style.alignItems = "center";
    editorParent.style.textAlign = "center";

    this.editorContent = ToolsView.createElement(
      "div",
      false
    ) as HTMLDivElement;
    this.editorContent.contentEditable = "true";
    this.editorContent.style.width = "100%";
    this.editorContent.style.outline = "none";
    this.editorContent.style.backgroundColor = cell.isEdge() ? "#fff" : "";
    this.editorContent.style.border = cell.isEdge() ? "1px solid #ccc" : "none";
    editorParent.appendChild(this.editorContent);
    this.container.appendChild(editorParent);
    this.init();

    return this;
  }

  init = () => {
    const cell = this.cell;
    if (cell.isNode()) {
      const value = cell.attr("text/textWrap/text") as string;
      if (value) {
        this.editorContent.innerText = value;
        cell.attr("text/style/display", "none");
      }
    }
    setTimeout(() => {
      this.editorContent.focus();
    });
    document.addEventListener("mousedown", this.onMouseDown);
  };

  onMouseDown = (e: MouseEvent) => {
    if (e.target !== this.editorContent) {
      const cell = this.cell;
      const value = this.editorContent.innerText;
      cell.removeTools();
      if (cell.isNode()) {
        cell.attr("text/textWrap/text", value);
        cell.attr("text/style/display", "");
      } else if (cell.isEdge()) {
        cell.appendLabel({
          attrs: {
            text: {
              text: value,
            },
          },
          position: {
            distance: this.getDistance(),
          },
        });
      }
      document.removeEventListener("mousedown", this.onMouseDown);
    }
  };

  getDistance() {
    const cell = this.cell;
    if (cell.isEdge()) {
      const targetPoint = cell.getTargetPoint();
      const cross = cell
        .getSourceNode()!
        .getBBox()
        .intersectsWithLineFromCenterToPoint(targetPoint)!;
      const p = new Point(this.options.x, this.options.y);
      return p.distance(cross);
    }
    return 0;
  }
}

EditableCellTool.config({
  tagName: "div",
  isSVGElement: false,
});

export interface EditableCellToolOptions extends ToolsView.ToolItem.Options {
  x: number;
  y: number;
}

// 创建画布
const initializeX6Graph = (isPreview?: boolean) => {
  Graph.registerNodeTool("editableCell", EditableCellTool, true);
  return new Graph({
    container: document.getElementById("graph-container")!,
    grid: true,
    history: true,
    mousewheel: {
      enabled: true,
      zoomAtMousePosition: true,
      modifiers: "ctrl",
      minScale: 0.5,
      maxScale: 3,
    },
    connecting: {
      router: "manhattan",
      connector: {
        name: "rounded",
        args: {
          radius: 8,
        },
      },
      anchor: "center",
      connectionPoint: "anchor",
      allowBlank: false,
      snap: {
        radius: 20,
      },
      createEdge() {
        return new Shape.Edge({
          attrs: {
            line: {
              stroke: "#A2B1C3",
              strokeWidth: 2,
              targetMarker: {
                name: "block",
                width: 12,
                height: 8,
              },
            },
          },
          zIndex: 0,
        });
      },
      validateConnection({ targetMagnet }) {
        return !!targetMagnet;
      },
    },
    highlighting: {
      magnetAdsorbed: {
        name: "stroke",
        args: {
          attrs: {
            fill: "#5F95FF",
            stroke: "#5F95FF",
          },
        },
      },
    },
    resizing: true,
    rotating: true,
    selecting: {
      enabled: true,
      rubberband: true,
      showNodeSelectionBox: true,
    },
    snapline: true,
    keyboard: true,
    clipboard: true,
    interacting: {
      nodeMovable: !isPreview,
      edgeMovable: !isPreview,
    }
  });
};

// 创建左侧工具栏/元件库
const initializeStencil = (graph: any, ports: any) => {
  const stencilBox = document.getElementById("stencil");
  if (stencilBox) {
    const stencil = new Addon.Stencil({
      title: "流程图",
      target: graph,
      stencilGraphWidth: 280,
      stencilGraphHeight: 250,
      collapsable: true,
      getDropNode: (sourceNode: any) => {
        const { data } = sourceNode.toJSON();
        const { type } = data;

        const commonAttrs = (data?: any, text?: any) => ({
          width: 100,
          height: 40,
          data: data
            ? data
            : {
              typeName: "文本",
              type: "textNode",
              name: "元件名称",
            },
          attrs: {
            body: {
              stroke: "transparent",
              fill: "transparent",
              // strokeWidth: 1,
            },
            text: text
              ? text
              : {
                textWrap: {
                  text: "文本编辑",
                  width: -1,
                },
              },
          },
          ports: { ...ports },
        });

        if (type === "textNode") {
          // 当拖拽文本节点时，替换节点样式
          const textNode = graph.createNode({ ...commonAttrs() });
          return textNode;
        }

        if (type === "timeNode") {
          // 当拖拽时间节点时，替换节点样式
          return graph.createNode({
            ...commonAttrs(
              {
                typeName: "时间",
                type: "timeNode",
                name: "元件名称",
              },
              {
                textWrap: {
                  text: moment().format("YYYY-MM-DD HH:mm"),
                  width: -1,
                },
              }
            ),
            width: 120,
          });
        }

        if (type === "lineNode") {
          // 当拖拽直线节点时，替换节点样式
          return graph.createNode({
            shape: 'polyline',
            // x: 320,
            // y: 180,
            width: 80,
            height: 80,
            attrs: {
              body: {
                fill: 'none',
                stroke: '#ffa940',
                refPoints: '0,40 40,40 40',
              },
            },
            ports: { ...ports },
          });
        }

        if (type === 'tableNode') {
          return graph.createNode({
            width: 160,
            height: 60,
            shape: 'html',
            data: {
              typeName: "表格",
              type: "tableNode",
              name: "直线",
              custom: {
                row: 3,
                column: 3,
              },
              time: new Date().toString(),
            },
            html: 'html-table',
            ports: { ...ports },
          })
        }

        if (type === 'virtualImgNode') {
          return graph.createNode({
            shape: "custom-image",
            //   label: item.label,
            data: {
              typeName: "表格",
              type: "tableNode",
              name: "直线",
            },
            attrs: {
              text: {
                fontSize: 12,
                fill: "#262626",
                textWrap: {
                  text: "",
                },
              },
              body: {
                strokeWidth: 1,
                stroke: "#5F95FF",
                fill: "#EFF4FF",
                rx: 0,
                ry: 0,
              },
              image: {
                "xlink:href": coolFan,
              },
            },
          })
        }
        return sourceNode.clone();
      },
      groups: [
        {
          title: "系统元件",
          name: "group1",
          layoutOptions: {
            rowHeight: 70,
          },
        },
        {
          title: "我的元件",
          name: "group2",
          graphHeight: 250,
          layoutOptions: {
            rowHeight: 70,
          },
        },
        {
          title: "特殊元件",
          name: "group3",
          graphHeight: 250,
          layoutOptions: {
            rowHeight: 70,
          },
        },
      ],
      layoutOptions: {
        columns: 3,
        columnWidth: 85,
        rowHeight: 55,
      },
    });
    document.getElementById("stencil")!.appendChild(stencil.container);
    return stencil;
  }
  return null;
};

// 创建公共元件连线桩
const commonPorts = () => {
  return {
    groups: {
      top: {
        position: "top",
        attrs: {
          circle: {
            r: 4,
            magnet: true,
            stroke: "#5F95FF",
            strokeWidth: 1,
            fill: "#fff",
            style: {
              visibility: "hidden",
            },
          },
        },
      },
      right: {
        position: "right",
        attrs: {
          circle: {
            r: 4,
            magnet: true,
            stroke: "#5F95FF",
            strokeWidth: 1,
            fill: "#fff",
            style: {
              visibility: "hidden",
            },
          },
        },
      },
      bottom: {
        position: "bottom",
        attrs: {
          circle: {
            r: 4,
            magnet: true,
            stroke: "#5F95FF",
            strokeWidth: 1,
            fill: "#fff",
            style: {
              visibility: "hidden",
            },
          },
        },
      },
      left: {
        position: "left",
        attrs: {
          circle: {
            r: 4,
            magnet: true,
            stroke: "#5F95FF",
            strokeWidth: 1,
            fill: "#fff",
            style: {
              visibility: "hidden",
            },
          },
        },
      },
    },
    items: [
      {
        group: "top",
      },
      {
        group: "right",
      },
      {
        group: "bottom",
      },
      {
        group: "left",
      },
    ],
  };
};

// 统一注册所有元件
const registerComponent = (ports: any) => {

  // 注册自定义元件 表格
  Graph.registerHTMLComponent('html-table', (node) => {
    const { custom } = node.getData()
    const { row, column } = custom
    let rowArr: string = '', columnStr: string = ''
    for (let i = 0; i < column; i += 1) {
      columnStr += `<div class="table-column"></div>`
    }
    for (let i = 0; i < row; i += 1) {
      rowArr += `<div class="table-row">${columnStr}</div>`
    }
    return (
      `<div class="html-node-table">
   ${rowArr}
    </div>`
    )
  })

  // 注册自定义元件 表格
  Graph.registerHTMLComponent('html-img', (node) => {
    const { custom } = node.getData()
    const { url, title } = custom
    return (
      `<div class="html-node-img">
      <img src='${url}' />
      <span>${title}</span>
    </div>`
    )
  })

  // 注册系统元件 矩形
  Graph.registerNode(
    "custom-rect",
    {
      inherit: "rect",
      width: 60,
      height: 40,
      ports: { ...ports },
    },
    true
  );

  // 注册系统元件 菱形
  Graph.registerNode(
    "custom-polygon",
    {
      inherit: "polygon",
      width: 60,
      height: 40,
      label: "",
      attrs: {
        body: {
          strokeWidth: 1,
          stroke: "#5F95FF",
          fill: "#EFF4FF",
        },
        text: {
          fontSize: 12,
          fill: "#262626",
        },
      },
      ports: { ...ports },
    },
    true
  );

  // 注册系统元件 平行四边形
  Graph.registerNode(
    "custom-parallel-rectangle",
    {
      inherit: "polygon",
      width: 60,
      height: 40,
      label: "",
      attrs: {
        body: {
          strokeWidth: 1,
          stroke: "#5F95FF",
          fill: "#EFF4FF",
        },
        text: {
          fontSize: 12,
          fill: "#262626",
        },
      },
      ports: {
        ...ports,
        items: [
          {
            group: "top",
          },
          {
            group: "bottom",
          },
        ],
      },
    },
    true
  );

  // 注册系统元件 圆形
  Graph.registerNode(
    "custom-circle",
    {
      inherit: "circle",
      width: 40,
      height: 40,
      label: "",
      ports: { ...ports },
    },
    true
  );

  // 注册我的原件 图片
  Graph.registerNode(
    "custom-image",
    {
      inherit: "rect",
      width: 52,
      height: 52,
      markup: [
        {
          tagName: "image",
          selector: "body",
        },
      ],
      ports: { ...ports },
    },
    true
  );
}

// 创建系统元件
const createSysComponent = (ports: any, graph: any, stencil: any) => {

  // 创建虚拟文本节点
  const virtualTextNode = graph.createNode({
    shape: "custom-image",
    data: {
      typeName: "图片",
      type: "textNode",
      name: "文本",
    },
    attrs: {
      image: {
        "xlink:href": textIcon,
      },
    },
  });

  // 创建虚拟时间节点
  const virtualTimeNode = graph.createNode({
    shape: "custom-image",
    //   label: item.label,
    data: {
      typeName: "图片",
      type: "timeNode",
      name: "时间",
    },
    attrs: {
      image: {
        "xlink:href": timeIcon,
      },
    },
  });

  // 创建矩形
  const rectangleNode = graph.createNode({
    shape: "custom-rect",
    attrs: {
      body: {
        strokeWidth: 1,
        stroke: "#5F95FF",
        fill: "#EFF4FF",
        rx: 0,
        ry: 0,
      },
      text: {
        fontSize: 12,
        fill: "#262626",
        style: { display: "" },
        textWrap: {
          text: "矩形",
        },
      },
    },
    data: {
      typeName: "多边形",
      type: "polygonNode",
      name: "矩形",
    },
  });

  // 创建菱形节点
  const lozengeNode = graph.createNode({
    shape: "custom-polygon",
    data: {
      typeName: "多边形",
      type: "polygonNode",
      name: "菱形",
    },
    attrs: {
      body: {
        refPoints: "0,10 10,0 20,10 10,20",
      },
      text: {
        fontSize: 12,
        fill: "#262626",
        style: { display: "" },
        textWrap: {
          text: "",
        },
      },
    },
  });

  // 创建平行四边形
  const parallelRectangleNode = graph.createNode({
    shape: "custom-parallel-rectangle",
    data: {
      typeName: "多边形",
      type: "polygonNode",
      name: "平行四边形",
    },
    attrs: {
      body: {
        refPoints: "10,0 40,0 30,20 0,20",
      },
      text: {
        fontSize: 12,
        fill: "#262626",
        style: { display: "" },
        textWrap: {
          text: "",
        },
      },
    },
    label: "",
  });

  // 创建圆形节点
  const circleNode = graph.createNode({
    shape: "custom-circle",
    attrs: {
      body: {
        strokeWidth: 1,
        stroke: "#5F95FF",
        fill: "#EFF4FF",
      },
      text: {
        fontSize: 12,
        fill: "#262626",
        style: { display: "" },
        textWrap: {
          text: "",
        },
      },
    },
    data: {
      typeName: "多边形",
      type: "polygonNode",
      name: "圆形",
    },
  });

  // 虚拟直线节点
  // const virtualLineNode = graph.createNode({
  //   shape: "custom-image",
  //   //   label: item.label,
  //   data: {
  //     typeName: "直线",
  //     type: "lineNode",
  //     name: "直线",
  //   },
  //   attrs: {
  //     image: {
  //       "xlink:href": lineIcon,
  //     },
  //   },
  // });

  // 直线节点
  const lineNode = graph.createNode({
    shape: "custom-image",
    //   label: item.label,
    data: {
      typeName: "直线",
      type: "lineNode",
      name: "直线",
    },
    attrs: {
      image: {
        "xlink:href": lineIcon,
      },
    },
  });

  // 创建虚拟表格元件
  const virtualTableNode = graph.createNode({
    shape: "custom-image",
    //   label: item.label,
    data: {
      typeName: "表格",
      type: "tableNode",
      name: "表格",
    },
    attrs: {
      image: {
        "xlink:href": tabelIcon,
      },
    },
  });

  // 创建虚拟图片元件
  const virtualImgNode = graph.createNode({
    width: 52,
    height: 80,
    shape: 'html',
    data: {
      typeName: "图片",
      type: "virtualImgNode",
      name: "图片",
      custom: {
        url: coolFan,
        title: '图片'
      },
      time: new Date().toString(),
    },
    html: 'html-img',
    ports: { ...ports },
  })

  stencil.load(
    [
      virtualTextNode,
      virtualTimeNode,
      rectangleNode,
      lozengeNode,
      parallelRectangleNode,
      circleNode,
      lineNode,
      virtualTableNode,
      virtualImgNode
    ],
    "group1"
  );
};

// 创建我的元件
const createMyselfComponent = (ports: any, graph: any, stencil: any) => {
  const imageShapes = [
    {
      label: "self",
      image: coolFan,
      data: {
        typeName: "图片",
        type: "imgNode",
        name: "风机",
      },
    },
    {
      label: "self",
      image: pipelineCross,
      data: {
        typeName: "图片",
        type: "imgNode",
        name: "交叉管道",
      },
    },
    {
      label: "self",
      image: pipelineRevolve,
      data: {
        typeName: "图片",
        type: "imgNode",
        name: "旋转管道",
      },
    },
    {
      label: "self",
      image: pipelineTransverse,
      data: {
        typeName: "图片",
        type: "imgNode",
        name: "横向管道",
      },
    },
  ];

  const imageNodes = imageShapes.map((item) =>
    graph.createNode({
      shape: "custom-image",
      //   label: item.label,
      data: item.data,
      attrs: {
        text: {
          fontSize: 12,
          fill: "#262626",
          style: { display: "", zIndex: 99999999 },
          textWrap: {
            text: "",
          },
        },
        body: {
          strokeWidth: 1,
          stroke: "#5F95FF",
          fill: "#EFF4FF",
          rx: 0,
          ry: 0,
        },
        image: {
          "xlink:href": item.image,
        },
      },
    })
  );
  stencil.load(imageNodes, "group2");
};

// 创建特殊元件
const createSpecialComponent = (ports: any, graph: any, stencil: any) => { };

// 初始化鼠标/键盘事件
const initializeMouseEvent = (graph: any, isPreview?: boolean) => {
  // 复制
  graph.bindKey(["meta+c", "ctrl+c"], () => {
    const cells = graph.getSelectedCells();
    if (cells.length) {
      graph.copy(cells);
      if (!graph.isClipboardEmpty()) {
        const cells = graph.paste({ offset: 32 });
        graph.cleanSelection();
        graph.select(cells);
      }
    }
    return false;
  });

  // 剪切
  // graph.bindKey(["meta+x", "ctrl+x"], () => {
  //   const cells = graph.getSelectedCells();
  //   if (cells.length) {
  //     graph.cut(cells);
  //   }
  //   return false;
  // });

  // 粘贴
  // graph.bindKey(["meta+v", "ctrl+v"], () => {
  //   if (!graph.isClipboardEmpty()) {
  //     const cells = graph.paste({ offset: 32 });
  //     graph.cleanSelection();
  //     graph.select(cells);
  //   }
  //   return false;
  // });

  // 撤销动作
  graph.bindKey(["meta+z", "ctrl+z"], () => {
    if (graph.history.canUndo()) {
      graph.history.undo();
    }
    return false;
  });

  // 重做
  //   graph.bindKey(["meta+shift+z", "ctrl+shift+z"], () => {
  //     if (graph.history.canRedo()) {
  //       graph.history.redo();
  //     }
  //     return false;
  //   });

  // select all
  graph.bindKey(["meta+a", "ctrl+a"], () => {
    const nodes = graph.getNodes();
    if (nodes) {
      graph.select(nodes);
    }
  });

  //delete
  graph.bindKey("delete", () => {
    const cells = graph.getSelectedCells();
    if (cells.length) {
      graph.removeCells(cells);
    }
  });

  // zoom
  graph.bindKey(["ctrl+1", "meta+1"], () => {
    const zoom = graph.zoom();
    if (zoom < 1.5) {
      graph.zoom(0.1);
    }
  });
  graph.bindKey(["ctrl+2", "meta+2"], () => {
    const zoom = graph.zoom();
    if (zoom > 0.5) {
      graph.zoom(-0.1);
    }
  });

  if (!isPreview) {
    // 鼠标移入边 显示删除按钮以及二分按钮
    graph.on("edge:mouseenter", (data: any) => {
      const { cell } = data;
      cell.addTools(
        [
          { name: "vertices" },
          {
            name: "button-remove",
            args: { distance: 20 },
          },
        ],
        "onhover"
      );
    });
    // 鼠标移除边 隐藏删除按钮以及二分按钮
    graph.on("edge:mouseleave", (data: any) => {
      const { cell } = data;
      if (cell.hasTools("onhover")) {
        cell.removeTools();
      }
    });
  }


  // 非边元素开启鼠标双击编辑文本 
  graph.on("cell:dblclick", (data: any) => {
    const { cell, e } = data;
    if (!Object.keys(data).includes('edge')) {
      const p = graph.clientToGraph(e.clientX, e.clientY);
      cell.addTools([
        {
          name: "editableCell",
          args: {
            x: p.x,
            y: p.y,
          },
        },
      ]);
    }

  });

  const showPorts = (ports: NodeListOf<SVGElement>, show: boolean) => {
    for (let i = 0, len = ports.length; i < len; i = i + 1) {
      ports[i].style.visibility = show ? "visible" : "hidden";
    }
  };

  graph.on("node:mouseenter", () => {
    const container = document.getElementById("graph-container")!;
    const ports = container.querySelectorAll(
      ".x6-port-body"
    ) as NodeListOf<SVGElement>;
    showPorts(ports, true);
  });

  graph.on("node:mouseleave", () => {
    const container = document.getElementById("graph-container")!;
    const ports = container.querySelectorAll(
      ".x6-port-body"
    ) as NodeListOf<SVGElement>;
    showPorts(ports, false);
  });

};

// 渲染画布
export const getX6Render = (isPreview?: boolean) => {
  // 创建画布
  const graph: any = initializeX6Graph(isPreview);

  // 创建公共元件连线桩
  const ports = commonPorts();

  // 创建左侧工具栏/元件库
  const stencil: any = initializeStencil(graph, ports);

  if (stencil) {

    // 注册特殊元件(html元件)
    registerComponent(ports)

    // 创建以及注册我的元件
    createMyselfComponent(ports, graph, stencil);

    // 创建以及注册系统元件
    createSysComponent(ports, graph, stencil);

    //创建以及注册特殊元件
    createSpecialComponent(ports, graph, stencil);
  }

  // 初始化鼠标/键盘事件
  initializeMouseEvent(graph, isPreview);
  return { graph, stencil };
};
